import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { GestureFrame } from '../types';
import { absentGesture } from './gesture';
import { TwoHandGestureInterpreter } from './twohand';
import { ModelAssetLoader, ModelInitializationQueue, type ModelDownloadProgress } from './model-loader';

const FRAME_INTERVAL_MS = 50;
const STALE_FRAME_MS = 300;
const abortError = () => new DOMException('摄像头启动已取消', 'AbortError');
const modelAssets = new ModelAssetLoader();
const modelInitializations = new ModelInitializationQueue();
class HandModelRuntimeError extends Error {}

export type HandTrackerStatus = 'permission' | 'preview' | 'model' | 'ready' | 'stopped';

export class HandTracker {
  private model: HandLandmarker | null = null;
  private stream: MediaStream | null = null;
  private animationFrame = 0;
  private generation = 0;
  private running = false;
  private recovering = false;
  private delegate: 'GPU' | 'CPU' = 'GPU';
  private pending: Promise<void> | null = null;
  private startupAbort: AbortController | null = null;
  private lastInference = -Infinity;
  private lastVideoTime = -1;
  private lastFreshFrame = 0;
  private lastPresence = false;
  private interpreter = new TwoHandGestureInterpreter();
  private swapHands = false;
  private removeListeners: (() => void)[] = [];

  constructor(
    private readonly video: HTMLVideoElement,
    private readonly onFrame: (frame: GestureFrame) => void,
    private readonly onError?: (message: string) => void,
    private readonly onStatus?: (status: HandTrackerStatus, detail?: string) => void,
  ) {}

  /** Swap instrument roles without changing the mirrored camera preview. */
  setSwapHands(swapHands: boolean): void {
    if (swapHands === this.swapHands) return;
    this.swapHands = swapHands;
    this.interpreter.setSwapHands(swapHands);
    this.release('左右手角色已交换 · 请重新稳定手势', true);
  }

  start(): Promise<void> {
    if (this.running) return Promise.resolve();
    if (this.pending) return this.pending;
    const generation = ++this.generation;
    const task = this.initialize(generation);
    this.pending = task;
    void task.finally(() => {
      if (this.pending === task) this.pending = null;
    }).catch(() => { /* The caller receives the original startup rejection. */ });
    return task;
  }

  stop(): void {
    const generation = ++this.generation;
    this.startupAbort?.abort();
    this.startupAbort = null;
    this.pending = null;
    this.running = false;
    this.recovering = false;
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = 0;
    for (const remove of this.removeListeners) remove();
    this.removeListeners = [];
    const stream = this.stream;
    this.stream = null;
    stream?.getTracks().forEach((track) => track.stop());
    if (this.video.srcObject === stream) {
      this.video.pause();
      this.video.srcObject = null;
    }
    this.closeModel(this.model);
    this.model = null;
    this.release('摄像头未连接', true);
    this.reportStatus('stopped', generation);
  }

  private closeModel(model: HandLandmarker | null): void {
    try { model?.close(); } catch { /* A failed GPU context may already be gone. */ }
  }

  private emit(frame: GestureFrame): void {
    this.lastPresence = frame.present;
    try { this.onFrame(frame); } catch (error) { console.error('Hand frame callback failed', error); }
  }

  private reportStatus(status: HandTrackerStatus, generation: number, detail?: string): void {
    if (generation !== this.generation) return;
    try { this.onStatus?.(status, detail); } catch (error) { console.error('Hand status callback failed', error); }
  }

  private release(label: string, force = false): void {
    this.interpreter.reset();
    if (this.lastPresence || force) this.emit(absentGesture(label));
  }

  private fail(message: string): void {
    this.stop();
    this.release(message, true);
    this.onError?.(message);
  }

  private addListener(target: EventTarget, type: string, listener: EventListener): void {
    target.addEventListener(type, listener);
    this.removeListeners.push(() => target.removeEventListener(type, listener));
  }

  private async createModel(delegate: 'GPU' | 'CPU', generation: number, signal: AbortSignal): Promise<HandLandmarker> {
    const base = import.meta.env.BASE_URL;
    const files = await FilesetResolver.forVisionTasks(`${base}mediapipe`);
    const progress = new Map<string, ModelDownloadProgress>();
    const showProgress = (value: ModelDownloadProgress) => {
      progress.set(value.label, value);
      const detail = Array.from(progress.values()).map(part => part.complete ? `${part.label}已就绪`
        : `${part.attempt > 1 ? '重试 ' : ''}${part.label} ${(part.received / 1048576).toFixed(1)} MB${part.total ? ` / ${(part.total / 1048576).toFixed(1)} MB` : ''}`).join(' · ');
      this.reportStatus('model', generation, detail);
    };
    const url = (path: string) => {
      const resolved = new URL(path, location.href);
      if (resolved.origin !== location.origin) throw new Error('手势资源必须来自当前网站');
      return resolved.href;
    };
    const loader = await modelAssets.load(url(files.wasmLoaderPath), '识别脚本', signal, showProgress, 'loader');
    const downloads = new AbortController();
    const cancelDownloads = () => downloads.abort();
    signal.addEventListener('abort', cancelDownloads, { once: true });
    if (signal.aborted) cancelDownloads();
    let wasm: Uint8Array, model: Uint8Array;
    try {
      [wasm, model] = await Promise.all([
        modelAssets.load(url(files.wasmBinaryPath), '识别引擎', downloads.signal, showProgress, 'wasm'),
        modelAssets.load(url(`${base}models/hand_landmarker.task`), '手势模型', downloads.signal, showProgress, 'model'),
      ]);
    } catch (error) {
      downloads.abort();
      throw error;
    } finally { signal.removeEventListener('abort', cancelDownloads); }
    if (signal.aborted) throw abortError();
    this.reportStatus('model', generation, delegate === 'CPU' ? '正在使用兼容模式初始化手势识别…' : '下载完成，正在初始化手势识别…');
    return modelInitializations.run(async () => {
      const scriptUrl = URL.createObjectURL(new Blob([new Uint8Array(loader).buffer], { type: 'application/javascript' }));
      const wasmUrl = URL.createObjectURL(new Blob([new Uint8Array(wasm).buffer], { type: 'application/wasm' }));
      try {
        try {
          return await HandLandmarker.createFromOptions({ wasmLoaderPath: scriptUrl, wasmBinaryPath: wasmUrl }, {
            baseOptions: { modelAssetBuffer: model, delegate },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.6,
            minHandPresenceConfidence: 0.6,
            minTrackingConfidence: 0.55,
          });
        } catch (error) { throw new HandModelRuntimeError(`手势引擎初始化失败：${error instanceof Error ? error.message : String(error)}`); }
      } finally {
        document.querySelectorAll('script').forEach(script => { if (script.src === scriptUrl) script.remove(); });
        URL.revokeObjectURL(scriptUrl); URL.revokeObjectURL(wasmUrl);
      }
    }, signal);
  }

  private async initialize(generation: number): Promise<void> {
    let stream: MediaStream | null = null;
    let model: HandLandmarker | null = null;
    const controller = new AbortController();
    this.startupAbort = controller;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('请使用 localhost 或 HTTPS 打开摄像头。');
      this.release('正在连接摄像头', true);
      this.reportStatus('permission', generation);
      if (generation !== this.generation) throw abortError();
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30, max: 30 } },
        audio: false,
      });
      if (generation !== this.generation) throw abortError();
      this.stream = stream;
      for (const track of stream.getVideoTracks()) {
        this.addListener(track, 'ended', () => {
          if (generation !== this.generation) return;
          this.fail('摄像头已中断，请重新连接');
        });
        this.addListener(track, 'mute', () => this.release('摄像头暂时无画面', true));
      }
      this.video.autoplay = true;
      this.video.muted = true;
      this.video.playsInline = true;
      this.video.srcObject = stream;
      await this.video.play();
      if (generation !== this.generation) throw abortError();
      this.reportStatus('preview', generation);
      if (generation !== this.generation) throw abortError();

      this.release('正在加载手势识别', true);
      this.reportStatus('model', generation);
      if (generation !== this.generation) throw abortError();
      this.delegate = 'GPU';
      try {
        model = await this.createModel('GPU', generation, controller.signal);
      } catch (error) {
        if (generation !== this.generation) throw abortError();
        if (!(error instanceof HandModelRuntimeError)) throw error;
        console.warn('GPU hand tracking unavailable; using CPU.', error);
        this.delegate = 'CPU';
        model = await this.createModel('CPU', generation, controller.signal);
      }
      if (generation !== this.generation) throw abortError();
      this.model = model;
      this.running = true;
      this.lastInference = -Infinity;
      this.lastVideoTime = -1;
      this.lastFreshFrame = performance.now();
      this.addListener(document, 'visibilitychange', () => {
        cancelAnimationFrame(this.animationFrame);
        if (document.hidden) this.release('页面暂停 · 声部已松开', true);
        else if (this.running && !this.recovering) {
          this.lastVideoTime = -1;
          this.lastFreshFrame = performance.now();
          this.schedule();
        }
      });
      this.addListener(this.video, 'pause', () => this.release('摄像头画面已暂停', true));
      this.addListener(this.video, 'error', () => {
        this.fail('摄像头画面异常，请重新连接');
      });
      this.release('请将双手放入画面 · 和弦手选和弦，表情手控制声音', true);
      this.reportStatus('ready', generation);
      if (generation === this.generation && !document.hidden) this.schedule();
    } catch (error) {
      if (generation === this.generation) this.stop();
      else {
        stream?.getTracks().forEach((track) => track.stop());
        this.closeModel(model);
      }
      throw error;
    }
  }

  private schedule(): void {
    this.animationFrame = requestAnimationFrame((timestamp) => this.tick(timestamp));
  }

  private tick(timestamp: number): void {
    if (!this.running || this.recovering || document.hidden || !this.model) return;
    const fresh = this.video.readyState >= 2 && this.video.currentTime !== this.lastVideoTime;
    if (fresh && timestamp - this.lastInference >= FRAME_INTERVAL_MS) {
      this.lastInference = timestamp;
      this.lastVideoTime = this.video.currentTime;
      this.lastFreshFrame = timestamp;
      try {
        const result = this.model.detectForVideo(this.video, timestamp);
        this.emit(this.interpreter.update(result, timestamp, this.video.videoWidth / this.video.videoHeight));
      } catch (error) {
        this.release('手势识别恢复中', true);
        if (this.delegate === 'GPU') {
          void this.recoverWithCpu(this.generation);
        } else {
          console.error('Hand tracking stopped', error);
          this.fail('识别已中断，请重新连接摄像头');
        }
        return;
      }
    } else if (timestamp - this.lastFreshFrame > STALE_FRAME_MS) {
      this.release('未收到摄像头画面');
    }
    this.schedule();
  }

  private async recoverWithCpu(generation: number): Promise<void> {
    this.recovering = true;
    this.closeModel(this.model);
    this.model = null;
    const controller = new AbortController();
    this.startupAbort?.abort();
    this.startupAbort = controller;
    try {
      const model = await this.createModel('CPU', generation, controller.signal);
      if (generation !== this.generation) {
        this.closeModel(model);
        return;
      }
      this.model = model;
      this.delegate = 'CPU';
      this.recovering = false;
      this.lastVideoTime = -1;
      this.lastFreshFrame = performance.now();
      this.reportStatus('ready', generation);
      if (!document.hidden) this.schedule();
    } catch (error) {
      if (generation !== this.generation) return;
      console.error('CPU hand tracking could not recover', error);
      this.fail('识别已中断，请重新连接摄像头');
    }
  }
}
