export type SoundMode = 'ambient' | 'vocoder';
export type SoundPreset = 'moon' | 'glass' | 'warm';
export type VoiceMask = [boolean, boolean, boolean, boolean];
export type FingerMask = [boolean, boolean, boolean, boolean, boolean];
export type Handedness = 'Left' | 'Right';
export interface TrackedHand {
  /** Normalized, unmirrored camera coordinates for the video overlay. */
  landmarks: { x: number; y: number; z: number }[];
  /** Screen position: x follows the mirrored preview. */
  x: number;
  y: number;
  openness: number;
  /** Thumb, index, middle, ring, little finger, from the same raw frame. */
  fingers: FingerMask;
  fingerCount: number;
  /** Palm roll, normalized from -60° to +60° in the mirrored preview. */
  tilt: number;
  label: string;
  handedness?: Handedness;
}
export interface PerformanceState {
  soundPreset?: SoundPreset;
  texture?: number;
  /** Independent wrist filter: 0 dark, 0.5 neutral, 1 bright. */
  wristTone?: number;
  frequencies: [number, number, number, number];
  voices: VoiceMask;
  expression: number;
  brightness: number;
  space: number;
  volume: number;
  mode: SoundMode;
  active: boolean;
}
export interface AudioMetrics {
  inputLevel: number;
  outputLevel: number;
  pitchHz: number | null;
}
export interface GestureFrame {
  chordMode?: 'major' | 'minor';
  chordStyle?: 'open' | 'inversion' | 'seventh' | 'color';
  octaveShift?: 0 | -1;
  modifiersPending?: boolean;
  chordModePending?: boolean;
  chordStylePending?: boolean;
  present: boolean;
  x: number;
  y: number;
  openness: number;
  voices: VoiceMask;
  landmarks: { x: number; y: number; z: number }[];
  label: string;
  leftHand?: TrackedHand;
  rightHand?: TrackedHand;
  chordIndex: number | null;
  gate: boolean;
  brightness: number;
  expression: number;
}
