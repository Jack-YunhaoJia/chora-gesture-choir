import assert from 'node:assert/strict';
import test from 'node:test';
import { CHORD_QUALITIES, type ChordQuality } from '../src/harmony';
import type { FingerMask, Handedness, TrackedHand } from '../src/types';
import { mapTrackedHandLandmarks, mapWristTone, type Landmark } from '../src/vision/gesture';
import {
  assignHandRoles, CHORD_FINGER_MASKS, chordFromFingers, ChordSignDebouncer,
  SIGN_DWELL_MS, TRANSITION_HOLD_MS, TwoHandGestureInterpreter, type DetectedHands,
  modifiersFromFingers, RightHandModifierDebouncer, ChordModeDebouncer,
  CHORD_TILT_ZONES, CHORD_TILT_BOUNDARIES_DEGREES, CHORD_TILT_HYSTERESIS_DEGREES, chordQualityFromTilt,
} from '../src/vision/twohand';

const FIST: FingerMask = [false, false, false, false, false];
const THUMB_ONLY: FingerMask = [true, false, false, false, false];
const OPEN = CHORD_FINGER_MASKS[4];

/** Geometrically distinct straight and bent joints, not a stub of the classifier. */
function keypoints(fingers: FingerMask, shiftX = 0, shiftY = 0): Landmark[] {
  const points = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.75, z: 0 }));
  points[0] = { x: 0.5, y: 0.8, z: 0 };
  points[1] = { x: 0.42, y: 0.7, z: 0 };
  points[2] = { x: 0.33, y: 0.66, z: 0 };
  points[3] = fingers[0] ? { x: 0.25, y: 0.61, z: 0 } : { x: 0.4, y: 0.58, z: -0.06 };
  points[4] = fingers[0] ? { x: 0.17, y: 0.56, z: 0 } : { x: 0.53, y: 0.6, z: -0.04 };
  [5, 9, 13, 17].forEach((base, index) => {
    const x = 0.35 + index * 0.1;
    const extended = fingers[index + 1];
    points[base] = { x, y: 0.55, z: 0 };
    points[base + 1] = { x, y: 0.4, z: 0 };
    points[base + 2] = { x, y: extended ? 0.29 : 0.47, z: extended ? 0 : -0.08 };
    points[base + 3] = { x, y: extended ? 0.2 : 0.61, z: extended ? 0 : -0.05 };
  });
  return points.map((point) => ({ ...point, x: point.x + shiftX, y: point.y + shiftY }));
}

function tracked(fingers: FingerMask): TrackedHand {
  const hand = mapTrackedHandLandmarks(keypoints(fingers));
  assert.ok(hand);
  return hand;
}

function detection(...hands: { role: Handedness; fingers: FingerMask; x?: number; y?: number; confidence?: number }[]): DetectedHands {
  return {
    landmarks: hands.map((hand) => keypoints(hand.fingers, hand.x ?? 0, hand.y ?? 0)),
    handedness: hands.map((hand) => [{ categoryName: hand.role, score: hand.confidence ?? 0.99 }]),
  };
}

function pair(left = CHORD_FINGER_MASKS[0], right = OPEN): DetectedHands {
  return detection({ role: 'Left', fingers: left, x: -0.2 }, { role: 'Right', fingers: right, x: 0.2 });
}

/** Rotate in square-pixel coordinates, then normalize to the camera's aspect. */
function projectedRoll(points: Landmark[], degrees: number, aspect: number): Landmark[] {
  const wrist = points[0];
  const initialRoll = Math.atan2(wrist.x - points[9].x, wrist.y - points[9].y);
  const rotation = initialRoll - degrees * Math.PI / 180;
  return points.map(({ x, y, z }) => ({
    x: wrist.x + ((x - wrist.x) * Math.cos(rotation) - (y - wrist.y) * Math.sin(rotation)) / aspect,
    y: wrist.y + (x - wrist.x) * Math.sin(rotation) + (y - wrist.y) * Math.cos(rotation),
    z,
  }));
}

test('wrist lean has the same signed angle on landscape and portrait camera frames', () => {
  const world = keypoints(OPEN);
  for (const aspect of [1, 4 / 3, 16 / 9, 9 / 16]) {
    for (const degrees of [-60, -30, -12, 0, 12, 30, 60]) {
      const image = projectedRoll(world, degrees, aspect);
      const hand = mapTrackedHandLandmarks(image, world, aspect);
      assert.ok(hand);
      assert.ok(Math.abs(hand.tilt - (0.5 + degrees / 120)) < 1e-12, `${aspect}, ${degrees}`);
      assert.deepEqual(hand.landmarks, image);
      assert.deepEqual(hand.fingers, OPEN);
    }
  }
  // A mirror reverses the visible sideways lean without changing the finger pose.
  const image = projectedRoll(world, 30, 4 / 3);
  const mirrored = image.map(point => ({ ...point, x: 1 - point.x }));
  assert.ok(Math.abs(mapTrackedHandLandmarks(mirrored, world, 4 / 3)!.tilt - 0.25) < 1e-12);
});

test('wrist lean is independent of finger flex, hand translation and scale', () => {
  for (let bits = 0; bits < 32; bits += 1) {
    const fingers = [0, 1, 2, 3, 4].map(bit => Boolean(bits & 1 << bit)) as FingerMask;
    const world = keypoints(fingers);
    const image = projectedRoll(world, -24, 4 / 3)
      .map(point => ({ x: point.x * 0.45 + 0.2, y: point.y * 0.45 + 0.15, z: point.z * 0.45 }));
    const hand = mapTrackedHandLandmarks(image, world, 4 / 3);
    assert.ok(hand);
    assert.deepEqual(hand.fingers, fingers);
    assert.ok(Math.abs(hand.tilt - 0.3) < 1e-12);
  }
});

test('right wrist tone still spans its range at ±30° independently of four left-hand regions', () => {
  const world = keypoints(OPEN);
  for (const [degrees, tone] of [[-60, 0], [-30, 0], [-15, 0.25], [0, 0.5], [15, 0.75], [30, 1], [60, 1]]) {
    const hand = mapTrackedHandLandmarks(projectedRoll(world, degrees, 4 / 3), world, 4 / 3)!;
    assert.ok(Math.abs(mapWristTone(hand.tilt) - tone) < 1e-12);
  }
  for (const [degrees, expected] of [[-45, 'diminished'], [-20, 'minor'], [0, 'major'], [45, 'augmented']] as const) {
    const mode = new ChordModeDebouncer();
    const hand = mapTrackedHandLandmarks(projectedRoll(world, degrees, 4 / 3), world, 4 / 3)!;
    assert.equal(mode.update(hand, 0).value, undefined);
    assert.equal(mode.update(hand, 140).value, expected);
  }
});

test('invalid tone inputs stay neutral and invalid image aspects use square-pixel fallback', () => {
  for (const value of [NaN, Infinity, -Infinity]) assert.equal(mapWristTone(value), 0.5);
  assert.equal(mapWristTone(0.5, NaN), 0.5);
  assert.equal(mapWristTone(0.7, 0.7), 0.5);
  const image = projectedRoll(keypoints(OPEN), 30, 1);
  for (const aspect of [0, -1, NaN, Infinity]) {
    assert.equal(mapTrackedHandLandmarks(image, undefined, aspect)!.tilt, mapTrackedHandLandmarks(image)!.tilt);
  }
});

test('camera aspect flows through role assignment and publishes independent wrist controls', () => {
  for (const aspect of [4 / 3, 16 / 9, 9 / 16]) {
    const result = pair(CHORD_FINGER_MASKS[0], OPEN);
    const world = result.landmarks;
    result.worldLandmarks = world;
    result.landmarks = [projectedRoll([...world[0]], -13, aspect), projectedRoll([...world[1]], 30, aspect)];
    const interpreter = new TwoHandGestureInterpreter();
    interpreter.update(result, 0, aspect);
    const frame = interpreter.update(result, 140, aspect);
    assert.equal(frame.gate, true);
    assert.equal(frame.chordIndex, 0);
    assert.equal(frame.chordMode, 'minor');
    assert.ok(Math.abs(frame.leftHand!.tilt - (0.5 - 13 / 120)) < 1e-12);
    assert.ok(Math.abs(frame.brightness - 0.75) < 1e-12);
    assert.ok(Math.abs(mapWristTone(frame.brightness) - 1) < 1e-12);
    assert.deepEqual(frame.rightHand!.landmarks, result.landmarks[1]);
  }
});

test('four qualities travel through camera projection and role assignment, and loss rearms at neutral major', () => {
  for (const aspect of [4 / 3, 16 / 9, 9 / 16]) {
    for (const [degrees, expected] of [[-45, 'diminished'], [-20, 'minor'], [0, 'major'], [45, 'augmented']] as const) {
      const result = pair(CHORD_FINGER_MASKS[0], OPEN);
      const world = result.landmarks;
      result.worldLandmarks = world;
      result.landmarks = [projectedRoll([...world[0]], degrees, aspect), projectedRoll([...world[1]], 0, aspect)];
      const interpreter = new TwoHandGestureInterpreter();
      const first = interpreter.update(result, 0, aspect);
      assert.equal(first.gate, false);
      assert.equal(first.chordMode, undefined);
      const accepted = interpreter.update(result, 140, aspect);
      assert.equal(accepted.gate, true);
      assert.equal(accepted.chordMode, expected);
      assert.equal(accepted.chordIndex, 0);
      const missing = interpreter.update({ landmarks: [], handedness: [] }, 141, aspect);
      assert.equal(missing.gate, false);
      assert.equal(missing.chordMode, undefined);
      result.landmarks = [projectedRoll([...world[0]], 0, aspect), projectedRoll([...world[1]], 0, aspect)];
      const reentry = interpreter.update(result, 142, aspect);
      assert.equal(reentry.gate, false);
      assert.equal(reentry.chordMode, undefined);
      assert.equal(interpreter.update(result, 281, aspect).chordMode, undefined);
      const neutral = interpreter.update(result, 282, aspect);
      assert.equal(neutral.gate, true);
      assert.equal(neutral.chordMode, 'major');
    }
  }
});

test('all 32 full finger shapes preserve thumb and individual fingers', () => {
  for (let bits = 0; bits < 32; bits += 1) {
    const fingers = [0, 1, 2, 3, 4].map((bit) => Boolean(bits & 1 << bit)) as FingerMask;
    const result = tracked(fingers);
    assert.deepEqual(result.fingers, fingers);
    assert.equal(result.fingerCount, fingers.filter(Boolean).length);
  }
});

test('all seven declared chord signs match exactly; thumb-only and other counts do not substitute', () => {
  CHORD_FINGER_MASKS.forEach((fingers, chord) => assert.equal(chordFromFingers(tracked(fingers).fingers), chord));
  for (const shape of [FIST, THUMB_ONLY, [false, false, true, false, false], [true, false, false, false, true], [true, true, false, false, false]]) {
    assert.equal(chordFromFingers(shape as FingerMask), null);
  }
});

test('thumb reading is invariant to hand scale, 3D rotation and mirroring', () => {
  for (const fingers of CHORD_FINGER_MASKS) {
    for (const mirror of [-1, 1]) {
      for (const angle of [-1.1, 0.3, Math.PI]) {
        const transformed = keypoints(fingers).map(({ x, y, z }) => ({
          x: mirror * (x * Math.cos(angle) - y * Math.sin(angle)) * 0.4,
          y: (x * Math.sin(angle) + y * Math.cos(angle)) * 0.4,
          z: z * 0.4,
        }));
        assert.deepEqual(mapTrackedHandLandmarks(transformed)?.fingers, fingers);
      }
    }
  }
});

test('world geometry supplies the thumb as well as all four fingers; collapsed hands are rejected', () => {
  assert.deepEqual(mapTrackedHandLandmarks(keypoints(FIST), keypoints(OPEN))?.fingers, OPEN);
  assert.equal(mapTrackedHandLandmarks([]), null);
  assert.equal(mapTrackedHandLandmarks(Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }))), null);
  const corrupt = keypoints(OPEN);
  corrupt[4].z = NaN;
  assert.equal(mapTrackedHandLandmarks(corrupt), null);
});

test('straight thumb resting inside the palm does not become an extended thumb', () => {
  const points = keypoints(CHORD_FINGER_MASKS[3]);
  points[1] = { x: 0.25, y: 0.68, z: 0 };
  points[2] = { x: 0.34, y: 0.63, z: 0 };
  points[3] = { x: 0.43, y: 0.58, z: 0 };
  points[4] = { x: 0.52, y: 0.53, z: 0 };
  assert.equal(mapTrackedHandLandmarks(points)?.fingers[0], false);
});

test('new full sign must persist for 140ms, and incidental intermediate chords never commit', () => {
  const smoother = new ChordSignDebouncer();
  const one = tracked(CHORD_FINGER_MASKS[0]);
  const two = tracked(CHORD_FINGER_MASKS[1]);
  const three = tracked(CHORD_FINGER_MASKS[2]);
  assert.deepEqual(smoother.update(one, 0), { chordIndex: null, gate: false, pending: true });
  assert.equal(smoother.update(one, SIGN_DWELL_MS - 1).gate, false);
  assert.deepEqual(smoother.update(one, SIGN_DWELL_MS), { chordIndex: 0, gate: true, pending: false });
  assert.equal(smoother.update(two, 200).chordIndex, 0);
  assert.equal(smoother.update(two, 250).chordIndex, 0);
  assert.equal(smoother.update(three, 300).chordIndex, 0);
  assert.equal(smoother.update(three, 439).chordIndex, 0);
  assert.equal(smoother.update(three, 440).chordIndex, 2);
});

test('unstable valid signs cannot extend the transition grace period indefinitely', () => {
  const smoother = new ChordSignDebouncer();
  smoother.update(tracked(CHORD_FINGER_MASKS[0]), 0);
  smoother.update(tracked(CHORD_FINGER_MASKS[0]), 140);
  assert.equal(smoother.update(tracked(CHORD_FINGER_MASKS[1]), 200).gate, true);
  assert.equal(smoother.update(tracked(CHORD_FINGER_MASKS[2]), 300).gate, true);
  assert.equal(smoother.update(tracked(CHORD_FINGER_MASKS[1]), 400).gate, true);
  assert.equal(smoother.update(tracked(CHORD_FINGER_MASKS[2]), 450).gate, false);
});

test('unknown shape holds at most 250ms, and reopening after silence needs a stable sign', () => {
  const smoother = new ChordSignDebouncer();
  const known = tracked(CHORD_FINGER_MASKS[0]);
  const unknown = tracked(THUMB_ONLY);
  smoother.update(known, 0);
  smoother.update(known, 140);
  assert.equal(smoother.update(unknown, 200).gate, true);
  assert.equal(smoother.update(unknown, 200 + TRANSITION_HOLD_MS - 1).gate, true);
  assert.equal(smoother.update(unknown, 200 + TRANSITION_HOLD_MS).gate, false);
  assert.equal(smoother.update(known, 500).gate, false);
  assert.equal(smoother.update(known, 640).gate, true);
});

test('fist and left hand loss bypass all debounce and reset chord arming', () => {
  for (const hand of [tracked(FIST), undefined]) {
    const smoother = new ChordSignDebouncer();
    const known = tracked(CHORD_FINGER_MASKS[0]);
    smoother.update(known, 0);
    smoother.update(known, 140);
    assert.equal(smoother.update(hand, 141).gate, false);
    assert.equal(smoother.update(known, 142).gate, false);
  }
});

test('hand roles follow categories when arrays reorder or hands cross the screen', () => {
  const interpreter = new TwoHandGestureInterpreter();
  const original = pair();
  interpreter.update(original, 0);
  assert.equal(interpreter.update(original, 140).gate, true);
  const crossed = detection(
    { role: 'Right', fingers: OPEN, x: -0.2 },
    { role: 'Left', fingers: CHORD_FINGER_MASKS[0], x: 0.2 },
  );
  const frame = interpreter.update(crossed, 190);
  assert.equal(frame.chordIndex, 0);
  assert.equal(frame.gate, true);
  assert.equal(frame.leftHand?.handedness, 'Left');
  assert.equal(frame.rightHand?.handedness, 'Right');
  assert.deepEqual(frame.leftHand?.fingers, CHORD_FINGER_MASKS[0]);
  assert.deepEqual(frame.rightHand?.fingers, OPEN);
  assert.deepEqual(frame.leftHand?.landmarks, crossed.landmarks[1]);
});

test('either missing role or either fist mutes immediately, retaining any visible hand for feedback', () => {
  for (const missing of [
    detection({ role: 'Right', fingers: OPEN }),
    detection({ role: 'Left', fingers: CHORD_FINGER_MASKS[0] }),
    pair(FIST), pair(CHORD_FINGER_MASKS[0], FIST),
  ]) {
    const interpreter = new TwoHandGestureInterpreter();
    interpreter.update(pair(), 0);
    assert.equal(interpreter.update(pair(), 140).gate, true);
    const off = interpreter.update(missing, 141);
    assert.equal(off.gate, false);
    assert.equal(off.present, true);
    assert.deepEqual(off.voices, [false, false, false, false]);
    assert.equal(interpreter.update(pair(), 142).gate, false);
  }
});

test('ambiguous, weak or missing handedness is never guessed by landmark-array order', () => {
  const duplicate = detection({ role: 'Left', fingers: OPEN }, { role: 'Left', fingers: CHORD_FINGER_MASKS[0] });
  assert.deepEqual(assignHandRoles(duplicate), { leftHand: undefined, rightHand: undefined });
  const weak = detection({ role: 'Left', fingers: OPEN, confidence: 0.55 }, { role: 'Right', fingers: OPEN });
  assert.equal(assignHandRoles(weak).leftHand, undefined);
  assert.equal(assignHandRoles({ landmarks: pair().landmarks, handedness: [] }).leftHand, undefined);
});

test('swapping roles clears accepted harmony and reads each quality from the new chord wrist', () => {
  for (const aspect of [4 / 3, 9 / 16]) {
    for (const [degrees, expected] of [[-45, 'diminished'], [-20, 'minor'], [0, 'major'], [45, 'augmented']] as const) {
      const result = pair();
      const world = result.landmarks;
      result.worldLandmarks = world;
      result.landmarks = [projectedRoll([...world[0]], -45, aspect), projectedRoll([...world[1]], degrees, aspect)];
      const interpreter = new TwoHandGestureInterpreter();
      interpreter.update(result, 0, aspect);
      const original = interpreter.update(result, 140, aspect);
      assert.equal(original.chordIndex, 0);
      assert.equal(original.chordMode, 'diminished');
      interpreter.setSwapHands(true);
      const pending = interpreter.update(result, 141, aspect);
      assert.equal(pending.gate, false);
      assert.equal(pending.chordMode, undefined);
      assert.equal(pending.chordStyle, undefined);
      assert.equal(pending.octaveShift, undefined);
      assert.equal(pending.leftHand?.handedness, 'Right');
      assert.equal(pending.rightHand?.handedness, 'Left');
      const swapped = interpreter.update(result, 281, aspect);
      assert.equal(swapped.gate, true);
      assert.equal(swapped.chordIndex, 4);
      assert.equal(swapped.chordMode, expected);
      assert.equal(swapped.chordStyle, 'open');
      assert.equal(swapped.octaveShift, 0);
      assert.equal(mapWristTone(swapped.brightness), 0);
      interpreter.setSwapHands(true);
      assert.equal(interpreter.update(result, 282, aspect).gate, true);
      interpreter.setSwapHands(false);
      assert.equal(interpreter.update(result, 283, aspect).chordMode, undefined);
      assert.equal(interpreter.update(result, 423, aspect).chordMode, 'diminished');
    }
  }
});

test('right height and mirrored palm tilt control expression and brightness independently of the left hand', () => {
  const interpreter = new TwoHandGestureInterpreter();
  const first = interpreter.update(pair(), 0);
  const raised = pair();
  raised.landmarks = [raised.landmarks[0], raised.landmarks[1].map((point) => ({ ...point, x: point.x + (0.8 - point.y) * 0.8, y: point.y - 0.2 }))];
  // Keep geometric finger posture independent from the changed camera projection.
  raised.worldLandmarks = pair().landmarks;
  const changed = interpreter.update(raised, 50);
  assert.ok(changed.expression > first.expression);
  assert.ok(changed.brightness < first.brightness);
  assert.equal(changed.leftHand?.x, first.leftHand?.x);
  assert.deepEqual(changed.rightHand?.landmarks, raised.landmarks[1]);
  const settled = interpreter.update(raised, 1000);
  assert.ok(settled.expression > changed.expression);
  assert.ok(settled.brightness < changed.brightness);
  assert.ok(settled.expression <= 1 && settled.expression >= 0);
  assert.ok(settled.brightness <= 1 && settled.brightness >= 0);
});


test('confirmed sixth and seventh signs are horns and horns with thumb, not shaka or L', () => {
  assert.equal(chordFromFingers([false, true, false, false, true]), 5);
  assert.equal(chordFromFingers([true, true, false, false, true]), 6);
  assert.equal(chordFromFingers([true, false, false, false, true]), null);
  assert.equal(chordFromFingers([true, true, false, false, false]), null);
});

test('right styles count non-thumb fingers and thumb independently lowers exactly one octave', () => {
  const expected = ['open', 'inversion', 'seventh', 'color'];
  for (let mask = 0; mask < 16; mask += 1) {
    const fingers = [false, ...[0, 1, 2, 3].map(bit => Boolean(mask & 1 << bit))] as FingerMask;
    const count = fingers.slice(1).filter(Boolean).length;
    for (const thumb of [false, true]) {
      fingers[0] = thumb;
      const result = modifiersFromFingers(tracked(fingers).fingers);
      if (count === 0) assert.equal(result, null);
      else assert.deepEqual(result, { chordStyle: expected[count - 1], octaveShift: thumb ? -1 : 0 });
    }
  }
});

test('right style and octave commit as a pair after a stable pose, skipping intermediate shapes', () => {
  const debounce = new RightHandModifierDebouncer();
  const one = tracked([false, true, false, false, false]);
  const intermediate = tracked([true, true, true, false, false]);
  const final = tracked([true, true, true, true, false]);
  assert.deepEqual(debounce.update(one, 0), { value: undefined, pending: true });
  assert.equal(debounce.update(one, 139).value, undefined);
  const initial = { chordStyle: 'open', octaveShift: 0 };
  assert.deepEqual(debounce.update(one, 140), { value: initial, pending: false });
  assert.deepEqual(debounce.update(intermediate, 200), { value: initial, pending: true });
  assert.deepEqual(debounce.update(final, 300), { value: initial, pending: true });
  assert.deepEqual(debounce.update(final, 439), { value: initial, pending: true });
  assert.deepEqual(debounce.update(final, 440), { value: { chordStyle: 'seventh', octaveShift: -1 }, pending: false });
  // A brief thumb fold must not make the instrument leap to the upper octave.
  assert.equal(debounce.update(tracked([false, true, true, true, false]), 450).value?.octaveShift, -1);
  assert.deepEqual(debounce.update(final, 470), { value: { chordStyle: 'seventh', octaveShift: -1 }, pending: false });
});

test('four tilt regions cover the complete roll range in dim/minor/major/aug order with neutral major', () => {
  const quality = (degrees: number, previous?: ChordQuality) => chordQualityFromTilt((degrees + 60) / 120, previous);
  assert.deepEqual(CHORD_TILT_ZONES.map(zone => zone.quality), CHORD_QUALITIES);
  assert.equal(CHORD_TILT_ZONES[0].minDegrees, -60);
  assert.equal(CHORD_TILT_ZONES.at(-1)?.maxDegrees, 60);
  assert.deepEqual(CHORD_TILT_BOUNDARIES_DEGREES, [-30, -10, 25]);
  assert.equal(CHORD_TILT_HYSTERESIS_DEGREES, 3);
  for (const degrees of [-100, -60, -45, -30.001]) assert.equal(quality(degrees), 'diminished');
  for (const degrees of [-30, -20, -10.001]) assert.equal(quality(degrees), 'minor');
  for (const degrees of [-10, 0, 24.999]) assert.equal(quality(degrees), 'major');
  for (const degrees of [25, 45, 60, 100]) assert.equal(quality(degrees), 'augmented');
  for (const previous of CHORD_QUALITIES) assert.equal(quality(0, previous), 'major');
  for (const invalid of [NaN, Infinity, -Infinity]) {
    assert.equal(chordQualityFromTilt(invalid), 'major');
    assert.equal(chordQualityFromTilt(invalid, 'minor'), 'minor');
  }
});

test('all three tilt boundaries resist noise from either side and require a fresh 140ms stable destination', () => {
  const base = tracked(CHORD_FINGER_MASKS[0]);
  const hand = (degrees: number) => ({ ...base, tilt: (degrees + 60) / 120 });
  const centers = [-45, -20, 0, 45];
  for (const [index, boundary] of CHORD_TILT_BOUNDARIES_DEGREES.entries()) {
    for (const direction of [-1, 1]) {
      const from = direction === 1 ? index : index + 1;
      const to = direction === 1 ? index + 1 : index;
      const debounce = new ChordModeDebouncer();
      debounce.update(hand(centers[from]), 0);
      assert.deepEqual(debounce.update(hand(centers[from]), 140), { value: CHORD_QUALITIES[from], pending: false });
      for (const [offset, timestamp] of [[-2.9, 200], [2.9, 400], [-1, 600], [1, 800]]) {
        assert.deepEqual(debounce.update(hand(boundary + offset), timestamp), { value: CHORD_QUALITIES[from], pending: false });
      }
      const destination = hand(boundary + direction * 3.2);
      assert.deepEqual(debounce.update(destination, 1000), { value: CHORD_QUALITIES[from], pending: true });
      // Touching the former region cancels the excursion instead of accruing dwell.
      assert.deepEqual(debounce.update(hand(boundary), 1100), { value: CHORD_QUALITIES[from], pending: false });
      assert.equal(debounce.update(destination, 1200).value, CHORD_QUALITIES[from]);
      assert.equal(debounce.update(destination, 1339).value, CHORD_QUALITIES[from]);
      assert.deepEqual(debounce.update(destination, 1340), { value: CHORD_QUALITIES[to], pending: false });
    }
  }
});

test('returning upright confirms major from every region; fast sweeps never commit intermediate qualities', () => {
  const base = tracked(CHORD_FINGER_MASKS[0]);
  const hand = (degrees: number) => ({ ...base, tilt: (degrees + 60) / 120 });
  for (const [degrees, expected] of [[-45, 'diminished'], [-20, 'minor'], [45, 'augmented']] as const) {
    const debounce = new ChordModeDebouncer();
    debounce.update(hand(degrees), 0);
    assert.equal(debounce.update(hand(degrees), 140).value, expected);
    assert.deepEqual(debounce.update(hand(0), 200), { value: expected, pending: true });
    assert.equal(debounce.update(hand(0), 339).value, expected);
    assert.deepEqual(debounce.update(hand(0), 340), { value: 'major', pending: false });
  }
  const debounce = new ChordModeDebouncer();
  debounce.update(hand(-45), 0);
  debounce.update(hand(-45), 140);
  assert.equal(debounce.update(hand(-20), 200).value, 'diminished');
  assert.equal(debounce.update(hand(0), 250).value, 'diminished');
  assert.equal(debounce.update(hand(45), 300).value, 'diminished');
  assert.equal(debounce.update(hand(45), 439).value, 'diminished');
  assert.deepEqual(debounce.update(hand(45), 440), { value: 'augmented', pending: false });
});

test('modifier hand loss, fists and thumb-only reset acceptance so reopening cannot reuse stale state', () => {
  for (const invalid of [undefined, tracked(FIST), tracked(THUMB_ONLY)]) {
    const debounce = new RightHandModifierDebouncer();
    const lowered = tracked([true, true, false, false, false]);
    debounce.update(lowered, 0);
    assert.equal(debounce.update(lowered, 140).value?.octaveShift, -1);
    assert.deepEqual(debounce.update(invalid, 141), { pending: false });
    assert.equal(debounce.update(lowered, 142).value, undefined);
  }
  for (const invalid of [undefined, tracked(FIST)]) {
    for (const [degrees, expected] of [[-45, 'diminished'], [-20, 'minor'], [45, 'augmented']] as const) {
      const mode = new ChordModeDebouncer();
      const tilted = { ...tracked(CHORD_FINGER_MASKS[0]), tilt: (degrees + 60) / 120 };
      const upright = { ...tilted, tilt: 0.5 };
      mode.update(tilted, 0);
      assert.equal(mode.update(tilted, 140).value, expected);
      assert.deepEqual(mode.update(invalid, 141), { pending: false });
      assert.deepEqual(mode.update(upright, 142), { value: undefined, pending: true });
      assert.equal(mode.update(upright, 281).value, undefined);
      assert.deepEqual(mode.update(upright, 282), { value: 'major', pending: false });
    }
  }
});

test('interpreter publishes only accepted modifiers and mutes thumb-only despite a stable left chord', () => {
  const interpreter = new TwoHandGestureInterpreter();
  const initial = pair(CHORD_FINGER_MASKS[0], [false, true, false, false, false]);
  const first = interpreter.update(initial, 0);
  assert.equal(first.chordStyle, undefined);
  assert.equal(first.octaveShift, undefined);
  assert.equal(first.modifiersPending, true);
  const accepted = interpreter.update(initial, 140);
  assert.equal(accepted.gate, true);
  assert.equal(accepted.chordStyle, 'open');
  assert.equal(accepted.octaveShift, 0);
  assert.equal(accepted.chordMode, 'major');
  const changed = pair(CHORD_FINGER_MASKS[0], [true, true, true, true, false]);
  assert.equal(interpreter.update(changed, 200).chordStyle, 'open');
  assert.equal(interpreter.update(changed, 340).chordStyle, 'seventh');
  const off = interpreter.update(pair(CHORD_FINGER_MASKS[0], THUMB_ONLY), 341);
  assert.equal(off.gate, false);
  assert.equal(off.chordMode, undefined);
  assert.equal(off.chordStyle, undefined);
  assert.equal(off.octaveShift, undefined);
  assert.match(off.label, /只伸拇指/);
});
