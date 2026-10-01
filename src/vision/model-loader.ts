const abortError = () => new DOMException('摄像头启动已取消', 'AbortError');

export interface ModelDownloadProgress {
  label: string;
  received: number;
  total?: number;
  attempt: number;
  complete: boolean;
}

export type ModelAssetKind = 'wasm' | 'model' | 'loader';

/** Reject HTML fallbacks and wrong binary formats before putting bytes in the warm cache. */
export function validateModelAsset(bytes: Uint8Array, kind: ModelAssetKind): void {
  const starts = (...values: number[]) => values.every((value, index) => bytes[index] === value);
  const text = () => new TextDecoder().decode(bytes.subarray(0, 512));
  const valid = kind === 'wasm' ? starts(0, 97, 115, 109, 1, 0, 0, 0)
    : kind === 'model' ? starts(0, 0, 80, 75, 3, 4) || starts(80, 75, 3, 4)
      : !/^\s*</.test(text()) && text().includes('ModuleFactory');
  if (!valid) throw new Error('手势资源内容不正确，请重新加载');
}

/** Completed buffers are shared within this page; cancelled/failed loads never enter the cache. */
export class ModelAssetLoader {
  private readonly cache = new Map<string, Uint8Array>();

  constructor(private readonly options: { fetcher?: typeof fetch; idleMs?: number; totalMs?: number } = {}) {}

  async load(url: string, label: string, signal: AbortSignal,
    progress: (value: ModelDownloadProgress) => void, kind?: ModelAssetKind): Promise<Uint8Array> {
    if (signal.aborted) throw abortError();
    const cached = this.cache.get(url);
    if (cached) {
      progress({ label, received: cached.length, total: cached.length, attempt: 1, complete: true });
      return cached;
    }
    for (let attempt = 1; attempt <= 2; attempt++) {
      if (signal.aborted) throw abortError();
      const requestUrl = new URL(url);
      if (attempt > 1) requestUrl.searchParams.set('chora_retry', String(Date.now()));
      const controller = new AbortController();
      const cancel = () => controller.abort(abortError());
      signal.addEventListener('abort', cancel, { once: true });
      let idle: ReturnType<typeof setTimeout> | undefined;
      const resetIdle = () => {
        clearTimeout(idle);
        idle = setTimeout(() => controller.abort(new Error(`${label}下载停顿，请检查网络后重试`)), this.options.idleMs ?? 15000);
      };
      const totalTimer = setTimeout(() => controller.abort(new Error(`${label}下载超时，请检查网络后重试`)), this.options.totalMs ?? 90000);
      let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
      let finished = false;
      let retryable = true;
      try {
        resetIdle();
        progress({ label, received: 0, attempt, complete: false });
        const response = await (this.options.fetcher ?? fetch)(requestUrl.href, { signal: controller.signal, cache: attempt > 1 ? 'reload' : 'default' });
        resetIdle();
        if (!response.ok) {
          retryable = response.status === 408 || response.status === 429 || response.status >= 500;
          throw new Error(`${label}加载失败（HTTP ${response.status}）`);
        }
        if (response.headers.get('content-type')?.includes('text/html')) throw new Error(`${label}返回了网页，请检查资源地址或网络后重试`);
        if (!response.body) throw new Error(`${label}没有返回可读取的内容`);
        // Content-Length describes compressed transfer bytes on Pages. Only use
        // it as a denominator when the stream has not been decompressed.
        const length = Number(response.headers.get('content-length'));
        const total = !response.headers.get('content-encoding') && length > 0 ? length : undefined;
        reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0, lastProgress = -Infinity;
        while (true) {
          const { done, value } = await reader.read();
          if (controller.signal.aborted) throw controller.signal.reason;
          if (done) break;
          chunks.push(value); received += value.length; resetIdle();
          if (performance.now() - lastProgress >= 200) {
            progress({ label, received, total, attempt, complete: false });
            lastProgress = performance.now();
          }
        }
        if (!received) throw new Error(`${label}返回了空文件`);
        if (signal.aborted) throw abortError();
        const bytes = new Uint8Array(received);
        let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
        if (kind) validateModelAsset(bytes, kind);
        this.cache.set(url, bytes);
        finished = true;
        progress({ label, received, total: received, attempt, complete: true });
        return bytes;
      } catch (error) {
        if (signal.aborted) throw abortError();
        if (!retryable || attempt === 2) throw controller.signal.aborted ? controller.signal.reason : error;
      } finally {
        clearTimeout(idle); clearTimeout(totalTimer);
        signal.removeEventListener('abort', cancel);
        if (!finished) { controller.abort(); void reader?.cancel().catch(() => {}); }
        else reader?.releaseLock();
      }
    }
    throw new Error(`${label}加载失败`);
  }
}

/** MediaPipe's SDK uses a global ModuleFactory while loading a script. */
export class ModelInitializationQueue {
  private tail: Promise<void> = Promise.resolve();
  constructor(private readonly timeoutMs = 30000) {}

  run<T extends { close(): void }>(factory: () => Promise<T>, signal: AbortSignal): Promise<T> {
    const controller = new AbortController();
    const cancel = () => controller.abort(abortError());
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) cancel();
    const timer = setTimeout(() => controller.abort(new Error('手势引擎初始化超时，请重试；若仍失败请刷新页面')), this.timeoutMs);
    const operation = this.tail.then(async () => {
      if (controller.signal.aborted) throw controller.signal.reason;
      const model = await factory();
      if (controller.signal.aborted) {
        try { model.close(); } catch { /* A failed graphics context may already be gone. */ }
        throw controller.signal.reason;
      }
      return model;
    });
    // A cancelled caller returns immediately, but the SDK critical section
    // remains locked until the late factory settles and its model is closed.
    this.tail = operation.then(() => {}, () => {});
    return new Promise<T>((resolve, reject) => {
      const abort = () => reject(controller.signal.reason);
      controller.signal.addEventListener('abort', abort, { once: true });
      if (controller.signal.aborted) abort();
      operation.then(resolve, reject).finally(() => controller.signal.removeEventListener('abort', abort));
    }).finally(() => { clearTimeout(timer); signal.removeEventListener('abort', cancel); });
  }
}
