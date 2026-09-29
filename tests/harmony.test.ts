import test from 'node:test';
import assert from 'node:assert/strict';
import { CHORDS, NOTE_NAMES, chordName, frequencies, midiNotes, positionToChord, type GestureChordStyle } from '../src/harmony';

const roots = [0, 2, 4, 5, 7, 9, 11];
const intervals = [[0, 4, 7, 11], [0, 3, 7, 10], [0, 3, 7, 10], [0, 4, 7, 11], [0, 4, 7, 10], [0, 3, 7, 10], [0, 3, 6, 10]];

test('seven diatonic seventh chords have correct names and pitches in all 12 keys', () => {
  const labels = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'];
  assert.equal(CHORDS.length, 7);
  assert.deepEqual(CHORDS.map(chord => chord.degree), ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii']);
  for (let key = 0; key < 12; key++) {
    for (let chord = 0; chord < 7; chord++) {
      const notes = midiNotes(chord, key);
      assert.deepEqual(notes.map(n => n - (48 + key + roots[chord])), intervals[chord]);
      assert.equal(chordName(chord, key), `${NOTE_NAMES[(roots[chord] + key) % 12]}${labels[chord]}`);
      assert.deepEqual(notes, midiNotes(chord, key, 'seventh'));
      assert.equal(notes[0], 48 + key + roots[chord]);
      const pitches = frequencies(chord, key);
      assert.equal(pitches.length, 4);
      pitches.forEach((hz, index) => {
        assert.ok(hz > 45 && hz < 1800);
        assert.ok(Math.abs(69 + 12 * Math.log2(hz / 440) - notes[index]) < 1e-10);
      });
    }
  }
  assert.deepEqual(CHORDS.map((_, index) => chordName(index)), ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5']);
  assert.equal(chordName(0, 2), 'Dmaj7');
});

test('triads keep the third and fifth while the fourth voice doubles the root one octave up', () => {
  const labels = ['', 'm', 'm', '', '', 'm', 'dim'];
  for (let key = 0; key < 12; key++) {
    for (let chord = 0; chord < 7; chord++) {
      const notes = midiNotes(chord, key, 'triad');
      assert.deepEqual(notes.map(n => n - notes[0]), [...intervals[chord].slice(0, 3), 12]);
      assert.equal(chordName(chord, key, 'triad'), `${NOTE_NAMES[(roots[chord] + key) % 12]}${labels[chord]}`);
      const pitches = frequencies(chord, key, 'triad');
      assert.ok(Math.abs(pitches[3] / pitches[0] - 2) < 1e-10);
    }
  }
  assert.deepEqual(midiNotes(6), [59, 62, 65, 69]);
  assert.deepEqual(midiNotes(6, 0, 'triad'), [59, 62, 65, 71]);
  assert.equal(chordName(6, 0, 'triad'), 'Bdim');
});

test('all seven position zones use boundary hysteresis and clamp at the edges', () => {
  for (let chord = 0; chord < CHORDS.length; chord++) {
    assert.equal(positionToChord((chord + 0.5) / CHORDS.length, 0), chord);
  }
  for (let right = 1; right < CHORDS.length; right++) {
    const boundary = right / CHORDS.length;
    assert.equal(positionToChord(boundary + 0.01, right - 1), right - 1);
    assert.equal(positionToChord(boundary + 0.03, right - 1), right);
    assert.equal(positionToChord(boundary - 0.01, right), right);
    assert.equal(positionToChord(boundary - 0.03, right), right - 1);
  }
  assert.equal(positionToChord(1, 0), 6);
  assert.equal(positionToChord(0, 6), 0);
  assert.equal(positionToChord(1.2, 0), 6);
  assert.equal(positionToChord(-0.2, 6), 0);
});


test('free major/minor modes choose qualities independently from scale degree while preserving the root classes', () => {
  for (let key = 0; key < 12; key += 1) {
    for (let chord = 0; chord < 7; chord += 1) {
      for (const mode of ['major', 'minor'] as const) {
        const notes = midiNotes(chord, key, 'triad', { mode });
        assert.deepEqual(notes.map(n => n - notes[0]), [0, mode === 'major' ? 4 : 3, 7, 12]);
        assert.equal(notes[0], 48 + key + roots[chord]);
      }
    }
  }
  assert.equal(chordName(1, 0, 'triad', { mode: 'major' }), 'D');
  assert.equal(chordName(0, 0, 'triad', { mode: 'minor' }), 'Cm');
  assert.equal(chordName(6, 0, 'seventh', { mode: 'minor' }), 'Bm7');
});

test('four reference styles have correct free-mode pitch intervals and inversion names', () => {
  const expected: Record<GestureChordStyle, { major: number[]; minor: number[]; majorName: string; minorName: string }> = {
    open: { major: [0, 7, 12, 16], minor: [0, 7, 12, 15], majorName: 'C', minorName: 'Cm' },
    inversion: { major: [4, 7, 12, 16], minor: [3, 7, 12, 15], majorName: 'C/E', minorName: 'Cm/E♭' },
    seventh: { major: [0, 4, 7, 11], minor: [0, 3, 7, 10], majorName: 'Cmaj7', minorName: 'Cm7' },
    color: { major: [0, 4, 7, 10], minor: [0, 3, 6, 9], majorName: 'C7', minorName: 'Cdim7' },
  };
  for (const style of Object.keys(expected) as GestureChordStyle[]) {
    for (const mode of ['major', 'minor'] as const) {
      assert.deepEqual(midiNotes(0, 0, 'triad', { mode, style }).map(note => note - 48), expected[style][mode]);
      assert.equal(chordName(0, 0, 'triad', { mode, style }), expected[style][mode === 'major' ? 'majorName' : 'minorName']);
    }
  }
});

test('thumb lowers all four voices by exactly an octave across modes, styles and keys', () => {
  for (const mode of ['diatonic', 'major', 'minor'] as const) {
    for (const style of [undefined, 'open', 'inversion', 'seventh', 'color'] as const) {
      for (let chord = 0; chord < 7; chord += 1) {
        for (let key = 0; key < 12; key += 1) {
          const normal = frequencies(chord, key, 'seventh', { mode, style });
          const lower = frequencies(chord, key, 'seventh', { mode, style, octaveShift: -1 });
          lower.forEach((hz, index) => assert.ok(Math.abs(hz * 2 - normal[index]) < 1e-8));
        }
      }
    }
  }
});

test('default harmony remains diatonic; explicit layouts preserve diminished degree unless choosing chromatic color', () => {
  assert.deepEqual(midiNotes(6, 0, 'triad', { style: 'open' }), [59, 65, 71, 74]);
  assert.deepEqual(midiNotes(6, 0, 'triad', { style: 'inversion' }), [62, 65, 71, 74]);
  assert.equal(chordName(6, 0, 'triad', { style: 'inversion' }), 'Bdim/D');
  assert.deepEqual(midiNotes(4, 0, 'seventh', { style: 'seventh' }), [55, 59, 62, 65]);
  assert.deepEqual(midiNotes(1, 0, 'seventh', { style: 'color' }), [50, 53, 56, 59]);
  assert.equal(chordName(1, 0, 'seventh', { style: 'color' }), 'Ddim7');
});
