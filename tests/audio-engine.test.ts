import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AudioEngine } from '../src/audio/AudioEngine';
import { SOUND_PRESET_IDS, SOUND_PRESETS } from '../src/audio/presets';
import type { PerformanceState } from '../src/types';

const state: PerformanceState = {
  soundPreset: 'moon', texture: 0.5,
  frequencies: [130.81, 164.81, 196, 246.94], voices: [true, true, true, true],
  expression: 0.72, brightness: 0.58, space: 0.55, volume: 0.7, mode: 'ambient', active: true,
};

function instrument() {
  const engine = new AudioEngine();
  const calls: [string, number][] = [];
  // A recording DSP isolates the public update contract without creating a
  // device or AudioContext. The integration check below uses compiled metadata.
  const internals = engine as unknown as { session: unknown; state: PerformanceState };
  internals.session = { dsp: { setParamValue: (path: string, value: number) => calls.push([path, value]) }, sent: new Map() };
  return { engine, calls, internals, values: () => Object.fromEntries(calls) };
}

test('each named preset reaches a distinct compiled instrument without changing the chord', () => {
  const { engine, calls, values } = instrument();
  for (const [index, soundPreset] of SOUND_PRESET_IDS.entries()) {
    engine.update({ ...state, soundPreset, ...SOUND_PRESETS[soundPreset].defaults });
    assert.equal(values()['/CHORA/preset'], index);
    assert.equal(values()['/CHORA/texture'], SOUND_PRESETS[soundPreset].defaults.texture);
    state.frequencies.forEach((value, i) => assert.equal(values()[`/CHORA/freq${i}`], value));
  }
  const json = JSON.parse(readFileSync(new URL('../public/audio/chora.json', import.meta.url), 'utf8'));
  const addresses = new Set<string>();
  type DspUiItem = { address?: string; items?: DspUiItem[] };
  const visit = (items: DspUiItem[]) => {
    for (const item of items) { if (item.address) addresses.add(item.address); if (item.items) visit(item.items); }
  };
  visit(json.ui);
  for (const [path] of calls) assert.ok(addresses.has(path), `${path} must exist in compiled Faust`);
});

test('tracking updates do not restart attacks, while explicit repeats reach the DSP', () => {
  const { engine, calls, values } = instrument();
  engine.update(state);
  engine.retrigger();
  const firstStrike = values()['/CHORA/strike'];
  for (let frame = 0; frame < 20; frame++) engine.update({ ...state, expression: 0.5 + frame * 0.01 });
  assert.equal(calls.filter(([path]) => path === '/CHORA/strike').length, 1);
  engine.retrigger();
  assert.notEqual(values()['/CHORA/strike'], firstStrike);
  assert.equal(calls.filter(([path]) => path === '/CHORA/strike').length, 2);
});

test('wrist tone reaches DSP independently of brightness, defaults neutral, and is bounded', () => {
  const { engine, values, calls } = instrument();
  engine.update(state);
  assert.equal(values()['/CHORA/wristTone'], 0.5);
  for (const wristTone of [0, 0.25, 0.75, 1]) {
    engine.update({ ...state, wristTone });
    assert.equal(values()['/CHORA/wristTone'], wristTone);
    assert.equal(values()['/CHORA/brightness'], state.brightness);
    state.frequencies.forEach((value, i) => assert.equal(values()[`/CHORA/freq${i}`], value));
  }
  assert.equal(calls.filter(([path]) => path === '/CHORA/strike').length, 0);
  for (const [wristTone, expected] of [[-2, 0], [3, 1], [Number.NaN, 0.5], [Infinity, 0.5]]) {
    engine.update({ ...state, wristTone });
    assert.equal(values()['/CHORA/wristTone'], expected);
  }
  engine.update(state);
  assert.equal(values()['/CHORA/wristTone'], 0.5);
});

test('mode switches preserve pitch and voice selection; inactive state mutes wet tails', () => {
  const { engine, values } = instrument();
  const selected = { ...state, voices: [true, false, true, false] as PerformanceState['voices'] };
  engine.update(selected);
  engine.update({ ...selected, mode: 'vocoder', soundPreset: 'glass' });
  assert.equal(values()['/CHORA/vocoder'], 1);
  selected.voices.forEach((enabled, i) => assert.equal(values()[`/CHORA/voice${i}`], +enabled));
  selected.frequencies.forEach((frequency, i) => assert.equal(values()[`/CHORA/freq${i}`], frequency));
  engine.update({ ...selected, active: false });
  assert.equal(values()['/CHORA/master'], 0);
  for (let i = 0; i < 4; i++) assert.equal(values()[`/CHORA/voice${i}`], 0);
});

test('loading snapshot does not follow caller mutation and invalid control values are bounded', () => {
  const engine = new AudioEngine();
  const mutable = { ...state, voices: [...state.voices], frequencies: [...state.frequencies] } as PerformanceState;
  engine.update(mutable);
  mutable.voices[0] = false;
  mutable.frequencies[0] = 880;
  const snapshot = (engine as unknown as { state: PerformanceState }).state;
  assert.equal(snapshot.voices[0], true);
  assert.equal(snapshot.frequencies[0], state.frequencies[0]);
  const recorded = instrument();
  recorded.engine.update({ ...state, texture: Number.NaN, brightness: 8, space: -1, volume: 9 });
  assert.equal(recorded.values()['/CHORA/texture'], 0);
  assert.equal(recorded.values()['/CHORA/brightness'], 1);
  assert.equal(recorded.values()['/CHORA/space'], 0);
  assert.equal(recorded.values()['/CHORA/master'], 0.8);
});
