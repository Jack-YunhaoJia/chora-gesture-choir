import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AudioEngine } from '../src/audio/AudioEngine';
import { SOUND_PRESET_IDS, SOUND_PRESETS } from '../src/audio/presets';
import type { PerformanceState } from '../src/types';

const state: PerformanceState = {
  soundPreset: 'moon', texture: 0.5,
  frequencies: [130.81, 164.81, 196, 246.94], voices: [true, true, true, true],
  expression: 0.72, brightness: 0.58, space: 0.55, volume: 0.7, mode: 'ambient', active: true,
};

function instrument() {
  const engine = new AudioEngine();
  const calls: [string, number][] = [];
  // A recording DSP isolates the public update contract without creating a
  // device or AudioContext. The integration check below uses compiled metadata.
  const internals = engine as unknown as { session: unknown; state: PerformanceState };
  internals.session = { dsp: { setParamValue: (path: string, value: number) => calls.push([path, value]) }, sent: new Map() };
  return { engine, calls, internals, values: () => Object.fromEntries(calls) };
}

test('each named preset reaches a distinct compiled instrument without changing the chord', () => {
  const { engine, calls, values } = instrument();
  for (const [index, soundPreset] of SOUND_PRESET_IDS.entries()) {
    engine.update({ ...state, soundPreset, ...SOUND_PRESETS[soundPreset].defaults });
    assert.equal(values()['/CHORA/preset'], index);
    assert.equal(values()['/CHORA/texture'], SOUND_PRESETS[soundPreset].defaults.texture);
    state.frequencies.forEach((value, i) => assert.equal(values()[`/CHORA/freq${i}`], value));
  }
  const json = JSON.parse(readFileSync(new URL('../public/audio/chora.json', import.meta.url), 'utf8'));
  const addresses = new Set<string>();
  type DspUiItem = { address?: string; items?: DspUiItem[] };
  const visit = (items: DspUiItem[]) => {
    for (const item of items) { if (item.address) addresses.add(item.address); if (item.items) visit(item.items); }
  };
  visit(json.ui);
  for (const [path] of calls) assert.ok(addresses.has(path), `${path} must exist in compiled Faust`);
});

test('tracking updates do not restart attacks, while explicit repeats reach the DSP', () => {
  const { engine, calls, values } = instrument();
  engine.update(state);
  engine.retrigger();
  const firstStrike = values()['/CHORA/strike'];
  for (let frame = 0; frame < 20; frame++) engine.update({ ...state, expression: 0.5 + frame * 0.01 });
  assert.equal(calls.filter(([path]) => path === '/CHORA/strike').length, 1);
  engine.retrigger();
  assert.notEqual(values()['/CHORA/strike'], firstStrike);
  assert.equal(calls.filter(([path]) => path === '/CHORA/strike').length, 2);
});

test('wrist tone reaches DSP independently of brightness, defaults neutral, and is bounded', () => {
  const { engine, values, calls } = instrument();
  engine.update(state);
  assert.equal(values()['/CHORA/wristTone'], 0.5);
  for (const wristTone of [0, 0.25, 0.75, 1]) {
    engine.update({ ...state, wristTone });
    assert.equal(values()['/CHORA/wristTone'], wristTone);
    assert.equal(values()['/CHORA/brightness'], state.brightness);
    state.frequencies.forEach((value, i) => assert.equal(values()[`/CHORA/freq${i}`], value));
  }
  assert.equal(calls.filter(([path]) => path === '/CHORA/strike').length, 0);
  for (const [wristTone, expected] of [[-2, 0], [3, 1], [Number.NaN, 0.5], [Infinity, 0.5]]) {
    engine.update({ ...state, wristTone });
    assert.equal(values()['/CHORA/wristTone'], expected);
  }
  engine.update(state);
  assert.equal(values()['/CHORA/wristTone'], 0.5);
});

test('mode switches preserve pitch and voice selection; inactive state mutes wet tails', () => {
  const { engine, values } = instrument();
  const selected = { ...state, voices: [true, false, true, false] as PerformanceState['voices'] };
  engine.update(selected);
  engine.update({ ...selected, mode: 'vocoder', soundPreset: 'glass' });
  assert.equal(values()['/CHORA/vocoder'], 1);
  selected.voices.forEach((enabled, i) => assert.equal(values()[`/CHORA/voice${i}`], +enabled));
  selected.frequencies.forEach((frequency, i) => assert.equal(values()[`/CHORA/freq${i}`], frequency));
  engine.update({ ...selected, active: false });
  assert.equal(values()['/CHORA/master'], 0);
  for (let i = 0; i < 4; i++) assert.equal(values()[`/CHORA/voice${i}`], 0);
});

test('loading snapshot does not follow caller mutation and invalid control values are bounded', () => {
  const engine = new AudioEngine();
  const mutable = { ...state, voices: [...state.voices], frequencies: [...state.frequencies] } as PerformanceState;
  engine.update(mutable);
  mutable.voices[0] = false;
  mutable.frequencies[0] = 880;
  const snapshot = (engine as unknown as { state: PerformanceState }).state;
  assert.equal(snapshot.voices[0], true);
  assert.equal(snapshot.frequencies[0], state.frequencies[0]);
  const recorded = instrument();
  recorded.engine.update({ ...state, texture: Number.NaN, brightness: 8, space: -1, volume: 9 });
  assert.equal(recorded.values()['/CHORA/texture'], 0);
  assert.equal(recorded.values()['/CHORA/brightness'], 1);
  assert.equal(recorded.values()['/CHORA/space'], 0);
  assert.equal(recorded.values()['/CHORA/master'], 0.8);
});

type TestNode = {
  kind: string;
  connections: unknown[];
  disconnects: number;
  sample: number;
  fftSize: number;
  connect(node: unknown): void;
  disconnect(): void;
  getFloatTimeDomainData(buffer: Float32Array): void;
};

function microphoneInstrument() {
  const engine = new AudioEngine();
  const nodes: TestNode[] = [];
  const gainEvents: [string, number, number, number?][] = [];
  const params: [string, number][] = [];
  let failConnection: string | undefined;
  const node = (kind: string): TestNode => {
    const result: TestNode = {
      kind, connections: [], disconnects: 0, sample: 0, fftSize: 0,
      connect(target) {
        if (failConnection === kind) throw new Error('simulated connection failure');
        this.connections.push(target);
      },
      disconnect() { this.disconnects++; this.connections.length = 0; },
      getFloatTimeDomainData(buffer) { buffer.fill(this.sample); },
    };
    nodes.push(result);
    return result;
  };
  let analyserCount = 0;
  const context = {
    currentTime: 2, sampleRate: 48000, state: 'running', closes: 0,
    createMediaStreamSource: () => node('source'),
    createAnalyser: () => node(`analyser${analyserCount++}`),
    createGain: () => Object.assign(node('gain'), {
      gain: {
        setValueAtTime: (value: number, time: number) => gainEvents.push(['set', value, time]),
        cancelScheduledValues: (time: number) => gainEvents.push(['cancel', 0, time]),
        setTargetAtTime: (value: number, time: number, constant: number) => gainEvents.push(['target', value, time, constant]),
      },
    }),
    async close() { this.state = 'closed'; this.closes++; },
  };
  const dsp = Object.assign(node('dsp'), {
    setParamValue: (path: string, value: number) => params.push([path, value]),
    stop() {}, destroy() {},
  });
  const session = {
    context, dsp, output: node('output'),
    abort: new AbortController(), ready: Promise.resolve(), sent: new Map<string, number>(),
    usesMicrophone: false, demoModulator: true,
    inputData: new Float32Array(2048), rawInputData: new Float32Array(2048), outputData: new Float32Array(1024),
  };
  (engine as unknown as { session: unknown }).session = session;
  return { engine, session, context, nodes, gainEvents, params, failAt: (kind?: string) => { failConnection = kind; } };
}

function fakeMicrophone() {
  const track = { readyState: 'live', stops: 0, stop() { this.readyState = 'ended'; this.stops++; } };
  return { track, stream: { getTracks: () => [track], getAudioTracks: () => [track] } };
}

async function withMicrophoneRequest(request: () => Promise<unknown>, action: () => Promise<void>) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: { getUserMedia: request } } });
  try { await action(); }
  finally {
    if (descriptor) Object.defineProperty(globalThis, 'navigator', descriptor);
    else Reflect.deleteProperty(globalThis, 'navigator');
  }
}

test('microphone gain is bounded, defaults to +12 dB and changes smoothly without new DSP parameters', async () => {
  const f = microphoneInstrument(), mic = fakeMicrophone();
  f.engine.update(state);
  await withMicrophoneRequest(async () => mic.stream, async () => {
    await f.engine.enableMicrophone();
    assert.equal(f.gainEvents[0][0], 'set');
    assert.ok(Math.abs(f.gainEvents[0][1] - 10 ** (12 / 20)) < 1e-12);
    const before = f.gainEvents.length;
    f.engine.update(state);
    assert.equal(f.gainEvents.length, before, 'tracking frames must not restart gain ramps');
    for (const [microphoneGainDb, expected] of [[-8, 0], [40, 24], [6, 6], [Number.NaN, 12], [Infinity, 12]]) {
      f.context.currentTime += 0.02;
      f.engine.update({ ...state, microphoneGainDb });
      const target = f.gainEvents.filter(([kind]) => kind === 'target').at(-1)!;
      assert.ok(Math.abs(target[1] - 10 ** (expected / 20)) < 1e-12);
      assert.equal(target[3], 0.03, '30 ms smoothing remains positive and finite');
      assert.equal(f.engine.diagnostics.microphoneGainDb, expected);
    }
    assert.ok(f.params.every(([path]) => !/microphone|gain/i.test(path)), 'gain belongs to Web Audio, not Faust');
    assert.equal(new Map(f.params).get('/CHORA/freq0'), state.frequencies[0]);
    assert.equal(f.engine.demoModulatorEnabled, false);
    await f.engine.stop();
  });
});

test('microphone gain set before permission resolves is used by the complete graph and stop releases it', async () => {
  const f = microphoneInstrument(), mic = fakeMicrophone();
  let resolvePermission!: (value: unknown) => void;
  await withMicrophoneRequest(() => new Promise(resolve => { resolvePermission = resolve; }), async () => {
    const pending = f.engine.enableMicrophone();
    await Promise.resolve();
    f.engine.update({ ...state, microphoneGainDb: 18 });
    resolvePermission(mic.stream);
    await pending;
    assert.equal(f.engine.diagnostics.microphoneGainDb, 18);
    assert.ok(Math.abs(f.gainEvents[0][1] - 10 ** (18 / 20)) < 1e-12);
    const [source, raw, gain, processed] = ['source', 'analyser0', 'gain', 'analyser1'].map(kind => f.nodes.find(n => n.kind === kind)!);
    assert.deepEqual(source.connections, [raw]);
    assert.deepEqual(raw.connections, [gain]);
    assert.deepEqual(gain.connections, [processed]);
    assert.deepEqual(processed.connections, [f.session.dsp]);
    await f.engine.stop();
    for (const n of [source, raw, gain, processed]) assert.equal(n.disconnects, 1, `${n.kind} released exactly once`);
    assert.equal(mic.track.stops, 1);
    assert.equal(f.context.closes, 1);
    assert.equal(f.engine.microphoneEnabled, false);
    assert.equal(f.engine.metrics().inputLevel, 0);
  });
});

test('post-gain dBFS meter reports weak inputs and distinguishes boost overload from capture clipping', async () => {
  const f = microphoneInstrument(), mic = fakeMicrophone();
  await withMicrophoneRequest(async () => mic.stream, async () => {
    await f.engine.enableMicrophone();
    const raw = f.nodes.find(n => n.kind === 'analyser0')!;
    const processed = f.nodes.find(n => n.kind === 'analyser1')!;
    raw.sample = 10 ** (-42 / 20);
    processed.sample = 10 ** (-30 / 20);
    let metrics = f.engine.metrics();
    assert.ok(Math.abs(metrics.rawInputDb! + 42) < 1e-5);
    assert.ok(Math.abs(metrics.inputDb! + 30) < 1e-5);
    assert.ok(Math.abs(metrics.inputLevel - 0.5) < 1e-6, '-30 dBFS is halfway on the -60..0 meter');
    assert.equal(metrics.rawInputClipped, false);
    processed.sample = 1.2;
    metrics = f.engine.metrics();
    assert.equal(metrics.inputClipped, true);
    assert.ok(metrics.inputPeak! > 1, 'float graph peak is not hidden by UI normalization');
    assert.equal(metrics.inputLevel, 1);
    assert.equal(metrics.rawInputClipped, false, 'boost overload is not capture clipping');
    raw.sample = 1;
    assert.equal(f.engine.metrics().rawInputClipped, true);
    raw.sample = processed.sample = 0;
    metrics = f.engine.metrics();
    assert.equal(metrics.inputLevel, 0);
    assert.equal(metrics.inputDb, -90);
    assert.equal(metrics.rawInputDb, -90);
    assert.equal(metrics.inputPeak, 0);
    assert.equal(metrics.inputClipped, false);
    assert.equal(metrics.pitchHz, null);
    mic.track.stop();
    processed.sample = 1;
    assert.equal(f.engine.metrics().inputPeak, 0, 'ended devices must not retain stale analyser data');
    await f.engine.stop();
  });
});

test('failed microphone graph construction releases partial nodes and permits retry', async () => {
  const f = microphoneInstrument(), first = fakeMicrophone(), second = fakeMicrophone();
  let requestCount = 0;
  await withMicrophoneRequest(async () => ++requestCount === 1 ? first.stream : second.stream, async () => {
    f.failAt('gain');
    await assert.rejects(f.engine.enableMicrophone(), /simulated connection failure/);
    assert.equal(first.track.stops, 1);
    assert.equal(f.engine.microphoneEnabled, false);
    assert.equal(f.engine.demoModulatorEnabled, true);
    for (const n of f.nodes.filter(n => !['dsp', 'output'].includes(n.kind))) assert.equal(n.disconnects, 1);
    f.failAt();
    await f.engine.enableMicrophone();
    assert.equal(f.engine.microphoneEnabled, true);
    assert.equal(requestCount, 2);
    await f.engine.stop();
    assert.equal(second.track.stops, 1);
  });
});

test('microphone permission denial and permission granted after stop leave no live graph', async () => {
  const rejected = microphoneInstrument();
  await withMicrophoneRequest(async () => { throw new DOMException('denied', 'NotAllowedError'); }, async () => {
    await assert.rejects(rejected.engine.enableMicrophone(), { name: 'NotAllowedError' });
    assert.equal(rejected.nodes.length, 2, 'permission failure creates no microphone nodes');
    await rejected.engine.stop();
  });
  const late = microphoneInstrument(), mic = fakeMicrophone();
  let resolvePermission!: (value: unknown) => void;
  await withMicrophoneRequest(() => new Promise(resolve => { resolvePermission = resolve; }), async () => {
    const pending = late.engine.enableMicrophone();
    await Promise.resolve();
    await late.engine.stop();
    resolvePermission(mic.stream);
    await assert.rejects(pending, { name: 'AbortError' });
    assert.equal(mic.track.stops, 1);
    assert.equal(late.nodes.length, 2, 'late permission must not create audio nodes');
    assert.equal(late.context.closes, 1);
  });
});
