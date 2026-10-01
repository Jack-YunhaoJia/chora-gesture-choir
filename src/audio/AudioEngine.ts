import type { IFaustMonoWebAudioNode, LooseFaustDspFactory } from '@grame/faustwasm';
import type { AudioMetrics, PerformanceState } from '../types';
import { soundPresetIndex } from './presets';

type MicrophoneGraph = {
  source?: MediaStreamAudioSourceNode;
  rawInput?: AnalyserNode;
  microphoneGain?: GainNode;
  input?: AnalyserNode;
  stream?: MediaStream;
};

type Session = MicrophoneGraph & {
  context: AudioContext;
  abort: AbortController;
  ready: Promise<void>;
  dsp?: IFaustMonoWebAudioNode;
  output?: AnalyserNode;
  limiter?: DynamicsCompressorNode;
  silentInput?: ConstantSourceNode;
  micRequest?: Promise<void>;
  microphoneGainDb?: number;
  inputData: Float32Array<ArrayBuffer>;
  rawInputData: Float32Array<ArrayBuffer>;
  outputData: Float32Array<ArrayBuffer>;
  sent: Map<string, number>;
  usesMicrophone: boolean;
  demoModulator: boolean;
};

const clamp = (value: number, lo = 0, hi = 1) => Number.isFinite(value) ? Math.min(hi, Math.max(lo, value)) : lo;
const microphoneGainDb = (value?: number) => Number.isFinite(value) ? clamp(value!, 0, 24) : 12;
const cancelled = () => new DOMException('声音启动已取消', 'AbortError');

/** A real Faust/WebAssembly instrument. No microphone signal is dry-monitored. */
export class AudioEngine {
  readonly engineName = 'Faust · 16-band vocoder';
  private session?: Session;
  private state?: PerformanceState;
  private lastPitchTime = 0;
  private lastPitch: number | null = null;
  private strike = 0;

  get microphoneEnabled(): boolean {
    return Boolean(this.session?.stream?.getAudioTracks().some(track => track.readyState === 'live'));
  }

  /** Demo is an intentionally synthesized vowel, never a fake microphone signal. */
  get demoModulatorEnabled(): boolean {
    return Boolean(this.session?.demoModulator && !this.session.usesMicrophone);
  }

  setDemoModulatorEnabled(enabled: boolean): void {
    const session = this.session;
    if (!session) return;
    session.demoModulator = enabled && !session.usesMicrophone;
    if (session.dsp) this.param(session, 'demo', session.demoModulator ? 1 : 0);
  }

  get diagnostics() {
    return {
      engine: this.engineName,
      sampleRate: this.session?.context.sampleRate ?? null,
      contextState: this.session?.context.state ?? 'closed',
      microphone: this.microphoneEnabled,
      microphoneGainDb: this.session?.microphoneGainDb ?? microphoneGainDb(this.state?.microphoneGainDb),
      demoModulator: this.demoModulatorEnabled,
      dryMonitor: false,
      bands: 16,
      voices: 4,
    } as const;
  }

  async start({ microphone }: { microphone: boolean }): Promise<void> {
    if (this.session) {
      await this.session.ready;
      if (microphone) await this.enableMicrophone();
      return;
    }
    if (!window.isSecureContext) throw new Error('请通过 localhost 或 HTTPS 打开 CHORA。');
    if (!window.AudioContext) throw new Error('这个浏览器暂不支持 Web Audio，请使用新版 Chrome 或 Edge。');

    // Create and resume in the button's user-activation turn, before network work.
    const context = new AudioContext({ latencyHint: 'interactive' });
    const resumed = context.resume();
    const session: Session = {
      context,
      abort: new AbortController(),
      ready: Promise.resolve(),
      inputData: new Float32Array(2048),
      rawInputData: new Float32Array(2048),
      outputData: new Float32Array(1024),
      sent: new Map(),
      usesMicrophone: false,
      demoModulator: true,
    };
    this.session = session;
    session.ready = this.initialise(session, resumed);
    try {
      await session.ready;
      if (microphone) await this.enableMicrophone();
    } catch (error) {
      if (this.session === session) {
        this.session = undefined;
        await this.dispose(session);
      }
      throw error;
    }
  }

  private assertCurrent(session: Session): void {
    if (session !== this.session || session.abort.signal.aborted) throw cancelled();
  }

  private async initialise(session: Session, resumed: Promise<void>): Promise<void> {
    // Await resume concurrently with asset requests, so failures are never unhandled.
    const [, wasmResponse, jsonResponse, { FaustMonoAudioWorkletNode }] = await Promise.all([
      resumed,
      fetch(`${import.meta.env.BASE_URL}audio/chora.wasm`, { signal: session.abort.signal }),
      fetch(`${import.meta.env.BASE_URL}audio/chora.json`, { signal: session.abort.signal }),
      import('@grame/faustwasm'),
    ]);
    if (!wasmResponse.ok || !jsonResponse.ok) throw new Error('声音文件加载失败，请刷新后重试。');
    const [bytes, json] = await Promise.all([wasmResponse.arrayBuffer(), jsonResponse.text()]);
    this.assertCurrent(session);
    const factory: LooseFaustDspFactory = { module: await WebAssembly.compile(bytes), json, soundfiles: {} };
    this.assertCurrent(session);
    await session.context.audioWorklet.addModule(`${import.meta.env.BASE_URL}audio/chora-worklet.js`);
    this.assertCurrent(session);
    const dsp = new FaustMonoAudioWorkletNode(session.context, {
      processorOptions: { name: 'CHORA', factory, sampleSize: 4 },
    });
    // stop() can happen while the worklet module is loading.
    if (session !== this.session || session.abort.signal.aborted) {
      dsp.destroy();
      dsp.disconnect();
      throw cancelled();
    }
    session.dsp = dsp;
    // Faust's mono runtime skips processing if its declared input is absent.
    // A zero-valued source keeps demo synthesis running without any device.
    const silentInput = session.context.createConstantSource();
    silentInput.offset.value = 0;
    silentInput.connect(dsp);
    silentInput.start();
    session.silentInput = silentInput;
    const output = session.context.createAnalyser();
    output.fftSize = session.outputData.length;
    output.smoothingTimeConstant = 0.78;
    session.output = output;
    const limiter = session.context.createDynamicsCompressor();
    limiter.threshold.value = -9;
    limiter.knee.value = 4;
    limiter.ratio.value = 16;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.22;
    session.limiter = limiter;
    dsp.connect(limiter);
    limiter.connect(output);
    output.connect(session.context.destination);
    this.param(session, 'demo', session.demoModulator ? 1 : 0);
    this.param(session, 'master', 0);
    dsp.start();
    if (this.state) this.update(this.state);
  }

  async enableMicrophone(): Promise<void> {
    const session = this.session;
    if (!session) throw new Error('请先启动声音。');
    await session.ready;
    this.assertCurrent(session);
    if (this.microphoneEnabled) return;
    if (session.micRequest) return session.micRequest;
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('浏览器未提供麦克风权限，请使用 localhost 或 HTTPS。');

    const request = (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      // Permission dialogs cannot be cancelled, but late streams are released.
      if (session !== this.session || session.abort.signal.aborted) {
        stream.getTracks().forEach(track => track.stop());
        throw cancelled();
      }
      const candidate: MicrophoneGraph = { stream };
      try {
        const source = candidate.source = session.context.createMediaStreamSource(stream);
        const rawInput = candidate.rawInput = session.context.createAnalyser();
        rawInput.fftSize = session.rawInputData.length;
        const gain = candidate.microphoneGain = session.context.createGain();
        const gainDb = microphoneGainDb(this.state?.microphoneGainDb);
        gain.gain.setValueAtTime(10 ** (gainDb / 20), session.context.currentTime);
        const input = candidate.input = session.context.createAnalyser();
        input.fftSize = session.inputData.length;
        source.connect(rawInput);
        rawInput.connect(gain);
        gain.connect(input);
        input.connect(session.dsp!);
        this.param(session, 'demo', 0);
        // Commit only after every node is connected. Failed replacements leave
        // the previous graph intact and release all partially-created nodes.
        disconnectMicrophone(session);
        Object.assign(session, candidate);
        session.microphoneGainDb = gainDb;
        session.usesMicrophone = true;
        session.demoModulator = false;
        this.lastPitch = null;
        this.lastPitchTime = 0;
      } catch (error) {
        disconnectMicrophone(candidate);
        throw error;
      }
    })();
    session.micRequest = request;
    try { await request; }
    finally { if (session.micRequest === request) session.micRequest = undefined; }
  }

  update(state: PerformanceState): void {
    // Keep a snapshot: a caller may mutate its UI state while audio is loading.
    this.state = { ...state, microphoneGainDb: microphoneGainDb(state.microphoneGainDb), frequencies: [...state.frequencies], voices: [...state.voices] };
    const session = this.session;
    if (!session) return;
    this.updateMicrophoneGain(session, this.state.microphoneGainDb!);
    if (!session.dsp) return;
    state.frequencies.forEach((freq, i) => this.param(session, `freq${i}`, clamp(freq, 45, 1800)));
    state.voices.forEach((voice, i) => this.param(session, `voice${i}`, state.active && voice ? 1 : 0));
    this.param(session, 'expression', clamp(state.expression));
    this.param(session, 'brightness', clamp(state.brightness));
    this.param(session, 'wristTone', Number.isFinite(state.wristTone) ? clamp(state.wristTone!) : 0.5);
    this.param(session, 'space', clamp(state.space));
    this.param(session, 'preset', soundPresetIndex(state.soundPreset));
    this.param(session, 'texture', clamp(state.texture ?? 0.5));
    this.param(session, 'master', state.active ? clamp(state.volume) * 0.8 : 0);
    this.param(session, 'vocoder', state.mode === 'vocoder' ? 1 : 0);
  }

  private updateMicrophoneGain(session: Session, gainDb: number): void {
    if (!session.microphoneGain || session.microphoneGainDb === gainDb) return;
    const now = session.context.currentTime;
    session.microphoneGain.gain.cancelScheduledValues(now);
    session.microphoneGain.gain.setTargetAtTime(10 ** (gainDb / 20), now, 0.03);
    session.microphoneGainDb = gainDb;
  }

  /** Explicit repeated chord attacks; ordinary tracking frames never retrigger. */
  retrigger(): void {
    this.strike = (this.strike + 1) % 65536;
    if (this.session?.dsp) this.param(this.session, 'strike', this.strike);
  }

  private param(session: Session, name: string, value: number): void {
    // Gesture updates run faster than useful audio changes; smoothing is in DSP.
    if (Math.abs((session.sent.get(name) ?? -1000) - value) < 0.0008) return;
    session.dsp?.setParamValue(`/CHORA/${name}`, value);
    session.sent.set(name, value);
  }

  metrics(): AudioMetrics {
    const session = this.session;
    if (!session?.output) return silentMetrics(0);
    session.output.getFloatTimeDomainData(session.outputData);
    const outputLevel = clamp(rms(session.outputData) * 4);
    if (!session.input || !this.microphoneEnabled) {
      this.lastPitch = null;
      return silentMetrics(outputLevel);
    }
    session.input.getFloatTimeDomainData(session.inputData);
    const input = inputStats(session.inputData);
    let raw: ReturnType<typeof inputStats> | undefined;
    if (session.rawInput && session.rawInputData) {
      session.rawInput.getFloatTimeDomainData(session.rawInputData);
      raw = inputStats(session.rawInputData);
    }
    const now = performance.now();
    if (now - this.lastPitchTime > 140) {
      this.lastPitchTime = now;
      this.lastPitch = input.level > 0.009 ? estimatePitch(session.inputData, session.context.sampleRate) : null;
    }
    if (input.level === 0) this.lastPitch = null;
    return {
      inputLevel: clamp((input.db + 60) / 60), inputDb: input.db,
      inputPeak: input.peak, inputClipped: input.clipped,
      ...(raw ? { rawInputDb: raw.db, rawInputPeak: raw.peak, rawInputClipped: raw.clipped } : {}),
      outputLevel, pitchHz: this.lastPitch,
    };
  }

  async stop(): Promise<void> {
    const session = this.session;
    this.session = undefined;
    this.lastPitch = null;
    this.lastPitchTime = 0;
    if (session) await this.dispose(session);
  }

  private async dispose(session: Session): Promise<void> {
    session.abort.abort();
    disconnectMicrophone(session);
    session.silentInput?.stop();
    session.silentInput?.disconnect();
    session.dsp?.stop();
    session.dsp?.destroy();
    session.dsp?.disconnect();
    session.limiter?.disconnect();
    session.output?.disconnect();
    if (session.context.state !== 'closed') await session.context.close().catch(() => {});
  }
}

function disconnectMicrophone(graph: MicrophoneGraph): void {
  for (const node of [graph.source, graph.rawInput, graph.microphoneGain, graph.input]) {
    try { node?.disconnect(); } catch { /* Continue releasing the other nodes. */ }
  }
  graph.stream?.getTracks().forEach(track => {
    try { track.stop(); } catch { /* A detached device must not prevent cleanup. */ }
  });
}

function silentMetrics(outputLevel: number): AudioMetrics {
  return {
    inputLevel: 0, inputDb: -90, inputPeak: 0, inputClipped: false,
    rawInputDb: -90, rawInputPeak: 0, rawInputClipped: false,
    outputLevel, pitchHz: null,
  };
}

function inputStats(buffer: Float32Array): { level: number; db: number; peak: number; clipped: boolean } {
  let energy = 0, peak = 0;
  for (const sample of buffer) {
    if (!Number.isFinite(sample)) continue;
    energy += sample * sample;
    peak = Math.max(peak, Math.abs(sample));
  }
  const level = Math.sqrt(energy / Math.max(1, buffer.length));
  return { level, db: Math.max(-90, 20 * Math.log10(Math.max(level, 10 ** (-90 / 20)))), peak, clipped: peak >= 0.99 };
}

function rms(buffer: Float32Array): number {
  let energy = 0;
  for (const sample of buffer) energy += sample * sample;
  return Math.sqrt(energy / buffer.length);
}

/** Optional display telemetry only; this is not used to infer or retune chords. */
function estimatePitch(buffer: Float32Array, sampleRate: number): number | null {
  let mean = 0;
  for (const value of buffer) mean += value;
  mean /= buffer.length;
  const minLag = Math.floor(sampleRate / 900);
  const maxLag = Math.min(Math.floor(sampleRate / 75), Math.floor(buffer.length / 2));
  let best = 0, bestLag = 0;
  let previous = 0, previousLag = 0;
  let ascending = false;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0, left = 0, right = 0;
    for (let i = 0; i < buffer.length - maxLag; i += 2) {
      const a = buffer[i] - mean, b = buffer[i + lag] - mean;
      sum += a * b; left += a * a; right += b * b;
    }
    const correlation = sum / Math.sqrt(left * right + 1e-14);
    // Choose the first convincing periodic peak to avoid octave-down multiples.
    if (ascending && correlation < previous && previous > 0.87) return sampleRate / previousLag;
    ascending = correlation > previous;
    if (correlation > best) { best = correlation; bestLag = lag; }
    previous = correlation; previousLag = lag;
  }
  return best > 0.7 && bestLag > minLag ? sampleRate / bestLag : null;
}
