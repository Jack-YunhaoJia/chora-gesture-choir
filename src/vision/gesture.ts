import type { FingerMask, GestureFrame, TrackedHand, VoiceMask } from '../types';

export type Landmark = { x: number; y: number; z: number };

const FINGERS = [[5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]];
const FINGER_NAMES = ['食指', '中指', '无名指', '小指'];
const PALM = [0, 5, 9, 13, 17];
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const distance = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/** Right-hand tone reaches its extremes at ±30°; left-hand mode keeps ±60°. */
export function mapWristTone(tilt: number, neutral = 0.5): number {
  const center = Number.isFinite(neutral) ? neutral : 0.5;
  const value = Number.isFinite(tilt) ? tilt : center;
  return clamp(0.5 + (value - center) * 2);
}

function jointAngle(a: Landmark, joint: Landmark, b: Landmark): number {
  const first = distance(a, joint);
  const second = distance(b, joint);
  if (first * second < 1e-12) return 0;
  const dot = (a.x - joint.x) * (b.x - joint.x)
    + (a.y - joint.y) * (b.y - joint.y)
    + (a.z - joint.z) * (b.z - joint.z);
  return Math.acos(Math.max(-1, Math.min(1, dot / (first * second)))) * 180 / Math.PI;
}

function validLandmarks(points: readonly Landmark[] | undefined): points is readonly Landmark[] {
  return !!points && points.length === 21 && points.every((point) =>
    Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z));
}

export function gestureLabel(voices: VoiceMask): string {
  const count = voices.filter(Boolean).length;
  if (count === 0) return '握拳 · 静音';
  if (count === 4) return '四指展开 · 全声部';
  return `${FINGER_NAMES.filter((_, index) => voices[index]).join('、')} · ${count} 个声部`;
}

export function absentGesture(label = '等待手势'): GestureFrame {
  return {
    present: false, x: 0.5, y: 0.5, openness: 0,
    voices: [false, false, false, false], landmarks: [], label,
    chordIndex: null, gate: false, brightness: 0.5, expression: 0,
  };
}

/**
 * Finger joints and wrist-relative reach make this independent of hand rotation
 * and handedness. World landmarks avoid perspective distortion when available;
 * normalized landmarks remain unmodified for drawing over the webcam image.
 */
export function mapHandLandmarks(
  landmarks: readonly Landmark[] | undefined,
  worldLandmarks?: readonly Landmark[],
): GestureFrame {
  if (!validLandmarks(landmarks)) return absentGesture();
  const points = validLandmarks(worldLandmarks) ? worldLandmarks : landmarks;
  const wrist = points[0];
  const palmSize = Math.max(distance(wrist, points[9]), distance(points[5], points[17]));
  if (palmSize < 1e-5) return absentGesture();

  const voices: VoiceMask = [false, false, false, false];
  let openness = 0;
  FINGERS.forEach(([base, pip, dip, tip], index) => {
    const chainLength = distance(points[base], points[pip])
      + distance(points[pip], points[dip]) + distance(points[dip], points[tip]);
    const reach = distance(wrist, points[tip]) - distance(wrist, points[pip]);
    voices[index] = jointAngle(points[base], points[pip], points[dip]) > 142
      && jointAngle(points[pip], points[dip], points[tip]) > 135
      && reach > palmSize * 0.12;
    openness += clamp((distance(wrist, points[tip]) - distance(wrist, points[base]))
      / Math.max(chainLength, 1e-5));
  });

  const center = PALM.reduce((sum, index) => ({ x: sum.x + landmarks[index].x, y: sum.y + landmarks[index].y }), { x: 0, y: 0 });
  return {
    present: true,
    x: clamp(1 - center.x / PALM.length),
    y: clamp(center.y / PALM.length),
    openness: openness / 4,
    voices,
    landmarks: landmarks.map(({ x, y, z }) => ({ x, y, z })),
    label: gestureLabel(voices),
    chordIndex: null,
    gate: voices.some(Boolean),
    brightness: 1 - clamp(center.y / PALM.length),
    expression: openness / 4,
  };
}

/**
 * Read all five fingers together. A thumb must be straight AND extend out of the
 * index side of the palm; a straight thumb resting across a fist is still folded.
 * The thumb tests use the same world geometry as the four long fingers.
 */
export function mapTrackedHandLandmarks(
  landmarks: readonly Landmark[] | undefined,
  worldLandmarks?: readonly Landmark[],
  imageAspectRatio = 1,
): TrackedHand | null {
  const frame = mapHandLandmarks(landmarks, worldLandmarks);
  if (!frame.present || !landmarks) return null;
  const points = validLandmarks(worldLandmarks) ? worldLandmarks : landmarks;
  const palmSize = Math.max(distance(points[0], points[9]), distance(points[5], points[17]));
  const side = { x: points[5].x - points[17].x, y: points[5].y - points[17].y, z: points[5].z - points[17].z };
  const sideLength = Math.hypot(side.x, side.y, side.z);
  const thumbOutward = ((points[4].x - points[5].x) * side.x
    + (points[4].y - points[5].y) * side.y
    + (points[4].z - points[5].z) * side.z) / Math.max(sideLength, 1e-5);
  const thumb = jointAngle(points[1], points[2], points[3]) > 130
    && jointAngle(points[2], points[3], points[4]) > 145
    && distance(points[0], points[4]) - distance(points[0], points[2]) > palmSize * 0.05
    && thumbOutward > palmSize * 0.1;
  const fingers: FingerMask = [thumb, ...frame.voices];
  const fingerCount = fingers.filter(Boolean).length;
  // The wrist→middle-knuckle axis measures sideways lean in the mirrored
  // preview, not palm yaw/pitch. Correct the normalized x/y aspect before
  // taking its angle; the raw overlay coordinates remain untouched.
  const aspect = Number.isFinite(imageAspectRatio) && imageAspectRatio > 0 ? imageAspectRatio : 1;
  const roll = Math.atan2((landmarks[0].x - landmarks[9].x) * aspect, landmarks[0].y - landmarks[9].y);
  return {
    landmarks: frame.landmarks, x: frame.x, y: frame.y, openness: frame.openness,
    // Preserve the ±60° tilt contract used by the left-hand mode thresholds.
    fingers, fingerCount, tilt: clamp(0.5 + roll / (2 * Math.PI / 3)),
    label: fingerCount === 0 ? '握拳' : `${['拇指', ...FINGER_NAMES].filter((_, index) => fingers[index]).join('、')}展开`,
  };
}

/** Short per-finger dwell prevents chatter. Hand loss always bypasses the dwell. */
export class GestureSmoother {
  private stable: VoiceMask = [false, false, false, false];
  private candidate: VoiceMask = [false, false, false, false];
  private since = [0, 0, 0, 0];
  private previous: GestureFrame | null = null;
  private previousTime = 0;

  reset(): void {
    this.stable = [false, false, false, false];
    this.candidate = [false, false, false, false];
    this.since = [0, 0, 0, 0];
    this.previous = null;
    this.previousTime = 0;
  }

  update(raw: GestureFrame, timestamp: number): GestureFrame {
    if (!raw.present) {
      this.reset();
      return raw;
    }
    raw.voices.forEach((extended, index) => {
      if (extended !== this.candidate[index]) {
        this.candidate[index] = extended;
        this.since[index] = timestamp;
      }
      const dwell = extended ? 85 : 60;
      if (timestamp - this.since[index] >= dwell) this.stable[index] = extended;
    });
    const alpha = this.previous ? 1 - Math.exp(-Math.max(0, timestamp - this.previousTime) / 85) : 1;
    const blend = (key: 'x' | 'y' | 'openness') => this.previous
      ? this.previous[key] + (raw[key] - this.previous[key]) * alpha : raw[key];
    const frame: GestureFrame = { ...raw, x: blend('x'), y: blend('y'), openness: blend('openness'), voices: [...this.stable], label: gestureLabel(this.stable) };
    this.previous = frame;
    this.previousTime = timestamp;
    return frame;
  }
}
