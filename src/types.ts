import type { ChordQuality, GestureChordStyle } from './harmony';

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
  /** Microphone boost before analysis and the vocoder: 0–24 dB, default 12 dB. */
  microphoneGainDb?: number;
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
  /** Post-gain RMS meter: -60 dBFS maps to 0, 0 dBFS to 1. */
  inputLevel: number;
  /** Post-gain RMS dBFS; silence is reported as the finite floor -90 dBFS. */
  inputDb?: number;
  /** Post-gain absolute peak; may exceed 1 inside Web Audio's float graph. */
  inputPeak?: number;
  /** Post-gain near/full-scale warning, not proof of hardware clipping. */
  inputClipped?: boolean;
  /** Capture signal before the user-controlled microphone boost. */
  rawInputDb?: number;
  rawInputPeak?: number;
  rawInputClipped?: boolean;
  outputLevel: number;
  pitchHz: number | null;
}
export interface GestureFrame {
  chordMode?: ChordQuality;
  chordStyle?: GestureChordStyle;
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
