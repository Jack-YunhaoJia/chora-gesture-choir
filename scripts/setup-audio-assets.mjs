import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  instantiateFaustModuleFromFile, LibFaust, FaustCompiler, FaustMonoDspGenerator,
} from '../node_modules/@grame/faustwasm/dist/esm/index.js';

// Compile at development time: the browser downloads a small DSP, not libfaust.
const root = new URL('../', import.meta.url);
const modulePath = fileURLToPath(new URL('node_modules/@grame/faustwasm/libfaust-wasm/libfaust-wasm.js', root));
const compiler = new FaustCompiler(new LibFaust(await instantiateFaustModuleFromFile(modulePath)));
const generator = new FaustMonoDspGenerator();
const source = await readFile(new URL('src/audio/chora.dsp', root), 'utf8');
const result = await generator.compile(compiler, 'CHORA', source, '-ftz 2');
if (!result?.factory) throw new Error(`Faust compilation failed: ${compiler.getErrorMessage()}`);
await mkdir(new URL('public/audio/demos/', root), { recursive: true });
await writeFile(new URL('public/audio/chora.wasm', root), result.factory.code);
await writeFile(new URL('public/audio/chora.json', root), result.factory.json);
// Faust serializes several runtime classes with Function#toString. Capture the
// original worklet at build time so production minification cannot rename it.
const capturedWorklet = new Error('CHORA: worklet source captured');
let workletSource = '';
try {
  await generator.createNode({
    audioWorklet: {
      async addModule(url) {
        workletSource = await (await fetch(url)).text();
        URL.revokeObjectURL(url);
        throw capturedWorklet;
      },
    },
  }, 'CHORA', result.factory, false, 128, 'CHORA');
} catch (error) {
  if (error !== capturedWorklet) throw error;
}
if (!workletSource.includes('registerProcessor')) throw new Error('Faust did not generate a worklet.');
await writeFile(new URL('public/audio/chora-worklet.js', root), workletSource);
console.log(`Faust ${compiler.version()}: compiled CHORA (${result.factory.code.length} bytes).`);

const rate = 48000;
const duration = 11.8;
const ids = ['moon', 'glass', 'warm'];
const midiToHz = n => 440 * 2 ** ((n - 69) / 12);
const common = {
  freq0: midiToHz(48), freq1: midiToHz(52), freq2: midiToHz(55), freq3: midiToHz(59),
  voice0: 1, voice1: 1, voice2: 1, voice3: 1,
  master: 0.58, expression: 0.72, brightness: 0.58, wristTone: 0.5, space: 0.55, texture: 0.5,
  vocoder: 0, demo: 0, preset: 0, strike: 0,
};
const chords = [[48, 52, 55, 59], [45, 48, 52, 55], [53, 57, 60, 64], [43, 47, 50, 53]];
const sequence = [0.16, 2.66, 5.16, 7.66].map((time, index) => ({
  time, values: Object.fromEntries(chords[index].flatMap((note, i) => [[`freq${i}`, midiToHz(note)], [`voice${i}`, 1]])),
}));
sequence.push({ time: 10.16, values: { voice0: 0, voice1: 0, voice2: 0, voice3: 0, master: 0 } });

// Same deterministic synthetic /a/-/u/-/e/ vowel for EVERY vocoder comparison.
// It is a source fixture, not a recording or a claim of real-singing quality.
function syntheticVowel(seconds) {
  const data = new Float32Array(Math.ceil(rate * seconds));
  let peak = 0;
  for (let n = 0; n < data.length; n++) {
    const t = n / rate, phase = 2 * Math.PI * 147 * t;
    const f1 = 570 + 210 * Math.sin(2 * Math.PI * 0.16 * t);
    const f2 = 1430 + 560 * Math.sin(2 * Math.PI * 0.11 * t + 0.5);
    const envelope = Math.min(1, Math.max(0, (t - 0.1) / 0.07))
      * Math.min(1, Math.max(0, (10.15 - t) / 0.12))
      * (0.18 + 0.82 * Math.max(0, Math.sin(2 * Math.PI * 0.87 * t)));
    let sample = 0;
    for (let h = 1; h <= 45; h++) {
      const hz = 147 * h;
      const formants = 0.055 + Math.exp(-0.5 * ((hz - f1) / 135) ** 2)
        + 0.6 * Math.exp(-0.5 * ((hz - f2) / 210) ** 2)
        + 0.24 * Math.exp(-0.5 * ((hz - 2850) / 300) ** 2);
      sample += Math.sin(phase * h + 0.1 * Math.sin(h)) * formants / Math.sqrt(h);
    }
    data[n] = sample * envelope;
    peak = Math.max(peak, Math.abs(data[n]));
  }
  for (let i = 0; i < data.length; i++) data[i] *= 0.22 / peak;
  return data;
}
const vowel = syntheticVowel(duration);

async function render({ values = {}, length = rate * 4, input = vowel, timeline = [], instrument = generator, sampleRate = rate, omitParameters = [] } = {}) {
  const processor = await instrument.createOfflineProcessor(sampleRate, 128);
  if (!processor) throw new Error('Cannot instantiate compiled DSP.');
  const paths = new Map(processor.getParams().map(path => [path.split('/').at(-1), path]));
  const set = values => {
    for (const [key, value] of Object.entries(values)) {
      if (omitParameters.includes(key)) continue;
      if (!paths.has(key)) throw new Error(`Missing compiled DSP parameter: ${key}`);
      processor.setParamValue(paths.get(key), value);
    }
  };
  set({ ...common, ...values });
  let cursor = 0;
  const audio = processor.render(input ? [input] : [], length, sample => {
    while (cursor < timeline.length && sample >= timeline[cursor].time * sampleRate) set(timeline[cursor++].values);
  });
  processor.destroy();
  return audio;
}

function energyStats(audio, start = 0, end = audio[0].length) {
  let peak = 0, energy = 0, samples = 0, maxStep = 0;
  for (const channel of audio) for (let i = start; i < Math.min(end, channel.length); i++) {
    if (!Number.isFinite(channel[i])) throw new Error('DSP emitted non-finite audio.');
    peak = Math.max(peak, Math.abs(channel[i]));
    maxStep = Math.max(maxStep, i ? Math.abs(channel[i] - channel[i - 1]) : 0);
    energy += channel[i] ** 2;
    samples++;
  }
  return { peak, rms: Math.sqrt(energy / samples), maxSampleStep: maxStep };
}

function fft(real, imag) {
  const n = real.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [real[i], real[j]] = [real[j], real[i]]; [imag[i], imag[j]] = [imag[j], imag[i]]; }
  }
  for (let size = 2; size <= n; size <<= 1) for (let offset = 0; offset < n; offset += size) {
    for (let k = 0; k < size / 2; k++) {
      const a = offset + k, b = a + size / 2, angle = -2 * Math.PI * k / size;
      const r = real[b] * Math.cos(angle) - imag[b] * Math.sin(angle);
      const im = real[b] * Math.sin(angle) + imag[b] * Math.cos(angle);
      real[b] = real[a] - r; imag[b] = imag[a] - im; real[a] += r; imag[a] += im;
    }
  }
}
function spectrum(audio) {
  const size = 8192, bins = new Float64Array(size / 2);
  for (const t of [0.6, 1.2, 1.9, 2.7, 3.4]) {
    const offset = Math.floor(t * rate), real = new Float64Array(size), imag = new Float64Array(size);
    for (let i = 0; i < size; i++) real[i] = (audio[0][offset + i] + audio[1][offset + i]) * 0.5
      * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (size - 1)));
    fft(real, imag);
    for (let i = 1; i < bins.length; i++) bins[i] += real[i] ** 2 + imag[i] ** 2;
  }
  const ranges = { low: [35, 250], body: [250, 1000], presence: [1000, 4000], air: [4000, 12000] };
  let total = 0, weighted = 0;
  const bands = Object.fromEntries(Object.keys(ranges).map(k => [k, 0]));
  for (let i = 1; i < bins.length; i++) {
    const hz = i * rate / size;
    total += bins[i]; weighted += hz * bins[i];
    for (const [key, [lo, hi]] of Object.entries(ranges)) if (hz >= lo && hz < hi) bands[key] += bins[i];
  }
  return { spectralCentroidHz: weighted / total,
    energyFractions: Object.fromEntries(Object.entries(bands).map(([key, value]) => [key, value / total])) };
}
function normalizedDifference(left, right, start = Math.floor(rate * 0.5), end = Math.floor(rate * 3.9)) {
  const leftRms = energyStats(left, start, end).rms, rightRms = energyStats(right, start, end).rms;
  let sum = 0, samples = 0;
  for (let c = 0; c < left.length; c++) for (let n = start; n < end; n++) {
    sum += (left[c][n] / leftRms - right[c][n] / rightRms) ** 2; samples++;
  }
  return Math.sqrt(sum / samples);
}

// Interpolate the actual rendered fundamental, instead of merely checking
// unchanged frequency parameter messages. One isolated voice avoids ambiguous
// chord/harmonic peaks; all three wrist positions use the same signal fixture.
function fundamental(audio, expectedHz) {
  const size = 65536, offset = rate * 2, real = new Float64Array(size), imag = new Float64Array(size);
  for (let i = 0; i < size; i++) real[i] = (audio[0][offset + i] + audio[1][offset + i]) * 0.5
    * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (size - 1)));
  fft(real, imag);
  const power = i => real[i] ** 2 + imag[i] ** 2;
  let peak = Math.floor(expectedHz * 0.97 * size / rate);
  for (let i = peak + 1; i <= Math.ceil(expectedHz * 1.03 * size / rate); i++) if (power(i) > power(peak)) peak = i;
  if (power(peak) < 0.00001) throw new Error('Wrist test fundamental is absent.');
  const left = Math.log(power(peak - 1)), middle = Math.log(power(peak)), right = Math.log(power(peak + 1));
  const correction = 0.5 * (left - right) / (left - 2 * middle + right);
  return (peak + correction) * rate / size;
}
function wav(audio) {
  const channels = audio.length, length = audio[0].length, bytes = length * channels * 2;
  const buffer = Buffer.alloc(44 + bytes);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + bytes, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(rate, 24); buffer.writeUInt32LE(rate * channels * 2, 28);
  buffer.writeUInt16LE(channels * 2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36); buffer.writeUInt32LE(bytes, 40);
  for (let n = 0; n < length; n++) for (let c = 0; c < channels; c++) {
    buffer.writeInt16LE(Math.round(Math.min(1, Math.max(-1, audio[c][n])) * 32767), 44 + (n * channels + c) * 2);
  }
  return buffer;
}

const report = {
  generatedAt: new Date().toISOString(), sampleRate: rate,
  method: 'Actual compiled Faust WASM; all presets have identical pitch, controls, volume and source input. Raw WAVs are not individually normalized. Measurements prove DSP differences and bounds, not perceptual quality or real-singer intelligibility.',
  source: 'Deterministic synthetic /a/-/u/-/e/ vowel, 147 Hz fundamental; not human speech or microphone recording.',
  controls: common,
  audition: { duration, chords: ['Cmaj7', 'Am7', 'Fmaj7', 'G7'], chordSeconds: [0.16, 2.66, 5.16, 7.66], muteSeconds: 10.16 },
  variants: {}, pairwiseNormalizedDifference: {}, pairwiseBandEnergyDistance: {}, silence: {}, extremes: {}, transitions: {}, sampleRates: {}, textureControl: {}, articulation: {},
  wristTone: {}, wristExtremes: {},
};
const steady = {};
for (const [mode, vocoder] of [['ambient', 0], ['vocoder', 1]]) {
  for (const [preset, id] of ids.entries()) {
    const key = `${mode}-${id}`;
    const values = { preset, vocoder };
    const audio = await render({ values });
    steady[key] = audio;
    const stats = { ...energyStats(audio, Math.floor(rate * 0.5)), ...spectrum(audio) };
    if (stats.rms < 0.003 || stats.peak > 0.88) throw new Error(`${key} level check failed: ${JSON.stringify(stats)}`);
    report.variants[key] = stats;
    const demoAudio = await render({ values: { ...values, voice0: 0, voice1: 0, voice2: 0, voice3: 0 }, length: Math.ceil(duration * rate), timeline: sequence });
    await writeFile(new URL(`public/audio/demos/${key}.wav`, root), wav(demoAudio));
    const tail = energyStats(demoAudio, Math.floor(11 * rate));
    if (tail.rms > 0.000001) throw new Error(`${key} did not mute: ${tail.rms}`);
    // Include the first sample: startup routing must never leak the ambient pad
    // into vocoder silence while preset/mode crossfades initialize.
    const silent = energyStats(await render({ values, input: null }));
    const voicesOff = energyStats(await render({ values: { ...values, voice0: 0, voice1: 0, voice2: 0, voice3: 0 } }));
    report.silence[key] = { noMicrophone: vocoder ? silent.rms : null, voicesOff: voicesOff.rms, afterMute: tail.rms };
    if ((vocoder && silent.rms > 0.000001) || voicesOff.rms > 0.000001) throw new Error(`${key} silence check failed`);
    const textureDry = await render({ values: { ...values, texture: 0 } });
    const textureRich = await render({ values: { ...values, texture: 1 } });
    const textureDelta = normalizedDifference(textureDry, textureRich);
    report.textureControl[key] = textureDelta;
    if (textureDelta < 0.1) throw new Error(`${key} texture knob has too little effect`);
    for (const extreme of [0, 1]) {
      const samples = await render({ values: { ...values, master: 0.8, expression: 1, brightness: extreme, space: extreme, texture: extreme,
        freq0: midiToHz(60), freq1: midiToHz(64), freq2: midiToHz(67), freq3: midiToHz(71) } });
      const checked = energyStats(samples);
      if (checked.peak >= 0.9) throw new Error(`${key} exceeded safety stage: ${checked.peak}`);
      report.extremes[`${key}-${extreme}`] = checked;
    }
  }
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const delta = normalizedDifference(steady[`${mode}-${ids[i]}`], steady[`${mode}-${ids[j]}`]);
    report.pairwiseNormalizedDifference[`${mode}:${ids[i]}/${ids[j]}`] = delta;
    if (delta < 0.18) throw new Error(`${mode} ${ids[i]}/${ids[j]} collapsed to the same waveform`);
    const left = report.variants[`${mode}-${ids[i]}`].energyFractions;
    const right = report.variants[`${mode}-${ids[j]}`].energyFractions;
    const distance = Object.keys(left).reduce((total, band) => total + Math.abs(left[band] - right[band]), 0);
    report.pairwiseBandEnergyDistance[`${mode}:${ids[i]}/${ids[j]}`] = distance;
    if (distance < 0.05) throw new Error(`${mode} ${ids[i]}/${ids[j]} lacks a measurable spectral difference`);
  }
}
// Fixed dry signals isolate wrist colour from room tails, input changes and
// loudness normalization. Centre is also compared with an independently
// compiled version that bypasses only the new colour stage.
const wristBypass = new FaustMonoDspGenerator();
const bypassSource = source.replace('x : wristColour : reflections(channel)', 'x : reflections(channel)');
if (bypassSource === source) throw new Error('Cannot construct independent wrist bypass fixture.');
if (!(await wristBypass.compile(compiler, 'CHORA', bypassSource, '-ftz 2'))?.factory)
  throw new Error('Cannot compile independent wrist bypass fixture.');
for (const [mode, vocoder] of [['ambient', 0], ['vocoder', 1]]) for (const [preset, id] of ids.entries()) {
  const key = `${mode}-${id}`, values = { preset, vocoder, space: 0 };
  const tones = {};
  for (const [label, wristTone] of [['dark', 0], ['neutral', 0.5], ['bright', 1]]) {
    const audio = await render({ values: { ...values, wristTone } });
    const stats = { ...energyStats(audio, rate / 2), ...spectrum(audio) };
    tones[label] = { audio, stats };
  }
  const bypass = await render({ values, instrument: wristBypass, omitParameters: ['wristTone'] });
  const stats = report.wristTone[key] = {
    dark: tones.dark.stats, neutral: tones.neutral.stats, bright: tones.bright.stats,
    darkToBrightNormalizedDifference: normalizedDifference(tones.dark.audio, tones.bright.audio),
    neutralBypassNormalizedDifference: normalizedDifference(tones.neutral.audio, bypass),
    darkToNeutralDb: 20 * Math.log10(tones.dark.stats.rms / tones.neutral.stats.rms),
    brightToNeutralDb: 20 * Math.log10(tones.bright.stats.rms / tones.neutral.stats.rms),
  };
  const highBand = value => value.energyFractions.presence + value.energyFractions.air;
  stats.brightToDarkHighBandRatio = highBand(stats.bright) / highBand(stats.dark);
  if (stats.neutralBypassNormalizedDifference !== 0) throw new Error(`${key} neutral wrist changed the instrument`);
  if (stats.neutral.spectralCentroidHz < stats.dark.spectralCentroidHz * 1.1
      || stats.bright.spectralCentroidHz < stats.neutral.spectralCentroidHz * 1.08
      || stats.brightToDarkHighBandRatio < 12)
    throw new Error(`${key} wrist does not sufficiently change spectral balance`);
  if (Math.abs(stats.darkToNeutralDb) > 4 || Math.abs(stats.brightToNeutralDb) > 3)
    throw new Error(`${key} wrist changes fixed-fixture level too much`);

  stats.fundamentalHz = {};
  for (const [label, wristTone] of [['dark', 0], ['neutral', 0.5], ['bright', 1]]) {
    const audio = await render({ values: { ...values, wristTone, freq0: 220, voice1: 0, voice2: 0, voice3: 0 } });
    stats.fundamentalHz[label] = fundamental(audio, 220);
  }
  stats.maxPitchShiftCents = Math.max(...['dark', 'bright'].map(label =>
    Math.abs(1200 * Math.log2(stats.fundamentalHz[label] / stats.fundamentalHz.neutral))));
  if (stats.maxPitchShiftCents > 1) throw new Error(`${key} wrist shifted the rendered fundamental`);

  const swept = await render({ values, timeline: [
    { time: 0.6, values: { wristTone: 0 } }, { time: 1.35, values: { wristTone: 1 } },
    { time: 2.2, values: { wristTone: 0.5 } },
  ] });
  stats.sweep = energyStats(swept);
  stats.returnToNeutralNormalizedDifference = normalizedDifference(swept, tones.neutral.audio, Math.floor(3.3 * rate));
  if (stats.sweep.peak >= 0.9 || stats.sweep.maxSampleStep > 0.22
      || stats.returnToNeutralNormalizedDifference > 0.001)
    throw new Error(`${key} wrist sweep or return to neutral failed: ${JSON.stringify({ sweep: stats.sweep, returnToNeutral: stats.returnToNeutralNormalizedDifference })}`);

  stats.silence = {};
  for (const wristTone of [0, 1]) {
    const off = energyStats(await render({ values: { ...values, wristTone, voice0: 0, voice1: 0, voice2: 0, voice3: 0 }, length: rate * 2 }));
    const noInput = vocoder ? energyStats(await render({ values: { ...values, wristTone }, input: null, length: rate * 2 })) : null;
    stats.silence[wristTone] = { voicesOff: off.rms, noInput: noInput?.rms ?? null };
    if (off.rms > 0.000001 || (noInput && noInput.rms > 0.000001)) throw new Error(`${key} wrist breaks silence`);
  }
  console.log(`Wrist ${key}: centroid ${[stats.dark, stats.neutral, stats.bright].map(s => s.spectralCentroidHz.toFixed(0)).join(' / ')} Hz; level ${stats.darkToNeutralDb.toFixed(2)} / ${stats.brightToNeutralDb.toFixed(2)} dB; pitch shift ${stats.maxPitchShiftCents.toFixed(3)} cents.`);
}

// Include every mode and instrument, both wrist endpoints, low/high registers,
// both timbre/room extremes and every supported sample rate. Input is the
// built-in synthetic vowel here so it runs at the processor's own sample rate.
for (const sampleRate of [44100, 48000, 96000]) for (const [mode, vocoder] of [['ambient', 0], ['vocoder', 1]])
  for (const [preset, id] of ids.entries()) for (const wristTone of [0, 1])
    for (const register of [36, 81]) for (const extreme of [0, 1]) {
      const key = `${sampleRate}-${mode}-${id}-w${wristTone}-m${register}-x${extreme}`;
      const audio = await render({ values: { preset, vocoder, wristTone, brightness: extreme, texture: extreme, space: extreme,
        master: 0.8, expression: 1, demo: 1, freq0: midiToHz(register), freq1: midiToHz(register + 4),
        freq2: midiToHz(register + 7), freq3: midiToHz(register + 11) },
        input: null, sampleRate, length: Math.ceil(sampleRate * 1.5) });
      const stats = energyStats(audio);
      if (stats.peak >= 0.9 || stats.rms < 0.0001) throw new Error(`${key} wrist extreme failed`);
      report.wristExtremes[key] = stats;
    }
// Open the gate after all controls have settled. Compare the first 15–75 ms
// with the body, independent of the master's startup fade or chord changes.
for (const [preset, id] of ids.entries()) {
  const audio = await render({ values: { preset, space: 0, voice0: 0, voice1: 0, voice2: 0, voice3: 0 }, input: null,
    timeline: [{ time: 0.4, values: { voice0: 1, voice1: 1, voice2: 1, voice3: 1 } }] });
  const early = energyStats(audio, Math.floor(rate * 0.415), Math.floor(rate * 0.475)).rms;
  const body = energyStats(audio, Math.floor(rate * 1.1), Math.floor(rate * 1.4)).rms;
  const late = energyStats(audio, Math.floor(rate * 3.6), Math.floor(rate * 3.9)).rms;
  report.articulation[id] = { earlyRms: early, bodyRms: body, lateRms: late, earlyToBodyRatio: early / body };
}
if (report.articulation.moon.earlyToBodyRatio > 0.4) throw new Error('Choir lost its slow attack');
if (report.articulation.glass.earlyToBodyRatio < 0.7 || report.articulation.warm.earlyToBodyRatio < 0.6)
  throw new Error('Glass/reed attack is no longer direct');
if (report.articulation.glass.lateRms < 0.01) throw new Error('Glass cannot sustain a held chord');
for (const sampleRate of [44100, 96000]) {
  const sampleChecks = {};
  for (const [mode, vocoder] of [['ambient', 0], ['vocoder', 1]]) for (const [preset, id] of ids.entries()) {
    const key = `${mode}-${id}`;
    sampleChecks[key] = energyStats(await render({ values: { preset, vocoder, demo: 1 }, input: null, sampleRate, length: sampleRate * 2 }));
    if (sampleChecks[key].rms < 0.003 || sampleChecks[key].peak > 0.9) throw new Error(`${sampleRate} Hz ${key} failed`);
  }
  report.sampleRates[sampleRate] = sampleChecks;
}
// A person stopping after singing must not leave an audible sustained carrier.
const endingVowel = new Float32Array(rate * 5);
endingVowel.set(vowel.subarray(0, rate));
for (const [preset, id] of ids.entries()) {
  const tail = energyStats(await render({ values: { preset, vocoder: 1 }, input: endingVowel, length: endingVowel.length }), rate * 4);
  report.silence[`vocoder-${id}`].afterInputStops = tail.rms;
  if (tail.rms > 0.0001) throw new Error(`Vocoder ${id} did not decay after input stopped`);
}
// Repeated chord, preset change and mode change exercise paths a static render misses.
const transitions = await render({ values: { preset: 1 }, timeline: [
  { time: 0.9, values: { strike: 1 } }, { time: 1.6, values: { preset: 2 } },
  { time: 2.3, values: { vocoder: 1 } }, { time: 3, values: { preset: 0 } },
] });
report.transitions = energyStats(transitions);
if (report.transitions.maxSampleStep > 0.22) throw new Error('Preset/mode/retrigger transition has a large discontinuity');
const repeated = await render({ values: { preset: 1 }, timeline: [{ time: 2.8, values: { strike: 1 } }] });
const repeatDelta = normalizedDifference(repeated, steady['ambient-glass']);
if (repeatDelta < 0.05) throw new Error('Explicit repeat did not trigger glass envelope');
report.transitions.retriggerNormalizedDifference = repeatDelta;
// The permission-free demo path is separately checked, not substituted for mic input.
report.demoModulator = energyStats(await render({ values: { vocoder: 1, demo: 1 }, input: null }), rate);
if (report.demoModulator.rms < 0.003) throw new Error('Demo modulator is silent');

await writeFile(new URL('public/audio/demos/source-synthetic-vowel.wav', root), wav([vowel]));
await writeFile(new URL('public/audio/demos/report.json', root), `${JSON.stringify(report, null, 2)}\n`);
console.log('Rendered six fixed-control auditions. Levels and spectral centroids:');
for (const [key, values] of Object.entries(report.variants)) console.log(`  ${key}: RMS ${values.rms.toFixed(4)}, peak ${values.peak.toFixed(3)}, centroid ${values.spectralCentroidHz.toFixed(0)} Hz`);
console.log('Normalized preset differences:', JSON.stringify(report.pairwiseNormalizedDifference));
console.log('Passed finite output, voices-off/mic-silence/mute, extremes, preset/mode transitions, and explicit retrigger.');
