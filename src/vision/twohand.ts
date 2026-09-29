import { GESTURE_CHORD_STYLES, type ChordQuality, type GestureChordStyle } from '../harmony';
import type { FingerMask, GestureFrame, Handedness, TrackedHand, VoiceMask } from '../types';
import { absentGesture, mapTrackedHandLandmarks, type Landmark } from './gesture';

export const SIGN_DWELL_MS = 140;
export const TRANSITION_HOLD_MS = 250;
const ROLE_CONFIDENCE = 0.6;
const CONTROL_SMOOTHING_MS = 85;
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/**
 * Seven canonical complete signs. VI/VII match the confirmed reference.
 * CHORA deliberately requires the shown I–V shapes instead of arbitrary counts.
 */
export const CHORD_FINGER_MASKS: readonly FingerMask[] = [
  [false, true, false, false, false],
  [false, true, true, false, false],
  [false, true, true, true, false],
  [false, true, true, true, true],
  [true, true, true, true, true],
  [false, true, false, false, true],
  [true, true, false, false, true],
];
const DEGREES = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

export function chordFromFingers(fingers: FingerMask): number | null {
  const index = CHORD_FINGER_MASKS.findIndex((sign) => sign.every((extended, i) => extended === fingers[i]));
  return index < 0 ? null : index;
}

export interface SignState {
  chordIndex: number | null;
  gate: boolean;
  pending: boolean;
}

/**
 * Debounce complete raw signs, never separately debounced fingers. A short
 * accidental intermediate shape therefore cannot become a different chord.
 * Any unresolved transition has one bounded grace period, even if it jitters
 * between several unknown / not-yet-stable shapes.
 */
export class ChordSignDebouncer {
  private stable: number | null = null;
  private armed = false;
  private candidate: number | null = null;
  private candidateSince = 0;
  private transitionSince: number | null = null;

  reset(): void {
    this.stable = null;
    this.armed = false;
    this.candidate = null;
    this.candidateSince = 0;
    this.transitionSince = null;
  }

  update(hand: TrackedHand | undefined, timestamp: number): SignState {
    if (!hand || hand.fingerCount === 0) {
      this.reset();
      return { chordIndex: null, gate: false, pending: false };
    }
    const chord = chordFromFingers(hand.fingers);
    if (chord !== null && chord === this.stable && this.armed) {
      this.candidate = chord;
      this.candidateSince = timestamp;
      this.transitionSince = null;
      return { chordIndex: this.stable, gate: true, pending: false };
    }
    if (this.transitionSince === null) this.transitionSince = timestamp;
    if (this.candidate !== chord) {
      this.candidate = chord;
      this.candidateSince = timestamp;
    }
    if (chord !== null && timestamp - this.candidateSince >= SIGN_DWELL_MS) {
      this.stable = chord;
      this.armed = true;
      this.transitionSince = null;
      return { chordIndex: chord, gate: true, pending: false };
    }
    if (timestamp - this.transitionSince >= TRANSITION_HOLD_MS) this.armed = false;
    return {
      chordIndex: this.stable,
      gate: this.stable !== null && this.armed,
      pending: chord !== null,
    };
  }
}

export interface RightHandModifiers {
  chordStyle: GestureChordStyle;
  octaveShift: 0 | -1;
}

/** The thumb changes register independently from the other four fingers. */
export function modifiersFromFingers(fingers: FingerMask): RightHandModifiers | null {
  const count = fingers.slice(1).filter(Boolean).length;
  if (count === 0) return null;
  return { chordStyle: GESTURE_CHORD_STYLES[count - 1], octaveShift: fingers[0] ? -1 : 0 };
}

/**
 * Commit a whole modifier pose; separately debouncing its fingers could produce
 * a layout/octave combination the performer never held. Pending poses retain
 * the previous accepted value instead of jumping through intermediate colors.
 */
export class RightHandModifierDebouncer {
  private stable: RightHandModifiers | undefined;
  private candidate: RightHandModifiers | undefined;
  private candidateSince = 0;

  reset(): void { this.stable = undefined; this.candidate = undefined; this.candidateSince = 0; }

  update(hand: TrackedHand | undefined, timestamp: number): { value?: RightHandModifiers; pending: boolean } {
    const next = hand ? modifiersFromFingers(hand.fingers) : null;
    if (!next) { this.reset(); return { pending: false }; }
    const same = (other: RightHandModifiers | undefined) => other?.chordStyle === next.chordStyle
      && other.octaveShift === next.octaveShift;
    if (same(this.stable)) {
      this.candidate = next;
      this.candidateSince = timestamp;
      return { value: this.stable, pending: false };
    }
    if (!same(this.candidate)) { this.candidate = next; this.candidateSince = timestamp; }
    if (timestamp - this.candidateSince >= SIGN_DWELL_MS) {
      this.stable = next;
      return { value: this.stable, pending: false };
    }
    return { value: this.stable, pending: true };
  }
}

/** Nominal regions in the mirrored preview; a relaxed upright hand is major. */
export const CHORD_TILT_BOUNDARIES_DEGREES = [-30, -10, 25] as const;
export const CHORD_TILT_HYSTERESIS_DEGREES = 3;
export const CHORD_TILT_ZONES: readonly { quality: ChordQuality; minDegrees: number; maxDegrees: number }[] = [
  { quality: 'diminished', minDegrees: -60, maxDegrees: CHORD_TILT_BOUNDARIES_DEGREES[0] },
  { quality: 'minor', minDegrees: CHORD_TILT_BOUNDARIES_DEGREES[0], maxDegrees: CHORD_TILT_BOUNDARIES_DEGREES[1] },
  { quality: 'major', minDegrees: CHORD_TILT_BOUNDARIES_DEGREES[1], maxDegrees: CHORD_TILT_BOUNDARIES_DEGREES[2] },
  { quality: 'augmented', minDegrees: CHORD_TILT_BOUNDARIES_DEGREES[2], maxDegrees: 60 },
];

/**
 * Keep only the committed region within its 3° edge margin. Outside that
 * margin, choose the actual destination directly, even when crossing several
 * regions. The center belongs to major, so returning upright resets quality.
 */
export function chordQualityFromTilt(tilt: number, previous?: ChordQuality): ChordQuality {
  if (!Number.isFinite(tilt)) return previous ?? 'major';
  const degrees = clamp(tilt) * 120 - 60;
  const stableZone = CHORD_TILT_ZONES.find(zone => zone.quality === previous);
  if (stableZone && degrees >= stableZone.minDegrees - CHORD_TILT_HYSTERESIS_DEGREES
    && degrees <= stableZone.maxDegrees + CHORD_TILT_HYSTERESIS_DEGREES) return stableZone.quality;
  return CHORD_TILT_ZONES.find(zone => degrees < zone.maxDegrees)?.quality ?? 'augmented';
}

export class ChordModeDebouncer {
  private stable: ChordQuality | undefined;
  private candidate: ChordQuality | undefined;
  private candidateSince = 0;

  reset(): void { this.stable = undefined; this.candidate = undefined; this.candidateSince = 0; }

  update(hand: TrackedHand | undefined, timestamp: number): { value?: ChordQuality; pending: boolean } {
    if (!hand || hand.fingerCount === 0) { this.reset(); return { pending: false }; }
    const next = chordQualityFromTilt(hand.tilt, this.stable);
    if (next === this.stable) {
      this.candidate = next;
      this.candidateSince = timestamp;
      return { value: this.stable, pending: false };
    }
    if (next !== this.candidate) { this.candidate = next; this.candidateSince = timestamp; }
    if (timestamp - this.candidateSince >= SIGN_DWELL_MS) {
      this.stable = next;
      return { value: next, pending: false };
    }
    return { value: this.stable, pending: true };
  }
}

class HandControlSmoother {
  private previous: TrackedHand | undefined;
  private previousTime = 0;

  reset(): void { this.previous = undefined; this.previousTime = 0; }

  update(raw: TrackedHand | undefined, timestamp: number): TrackedHand | undefined {
    if (!raw) { this.reset(); return undefined; }
    const previous = this.previous;
    const alpha = previous ? 1 - Math.exp(-Math.max(0, timestamp - this.previousTime) / CONTROL_SMOOTHING_MS) : 1;
    const blend = (key: 'x' | 'y' | 'openness' | 'tilt') => previous
      ? previous[key] + (raw[key] - previous[key]) * alpha : raw[key];
    const hand = { ...raw, x: blend('x'), y: blend('y'), openness: blend('openness'), tilt: blend('tilt') };
    this.previous = hand;
    this.previousTime = timestamp;
    return hand;
  }
}

/** Structural subset of MediaPipe's result, also usable for deterministic tests. */
export interface DetectedHands {
  landmarks: readonly (readonly Landmark[])[];
  worldLandmarks?: readonly (readonly Landmark[])[];
  handedness: readonly (readonly { categoryName: string; score?: number }[])[];
}

export interface HandRoles {
  leftHand?: TrackedHand;
  rightHand?: TrackedHand;
}

/**
 * Assign roles from model categories, never detection-array order or screen x.
 * CSS mirrors only the preview; the tracker sends the original video pixels.
 * `swapHands` explicitly swaps the control roles for the user's camera/setup.
 * If two detections claim the same category at similar confidence, that role
 * stays unavailable instead of risking a sudden instrument-role substitution.
 */
export function assignHandRoles(result: DetectedHands, swapHands = false, imageAspectRatio = 1): HandRoles {
  const candidates: Record<Handedness, { hand: TrackedHand; confidence: number }[]> = { Left: [], Right: [] };
  result.landmarks.forEach((landmarks, index) => {
    const categories = (result.handedness[index] ?? [])
      .filter((category) => category.categoryName === 'Left' || category.categoryName === 'Right')
      .sort((a, b) => (b.score ?? 1) - (a.score ?? 1));
    const category = categories[0];
    if (!category || (category.score ?? 1) < ROLE_CONFIDENCE) return;
    const hand = mapTrackedHandLandmarks(landmarks, result.worldLandmarks?.[index], imageAspectRatio);
    if (!hand) return;
    const handedness = category.categoryName as Handedness;
    hand.handedness = handedness;
    candidates[handedness].push({ hand, confidence: category.score ?? 1 });
  });
  const pick = (handedness: Handedness): TrackedHand | undefined => {
    const matches = candidates[handedness].sort((a, b) => b.confidence - a.confidence);
    if (matches.length > 1 && matches[0].confidence - matches[1].confidence < 0.1) return undefined;
    return matches[0]?.hand;
  };
  return { leftHand: pick(swapHands ? 'Right' : 'Left'), rightHand: pick(swapHands ? 'Left' : 'Right') };
}

/** State is kept independently for the left and right control roles. */
export class TwoHandGestureInterpreter {
  private swapHands = false;
  private chord = new ChordSignDebouncer();
  private mode = new ChordModeDebouncer();
  private modifiers = new RightHandModifierDebouncer();
  private left = new HandControlSmoother();
  private right = new HandControlSmoother();

  reset(): void {
    this.chord.reset(); this.mode.reset(); this.modifiers.reset();
    this.left.reset(); this.right.reset();
  }

  setSwapHands(swapHands: boolean): void {
    if (swapHands === this.swapHands) return;
    this.swapHands = swapHands;
    this.reset();
  }

  update(result: DetectedHands, timestamp: number, imageAspectRatio = 1): GestureFrame {
    const roles = assignHandRoles(result, this.swapHands, imageAspectRatio);
    const leftHand = this.left.update(roles.leftHand, timestamp);
    const rightHand = this.right.update(roles.rightHand, timestamp);
    // Either hand disappearing/closing releases immediately and requires the
    // left sign to settle again when the performer resumes.
    const bothReady = !!leftHand && !!rightHand && leftHand.fingerCount > 0
      && rightHand.fingers.slice(1).some(Boolean);
    const sign = this.chord.update(bothReady ? leftHand : undefined, timestamp);
    const mode = this.mode.update(bothReady ? leftHand : undefined, timestamp);
    const modifiers = this.modifiers.update(bothReady ? rightHand : undefined, timestamp);
    const gate = bothReady && sign.gate;
    let label: string;
    if (!leftHand && !rightHand) label = '请将双手放入画面 · 和弦手选和弦，表情手控制声音';
    else if (!leftHand) label = '和弦手未识别 · 伴奏已静音，请将和弦手放入画面';
    else if (!rightHand) label = '表情手未识别 · 伴奏已静音，请将表情手放入画面';
    else if (leftHand.fingerCount === 0 || rightHand.fingerCount === 0) label = '握拳 · 伴奏已静音';
    else if (!rightHand.fingers.slice(1).some(Boolean)) label = '表情手只伸拇指 · 伴奏已静音，请再伸出至少一根手指';
    else if (chordFromFingers(leftHand.fingers) === null) label = gate
      ? '和弦手换形中 · 保持手势以选择和弦'
      : '和弦手指型未匹配 · 请用 1–5 指、食指＋小指，或再加拇指';
    else if (sign.pending) label = '和弦手指型确认中 · 请短暂停稳';
    else label = `和弦手 ${DEGREES[sign.chordIndex ?? 0]} · 表情手抬高变响，倾斜变亮`;
    const primary = leftHand ?? rightHand;
    const voices: VoiceMask = [gate, gate, gate, gate];
    return {
      ...absentGesture(label),
      present: !!primary,
      leftHand, rightHand,
      x: primary?.x ?? 0.5,
      y: primary?.y ?? 0.5,
      openness: rightHand?.openness ?? 0,
      voices,
      landmarks: primary?.landmarks ?? [],
      chordIndex: sign.chordIndex,
      gate,
      chordMode: mode.value,
      chordModePending: mode.pending,
      chordStylePending: modifiers.pending,
      chordStyle: modifiers.value?.chordStyle,
      octaveShift: modifiers.value?.octaveShift,
      modifiersPending: mode.pending || modifiers.pending,
      brightness: rightHand?.tilt ?? 0.5,
      expression: rightHand ? clamp((0.88 - rightHand.y) / 0.7) : 0,
    };
  }
}
