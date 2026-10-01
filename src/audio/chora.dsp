declare name "CHORA";
declare author "CHORA";
declare description "Three distinct four-voice instruments and a matched 16-band microphone vocoder.";
import("stdfaust.lib");

smooth(t) = si.smooth(ba.tau2pole(t));
// Initialize routing at its selected value: vocoder startup must not leak a pad.
routeSmooth(t, x) = loop ~ _ with {
    pole = ba.tau2pole(t);
    loop(previous) = select2(ba.time == 0, (1-pole)*x + pole*previous, x);
};
rawFreq(i) = hslider("freq%i", 220, 45, 1800, 0.01);
// Begin at the requested note; smoothing from 0 Hz makes the first strike bend.
freq(i) = routeSmooth(0.018, rawFreq(i));
gate(i) = hslider("voice%i", 0, 0, 1, 0.001);
voice(i) = gate(i) : smooth(0.025);
expression = routeSmooth(0.04, hslider("expression", 0.5, 0, 1, 0.001));
brightness = routeSmooth(0.09, hslider("brightness", 0.5, 0, 1, 0.001));
wristTone = routeSmooth(0.065, hslider("wristTone", 0.5, 0, 1, 0.001));
space = routeSmooth(0.15, hslider("space", 0.65, 0, 1, 0.001));
texture = routeSmooth(0.12, hslider("texture", 0.5, 0, 1, 0.001));
preset = hslider("preset", 0, 0, 2, 1);
moon = routeSmooth(0.12, preset == 0);
glass = routeSmooth(0.12, preset == 1);
warm = routeSmooth(0.12, preset == 2);
strike = hslider("strike", 0, 0, 65535, 1);
rawMode = hslider("vocoder", 0, 0, 1, 1);
mode = routeSmooth(0.12, rawMode);
demo = hslider("demo", 0, 0, 1, 1) : smooth(0.03);
master = hslider("master", 0, 0, 0.8, 0.001) : smooth(0.04);

// Explicit performance changes strike once. Ordinary tracking/control frames
// never sustain or refresh a glass note. Mode entry also articulates a note.
onset(i) = (gate(i) > gate(i)') | (rawFreq(i) != rawFreq(i)')
    | (preset != preset') | (rawMode != rawMode') | (strike != strike');
drift(i) = 1 + (0.0009 + 0.0024 * texture) * os.osc(0.11 + 0.031 * i);
choirEnvelope(i) = gate(i) : an.amp_follower_ud(0.62, 0.23);
reedEnvelope(i) = gate(i) : an.amp_follower_ud(0.009, 0.065);
// Microphone speech must return promptly after the gesture gate reopens.
// Ambient articulation is independent: the choir still blooms and glass decays.
vocoderEnvelope(i) = gate(i) : an.amp_follower_ud(0.016, 0.04);

// MOON: a slow, continuously moving vowel pad. The detuned voice and formants
// remain present throughout a held chord; this instrument has no struck layer.
lunar(i) = choirEnvelope(i) *
    (0.38 * os.osc(freq(i))
    + 0.26 * os.osc(freq(i) * drift(i))
    + 0.13 * os.osc(freq(i) / drift(i))
    + 0.065 * os.osc(freq(i) * 2.001)
    + (0.035 + 0.055 * texture) * os.osc(freq(i) * 3)
    + (0.30 + 0.25 * texture) * lunarFormant(i))
    : fi.lowpass(2, 1050 + 2900 * brightness);
lunarFormant(i) = os.sawtooth(freq(i) * drift(i)) :
    fi.bandpass(1, 390 + 170 * texture + 85 * os.osc(0.067), 950 + 310 * texture);

// GLASS: mallet/bell partials have different, finite decay times. Every term
// is enveloped: there is deliberately no sustained oscillator underneath.
// Texture changes the shorter upper partials, never reinstates a pad floor.
glassBody(trigger) = en.ar(0.003, 0.95 + 0.50 * texture, trigger);
glassPing(trigger) = en.ar(0.0015, 0.50 + 0.35 * texture, trigger);
glassAir(trigger) = en.ar(0.001, 0.12 + 0.08 * texture, trigger);
struck(i, trigger) = 0.45 * glassBody(trigger) * os.osc(freq(i))
    + 0.65 * glassPing(trigger) * os.osc(freq(i) * 2)
    + (0.30 + 0.20 * texture) * glassPing(trigger) * os.osc(freq(i) * 2.756)
    + (0.16 + 0.18 * texture) * glassAir(trigger) * os.osc(freq(i) * 5.404);
crystal(i) = (gate(i) : smooth(0.004)) * struck(i, onset(i))
    : fi.lowpass(2, min(0.44 * ma.SR, 2400 + 8900 * brightness));

// WARM: immediate, steady reed/organ with strong odd harmonics and a dry
// octave drawbar. Its sustained pulse structure contrasts with the choir's
// drift and the glass note's disappearing high partials.
reedCore(i) = (0.57 * os.pulsetrain(freq(i), 0.5 - 0.12 * texture)
    + (0.17 + 0.11 * texture) * os.pulsetrain(freq(i) * 2, 0.5)
    + 0.18 * os.osc(freq(i))
    + 0.07 * os.sawtooth(freq(i)))
    : fi.lowpass(2, 1300 + 4900 * brightness)
    : *(1.15 + 0.7 * texture) : ma.tanh;
reed(i) = reedEnvelope(i) * reedCore(i)
    * (0.975 + 0.025 * texture * os.osc(4.2 + i * 0.13));

pan(i) = 0.20 + 0.20 * i;
pad(i) = 1.45 * moon * lunar(i) + 1.55 * glass * crystal(i) + 0.75 * warm * reed(i);
padL = 0.36 * sum(i, 4, pad(i) * sqrt(1-pan(i)));
padR = 0.36 * sum(i, 4, pad(i) * sqrt(pan(i)));

// Permission-free demo is an explicitly synthetic voiced vowel. Microphone
// mode does not monitor dry input and produces no carrier sound during silence.
demoSource = os.sawtooth(112 + 0.8 * os.osc(0.17));
demoVowel = 0.55 * (0.64 + 0.36 * os.osc(0.38)) *
    ((demoSource : fi.bandpass(1, 220 + 80 * os.osc(0.09), 900 + 180 * os.osc(0.08)))
    + 0.60 * (demoSource : fi.bandpass(1, 1250 + 180 * os.osc(0.12), 2800 + 280 * os.osc(0.07))));
modulator(x) = (1-demo) * (x : fi.highpass(2, 65) : *(2.8) : ma.tanh) + demo * demoVowel;

// A real rise in input amplitude rearticulates glass speech. Compare a fast
// envelope with its own recent baseline, with a noise floor; a steady vowel
// does not become an endless synthetic arpeggio. Silence still multiplies the
// carrier by zero through every analysis band below.
syllableRise(x) = (fast > 0.012) & (fast > 1.6 * baseline) with {
    fast = x : an.amp_follower_ud(0.004, 0.025);
    baseline = fast : smooth(0.085);
};
syllableOnset(x) = rising & (1-rising') with { rising = syllableRise(x); };

// All microphone carriers sustain while a voice is enabled. The input analysis
// controls speech amplitude, so a continuous vowel must not exhaust its carrier.
// Their spectra remain distinct: detuned choir, bright octave glass, pulse reed.
lunarCarrier(i) = vocoderEnvelope(i) *
    (0.54 * os.sawtooth(freq(i) * drift(i))
    + 0.33 * os.sawtooth(freq(i) / drift(i)) + 0.20 * os.osc(freq(i)))
    : fi.lowpass(2, 2600 + brightness * 4200);
// Faust's saw fundamental has the opposite sine phase; subtracting the sine
// reinforces a stable low anchor instead of cancelling it under the wrist LPF.
crystalSustain(i) = (0.46 * os.sawtooth(freq(i))
    + (0.28 + 0.18 * texture) * os.sawtooth(freq(i) * 2)
    - 0.24 * os.osc(freq(i)) + 0.08 * os.osc(freq(i) * 3))
    : fi.lowpass(2, min(0.44 * ma.SR, 3000 + 4000 * brightness));
crystalCarrier(i, x) = vocoderEnvelope(i) *
    (crystalSustain(i) + 0.55 * struck(i, trigger)
    + 0.16 * glassPing(trigger) * os.sawtooth(freq(i)))
    with { trigger = onset(i) | syllableOnset(x); };
reedCarrier(i) = vocoderEnvelope(i) * reedCore(i);
carrier(x) = 0.25 * sum(i, 4,
    (1.32 * moon * lunarCarrier(i) + 1.24 * glass * crystalCarrier(i, x) + 0.98 * warm * reedCarrier(i)));

band(i) = fi.bandpass(1, 80 * pow(100, float(i)/16), 80 * pow(100, float(i+1)/16));
bandColour(i) = moon * (0.91 + 0.30 * exp(0-pow((float(i)-7)/3, 2)))
    + glass * (0.70 + 0.75 * float(i)/15)
    + warm * (1.05 + 0.25 * float(i)/15);
attack = 0.012 * moon + 0.002 * glass + 0.004 * warm;
release = 0.11 * moon + 0.026 * glass + 0.046 * warm;
vocband(i, x) = (carrier(x) : band(i)) * bandColour(i)
    * (x : band(i) : an.amp_follower_ud(attack, release));
vocode(x) = 6.4 * sum(i, 16, vocband(i, modulator(x)))
    : fi.lowpass(2, 2800 + 6200 * brightness);

// Short reflections separate the instruments even at the same space setting.
// One shared stereo diffusion network keeps the real-time cost moderate.
reflections(channel, x) = x
    + space * (0.19 * moon + 0.06 * glass + 0.012 * warm)
        * (x : de.delay(16384, int(ma.SR * (0.063 + 0.011 * channel))))
    + space * (0.12 * moon + 0.07 * glass)
        * (x : de.delay(16384, int(ma.SR * (0.139 + 0.023 * channel))));
room(channel, x) = (1 - 0.16 * space) * x
    + (0.19 * moon + 0.075 * glass + 0.02 * warm) * space
        * (x : re.mono_freeverb(0.69 + 0.17 * space + 0.03 * moon, 0.56, 0.30, channel * 23));
mixL(x) = (1-mode) * padL + mode * vocode(x);
mixR(x) = (1-mode) * padR + mode * vocode(x);

// Wrist expression is independent of each instrument's brightness setting.
// Centre is an exact dry pass-through. The dark half sweeps a mildly resonant
// lowpass through the chord's actual harmonics, not an almost empty 4–8 kHz
// region. Following the highest enabled voice preserves the full chord when
// register/voicing changes. The bright half gently shelves those harmonics up.
toneDark = max(0, 1 - 2 * wristTone);
toneBright = max(0, 2 * wristTone - 1);
toneReference = routeSmooth(0.08, max(180, max(max(freq(0) * gate(0), freq(1) * gate(1)),
    max(freq(2) * gate(2), freq(3) * gate(3)))));
toneCutoff = min(9000, toneReference * (1.1 + 1.45 * pow(1-toneDark, 2)));
darkTone(x) = (1-toneDark) * x + toneDark *
    (x : fi.resonlp(toneCutoff, 0.90, 1.15 + 0.20 * mode * glass));
wristColour(x) = darkTone(x) : brightTone;
brightTone(x) = (x + 2.4 * toneBright *
    (x - (x : fi.lowpass(1, min(9000, 1.35 * toneReference))))) / (1 + 1.20 * toneBright);
output(channel, x) = x : wristColour : reflections(channel) : room(channel)
    : *(master * (0.12 + 0.88 * expression)) : fi.highpass(2, 35) : ma.tanh : *(0.9);
process(x) = (mixL(x) : output(0)), (mixR(x) : output(1));
