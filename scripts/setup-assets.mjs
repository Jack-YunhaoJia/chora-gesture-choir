import { cp, mkdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const visionPackage = dirname(fileURLToPath(import.meta.resolve('@mediapipe/tasks-vision')));
const publicPath = join(root, 'public');
await mkdir(join(publicPath, 'mediapipe'), { recursive: true });
await cp(join(visionPackage, 'wasm'), join(publicPath, 'mediapipe'), { recursive: true });

const modelDirectory = join(publicPath, 'models');
const modelPath = join(modelDirectory, 'hand_landmarker.task');
await mkdir(modelDirectory, { recursive: true });
const existing = await stat(modelPath).catch(() => null);
if (!existing || existing.size < 1_000_000) {
  const url = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
  console.log('Downloading MediaPipe Hand Landmarker model (version 1)…');
  const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`Hand model download failed: ${response.status} ${response.statusText}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length < 1_000_000) throw new Error('Hand model download was incomplete.');
  const temporary = `${modelPath}.download`;
  try {
    await writeFile(temporary, bytes);
    await rename(temporary, modelPath);
  } finally {
    await unlink(temporary).catch(() => {});
  }
}
console.log('Hand tracking WASM and model are ready in public/. Camera images stay in this browser.');
