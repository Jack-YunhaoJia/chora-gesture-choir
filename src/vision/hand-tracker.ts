import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { GestureFrame } from '../types';
import { absentGesture } from './gesture';
import { TwoHandGestureInterpreter } from './twohand';

const FRAME_INTERVAL_MS = 50;
const STALE_FRAME_MS = 300;
const abortError = () => new DOMException('摄像头启动已取消', 'AbortError');

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
    private readonly onStatus?: (status: HandTrackerStatus) => void,
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

  private reportStatus(status: HandTrackerStatus, generation: number): void {
    if (generation !== this.generation) return;
    try { this.onStatus?.(status); } catch (error) { console.error('Hand status callback failed', error); }
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

  private async createModel(delegate: 'GPU' | 'CPU'): Promise<HandLandmarker> {
    const base = import.meta.env.BASE_URL;
    const files = await FilesetResolver.forVisionTasks(`${base}mediapipe`);
    return HandLandmarker.createFromOptions(files, {
      baseOptions: { modelAssetPath: `${base}models/hand_landmarker.task`, delegate },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.6,
      minHandPresenceConfidence: 0.6,
      minTrackingConfidence: 0.55,
    });
  }

  private async initialize(generation: number): Promise<void> {
    let stream: MediaStream | null = null;
    let model: HandLandmarker | null = null;
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
        model = await this.createModel('GPU');
      } catch (error) {
        if (generation !== this.generation) throw abortError();
        console.warn('GPU hand tracking unavailable; using CPU.', error);
        this.delegate = 'CPU';
        model = await this.createModel('CPU');
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
    try {
      const model = await this.createModel('CPU');
      if (generation !== this.generation) {
        this.closeModel(model);
        return;
      }
      this.model = model;
      this.delegate = 'CPU';
      this.recovering = false;
      this.lastVideoTime = -1;
      this.lastFreshFrame = performance.now();
      if (!document.hidden) this.schedule();
    } catch (error) {
      if (generation !== this.generation) return;
      console.error('CPU hand tracking could not recover', error);
      this.fail('识别已中断，请重新连接摄像头');
    }
  }
}
