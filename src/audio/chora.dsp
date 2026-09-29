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
mode = routeSmooth(0.12, hslider("vocoder", 0, 0, 1, 1));
demo = hslider("demo", 0, 0, 1, 1) : smooth(0.03);
master = hslider("master", 0, 0, 0.8, 0.001) : smooth(0.04);

// A note change, a reopened voice, a new instrument, or an explicit repeat
// starts one glass attack. Continuous gesture updates do not restart envelopes.
onset(i) = (gate(i) > gate(i)') | (rawFreq(i) != rawFreq(i)')
    | (preset != preset') | (strike != strike');
chime(i) = en.ar(0.004, 1.8 + 1.3 * texture, onset(i));
drift(i) = 1 + (0.0004 + 0.0013 * texture) * os.osc(0.13 + 0.027 * i);

// MOON: slowly arriving additive choir with restrained moving formants.
lunar(i) = (gate(i) : smooth(0.22)) *
    (0.51 * os.osc(freq(i))
    + 0.21 * os.osc(freq(i) * drift(i))
    + 0.11 * os.osc(freq(i) * 2.001)
    + (0.065 + 0.045 * texture) * os.osc(freq(i) * 3)
    + 0.032 * os.osc(freq(i) * 4.002)
    + (0.20 + 0.17 * texture) * lunarFormant(i))
    : fi.lowpass(2, 850 + 3600 * brightness);
lunarFormant(i) = os.sawtooth(freq(i) * drift(i)) :
    fi.bandpass(1, 360 + 160 * texture + 60 * os.osc(0.07), 1100 + 360 * texture);

// GLASS: a pitched FM strike followed by a quiet, persistent resonant bed.
// The non-integer partials decay; the sustained chord stays tonally stable.
crystal(i) = (gate(i) : smooth(0.007)) *
    (0.46 * os.osc(freq(i) + freq(i) * (0.22 + (1.1 + 2.5 * texture) * chime(i))
        * os.osc(freq(i) * 2))
    + 0.26 * os.osc(freq(i) * 2)
    + 0.10 * os.osc(freq(i) * 3)
    + chime(i) * (0.13 * os.osc(freq(i) * 4.01)
        + 0.09 * texture * os.osc(freq(i) * 5.97)))
    * (0.63 + 0.48 * chime(i))
    : fi.lowpass(2, 1800 + 6700 * brightness);

// WARM: odd-rich reed, soft pulse and a little even harmonic content.
// Saturation happens within this instrument, before the common safety stage.
reed(i) = (gate(i) : smooth(0.035)) *
    (((0.44 + 0.12 * texture) * os.sawtooth(freq(i))
    + (0.22 + 0.22 * texture) * os.pulsetrain(freq(i), 0.48 - 0.22 * texture)
    + 0.24 * os.osc(freq(i)))
    : fi.lowpass(2, 430 + 2600 * brightness + 440 * expression)
    : *(1.45 + 0.55 * texture) : ma.tanh)
    * (0.94 + 0.06 * texture * os.osc(3.7 + i * 0.11));

pan(i) = 0.20 + 0.20 * i;
pad(i) = 0.96 * moon * lunar(i) + 1.42 * glass * crystal(i) + 0.73 * warm * reed(i);
padL = 0.36 * sum(i, 4, pad(i) * sqrt(1-pan(i)));
padR = 0.36 * sum(i, 4, pad(i) * sqrt(pan(i)));

// Each vocoder instrument has its own carrier spectrum. A small saw component
// in the glass carrier provides energy between its discrete FM partials.
lunarCarrier(i) = (0.85 * os.sawtooth(freq(i) * drift(i)) + 0.24 * os.osc(freq(i)))
    : fi.lowpass(2, 3600 + brightness * 3800);
crystalCarrier(i) = 0.85 * os.osc(freq(i) + freq(i) * (1.2 + 1.4 * texture)
        * os.osc(2 * freq(i))) + 0.40 * os.sawtooth(freq(i));
reedCarrier(i) = (0.63 * os.pulsetrain(freq(i), 0.48 - 0.17 * texture)
    + 0.48 * os.sawtooth(freq(i)))
    : *(1.05 + 0.45 * texture) : ma.tanh;
carrier = 0.25 * sum(i, 4, voice(i) *
    (moon * lunarCarrier(i) + 1.20 * glass * crystalCarrier(i) + 0.77 * warm * reedCarrier(i)));

// Permission-free demo is an explicitly synthetic voiced vowel. Microphone
// mode does not monitor dry input and produces no carrier sound during silence.
demoSource = os.sawtooth(112 + 0.8 * os.osc(0.17));
demoVowel = 0.55 * (0.64 + 0.36 * os.osc(0.38)) *
    ((demoSource : fi.bandpass(1, 220 + 80 * os.osc(0.09), 900 + 180 * os.osc(0.08)))
    + 0.60 * (demoSource : fi.bandpass(1, 1250 + 180 * os.osc(0.12), 2800 + 280 * os.osc(0.07))));
modulator(x) = (1-demo) * (x : fi.highpass(2, 65) : *(2.8) : ma.tanh) + demo * demoVowel;

// Shared analysis boundaries preserve pitch/formant correspondence; carrier,
// band emphasis and syllabic attack/release all depend on instrument identity.
band(i) = fi.bandpass(1, 80 * pow(100, float(i)/16), 80 * pow(100, float(i+1)/16));
bandColour(i) = moon * (0.91 + 0.30 * exp(0-pow((float(i)-7)/3, 2)))
    + glass * (0.67 + 0.75 * float(i)/15)
    + warm * (1.18 - 0.42 * float(i)/15);
attack = 0.017 * moon + 0.003 * glass + 0.007 * warm;
release = 0.13 * moon + 0.038 * glass + 0.069 * warm;
vocband(i, x) = (carrier : band(i)) * bandColour(i)
    * (x : band(i) : an.amp_follower_ud(attack, release));
vocode(x) = 6.4 * sum(i, 16, vocband(i, modulator(x)))
    : fi.lowpass(2, 2400 + 5500 * brightness);

// Short reflections separate the instruments even at the same space setting.
// One shared stereo diffusion network keeps the real-time cost moderate.
reflections(channel, x) = x
    + space * (0.15 * moon + 0.07 * glass + 0.045 * warm)
        * (x : de.delay(16384, int(ma.SR * (0.063 + 0.011 * channel))))
    + space * (0.08 * moon + 0.13 * glass)
        * (x : de.delay(16384, int(ma.SR * (0.139 + 0.023 * channel))));
room(channel, x) = (1 - 0.16 * space) * x
    + (0.13 * moon + 0.085 * glass + 0.065 * warm) * space
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
