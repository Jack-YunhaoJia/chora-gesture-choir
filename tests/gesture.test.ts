import assert from 'node:assert/strict';
import test from 'node:test';
import type { VoiceMask } from '../src/types';
import { absentGesture, GestureSmoother, mapHandLandmarks, type Landmark } from '../src/vision/gesture';

function hand(voices: VoiceMask): Landmark[] {
  const points = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.75, z: 0 }));
  points[0] = { x: 0.5, y: 0.8, z: 0 };
  [5, 9, 13, 17].forEach((base, index) => {
    const x = 0.35 + index * 0.1;
    points[base] = { x, y: 0.55, z: 0 };
    points[base + 1] = { x, y: 0.4, z: 0 };
    points[base + 2] = { x, y: voices[index] ? 0.29 : 0.47, z: voices[index] ? 0 : -0.08 };
    points[base + 3] = { x, y: voices[index] ? 0.2 : 0.61, z: voices[index] ? 0 : -0.05 };
  });
  return points;
}

test('each non-thumb finger independently selects its own voice', () => {
  for (let mask = 0; mask < 16; mask += 1) {
    const voices = [0, 1, 2, 3].map((bit) => Boolean(mask & (1 << bit))) as VoiceMask;
    assert.deepEqual(mapHandLandmarks(hand(voices)).voices, voices);
  }
});

test('rotation and horizontal mirroring do not change finger selection', () => {
  const voices: VoiceMask = [true, false, true, false];
  const points = hand(voices);
  for (const angle of [Math.PI / 3, Math.PI / 2, Math.PI, -Math.PI / 4]) {
    for (const mirrored of [-1, 1]) {
      const rotated = points.map(({ x, y, z }) => ({
        x: 0.5 + mirrored * ((x - 0.5) * Math.cos(angle) - (y - 0.5) * Math.sin(angle)),
        y: 0.5 + (x - 0.5) * Math.sin(angle) + (y - 0.5) * Math.cos(angle),
        z,
      }));
      assert.deepEqual(mapHandLandmarks(rotated).voices, voices);
    }
  }
});

test('screen x is mirrored while the overlay retains original landmarks', () => {
  const points = hand([true, true, true, true]).map((point) => ({ ...point, x: point.x - 0.2 }));
  const frame = mapHandLandmarks(points);
  assert.equal(frame.x, 0.7);
  assert.ok(Math.abs(frame.y - 0.6) < 1e-10);
  assert.deepEqual(frame.landmarks, points);
  assert.notEqual(frame.landmarks, points);
  assert.ok(frame.openness > 0.8 && frame.openness <= 1);
});

test('world joints supply geometry independently of perspective', () => {
  const expected: VoiceMask = [false, true, true, false];
  const flattened = hand([false, false, false, false]);
  assert.deepEqual(mapHandLandmarks(flattened, hand(expected)).voices, expected);
});

test('missing, corrupt and collapsed landmarks safely release every voice', () => {
  const collapsed = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  const invalid = hand([true, true, true, true]);
  invalid[7].x = Number.NaN;
  for (const input of [undefined, [], collapsed, invalid]) {
    const frame = mapHandLandmarks(input);
    assert.equal(frame.present, false);
    assert.deepEqual(frame.voices, [false, false, false, false]);
  }
});

test('brief finger jitter cannot start a voice; stable extension and release can', () => {
  const smoother = new GestureSmoother();
  const extended = mapHandLandmarks(hand([true, false, false, false]));
  const fist = mapHandLandmarks(hand([false, false, false, false]));
  assert.equal(smoother.update(extended, 0).voices[0], false);
  assert.equal(smoother.update(fist, 50).voices[0], false);
  assert.equal(smoother.update(extended, 100).voices[0], false);
  assert.equal(smoother.update(extended, 200).voices[0], true);
  assert.equal(smoother.update(fist, 250).voices[0], true);
  assert.equal(smoother.update(fist, 320).voices[0], false);
});

test('losing the hand releases immediately and a reacquired hand must settle again', () => {
  const smoother = new GestureSmoother();
  const extended = mapHandLandmarks(hand([true, true, true, true]));
  smoother.update(extended, 1000);
  assert.deepEqual(smoother.update(extended, 1100).voices, [true, true, true, true]);
  assert.deepEqual(smoother.update(absentGesture(), 1101).voices, [false, false, false, false]);
  assert.deepEqual(smoother.update(extended, 1102).voices, [false, false, false, false]);
});

test('continuous controls are smoothed without delaying landmarks', () => {
  const smoother = new GestureSmoother();
  const left = mapHandLandmarks(hand([true, false, false, false]));
  const right = { ...left, x: 1, y: 0, openness: 1 };
  smoother.update(left, 0);
  const next = smoother.update(right, 50);
  assert.ok(next.x > left.x && next.x < right.x);
  assert.ok(next.y < left.y && next.y > right.y);
  assert.equal(next.landmarks, right.landmarks);
});
