export const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
export type ChordVoicing = 'triad' | 'seventh';
export type HarmonyMode = 'diatonic' | 'major' | 'minor';
export type GestureChordStyle = 'open' | 'inversion' | 'seventh' | 'color';
export interface HarmonyOptions {
  /** Omit to retain the original diatonic accompaniment. */
  mode?: HarmonyMode;
  /** Right-hand layout. Omit to use the existing triad/seventh setting. */
  style?: GestureChordStyle;
  /** An octave count, rather than a semitone offset. */
  octaveShift?: 0 | -1;
}
export const GESTURE_CHORD_STYLES: readonly GestureChordStyle[] = ['open', 'inversion', 'seventh', 'color'];
export const GESTURE_STYLE_NAMES: Record<GestureChordStyle, string> = {
  open: '开放三和弦', inversion: '第一转位', seventh: '七和弦', color: '属七 / 减七',
};
export const CHORDS = [
  { degree: 'I', label: 'maj7', root: 0, notes: [0, 4, 7, 11], mood: '明亮 · 悬浮' },
  { degree: 'ii', label: 'm7', root: 2, notes: [2, 5, 9, 12], mood: '柔和 · 启程' },
  { degree: 'iii', label: 'm7', root: 4, notes: [4, 7, 11, 14], mood: '含蓄 · 漫游' },
  { degree: 'IV', label: 'maj7', root: 5, notes: [5, 9, 12, 16], mood: '开阔 · 温暖' },
  { degree: 'V', label: '7', root: 7, notes: [7, 11, 14, 17], mood: '流动 · 归途' },
  { degree: 'vi', label: 'm7', root: 9, notes: [9, 12, 16, 19], mood: '柔软 · 内省' },
  { degree: 'vii', label: 'm7b5', root: 11, notes: [11, 14, 17, 21], mood: '悬念 · 牵引' },
];
/**
 * Free major/minor changes chord quality, not the seven root pitch classes.
 * CHORA keeps VII above the tonic, unlike the reference site's lower VII.
 */
function chordShape(index: number, voicing: ChordVoicing, options: HarmonyOptions): { label: string; intervals: number[] } {
  const chord = CHORDS[index];
  const mode = options.mode ?? 'diatonic';
  const diatonic = mode === 'diatonic';
  const minor = mode === 'minor' || (diatonic && chord.label.startsWith('m') && chord.label !== 'maj7');
  const fifth = diatonic && chord.label === 'm7b5' ? 6 : 7;
  const third = minor ? 3 : 4;
  const triadLabel = fifth === 6 ? 'dim' : minor ? 'm' : '';
  const seventhLabel = diatonic ? chord.label : minor ? 'm7' : 'maj7';
  const seventh = diatonic ? chord.notes[3] - chord.root : minor ? 10 : 11;
  switch (options.style) {
    case 'open': return { label: triadLabel, intervals: [0, fifth, 12, 12 + third] };
    case 'inversion': return { label: triadLabel, intervals: [third, fifth, 12, 12 + third] };
    case 'seventh': return { label: seventhLabel, intervals: [0, third, fifth, seventh] };
    // This is an explicit chromatic color choice, even in diatonic mode.
    case 'color': return minor
      ? { label: 'dim7', intervals: [0, 3, 6, 9] }
      : { label: '7', intervals: [0, 4, 7, 10] };
    default: return voicing === 'triad'
      ? { label: triadLabel, intervals: [0, third, fifth, 12] }
      : { label: seventhLabel, intervals: [0, third, fifth, seventh] };
  }
}
export function chordName(index: number, key = 0, voicing: ChordVoicing = 'seventh', options: HarmonyOptions = {}): string {
  const chord = CHORDS[index];
  const shape = chordShape(index, voicing, options);
  const root = NOTE_NAMES[((chord.root + key) % 12 + 12) % 12];
  if (options.style === 'inversion') {
    const bass = NOTE_NAMES[((chord.root + key + shape.intervals[0]) % 12 + 12) % 12];
    return `${root}${shape.label}/${bass}`;
  }
  return `${root}${shape.label}`;
}
export function midiNotes(index: number, key = 0, voicing: ChordVoicing = 'seventh', options: HarmonyOptions = {}): [number, number, number, number] {
  const root = 48 + key + CHORDS[index].root + 12 * (options.octaveShift ?? 0);
  return chordShape(index, voicing, options).intervals.map(n => root + n) as [number, number, number, number];
}
export function frequencies(index: number, key = 0, voicing: ChordVoicing = 'seventh', options: HarmonyOptions = {}): [number, number, number, number] {
  return midiNotes(index, key, voicing, options).map(n => 440 * 2 ** ((n - 69) / 12)) as [number, number, number, number];
}
export function noteName(midi: number): string {
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}
export function positionToChord(x: number, current: number): number {
  // A dead band at each boundary stops a stationary hand from flickering between chords.
  const count = CHORDS.length;
  const next = Math.min(count - 1, Math.max(0, Math.floor(x * count)));
  if (next > current && x < next / count + 0.025) return current;
  if (next < current && x > (next + 1) / count - 0.025) return current;
  return next;
}
