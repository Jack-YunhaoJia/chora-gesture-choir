import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { ModelAssetLoader, ModelInitializationQueue, validateModelAsset, type ModelDownloadProgress } from '../src/vision/model-loader';

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));
const url = 'https://example.test/chora/models/hand_landmarker.task';

test('model asset loading reports decoded byte progress and caches only a complete response', async () => {
  let calls = 0;
  const updates: ModelDownloadProgress[] = [];
  const loader = new ModelAssetLoader({ fetcher: (async () => {
    calls++;
    return new Response(new Uint8Array([1, 2, 3, 4]), { headers: { 'content-length': '2', 'content-encoding': 'gzip' } });
  }) as typeof fetch });
  const first = await loader.load(url, '模型', new AbortController().signal, value => updates.push(value));
  assert.deepEqual(first, new Uint8Array([1, 2, 3, 4]));
  assert.equal(updates.find(value => value.received > 0 && !value.complete)?.total, undefined);
  assert.equal(updates.at(-1)?.received, 4);
  assert.equal(updates.at(-1)?.complete, true);
  const second = await loader.load(url, '模型', new AbortController().signal, () => {});
  assert.equal(first, second);
  assert.equal(calls, 1);
});

test('an inactive download aborts and retries only that resource with a new URL', async () => {
  const requests: { url: string; aborted: boolean }[] = [];
  const loader = new ModelAssetLoader({ idleMs: 12, totalMs: 200, fetcher: ((input, init) => {
    const row = { url: String(input), aborted: false }; requests.push(row);
    if (requests.length === 2) return Promise.resolve(new Response(new Uint8Array([4, 5])));
    return new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => {
      row.aborted = true; reject(init.signal?.reason);
    }, { once: true }));
  }) as typeof fetch });
  assert.deepEqual(await loader.load(url, '模型', new AbortController().signal, () => {}), new Uint8Array([4, 5]));
  assert.equal(requests.length, 2);
  assert.equal(requests[0].url, url);
  assert.equal(requests[0].aborted, true);
  assert.equal(new URL(requests[1].url).origin, new URL(url).origin);
  assert.ok(new URL(requests[1].url).searchParams.has('chora_retry'));
});

test('HTML200 and wrong-format responses cannot poison the warm cache', async () => {
  const good = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]);
  for (const bad of [() => new Response('<!doctype html>', { headers: { 'content-type': 'text/html' } }), () => new Response(new Uint8Array([1, 2, 3]))]) {
    let calls = 0;
    const loader = new ModelAssetLoader({ fetcher: (async () => ++calls <= 2 ? bad() : new Response(good)) as typeof fetch });
    await assert.rejects(loader.load(url, '引擎', new AbortController().signal, () => {}, 'wasm'));
    assert.deepEqual(await loader.load(url, '引擎', new AbortController().signal, () => {}, 'wasm'), good);
    assert.equal(calls, 3);
  }
});

test('published SIMD, non-SIMD and task assets pass the format checks', async () => {
  for (const [path, kind] of [
    ['mediapipe/vision_wasm_internal.js', 'loader'], ['mediapipe/vision_wasm_nosimd_internal.js', 'loader'],
    ['mediapipe/vision_wasm_internal.wasm', 'wasm'], ['mediapipe/vision_wasm_nosimd_internal.wasm', 'wasm'],
    ['models/hand_landmarker.task', 'model'],
  ] as const) validateModelAsset(await readFile(new URL(`../public/${path}`, import.meta.url)), kind);
});

test('cancelling a response body stops the read without retry and does not cache partial bytes', async () => {
  let calls = 0;
  let aborted = false;
  let began: () => void;
  const reading = new Promise<void>(resolve => { began = resolve; });
  const loader = new ModelAssetLoader({ fetcher: (async (_input, init) => {
    calls++;
    if (calls > 1) return new Response(new Uint8Array([8, 9]));
    return new Response(new ReadableStream<Uint8Array>({ start(controller) {
      controller.enqueue(new Uint8Array([1]));
      init?.signal?.addEventListener('abort', () => { aborted = true; controller.error(init.signal?.reason); }, { once: true });
      began();
    } }));
  }) as typeof fetch });
  const controller = new AbortController();
  const task = loader.load(url, '模型', controller.signal, () => {});
  await reading; controller.abort();
  await assert.rejects(task, { name: 'AbortError' });
  assert.equal(aborted, true);
  assert.equal(calls, 1);
  assert.deepEqual(await loader.load(url, '模型', new AbortController().signal, () => {}), new Uint8Array([8, 9]));
  assert.equal(calls, 2);
});

test('HTTP404 fails without retry and an empty response never enters cache', async () => {
  let calls = 0;
  const loader = new ModelAssetLoader({ fetcher: (async () => { calls++; return new Response('', { status: 404 }); }) as typeof fetch });
  await assert.rejects(loader.load(url, '模型', new AbortController().signal, () => {}), /HTTP 404/);
  assert.equal(calls, 1);
  let empties = 0;
  const empty = new ModelAssetLoader({ fetcher: (async () => { empties++; return new Response(new Uint8Array()); }) as typeof fetch });
  await assert.rejects(empty.load(url, '模型', new AbortController().signal, () => {}), /空文件/);
  assert.equal(empties, 2);
});

test('steady but endless bytes hit the total deadline instead of resetting it', async () => {
  let calls = 0, stopped = 0;
  const loader = new ModelAssetLoader({ idleMs: 100, totalMs: 25, fetcher: (async (_input, init) => {
    calls++;
    return new Response(new ReadableStream<Uint8Array>({ start(controller) {
      const timer = setInterval(() => controller.enqueue(new Uint8Array([1])), 3);
      init?.signal?.addEventListener('abort', () => { clearInterval(timer); stopped++; controller.error(init.signal?.reason); }, { once: true });
    } }));
  }) as typeof fetch });
  await assert.rejects(loader.load(url, '模型', new AbortController().signal, () => {}), /下载超时/);
  assert.equal(calls, 2); assert.equal(stopped, 2);
});

test('cancelled model initialization holds the SDK lock and closes its late model before restarting', async () => {
  const queue = new ModelInitializationQueue();
  const controller = new AbortController();
  let finish: (value: { close(): void }) => void;
  let started = false, closed = false, secondStarted = false;
  const first = queue.run(() => { started = true; return new Promise<{ close(): void }>(resolve => { finish = resolve; }); }, controller.signal);
  await tick(); assert.equal(started, true);
  controller.abort(); await assert.rejects(first, { name: 'AbortError' });
  const second = queue.run(async () => { secondStarted = true; assert.equal(closed, true); return { close() {} }; }, new AbortController().signal);
  await tick(); assert.equal(secondStarted, false);
  finish!({ close() { closed = true; } });
  await second; assert.equal(secondStarted, true);
});

test('a timed-out initialization closes a late model and cannot overlap another SDK factory', async () => {
  const queue = new ModelInitializationQueue(15);
  let finish: (value: { close(): void }) => void, closed = false, skippedStarted = false;
  const first = queue.run(() => new Promise<{ close(): void }>(resolve => { finish = resolve; }), new AbortController().signal);
  await assert.rejects(first, /初始化超时/);
  const skipped = queue.run(async () => { skippedStarted = true; return { close() {} }; }, new AbortController().signal);
  await assert.rejects(skipped, /初始化超时/);
  assert.equal(skippedStarted, false);
  finish!({ close() { closed = true; } });
  await tick(); assert.equal(closed, true);
  await queue.run(async () => ({ close() {} }), new AbortController().signal);
  assert.equal(skippedStarted, false);
});
