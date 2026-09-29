
// DSP name and JSON string for DSP are generated
const faustData = {"processorName":"CHORA","dspName":"CHORA","dspMeta":{"name":"CHORA","filename":"CHORA","version":"2.89.2","compile_options":"-lang wasm-i -fpga-mem-th 4 -ct 1 -es 1 -mcd 16 -mdd 1024 -mdy 33 -single -ftz 2","library_list":["/usr/share/faust/stdfaust.lib","/usr/share/faust/signals.lib","/usr/share/faust/basics.lib","/usr/share/faust/maths.lib","/usr/share/faust/platform.lib","/usr/share/faust/oscillators.lib","/usr/share/faust/filters.lib","/usr/share/faust/envelopes.lib","/usr/share/faust/analyzers.lib","/usr/share/faust/delays.lib","/usr/share/faust/reverbs.lib"],"include_pathnames":["/share/faust","/share/faust","/usr/local/share/faust","/usr/share/faust","."],"size":1175124,"inputs":1,"outputs":2,"meta":[{"analyzers.lib/name":"Faust Analyzer Library"},{"analyzers.lib/version":"1.4.1"},{"author":"CHORA"},{"basics.lib/name":"Faust Basic Element Library"},{"basics.lib/version":"1.23.1"},{"compile_options":"-lang wasm-i -fpga-mem-th 4 -ct 1 -es 1 -mcd 16 -mdd 1024 -mdy 33 -single -ftz 2"},{"delays.lib/name":"Faust Delay Library"},{"delays.lib/version":"1.2.0"},{"description":"Three distinct four-voice instruments and a matched 16-band microphone vocoder."},{"envelopes.lib/ar:author":"Yann Orlarey, Stéphane Letz"},{"envelopes.lib/author":"GRAME"},{"envelopes.lib/copyright":"GRAME"},{"envelopes.lib/license":"LicenseRef-LGPL-2.1-or-later-with-Faust-exception"},{"envelopes.lib/name":"Faust Envelope Library"},{"envelopes.lib/version":"1.3.0"},{"filename":"CHORA"},{"filters.lib/allpass_comb:author":"Julius O. Smith III"},{"filters.lib/allpass_comb:copyright":"Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>"},{"filters.lib/allpass_comb:license":"LicenseRef-STK-4.3"},{"filters.lib/bandpass0_bandstop1:author":"Julius O. Smith III"},{"filters.lib/bandpass0_bandstop1:copyright":"Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>"},{"filters.lib/bandpass0_bandstop1:license":"LicenseRef-STK-4.3"},{"filters.lib/bandpass:author":"Julius O. Smith III"},{"filters.lib/bandpass:copyright":"Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>"},{"filters.lib/bandpass:license":"LicenseRef-STK-4.3"},{"filters.lib/fir:author":"Julius O. Smith III"},{"filters.lib/fir:copyright":"Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>"},{"filters.lib/fir:license":"LicenseRef-STK-4.3"},{"filters.lib/highpass:author":"Julius O. Smith III"},{"filters.lib/highpass:copyright":"Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>"},{"filters.lib/highpass:license":"LicenseRef-STK-4.3"},{"filters.lib/iir:author":"Julius O. Smith III"},{"filters.lib/iir:copyright":"Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>"},{"filters.lib/iir:license":"LicenseRef-STK-4.3"},{"filters.lib/lowpass0_highpass1:author":"Julius O. Smith III"},{"filters.lib/lowpass0_highpass1:copyright":"Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>"},{"filters.lib/lowpass0_highpass1:license":"LicenseRef-STK-4.3"},{"filters.lib/lowpass:author":"Julius O. Smith III"},{"filters.lib/lowpass:copyright":"Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>"},{"filters.lib/lowpass:license":"LicenseRef-STK-4.3"},{"filters.lib/name":"Faust Filters Library"},{"filters.lib/resonlp:author":"Julius O. Smith III"},{"filters.lib/resonlp:copyright":"Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>"},{"filters.lib/resonlp:license":"LicenseRef-STK-4.3"},{"filters.lib/tf1:author":"Julius O. Smith III"},{"filters.lib/tf1:copyright":"Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>"},{"filters.lib/tf1:license":"LicenseRef-STK-4.3"},{"filters.lib/tf1s:author":"Julius O. Smith III"},{"filters.lib/tf1s:copyright":"Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>"},{"filters.lib/tf1s:license":"LicenseRef-STK-4.3"},{"filters.lib/tf1sb:author":"Julius O. Smith III"},{"filters.lib/tf1sb:copyright":"Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>"},{"filters.lib/tf1sb:license":"LicenseRef-STK-4.3"},{"filters.lib/tf2:author":"Julius O. Smith III"},{"filters.lib/tf2:copyright":"Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>"},{"filters.lib/tf2:license":"LicenseRef-STK-4.3"},{"filters.lib/tf2s:author":"Julius O. Smith III"},{"filters.lib/tf2s:copyright":"Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>"},{"filters.lib/tf2s:license":"LicenseRef-STK-4.3"},{"filters.lib/version":"1.9.0"},{"maths.lib/author":"GRAME"},{"maths.lib/copyright":"GRAME"},{"maths.lib/license":"LicenseRef-LGPL-2.1-or-later-with-Faust-exception"},{"maths.lib/name":"Faust Math Library"},{"maths.lib/version":"2.9.0"},{"name":"CHORA"},{"oscillators.lib/lf_sawpos:author":"Bart Brouns, revised by Stéphane Letz"},{"oscillators.lib/lf_sawpos:licence":"LicenseRef-STK-4.3"},{"oscillators.lib/name":"Faust Oscillator Library"},{"oscillators.lib/saw2ptr:author":"Julius O. Smith III"},{"oscillators.lib/saw2ptr:license":"LicenseRef-STK-4.3"},{"oscillators.lib/sawN:author":"Julius O. Smith III"},{"oscillators.lib/sawN:license":"LicenseRef-STK-4.3"},{"oscillators.lib/version":"1.8.0"},{"platform.lib/name":"Generic Platform Library"},{"platform.lib/version":"1.3.0"},{"reverbs.lib/mono_freeverb:author":"Romain Michon"},{"reverbs.lib/name":"Faust Reverb Library"},{"reverbs.lib/version":"1.5.1"},{"signals.lib/name":"Faust Routing Library"},{"signals.lib/version":"1.7.0"}],"ui":[{"type":"vgroup","label":"CHORA","items":[{"type":"hslider","label":"brightness","varname":"fHslider7","shortname":"brightness","address":"/CHORA/brightness","index":262476,"init":0.5,"min":0,"max":1,"step":0.001},{"type":"hslider","label":"demo","varname":"fHslider16","shortname":"demo","address":"/CHORA/demo","index":329220,"init":0,"min":0,"max":1,"step":1},{"type":"hslider","label":"expression","varname":"fHslider9","shortname":"expression","address":"/CHORA/expression","index":279060,"init":0.5,"min":0,"max":1,"step":0.001},{"type":"hslider","label":"freq0","varname":"fHslider5","shortname":"freq0","address":"/CHORA/freq0","index":262308,"init":220,"min":45,"max":1800,"step":0.01},{"type":"hslider","label":"freq1","varname":"fHslider11","shortname":"freq1","address":"/CHORA/freq1","index":279116,"init":220,"min":45,"max":1800,"step":0.01},{"type":"hslider","label":"freq2","varname":"fHslider13","shortname":"freq2","address":"/CHORA/freq2","index":295748,"init":220,"min":45,"max":1800,"step":0.01},{"type":"hslider","label":"freq3","varname":"fHslider15","shortname":"freq3","address":"/CHORA/freq3","index":312380,"init":220,"min":45,"max":1800,"step":0.01},{"type":"hslider","label":"master","varname":"fHslider17","shortname":"master","address":"/CHORA/master","index":752928,"init":0,"min":0,"max":0.8,"step":0.001},{"type":"hslider","label":"preset","varname":"fHslider3","shortname":"preset","address":"/CHORA/preset","index":262248,"init":0,"min":0,"max":2,"step":1},{"type":"hslider","label":"space","varname":"fHslider0","shortname":"space","address":"/CHORA/space","index":262196,"init":0.65,"min":0,"max":1,"step":0.001},{"type":"hslider","label":"strike","varname":"fHslider8","shortname":"strike","address":"/CHORA/strike","index":262532,"init":0,"min":0,"max":65535,"step":1},{"type":"hslider","label":"texture","varname":"fHslider6","shortname":"texture","address":"/CHORA/texture","index":262336,"init":0.5,"min":0,"max":1,"step":0.001},{"type":"hslider","label":"vocoder","varname":"fHslider2","shortname":"vocoder","address":"/CHORA/vocoder","index":262236,"init":0,"min":0,"max":1,"step":1},{"type":"hslider","label":"voice0","varname":"fHslider4","shortname":"voice0","address":"/CHORA/voice0","index":262276,"init":0,"min":0,"max":1,"step":0.001},{"type":"hslider","label":"voice1","varname":"fHslider10","shortname":"voice1","address":"/CHORA/voice1","index":279096,"init":0,"min":0,"max":1,"step":0.001},{"type":"hslider","label":"voice2","varname":"fHslider12","shortname":"voice2","address":"/CHORA/voice2","index":295728,"init":0,"min":0,"max":1,"step":0.001},{"type":"hslider","label":"voice3","varname":"fHslider14","shortname":"voice3","address":"/CHORA/voice3","index":312360,"init":0,"min":0,"max":1,"step":0.001},{"type":"hslider","label":"wristTone","varname":"fHslider1","shortname":"wristTone","address":"/CHORA/wristTone","index":262216,"init":0.5,"min":0,"max":1,"step":0.001}]}]},"poly":false};
// Implementation needed classes of functions
var FaustDspInstance = class {
  constructor(exports) {
    this.fExports = exports;
  }
  compute($dsp, count, $input, $output) {
    this.fExports.compute($dsp, count, $input, $output);
  }
  getNumInputs($dsp) {
    return this.fExports.getNumInputs($dsp);
  }
  getNumOutputs($dsp) {
    return this.fExports.getNumOutputs($dsp);
  }
  getParamValue($dsp, index) {
    return this.fExports.getParamValue($dsp, index);
  }
  getSampleRate($dsp) {
    return this.fExports.getSampleRate($dsp);
  }
  init($dsp, sampleRate) {
    this.fExports.init($dsp, sampleRate);
  }
  instanceClear($dsp) {
    this.fExports.instanceClear($dsp);
  }
  instanceConstants($dsp, sampleRate) {
    this.fExports.instanceConstants($dsp, sampleRate);
  }
  instanceInit($dsp, sampleRate) {
    this.fExports.instanceInit($dsp, sampleRate);
  }
  instanceResetUserInterface($dsp) {
    this.fExports.instanceResetUserInterface($dsp);
  }
  setParamValue($dsp, index, value) {
    this.fExports.setParamValue($dsp, index, value);
  }
}
var FaustDspInstance = FaustDspInstance;
var _FaustBaseWebAudioDsp = class _FaustBaseWebAudioDsp {
  constructor(sampleSize, bufferSize, soundfiles) {
    this.fOutputHandler = null;
    this.fInputHandler = null;
    this.fComputeHandler = null;
    // To handle MIDI events plot
    this.fPlotHandler = null;
    this.fCachedEvents = [];
    this.fBufferNum = 0;
    this.fInChannels = [];
    this.fOutChannels = [];
    this.fOutputsTimer = 5;
    // UI items path
    this.fInputsItems = [];
    this.fOutputsItems = [];
    this.fDescriptor = [];
    // Soundfile handling
    this.fSoundfiles = [];
    this.fSoundfileBuffers = {};
    /**
     * Block-start address of every wasm audio channel, plus the heap view
     * holding the pointer tables.
     *
     * Rendering a slice means giving wasm a channel pointer to the slice's
     * first frame, so `setBufferOffset` rewrites the tables and needs these
     * unmoved addresses to offset from. Only the tables move; the
     * `fInChannels` / `fOutChannels` views from `initMemory` still span the
     * whole block and stay valid.
     */
    this.fInBase = [];
    this.fOutBase = [];
    // MIDI handling
    this.fPitchwheelLabel = [];
    this.fCtrlLabel = new Array(128).fill(null).map(() => []);
    // array of MIDI key handlers; array index is the MIDI note number
    this.fMidiKeyLabel = new Array(128).fill(null).map(() => []);
    this.fMidiKeyOnLabel = new Array(128).fill(null).map(() => []);
    this.fMidiKeyOffLabel = new Array(128).fill(null).map(() => []);
    this.fPathTable = {};
    /** Paths already complained about, so the warning is not repeated. */
    this.fUnknownPaths = /* @__PURE__ */ new Set();
    this.fUICallback = (item) => {
      if (item.type === "hbargraph" || item.type === "vbargraph") {
        const registerPath = (alias) => {
          if (this.fPathTable[alias] === void 0) {
            this.fPathTable[alias] = item.index;
          }
        };
        this.fOutputsItems.push(item.address);
        registerPath(item.address);
        registerPath(item.shortname);
        registerPath(item.label);
      } else if (item.type === "vslider" || item.type === "hslider" || item.type === "button" || item.type === "checkbox" || item.type === "nentry") {
        const registerPath = (alias) => {
          if (this.fPathTable[alias] === void 0) {
            this.fPathTable[alias] = item.index;
          }
        };
        this.fInputsItems.push(item.address);
        registerPath(item.address);
        registerPath(item.shortname);
        registerPath(item.label);
        this.fDescriptor.push(item);
        if (!item.meta) return;
        item.meta.forEach((meta) => {
          var _a, _b, _c, _d, _e, _f;
          const { midi, acc, gyr } = meta;
          if (midi) {
            const strMidi = midi.trim();
            if (strMidi === "pitchwheel") {
              const matched = strMidi.match(/^pitchwheel\s(\d+)/);
              if (matched) {
                this.fPitchwheelLabel.push({
                  path: item.address,
                  chan: parseInt(matched[1]),
                  min: item.min,
                  max: item.max
                });
              } else {
                this.fPitchwheelLabel.push({
                  path: item.address,
                  chan: 0,
                  min: item.min,
                  max: item.max
                });
              }
            } else {
              const matched2 = strMidi.match(/^ctrl\s(\d+)\s(\d+)/);
              const matched1 = strMidi.match(/^ctrl\s(\d+)/);
              const matchedKey = strMidi.match(
                /^key\s+(\d+)(?:\s+(\d+))?$/
              );
              const matchedKeyOn = strMidi.match(
                /^keyon\s+(\d+)(?:\s+(\d+))?$/
              );
              const matchedKeyOff = strMidi.match(
                /^keyoff\s+(\d+)(?:\s+(\d+))?$/
              );
              if (matched2) {
                this.fCtrlLabel[parseInt(matched2[1])].push({
                  path: item.address,
                  chan: parseInt(matched2[2]),
                  min: item.min,
                  max: item.max
                });
              } else if (matched1) {
                this.fCtrlLabel[parseInt(matched1[1])].push({
                  path: item.address,
                  chan: 0,
                  min: item.min,
                  max: item.max
                });
              } else if (matchedKey) {
                const note = parseInt(matchedKey[1]);
                const channel = matchedKey[2] ? parseInt(matchedKey[2]) : 0;
                this.fMidiKeyLabel[note].push({
                  path: item.address,
                  chan: channel,
                  min: (_a = item.min) != null ? _a : 0,
                  max: (_b = item.max) != null ? _b : 1
                });
              } else if (matchedKeyOn) {
                const note = parseInt(matchedKeyOn[1]);
                const channel = matchedKeyOn[2] ? parseInt(matchedKeyOn[2]) : 0;
                this.fMidiKeyOnLabel[note].push({
                  path: item.address,
                  chan: channel,
                  min: (_c = item.min) != null ? _c : 0,
                  max: (_d = item.max) != null ? _d : 1
                });
              } else if (matchedKeyOff) {
                const note = parseInt(matchedKeyOff[1]);
                const channel = matchedKeyOff[2] ? parseInt(matchedKeyOff[2]) : 0;
                this.fMidiKeyOffLabel[note].push({
                  path: item.address,
                  chan: channel,
                  min: (_e = item.min) != null ? _e : 0,
                  max: (_f = item.max) != null ? _f : 1
                });
              }
            }
          }
          if (acc) {
            const numAcc = acc.trim().split(" ").map(Number);
            this.setupAccHandler(
              item.address,
              FaustSensors.convertToAxis(numAcc[0]),
              FaustSensors.convertToCurve(numAcc[1]),
              numAcc[2],
              numAcc[3],
              numAcc[4],
              item.min,
              item.init,
              item.max
            );
          }
          if (gyr) {
            const numAcc = gyr.trim().split(" ").map(Number);
            this.setupGyrHandler(
              item.address,
              FaustSensors.convertToAxis(numAcc[0]),
              FaustSensors.convertToCurve(numAcc[1]),
              numAcc[2],
              numAcc[3],
              numAcc[4],
              item.min,
              item.init,
              item.max
            );
          }
        });
      } else if (item.type === "soundfile") {
        this.fSoundfiles.push({
          name: item.label,
          url: item.url,
          index: item.index,
          basePtr: -1
        });
      }
    };
    // Audio callback
    this.fProcessing = false;
    this.fDestroyed = false;
    this.fFirstCall = true;
    this.fBufferSize = bufferSize;
    this.fPtrSize = sampleSize;
    this.fSampleSize = sampleSize;
    this.fSoundfileBuffers = soundfiles;
    this.fAcc = { x: [], y: [], z: [] };
    this.fGyr = { x: [], y: [], z: [] };
  }
  /**
   * Report a parameter path that is in no control's alias list.
   *
   * Silence here is expensive: the path is a typo, or one kept from an
   * older version of the DSP, and without a word the control simply does
   * nothing while the caller believes it worked. But this can be reached
   * from the audio thread, at the rate a host moves a slider, so each path
   * is reported once and then let through quietly.
   *
   * @param path - the path that was not found
   * @param action - what was done instead
   */
  warnUnknownPath(path, action) {
    if (this.fUnknownPaths.has(path)) return;
    this.fUnknownPaths.add(path);
    console.warn(
      `Faust: unknown parameter path "${path}", ${action}. Use getParams() for the list of valid paths.`
    );
  }
  /**
   * Render a whole block through `render`, stopping at each event.
   *
   * Render up to the next event's frame, apply it, continue. Living in the
   * base class means mono and poly only have to supply what rendering a
   * slice means.
   *
   * With no events the block is one slice, which is what every caller that
   * passes no events gets.
   */
  renderBlock(events, render) {
    if (!events || events.length === 0) {
      render(0, this.fBufferSize);
      return;
    }
    let frame = 0;
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const at = Math.min(Math.max(event.frame, 0), this.fBufferSize);
      if (at > frame) {
        render(frame, at - frame);
        frame = at;
      }
      event.apply();
    }
    if (frame < this.fBufferSize) {
      render(frame, this.fBufferSize - frame);
    }
  }
  /**
   * Apply every event without rendering.
   *
   * For the blocks `compute` returns early from: stopped, or an input or
   * output not connected yet. The events have already left the processor's
   * queue, so dropping them here loses them permanently -- a `keyOn` that
   * never sounds, or a parameter the DSP and the host disagree about from
   * then on.
   *
   * A destroyed DSP is the exception, and does drop them.
   */
  applyEvents(events) {
    if (!events) return;
    for (let i = 0; i < events.length; i++) events[i].apply();
  }
  /**
   * Point the wasm channel tables at frame `offset` of the block.
   *
   * Each slice sets this before rendering, so nothing outside `compute`
   * depends on where the previous slice left the tables.
   */
  setBufferOffset(offset) {
    const bytes = offset * this.fSampleSize;
    for (let chan = 0; chan < this.fInBase.length; chan++) {
      this.fHEAP32[(this.fAudioInputs >> 2) + chan] = this.fInBase[chan] + bytes;
    }
    for (let chan = 0; chan < this.fOutBase.length; chan++) {
      this.fHEAP32[(this.fAudioOutputs >> 2) + chan] = this.fOutBase[chan] + bytes;
    }
  }
  // Tools
  static remap(v, mn0, mx0, mn1, mx1) {
    return (v - mn0) / (mx0 - mn0) * (mx1 - mn1) + mn1;
  }
  // JSON parsing functions
  static parseUI(ui, callback) {
    ui.forEach((group) => this.parseGroup(group, callback));
  }
  static parseGroup(group, callback) {
    if (group.items) {
      this.parseItems(group.items, callback);
    }
  }
  static parseItems(items, callback) {
    items.forEach((item) => this.parseItem(item, callback));
  }
  static parseItem(item, callback) {
    if (item.type === "vgroup" || item.type === "hgroup" || item.type === "tgroup") {
      this.parseItems(item.items, callback);
    } else {
      callback(item);
    }
  }
  /** Split the soundfile names and return an array of names */
  static splitSoundfileNames(input) {
    const trimmed = input.replace(/^\{|\}$/g, "");
    return trimmed.split(";").map(
      (str) => str.length <= 2 ? "" : str.substring(1, str.length - 1)
    ).map((str) => str.trim()).filter((str) => str.length > 0);
  }
  get hasAccInput() {
    return this.fAcc.x.length + this.fAcc.y.length + this.fAcc.z.length > 0;
  }
  propagateAcc(accelerationIncludingGravity, invert = false) {
    const { x, y, z } = accelerationIncludingGravity;
    if (invert) {
      if (x !== null) this.fAcc.x.forEach((handler) => handler(-x));
      if (y !== null) this.fAcc.y.forEach((handler) => handler(-y));
      if (z !== null) this.fAcc.z.forEach((handler) => handler(-z));
    } else {
      if (x !== null) this.fAcc.x.forEach((handler) => handler(x));
      if (y !== null) this.fAcc.y.forEach((handler) => handler(y));
      if (z !== null) this.fAcc.z.forEach((handler) => handler(z));
    }
  }
  get hasGyrInput() {
    return this.fGyr.x.length + this.fGyr.y.length + this.fGyr.z.length > 0;
  }
  propagateGyr(event) {
    const { alpha, beta, gamma } = event;
    if (alpha !== null) this.fGyr.x.forEach((handler) => handler(alpha));
    if (beta !== null) this.fGyr.y.forEach((handler) => handler(beta));
    if (gamma !== null) this.fGyr.z.forEach((handler) => handler(gamma));
  }
  /** Build the accelerometer handler */
  setupAccHandler(path, axis, curve, amin, amid, amax, min, init, max) {
    const handler = FaustSensors.buildHandler(
      curve,
      amin,
      amid,
      amax,
      min,
      init,
      max
    );
    switch (axis) {
      case 0 /* x */:
        this.fAcc.x.push(
          (val) => this.setParamValue(path, handler.uiToFaust(val))
        );
        break;
      case 1 /* y */:
        this.fAcc.y.push(
          (val) => this.setParamValue(path, handler.uiToFaust(val))
        );
        break;
      case 2 /* z */:
        this.fAcc.z.push(
          (val) => this.setParamValue(path, handler.uiToFaust(val))
        );
        break;
    }
  }
  /** Build the gyroscope handler */
  setupGyrHandler(path, axis, curve, amin, amid, amax, min, init, max) {
    const handler = FaustSensors.buildHandler(
      curve,
      amin,
      amid,
      amax,
      min,
      init,
      max
    );
    switch (axis) {
      case 0 /* x */:
        this.fGyr.x.push(
          (val) => this.setParamValue(path, handler.uiToFaust(val))
        );
        break;
      case 1 /* y */:
        this.fGyr.y.push(
          (val) => this.setParamValue(path, handler.uiToFaust(val))
        );
        break;
      case 2 /* z */:
        this.fGyr.z.push(
          (val) => this.setParamValue(path, handler.uiToFaust(val))
        );
        break;
    }
  }
  static extractUrlsFromMeta(dspMeta) {
    const soundfilesEntry = dspMeta.meta.find(
      (entry) => entry.soundfiles !== void 0
    );
    if (soundfilesEntry) {
      return soundfilesEntry.soundfiles.split(";").filter((url) => url !== "");
    } else {
      return [];
    }
  }
  /**
   * Load a soundfile possibly containing several parts in the DSP struct.
   * Soundfile pointers are located at 'index' offset, to be read in the JSON file.
   * The DSP struct is located at baseDSP in the wasm memory,
   * either a monophonic DSP, or a voice in a polyphonic context.
   *
   * @param allocator : the wasm memory allocator
   * @param baseDSP : the base DSP in the wasm memory
   * @param name : the name of the soundfile
   * @param url : the url of the soundfile
   */
  loadSoundfile(allocator, baseDSP, name, url) {
    console.log(`Soundfile ${name} paths: ${url}`);
    const soundfileIds = _FaustBaseWebAudioDsp.splitSoundfileNames(url);
    const item = this.fSoundfiles.find((item2) => item2.url === url);
    if (!item) throw new Error(`Soundfile with ${url} cannot be found !}`);
    if (item.basePtr !== -1) {
      const HEAP32 = allocator.getInt32Array();
      console.log(
        `Soundfile CACHE ${url}} : ${name} loaded at ${item.basePtr} in wasm memory with index ${item.index}`
      );
      HEAP32[baseDSP + item.index >> 2] = item.basePtr;
    } else {
      const soundfile = this.createSoundfile(
        allocator,
        soundfileIds,
        this.fSoundfileBuffers
      );
      if (soundfile) {
        const HEAP32 = soundfile.getHEAP32();
        item.basePtr = soundfile.getPtr();
        console.log(
          `Soundfile ${name} loaded at ${item.basePtr} in wasm memory with index ${item.index}`
        );
        HEAP32[baseDSP + item.index >> 2] = item.basePtr;
      } else {
        console.log(
          `Soundfile ${name} for ${url} cannot be created !}`
        );
      }
    }
  }
  createSoundfile(allocator, soundfileIdList, soundfiles, maxChan = Soundfile.MAX_CHAN) {
    let curChan = 1;
    let totalLength = 0;
    for (const soundfileId of soundfileIdList) {
      let chan = 0;
      let len = 0;
      const audioData = soundfiles == null ? void 0 : soundfiles[soundfileId];
      if (audioData) {
        chan = audioData.audioBuffer.length;
        len = audioData.audioBuffer[0].length;
      } else {
        len = Soundfile.BUFFER_SIZE;
        chan = 1;
      }
      curChan = Math.max(curChan, chan);
      totalLength += len;
    }
    totalLength += (Soundfile.MAX_SOUNDFILE_PARTS - soundfileIdList.length) * Soundfile.BUFFER_SIZE;
    const soundfile = new Soundfile(
      allocator,
      this.fSampleSize,
      curChan,
      totalLength,
      maxChan,
      soundfileIdList.length
    );
    let offset = 0;
    for (let part = 0; part < soundfileIdList.length; part++) {
      const soundfileId = soundfileIdList[part];
      const audioData = soundfiles == null ? void 0 : soundfiles[soundfileId];
      if (audioData) {
        soundfile.copyToOut(part, maxChan, offset, audioData);
        offset += audioData.audioBuffer[0].length;
      } else {
        offset = soundfile.emptyFile(part, offset);
      }
    }
    for (let part = soundfileIdList.length; part < Soundfile.MAX_SOUNDFILE_PARTS; part++) {
      offset = soundfile.emptyFile(part, offset);
    }
    soundfile.shareBuffers(curChan, maxChan);
    return soundfile;
  }
  /**
   * Init soundfiles memory.
   *
   * @param allocator : the wasm memory allocator
   * @param baseDSP : the DSP struct (either a monophonic DSP of polyphonic voice) base DSP in the wasm memory
   */
  initSoundfileMemory(allocator, baseDSP) {
    for (const { name, url } of this.fSoundfiles) {
      this.loadSoundfile(allocator, baseDSP, name, url);
    }
  }
  updateOutputs() {
    if (this.fOutputsItems.length > 0 && this.fOutputHandler && this.fOutputsTimer-- === 0) {
      this.fOutputsTimer = 5;
      this.fOutputsItems.forEach(
        (item) => {
          var _a;
          return (_a = this.fOutputHandler) == null ? void 0 : _a.call(this, item, this.getParamValue(item));
        }
      );
    }
  }
  // Public API
  metadata(handler) {
    if (this.fJSONDsp.meta) {
      this.fJSONDsp.meta.forEach(
        (meta) => handler(Object.keys(meta)[0], meta[Object.keys(meta)[0]])
      );
    }
  }
  compute(input, output) {
    return false;
  }
  setOutputParamHandler(handler) {
    this.fOutputHandler = handler;
  }
  getOutputParamHandler() {
    return this.fOutputHandler;
  }
  callOutputParamHandler(path, value) {
    if (this.fOutputHandler) {
      this.fOutputHandler(path, value);
    }
  }
  setInputParamHandler(handler) {
    this.fInputHandler = handler;
  }
  getInputParamHandler() {
    return this.fInputHandler;
  }
  callInputParamHandler(path, value) {
    if (this.fInputHandler) {
      this.fInputHandler(path, value);
    }
  }
  setComputeHandler(handler) {
    this.fComputeHandler = handler;
  }
  getComputeHandler() {
    return this.fComputeHandler;
  }
  setPlotHandler(handler) {
    this.fPlotHandler = handler;
  }
  getPlotHandler() {
    return this.fPlotHandler;
  }
  getNumInputs() {
    return -1;
  }
  getNumOutputs() {
    return -1;
  }
  midiMessage(data) {
    if (this.fPlotHandler) this.fCachedEvents.push({ data, type: "midi" });
    const cmd = data[0] >> 4;
    const channel = data[0] & 15;
    const data1 = data[1];
    const data2 = data[2];
    if (cmd === 11) return this.ctrlChange(channel, data1, data2);
    if (cmd === 14) return this.pitchWheel(channel, data2 * 128 + data1);
    if (cmd === 9) {
      if (data2 > 0) return this.keyOn(channel, data1, data2);
      else return this.keyOff(channel, data1, data2);
    }
    if (cmd === 8) {
      return this.keyOff(channel, data1, data2);
    }
  }
  ctrlChange(channel, ctrl, value) {
    if (this.fPlotHandler)
      this.fCachedEvents.push({
        type: "ctrlChange",
        data: [channel, ctrl, value]
      });
    if (this.fCtrlLabel[ctrl].length) {
      this.fCtrlLabel[ctrl].forEach((ctrl2) => {
        const { path, chan } = ctrl2;
        if (chan === 0 || channel === chan - 1) {
          this.setParamValue(
            path,
            _FaustBaseWebAudioDsp.remap(
              value,
              0,
              127,
              ctrl2.min,
              ctrl2.max
            )
          );
          if (this.fOutputHandler)
            this.fOutputHandler(path, this.getParamValue(path));
        }
      });
    }
  }
  keyOn(channel, pitch, velocity) {
    if (this.fPlotHandler)
      this.fCachedEvents.push({
        type: "keyOn",
        data: [channel, pitch, velocity]
      });
    this.fMidiKeyOnLabel[pitch].forEach((key) => {
      const { path, chan } = key;
      if (chan === 0 || channel === chan - 1) {
        this.setParamValue(
          path,
          _FaustBaseWebAudioDsp.remap(
            velocity,
            0,
            127,
            key.min,
            key.max
          )
        );
        if (this.fOutputHandler)
          this.fOutputHandler(path, this.getParamValue(path));
      }
    });
    this.fMidiKeyLabel[pitch].forEach((key) => {
      const { path, chan } = key;
      if (chan === 0 || channel === chan - 1) {
        this.setParamValue(
          path,
          _FaustBaseWebAudioDsp.remap(
            velocity,
            0,
            127,
            key.min,
            key.max
          )
        );
        if (this.fOutputHandler)
          this.fOutputHandler(path, this.getParamValue(path));
      }
    });
  }
  keyOff(channel, pitch, velocity) {
    if (this.fPlotHandler)
      this.fCachedEvents.push({
        type: "keyOff",
        data: [channel, pitch, velocity]
      });
    this.fMidiKeyOffLabel[pitch].forEach((key) => {
      const { path, chan } = key;
      if (chan === 0 || channel === chan - 1) {
        this.setParamValue(
          path,
          _FaustBaseWebAudioDsp.remap(
            velocity,
            0,
            127,
            key.min,
            key.max
          )
        );
        if (this.fOutputHandler)
          this.fOutputHandler(path, this.getParamValue(path));
      }
    });
    this.fMidiKeyLabel[pitch].forEach((key) => {
      const { path, chan } = key;
      if (chan === 0 || channel === chan - 1) {
        this.setParamValue(path, 0);
        if (this.fOutputHandler)
          this.fOutputHandler(path, this.getParamValue(path));
      }
    });
  }
  pitchWheel(channel, wheel) {
    if (this.fPlotHandler)
      this.fCachedEvents.push({
        type: "pitchWheel",
        data: [channel, wheel]
      });
    this.fPitchwheelLabel.forEach((pw) => {
      const { path, chan } = pw;
      if (chan === 0 || channel === chan - 1) {
        this.setParamValue(
          path,
          _FaustBaseWebAudioDsp.remap(wheel, 0, 16383, pw.min, pw.max)
        );
        if (this.fOutputHandler)
          this.fOutputHandler(path, this.getParamValue(path));
      }
    });
  }
  setParamValue(path, value) {
  }
  getParamValue(path) {
    return 0;
  }
  getParams() {
    return this.fInputsItems;
  }
  getMeta() {
    return this.fJSONDsp;
  }
  getJSON() {
    return JSON.stringify(this.getMeta());
  }
  getUI() {
    return this.fJSONDsp.ui;
  }
  getDescriptors() {
    return this.fDescriptor;
  }
  hasSoundfiles() {
    return this.fSoundfiles.length > 0;
  }
  startSensors() {
    this.startSensors();
  }
  stopSensors() {
    this.stopSensors();
  }
  init() {
  }
  instanceInit() {
  }
  instanceClear() {
  }
  instanceConstants() {
  }
  instanceResetUserInterface() {
  }
  start() {
    this.fProcessing = true;
  }
  stop() {
    this.fProcessing = false;
  }
  destroy() {
    this.fDestroyed = true;
    this.fOutputHandler = null;
    this.fInputHandler = null;
    this.fComputeHandler = null;
    this.fPlotHandler = null;
  }
}
var FaustBaseWebAudioDsp = _FaustBaseWebAudioDsp;
var FaustMonoWebAudioDsp = class extends FaustBaseWebAudioDsp {
  constructor(instance, sampleRate, sampleSize, bufferSize, soundfiles) {
    super(sampleSize, bufferSize, soundfiles);
    /**
     * Render one slice, for `renderBlock`.
     *
     * A field rather than an inline closure so it is allocated once instead of
     * on every `compute` call.
     */
    this.fRenderSlice = (offset, count) => {
      this.setBufferOffset(offset);
      this.fInstance.api.compute(
        this.fDSP,
        count,
        this.fAudioInputs,
        this.fAudioOutputs
      );
    };
    this.fInstance = instance;
    this.fSampleRate = sampleRate;
    this.fJSONDsp = JSON.parse(this.fInstance.json);
    FaustBaseWebAudioDsp.parseUI(this.fJSONDsp.ui, this.fUICallback);
    this.fEndMemory = this.initMemory();
    this.fInstance.api.init(this.fDSP, sampleRate);
    if (this.fSoundfiles.length > 0) {
      const allocator = new WasmAllocator(
        this.fInstance.memory,
        this.fEndMemory
      );
      this.initSoundfileMemory(allocator, this.fDSP);
    }
  }
  init() {
    this.fInstance.api.init(this.fDSP, this.fSampleRate);
  }
  instanceInit() {
    this.fInstance.api.instanceInit(this.fDSP, this.fSampleRate);
  }
  instanceClear() {
    this.fInstance.api.instanceClear(this.fDSP);
  }
  instanceConstants() {
    this.fInstance.api.instanceConstants(this.fDSP, this.fSampleRate);
  }
  instanceResetUserInterface() {
    this.fInstance.api.instanceResetUserInterface(this.fDSP);
  }
  initMemory() {
    this.fDSP = 0;
    const $audio = this.fJSONDsp.size;
    this.fAudioInputs = $audio;
    this.fAudioOutputs = this.fAudioInputs + this.getNumInputs() * this.fPtrSize;
    const $audioInputs = this.fAudioOutputs + this.getNumOutputs() * this.fPtrSize;
    const $audioOutputs = $audioInputs + this.getNumInputs() * this.fBufferSize * this.fSampleSize;
    const endMemory = $audioOutputs + this.getNumOutputs() * this.fBufferSize * this.fSampleSize;
    const HEAP = this.fInstance.memory.buffer;
    const HEAP32 = new Int32Array(HEAP);
    const HEAPF = this.fSampleSize === 4 ? new Float32Array(HEAP) : new Float64Array(HEAP);
    if (this.getNumInputs() > 0) {
      for (let chan = 0; chan < this.getNumInputs(); chan++) {
        HEAP32[(this.fAudioInputs >> 2) + chan] = $audioInputs + this.fBufferSize * this.fSampleSize * chan;
      }
      const dspInChans = HEAP32.subarray(
        this.fAudioInputs >> 2,
        this.fAudioInputs + this.getNumInputs() * this.fPtrSize >> 2
      );
      for (let chan = 0; chan < this.getNumInputs(); chan++) {
        this.fInChannels[chan] = HEAPF.subarray(
          dspInChans[chan] >> Math.log2(this.fSampleSize),
          dspInChans[chan] + this.fBufferSize * this.fSampleSize >> Math.log2(this.fSampleSize)
        );
      }
    }
    if (this.getNumOutputs() > 0) {
      for (let chan = 0; chan < this.getNumOutputs(); chan++) {
        HEAP32[(this.fAudioOutputs >> 2) + chan] = $audioOutputs + this.fBufferSize * this.fSampleSize * chan;
      }
      const dspOutChans = HEAP32.subarray(
        this.fAudioOutputs >> 2,
        this.fAudioOutputs + this.getNumOutputs() * this.fPtrSize >> 2
      );
      for (let chan = 0; chan < this.getNumOutputs(); chan++) {
        this.fOutChannels[chan] = HEAPF.subarray(
          dspOutChans[chan] >> Math.log2(this.fSampleSize),
          dspOutChans[chan] + this.fBufferSize * this.fSampleSize >> Math.log2(this.fSampleSize)
        );
      }
    }
    this.fHEAP32 = HEAP32;
    this.fInBase = [];
    for (let chan = 0; chan < this.getNumInputs(); chan++) {
      this.fInBase[chan] = HEAP32[(this.fAudioInputs >> 2) + chan];
    }
    this.fOutBase = [];
    for (let chan = 0; chan < this.getNumOutputs(); chan++) {
      this.fOutBase[chan] = HEAP32[(this.fAudioOutputs >> 2) + chan];
    }
    return endMemory;
  }
  toString() {
    return `============== Mono Memory layout ==============
        this.fBufferSize: ${this.fBufferSize}
        this.fJSONDsp.size: ${this.fJSONDsp.size}
        this.fAudioInputs: ${this.fAudioInputs}
        this.fAudioOutputs: ${this.fAudioOutputs}
        this.fDSP: ${this.fDSP}`;
  }
  // Public API
  compute(input, output, events) {
    if (this.fDestroyed) return false;
    if (!this.fProcessing) {
      this.applyEvents(events);
      return true;
    }
    if (this.fFirstCall) {
      this.initMemory();
      this.fFirstCall = false;
    }
    if (typeof input === "function") {
      input(this.fInChannels);
    } else {
      if (this.getNumInputs() > 0 && (!input || !input[0] || input[0].length === 0)) {
        this.applyEvents(events);
        return true;
      }
      if (this.getNumOutputs() > 0 && typeof output !== "function" && (!output || !output[0] || output[0].length === 0)) {
        this.applyEvents(events);
        return true;
      }
      if (input !== void 0) {
        for (let chan = 0; chan < Math.min(this.getNumInputs(), input.length); chan++) {
          const dspInput = this.fInChannels[chan];
          dspInput.set(input[chan]);
        }
      }
    }
    if (this.fComputeHandler) this.fComputeHandler(this.fBufferSize);
    this.renderBlock(events, this.fRenderSlice);
    this.updateOutputs();
    let forPlot = this.fOutChannels;
    if (typeof output === "function") {
      output(this.fOutChannels);
    } else {
      for (let chan = 0; chan < Math.min(this.getNumOutputs(), output.length); chan++) {
        const dspOutput = this.fOutChannels[chan];
        output[chan].set(dspOutput);
      }
      forPlot = output;
    }
    if (this.fPlotHandler) {
      this.fPlotHandler(
        forPlot,
        this.fBufferNum++,
        this.fCachedEvents.length ? this.fCachedEvents : void 0
      );
      this.fCachedEvents = [];
    }
    return true;
  }
  metadata(handler) {
    super.metadata(handler);
  }
  getNumInputs() {
    return this.fInstance.api.getNumInputs(this.fDSP);
  }
  getNumOutputs() {
    return this.fInstance.api.getNumOutputs(this.fDSP);
  }
  setParamValue(path, value) {
    const index = this.fPathTable[path];
    if (index === void 0) return this.warnUnknownPath(path, "ignored");
    if (this.fPlotHandler)
      this.fCachedEvents.push({ type: "param", data: { path, value } });
    this.fInstance.api.setParamValue(this.fDSP, index, value);
    this.callInputParamHandler(path, this.getParamValue(path));
  }
  getParamValue(path) {
    const index = this.fPathTable[path];
    if (index === void 0) {
      this.warnUnknownPath(path, "returning 0");
      return 0;
    }
    return this.fInstance.api.getParamValue(this.fDSP, index);
  }
  getMeta() {
    return this.fJSONDsp;
  }
  getJSON() {
    return this.fInstance.json;
  }
  getDescriptors() {
    return this.fDescriptor;
  }
  getUI() {
    return this.fJSONDsp.ui;
  }
}
var FaustMonoWebAudioDsp = FaustMonoWebAudioDsp;
var FaustWasmInstantiator = class {
  static createWasmImport(memory) {
    return {
      env: {
        memory: memory || new WebAssembly.Memory({ initial: 100 }),
        memoryBase: 0,
        tableBase: 0,
        // Integer version
        _abs: Math.abs,
        // Float version
        _acosf: Math.acos,
        _asinf: Math.asin,
        _atanf: Math.atan,
        _atan2f: Math.atan2,
        _ceilf: Math.ceil,
        _cosf: Math.cos,
        _expf: Math.exp,
        _floorf: Math.floor,
        _fmodf: (x, y) => x % y,
        _logf: Math.log,
        _log10f: Math.log10,
        _max_f: Math.max,
        _min_f: Math.min,
        _remainderf: (x, y) => x - Math.round(x / y) * y,
        _powf: Math.pow,
        _roundf: Math.round,
        _sinf: Math.sin,
        _sqrtf: Math.sqrt,
        _tanf: Math.tan,
        _acoshf: Math.acosh,
        _asinhf: Math.asinh,
        _atanhf: Math.atanh,
        _coshf: Math.cosh,
        _sinhf: Math.sinh,
        _tanhf: Math.tanh,
        _isnanf: Number.isNaN,
        _isinff: (x) => !isFinite(x),
        _copysignf: (x, y) => Math.sign(x) === Math.sign(y) ? x : -x,
        // Double version
        _acos: Math.acos,
        _asin: Math.asin,
        _atan: Math.atan,
        _atan2: Math.atan2,
        _ceil: Math.ceil,
        _cos: Math.cos,
        _exp: Math.exp,
        _floor: Math.floor,
        _fmod: (x, y) => x % y,
        _log: Math.log,
        _log10: Math.log10,
        _max_: Math.max,
        _min_: Math.min,
        _remainder: (x, y) => x - Math.round(x / y) * y,
        _pow: Math.pow,
        _round: Math.round,
        _sin: Math.sin,
        _sqrt: Math.sqrt,
        _tan: Math.tan,
        _acosh: Math.acosh,
        _asinh: Math.asinh,
        _atanh: Math.atanh,
        _cosh: Math.cosh,
        _sinh: Math.sinh,
        _tanh: Math.tanh,
        _isnan: Number.isNaN,
        _isinf: (x) => !isFinite(x),
        _copysign: (x, y) => Math.sign(x) === Math.sign(y) ? x : -x,
        table: new WebAssembly.Table({ initial: 0, element: "anyfunc" })
      }
    };
  }
  static createWasmMemoryPoly(voicesIn, sampleSize, dspMeta, effectMeta, bufferSize) {
    const voices = Math.max(4, voicesIn);
    const ptrSize = sampleSize;
    const pow2limit = (x) => {
      let n = 65536;
      while (n < x) {
        n *= 2;
      }
      return n;
    };
    const effectSize = effectMeta ? effectMeta.size : 0;
    let memorySize = pow2limit(
      effectSize + dspMeta.size * voices + (dspMeta.inputs + dspMeta.outputs * 2) * // + 2 for effect
      (ptrSize + bufferSize * sampleSize)
    ) / 65536;
    memorySize = Math.max(2, memorySize);
    return new WebAssembly.Memory({ initial: memorySize });
  }
  static createWasmMemoryMono(sampleSize, dspMeta, bufferSize) {
    const ptrSize = sampleSize;
    const memorySize = (dspMeta.size + (dspMeta.inputs + dspMeta.outputs) * (ptrSize + bufferSize * sampleSize)) / 65536;
    return new WebAssembly.Memory({ initial: memorySize * 2 });
  }
  static createMonoDSPInstanceAux(instance, json, mem = null) {
    const functions = instance.exports;
    const api = new FaustDspInstance(functions);
    const memory = mem ? mem : instance.exports.memory;
    return { memory, api, json };
  }
  static createMemoryMono(monoFactory) {
    const monoMeta = JSON.parse(monoFactory.json);
    const sampleSize = monoMeta.compile_options.match("-double") ? 8 : 4;
    return this.createWasmMemoryMono(sampleSize, monoMeta, 8192);
  }
  static createMemoryPoly(voices, voiceFactory, effectFactory) {
    const voiceMeta = JSON.parse(voiceFactory.json);
    const effectMeta = effectFactory && effectFactory.json ? JSON.parse(effectFactory.json) : null;
    const sampleSize = voiceMeta.compile_options.match("-double") ? 8 : 4;
    return this.createWasmMemoryPoly(
      voices,
      sampleSize,
      voiceMeta,
      effectMeta,
      8192
    );
  }
  static createMixerAux(mixerModule, memory) {
    const mixerImport = {
      imports: { print: console.log },
      memory: { memory }
    };
    const mixerInstance = new WebAssembly.Instance(
      mixerModule,
      mixerImport
    );
    const mixerFunctions = mixerInstance.exports;
    return mixerFunctions;
  }
  // Public API
  static async loadDSPFactory(wasmPath, jsonPath) {
    const wasmFile = await fetch(wasmPath);
    if (!wasmFile.ok) {
      throw new Error(
        `=> exception raised while running loadDSPFactory, file not found: ${wasmPath}`
      );
    }
    const wasmBuffer = await wasmFile.arrayBuffer();
    const module = await WebAssembly.compile(wasmBuffer);
    const jsonFile = await fetch(jsonPath);
    const json = await jsonFile.text();
    const meta = JSON.parse(json);
    const cOptions = meta.compile_options;
    const poly = cOptions.indexOf("wasm-e") !== -1;
    return {
      cfactory: 0,
      code: new Uint8Array(wasmBuffer),
      module,
      json,
      poly
    };
  }
  static async loadDSPMixer(mixerPath, fs) {
    let mixerBuffer = null;
    if (fs) {
      mixerBuffer = new Uint8Array(
        fs.readFile(mixerPath, { encoding: "binary" })
      );
    } else {
      const mixerFile = await fetch(mixerPath);
      mixerBuffer = await mixerFile.arrayBuffer();
    }
    return WebAssembly.compile(mixerBuffer);
  }
  static async createAsyncMonoDSPInstance(factory) {
    const pattern = /"type":\s*"soundfile"/;
    const isDetected = pattern.test(factory.json);
    if (isDetected) {
      const memory = this.createMemoryMono(factory);
      const instance = await WebAssembly.instantiate(
        factory.module,
        this.createWasmImport(memory)
      );
      return this.createMonoDSPInstanceAux(
        instance,
        factory.json,
        memory
      );
    } else {
      const instance = await WebAssembly.instantiate(
        factory.module,
        this.createWasmImport()
      );
      return this.createMonoDSPInstanceAux(instance, factory.json);
    }
  }
  static createSyncMonoDSPInstance(factory) {
    const pattern = /"type":\s*"soundfile"/;
    const isDetected = pattern.test(factory.json);
    if (isDetected) {
      const memory = this.createMemoryMono(factory);
      const instance = new WebAssembly.Instance(
        factory.module,
        this.createWasmImport(memory)
      );
      return this.createMonoDSPInstanceAux(
        instance,
        factory.json,
        memory
      );
    } else {
      const instance = new WebAssembly.Instance(
        factory.module,
        this.createWasmImport()
      );
      return this.createMonoDSPInstanceAux(instance, factory.json);
    }
  }
  static async createAsyncPolyDSPInstance(voiceFactory, mixerModule, voices, effectFactory) {
    const memory = this.createMemoryPoly(
      voices,
      voiceFactory,
      effectFactory
    );
    const voiceInstance = await WebAssembly.instantiate(
      voiceFactory.module,
      this.createWasmImport(memory)
    );
    const voiceFunctions = voiceInstance.exports;
    const voiceAPI = new FaustDspInstance(voiceFunctions);
    const mixerAPI = this.createMixerAux(mixerModule, memory);
    if (effectFactory) {
      const effectInstance = await WebAssembly.instantiate(
        effectFactory.module,
        this.createWasmImport(memory)
      );
      const effectFunctions = effectInstance.exports;
      const effectAPI = new FaustDspInstance(effectFunctions);
      return {
        memory,
        voices,
        voiceAPI,
        effectAPI,
        mixerAPI,
        voiceJSON: voiceFactory.json,
        effectJSON: effectFactory.json
      };
    } else {
      return {
        memory,
        voices,
        voiceAPI,
        mixerAPI,
        voiceJSON: voiceFactory.json
      };
    }
  }
  static createSyncPolyDSPInstance(voiceFactory, mixerModule, voices, effectFactory) {
    const memory = this.createMemoryPoly(
      voices,
      voiceFactory,
      effectFactory
    );
    const voiceInstance = new WebAssembly.Instance(
      voiceFactory.module,
      this.createWasmImport(memory)
    );
    const voiceFunctions = voiceInstance.exports;
    const voiceAPI = new FaustDspInstance(voiceFunctions);
    const mixerAPI = this.createMixerAux(mixerModule, memory);
    if (effectFactory) {
      const effectInstance = new WebAssembly.Instance(
        effectFactory.module,
        this.createWasmImport(memory)
      );
      const effectFunctions = effectInstance.exports;
      const effectAPI = new FaustDspInstance(effectFunctions);
      return {
        memory,
        voices,
        voiceAPI,
        effectAPI,
        mixerAPI,
        voiceJSON: voiceFactory.json,
        effectJSON: effectFactory.json
      };
    } else {
      return {
        memory,
        voices,
        voiceAPI,
        mixerAPI,
        voiceJSON: voiceFactory.json
      };
    }
  }
}
var FaustWasmInstantiator = FaustWasmInstantiator;
var _Soundfile = class _Soundfile {
  /** Maximum number of soundfile parts. */
  static get MAX_SOUNDFILE_PARTS() {
    return 256;
  }
  /** Maximum number of channels. */
  static get MAX_CHAN() {
    return 64;
  }
  /** Maximum buffer size in frames. */
  static get BUFFER_SIZE() {
    return 1024;
  }
  /** Default sample rate. */
  static get SAMPLE_RATE() {
    return 44100;
  }
  constructor(allocator, sampleSize, curChan, length, maxChan, totalParts) {
    this.fSampleSize = sampleSize;
    this.fIntSize = this.fSampleSize;
    this.fPtrSize = 4;
    this.fAllocator = allocator;
    console.log(
      `Soundfile constructor: curChan: ${curChan}, length: ${length}, maxChan: ${maxChan}, totalParts: ${totalParts}`
    );
    this.fPtr = allocator.alloc(4 * this.fPtrSize);
    this.fLength = allocator.alloc(
      _Soundfile.MAX_SOUNDFILE_PARTS * this.fIntSize
    );
    this.fSR = allocator.alloc(
      _Soundfile.MAX_SOUNDFILE_PARTS * this.fIntSize
    );
    this.fOffset = allocator.alloc(
      _Soundfile.MAX_SOUNDFILE_PARTS * this.fIntSize
    );
    this.fBuffers = this.allocBuffers(curChan, length, maxChan);
    const HEAP32 = this.fAllocator.getInt32Array();
    HEAP32[this.fPtr >> 2] = this.fBuffers;
    HEAP32[this.fPtr + this.fPtrSize >> 2] = this.fLength;
    HEAP32[this.fPtr + 2 * this.fPtrSize >> 2] = this.fSR;
    HEAP32[this.fPtr + 3 * this.fPtrSize >> 2] = this.fOffset;
    for (let chan = 0; chan < curChan; chan++) {
      const buffer = HEAP32[(this.fBuffers >> 2) + chan];
      console.log(`allocBuffers AFTER: ${chan} - ${buffer}`);
    }
  }
  allocBuffers(curChan, length, maxChan) {
    const buffers = this.fAllocator.alloc(maxChan * this.fPtrSize);
    console.log(`allocBuffers buffers: ${buffers}`);
    for (let chan = 0; chan < curChan; chan++) {
      const buffer = this.fAllocator.alloc(
        length * this.fSampleSize
      );
      const HEAP32 = this.fAllocator.getInt32Array();
      HEAP32[(buffers >> 2) + chan] = buffer;
    }
    return buffers;
  }
  shareBuffers(curChan, maxChan) {
    const HEAP32 = this.fAllocator.getInt32Array();
    for (let chan = curChan; chan < maxChan; chan++) {
      HEAP32[(this.fBuffers >> 2) + chan] = HEAP32[(this.fBuffers >> 2) + chan % curChan];
    }
  }
  copyToOut(part, maxChannels, offset, audioData) {
    if (this.fIntSize === 4) {
      const HEAP32 = this.fAllocator.getInt32Array();
      HEAP32[(this.fLength >> Math.log2(this.fIntSize)) + part] = audioData.audioBuffer[0].length;
      HEAP32[(this.fSR >> Math.log2(this.fIntSize)) + part] = audioData.sampleRate;
      HEAP32[(this.fOffset >> Math.log2(this.fIntSize)) + part] = offset;
    } else {
      const HEAP64 = this.fAllocator.getInt64Array();
      HEAP64[(this.fLength >> Math.log2(this.fIntSize)) + part] = BigInt(
        audioData.audioBuffer[0].length
      );
      HEAP64[(this.fSR >> Math.log2(this.fIntSize)) + part] = BigInt(
        audioData.sampleRate
      );
      HEAP64[(this.fOffset >> Math.log2(this.fIntSize)) + part] = BigInt(offset);
    }
    console.log(
      `copyToOut: part: ${part}, maxChannels: ${maxChannels}, offset: ${offset}, buffer: ${audioData}`
    );
    if (this.fSampleSize === 8) {
      this.copyToOutReal64(maxChannels, offset, audioData);
    } else {
      this.copyToOutReal32(maxChannels, offset, audioData);
    }
  }
  copyToOutReal32(maxChannels, offset, audioData) {
    const HEAP32 = this.fAllocator.getInt32Array();
    const HEAPF = this.fAllocator.getFloat32Array();
    for (let chan = 0; chan < audioData.audioBuffer.length; chan++) {
      const input = audioData.audioBuffer[chan];
      const output = HEAP32[(this.fBuffers >> 2) + chan];
      const begin = output + offset * this.fSampleSize >> Math.log2(this.fSampleSize);
      const end = output + (offset + input.length) * this.fSampleSize >> Math.log2(this.fSampleSize);
      console.log(
        `copyToOutReal32 begin: ${begin}, end: ${end}, delta: ${end - begin}`
      );
      const outputReal = HEAPF.subarray(
        output + offset * this.fSampleSize >> Math.log2(this.fSampleSize),
        output + (offset + input.length) * this.fSampleSize >> Math.log2(this.fSampleSize)
      );
      for (let sample = 0; sample < input.length; sample++) {
        outputReal[sample] = input[sample];
      }
    }
  }
  copyToOutReal64(maxChannels, offset, audioData) {
    const HEAP32 = this.fAllocator.getInt32Array();
    const HEAPF = this.fAllocator.getFloat64Array();
    for (let chan = 0; chan < audioData.audioBuffer.length; chan++) {
      const input = audioData.audioBuffer[chan];
      const output = HEAP32[(this.fBuffers >> 2) + chan];
      const begin = output + offset * this.fSampleSize >> Math.log2(this.fSampleSize);
      const end = output + (offset + input.length) * this.fSampleSize >> Math.log2(this.fSampleSize);
      console.log(
        `copyToOutReal64 begin: ${begin}, end: ${end}, delta: ${end - begin}`
      );
      const outputReal = HEAPF.subarray(
        output + offset * this.fSampleSize >> Math.log2(this.fSampleSize),
        output + (offset + input.length) * this.fSampleSize >> Math.log2(this.fSampleSize)
      );
      for (let sample = 0; sample < input.length; sample++) {
        outputReal[sample] = input[sample];
      }
    }
  }
  emptyFile(part, offset) {
    if (this.fIntSize === 4) {
      const HEAP32 = this.fAllocator.getInt32Array();
      HEAP32[(this.fLength >> Math.log2(this.fIntSize)) + part] = _Soundfile.BUFFER_SIZE;
      HEAP32[(this.fSR >> Math.log2(this.fIntSize)) + part] = _Soundfile.SAMPLE_RATE;
      HEAP32[(this.fOffset >> Math.log2(this.fIntSize)) + part] = offset;
    } else {
      const HEAP64 = this.fAllocator.getInt64Array();
      HEAP64[(this.fLength >> Math.log2(this.fIntSize)) + part] = BigInt(
        _Soundfile.BUFFER_SIZE
      );
      HEAP64[(this.fSR >> Math.log2(this.fIntSize)) + part] = BigInt(
        _Soundfile.SAMPLE_RATE
      );
      HEAP64[(this.fOffset >> Math.log2(this.fIntSize)) + part] = BigInt(offset);
    }
    return offset + _Soundfile.BUFFER_SIZE;
  }
  displayMemory(where = "", mem = false) {
    console.log("Soundfile memory: " + where);
    console.log(`fPtr: ${this.fPtr}`);
    console.log(`fBuffers: ${this.fBuffers}`);
    console.log(`fLength: ${this.fLength}`);
    console.log(`fSR: ${this.fSR}`);
    console.log(`fOffset: ${this.fOffset}`);
    const HEAP32 = this.fAllocator.getInt32Array();
    if (mem) console.log(`HEAP32: ${HEAP32}`);
    console.log(`HEAP32[this.fPtr >> 2]: ${HEAP32[this.fPtr >> 2]}`);
    console.log(
      `HEAP32[(this.fPtr + ptrSize) >> 2]: ${HEAP32[this.fPtr + this.fPtrSize >> 2]}`
    );
    console.log(
      `HEAP32[(this.fPtr + 2 * ptrSize) >> 2]: ${HEAP32[this.fPtr + 2 * this.fPtrSize >> 2]}`
    );
    console.log(
      `HEAP32[(this.fPtr + 3 * ptrSize) >> 2]: ${HEAP32[this.fPtr + 3 * this.fPtrSize >> 2]}`
    );
  }
  // Return the pointer to the soundfile structure in wasm memory
  getPtr() {
    return this.fPtr;
  }
  getHEAP32() {
    return this.fAllocator.getInt32Array();
  }
  getHEAPFloat32() {
    return this.fAllocator.getFloat32Array();
  }
  getHEAPFloat64() {
    return this.fAllocator.getFloat64Array();
  }
}
var Soundfile = _Soundfile;
var WasmAllocator = class {
  constructor(memory, offset) {
    this.memory = memory;
    this.allocatedBytes = offset;
  }
  /**
   * Allocates a block of memory of the specified size, returning the pointer to the
   * beginning of the block. The block is allocated at the current offset and the
   * offset is incremented by the size of the block.
   *
   * @param sizeInBytes The size of the block to allocate in bytes.
   * @returns The offset (pointer) to the beginning of the allocated block.
   */
  alloc(sizeInBytes) {
    const currentOffset = this.allocatedBytes;
    const newOffset = currentOffset + sizeInBytes;
    const totalMemoryBytes = this.memory.buffer.byteLength;
    if (newOffset > totalMemoryBytes) {
      const neededPages = Math.ceil(
        (newOffset - totalMemoryBytes) / 65536
      );
      console.log(`GROW: ${neededPages} pages`);
      this.memory.grow(neededPages);
    }
    this.allocatedBytes = newOffset;
    return currentOffset;
  }
  /**
   * Returns the underlying buffer object.
   *
   * @returns The buffer object.
   */
  getBuffer() {
    return this.memory.buffer;
  }
  /**
   * Returns the Int32 view of the underlying buffer object.
   *
   * @returns The view of the memory buffer as Int32Array.
   */
  getInt32Array() {
    return new Int32Array(this.memory.buffer);
  }
  /**
   * Returns the Int64 view of the underlying buffer object.
   *
   * @returns The view of the memory buffer as BigInt64Array.
   */
  getInt64Array() {
    return new BigInt64Array(this.memory.buffer);
  }
  /**
   * Returns the Float32 view of the underlying buffer object.
   *
   * @returns The view of the memory buffer as Float32Array.
   */
  getFloat32Array() {
    return new Float32Array(this.memory.buffer);
  }
  /**
   * Returns the Float64 view of the underlying buffer object..
   *
   * @returns The view of the memory buffer as Float64Array.
   */
  getFloat64Array() {
    return new Float64Array(this.memory.buffer);
  }
}
var WasmAllocator = WasmAllocator;
var _FaustSensors = class _FaustSensors {
  /**
   * Function to convert a number to an axis type
   *
   * @param value number
   * @returns axis type
   */
  static convertToAxis(value) {
    switch (value) {
      case 0:
        return 0 /* x */;
      case 1:
        return 1 /* y */;
      case 2:
        return 2 /* z */;
      default:
        console.error("Error: Axis not found value: " + value);
        return 0 /* x */;
    }
  }
  /**
   * Function to convert a number to a curve type
   *
   * @param value number
   * @returns curve type
   */
  static convertToCurve(value) {
    switch (value) {
      case 0:
        return 0 /* Up */;
      case 1:
        return 1 /* Down */;
      case 2:
        return 2 /* UpDown */;
      case 3:
        return 3 /* DownUp */;
      default:
        console.error("Error: Curve not found value: " + value);
        return 0 /* Up */;
    }
  }
  static get Range() {
    if (!this._Range) {
      this._Range = class {
        constructor(x, y) {
          this.fLo = Math.min(x, y);
          this.fHi = Math.max(x, y);
        }
        clip(x) {
          if (x < this.fLo) return this.fLo;
          if (x > this.fHi) return this.fHi;
          return x;
        }
      };
    }
    return this._Range;
  }
  /**
   * Interpolator class
   */
  static get Interpolator() {
    if (!this._Interpolator) {
      this._Interpolator = class {
        constructor(lo, hi, v1, v2) {
          this.fRange = new _FaustSensors.Range(lo, hi);
          if (hi !== lo) {
            this.fCoef = (v2 - v1) / (hi - lo);
            this.fOffset = v1 - lo * this.fCoef;
          } else {
            this.fCoef = 0;
            this.fOffset = (v1 + v2) / 2;
          }
        }
        returnMappedValue(v) {
          const x = this.fRange.clip(v);
          return this.fOffset + x * this.fCoef;
        }
        getLowHigh(amin, amax) {
          return { amin: this.fRange.fLo, amax: this.fRange.fHi };
        }
      };
    }
    return this._Interpolator;
  }
  /**
   * Interpolator3pt class, combine two interpolators
   */
  static get Interpolator3pt() {
    if (!this._Interpolator3pt) {
      this._Interpolator3pt = class {
        constructor(lo, mid, hi, v1, vMid, v2) {
          this.fSegment1 = new _FaustSensors.Interpolator(
            lo,
            mid,
            v1,
            vMid
          );
          this.fSegment2 = new _FaustSensors.Interpolator(
            mid,
            hi,
            vMid,
            v2
          );
          this.fMid = mid;
        }
        returnMappedValue(x) {
          return x < this.fMid ? this.fSegment1.returnMappedValue(x) : this.fSegment2.returnMappedValue(x);
        }
        getMappingValues(amin, amid, amax) {
          const lowHighSegment1 = this.fSegment1.getLowHigh(
            amin,
            amid
          );
          const lowHighSegment2 = this.fSegment2.getLowHigh(
            amid,
            amax
          );
          return {
            amin: lowHighSegment1.amin,
            amid: lowHighSegment2.amin,
            amax: lowHighSegment2.amax
          };
        }
      };
    }
    return this._Interpolator3pt;
  }
  /**
   * UpConverter class, convert accelerometer value to Faust value
   */
  static get UpConverter() {
    if (!this._UpConverter) {
      this._UpConverter = class {
        constructor(amin, amid, amax, fmin, fmid, fmax) {
          this.fActive = true;
          this.fA2F = new _FaustSensors.Interpolator3pt(
            amin,
            amid,
            amax,
            fmin,
            fmid,
            fmax
          );
          this.fF2A = new _FaustSensors.Interpolator3pt(
            fmin,
            fmid,
            fmax,
            amin,
            amid,
            amax
          );
        }
        uiToFaust(x) {
          return this.fA2F.returnMappedValue(x);
        }
        faustToUi(x) {
          return this.fF2A.returnMappedValue(x);
        }
        setMappingValues(amin, amid, amax, min, init, max) {
          this.fA2F = new _FaustSensors.Interpolator3pt(
            amin,
            amid,
            amax,
            min,
            init,
            max
          );
          this.fF2A = new _FaustSensors.Interpolator3pt(
            min,
            init,
            max,
            amin,
            amid,
            amax
          );
        }
        getMappingValues(amin, amid, amax) {
          return this.fA2F.getMappingValues(amin, amid, amax);
        }
        setActive(onOff) {
          this.fActive = onOff;
        }
        getActive() {
          return this.fActive;
        }
      };
    }
    return this._UpConverter;
  }
  /**
   * DownConverter class, convert accelerometer value to Faust value
   */
  static get DownConverter() {
    if (!this._DownConverter) {
      this._DownConverter = class {
        constructor(amin, amid, amax, fmin, fmid, fmax) {
          this.fActive = true;
          this.fA2F = new _FaustSensors.Interpolator3pt(
            amin,
            amid,
            amax,
            fmax,
            fmid,
            fmin
          );
          this.fF2A = new _FaustSensors.Interpolator3pt(
            fmin,
            fmid,
            fmax,
            amax,
            amid,
            amin
          );
        }
        uiToFaust(x) {
          return this.fA2F.returnMappedValue(x);
        }
        faustToUi(x) {
          return this.fF2A.returnMappedValue(x);
        }
        setMappingValues(amin, amid, amax, min, init, max) {
          this.fA2F = new _FaustSensors.Interpolator3pt(
            amin,
            amid,
            amax,
            max,
            init,
            min
          );
          this.fF2A = new _FaustSensors.Interpolator3pt(
            min,
            init,
            max,
            amax,
            amid,
            amin
          );
        }
        getMappingValues(amin, amid, amax) {
          return this.fA2F.getMappingValues(amin, amid, amax);
        }
        setActive(onOff) {
          this.fActive = onOff;
        }
        getActive() {
          return this.fActive;
        }
      };
    }
    return this._DownConverter;
  }
  /**
   * UpDownConverter class, convert accelerometer value to Faust value
   */
  static get UpDownConverter() {
    if (!this._UpDownConverter) {
      this._UpDownConverter = class {
        constructor(amin, amid, amax, fmin, fmid, fmax) {
          this.fActive = true;
          this.fA2F = new _FaustSensors.Interpolator3pt(
            amin,
            amid,
            amax,
            fmin,
            fmax,
            fmin
          );
          this.fF2A = new _FaustSensors.Interpolator(
            fmin,
            fmax,
            amin,
            amax
          );
        }
        uiToFaust(x) {
          return this.fA2F.returnMappedValue(x);
        }
        faustToUi(x) {
          return this.fF2A.returnMappedValue(x);
        }
        setMappingValues(amin, amid, amax, min, init, max) {
          this.fA2F = new _FaustSensors.Interpolator3pt(
            amin,
            amid,
            amax,
            min,
            max,
            min
          );
          this.fF2A = new _FaustSensors.Interpolator(
            min,
            max,
            amin,
            amax
          );
        }
        getMappingValues(amin, amid, amax) {
          return this.fA2F.getMappingValues(amin, amid, amax);
        }
        setActive(onOff) {
          this.fActive = onOff;
        }
        getActive() {
          return this.fActive;
        }
      };
    }
    return this._UpDownConverter;
  }
  static get DownUpConverter() {
    if (!this._DownUpConverter) {
      this._DownUpConverter = class {
        constructor(amin, amid, amax, fmin, fmid, fmax) {
          this.fActive = true;
          this.fA2F = new _FaustSensors.Interpolator3pt(
            amin,
            amid,
            amax,
            fmax,
            fmin,
            fmax
          );
          this.fF2A = new _FaustSensors.Interpolator(
            fmin,
            fmax,
            amin,
            amax
          );
        }
        uiToFaust(x) {
          return this.fA2F.returnMappedValue(x);
        }
        faustToUi(x) {
          return this.fF2A.returnMappedValue(x);
        }
        setMappingValues(amin, amid, amax, min, init, max) {
          this.fA2F = new _FaustSensors.Interpolator3pt(
            amin,
            amid,
            amax,
            max,
            min,
            max
          );
          this.fF2A = new _FaustSensors.Interpolator(
            min,
            max,
            amin,
            amax
          );
        }
        getMappingValues(amin, amid, amax) {
          return this.fA2F.getMappingValues(amin, amid, amax);
        }
        setActive(onOff) {
          this.fActive = onOff;
        }
        getActive() {
          return this.fActive;
        }
      };
    }
    return this._DownUpConverter;
  }
  /**
   * Public function to build the accelerometer handler
   *
   * @returns `UpdatableValueConverter` built for the given curve
   */
  static buildHandler(curve, amin, amid, amax, min, init, max) {
    switch (curve) {
      case 0 /* Up */:
        return new _FaustSensors.UpConverter(
          amin,
          amid,
          amax,
          min,
          init,
          max
        );
      case 1 /* Down */:
        return new _FaustSensors.DownConverter(
          amin,
          amid,
          amax,
          min,
          init,
          max
        );
      case 2 /* UpDown */:
        return new _FaustSensors.UpDownConverter(
          amin,
          amid,
          amax,
          min,
          init,
          max
        );
      case 3 /* DownUp */:
        return new _FaustSensors.DownUpConverter(
          amin,
          amid,
          amax,
          min,
          init,
          max
        );
      default:
        return new _FaustSensors.UpConverter(
          amin,
          amid,
          amax,
          min,
          init,
          max
        );
    }
  }
}
var FaustSensors = _FaustSensors;
var FaustAudioWorkletCommunicator = class {
  constructor(port) {
    this.port = port;
    this.supportSharedArrayBuffer = !!globalThis.SharedArrayBuffer;
    this.byteLength = 4 * Uint8Array.BYTES_PER_ELEMENT + 3 * Float32Array.BYTES_PER_ELEMENT + 3 * Float32Array.BYTES_PER_ELEMENT;
  }
  initializeBuffer(ab) {
    let ptr = 0;
    this.uin8Invert = new Uint8ClampedArray(ab, ptr, 1);
    ptr += Uint8ClampedArray.BYTES_PER_ELEMENT;
    this.uin8NewAccData = new Uint8ClampedArray(ab, ptr, 1);
    ptr += Uint8ClampedArray.BYTES_PER_ELEMENT;
    this.uin8NewGyrData = new Uint8ClampedArray(ab, ptr, 1);
    ptr += Uint8ClampedArray.BYTES_PER_ELEMENT;
    ptr += Uint8ClampedArray.BYTES_PER_ELEMENT;
    this.f32Acc = new Float32Array(ab, ptr, 3);
    ptr += 3 * Float32Array.BYTES_PER_ELEMENT;
    this.f32Gyr = new Float32Array(ab, ptr, 3);
    ptr += 3 * Float32Array.BYTES_PER_ELEMENT;
  }
  setNewAccDataAvailable(value) {
    if (!this.uin8NewAccData) return;
    this.uin8NewAccData[0] = +value;
  }
  getNewAccDataAvailable() {
    var _a;
    return !!((_a = this.uin8NewAccData) == null ? void 0 : _a[0]);
  }
  setNewGyrDataAvailable(value) {
    if (!this.uin8NewGyrData) return;
    this.uin8NewGyrData[0] = +value;
  }
  getNewGyrDataAvailable() {
    var _a;
    return !!((_a = this.uin8NewGyrData) == null ? void 0 : _a[0]);
  }
  setAcc({ x, y, z }, invert = false) {
    if (!this.supportSharedArrayBuffer) {
      const e = { type: "acc", data: { x, y, z }, invert };
      this.port.postMessage(e);
    }
    if (!this.uin8NewAccData) return;
    this.uin8Invert[0] = +invert;
    this.f32Acc[0] = x;
    this.f32Acc[1] = y;
    this.f32Acc[2] = z;
    this.uin8NewAccData[0] = 1;
  }
  getAcc() {
    if (!this.uin8NewAccData) return;
    const invert = !!this.uin8Invert[0];
    const [x, y, z] = this.f32Acc;
    return { x, y, z, invert };
  }
  setGyr({
    alpha,
    beta,
    gamma
  }) {
    if (!this.supportSharedArrayBuffer) {
      const e = { type: "gyr", data: { alpha, beta, gamma } };
      this.port.postMessage(e);
    }
    if (!this.uin8NewGyrData) return;
    this.f32Gyr[0] = alpha;
    this.f32Gyr[1] = beta;
    this.f32Gyr[2] = gamma;
    this.uin8NewGyrData[0] = 1;
  }
  getGyr() {
    if (!this.uin8NewGyrData) return;
    const [alpha, beta, gamma] = this.f32Gyr;
    return { alpha, beta, gamma };
  }
}
var FaustAudioWorkletCommunicator = FaustAudioWorkletCommunicator;
var FaustAudioWorkletProcessorCommunicator = class extends FaustAudioWorkletCommunicator {
  constructor(port) {
    super(port);
    if (this.supportSharedArrayBuffer) {
      this.port.addEventListener("message", (event) => {
        const { data } = event;
        if (data.type === "initSab") {
          this.initializeBuffer(data.sab);
        }
      });
    } else {
      const ab = new ArrayBuffer(this.byteLength);
      this.initializeBuffer(ab);
      this.port.addEventListener("message", (event) => {
        const msg = event.data;
        switch (msg.type) {
          // Sensors messages
          case "acc": {
            this.setAcc(msg.data, msg.invert);
            break;
          }
          case "gyr": {
            this.setGyr(msg.data);
            break;
          }
          default:
            break;
        }
      });
    }
  }
}
var FaustAudioWorkletProcessorCommunicator = FaustAudioWorkletProcessorCommunicator;
// Put them in dependencies
const dependencies = {
    FaustBaseWebAudioDsp,
    FaustMonoWebAudioDsp,
    FaustWasmInstantiator,
    FaustAudioWorkletProcessorCommunicator
};
// Generate the actual AudioWorkletProcessor code
((dependencies, faustData, register = true) => {
  const { registerProcessor, AudioWorkletProcessor, sampleRate } = globalThis;
  const audioClock = globalThis;
  const kBlockSize = 128;
  const kFromAutomation = -2;
  const kFromSensors = -1;
  const kCancelled = () => {
  };
  const kRampChanges = 16;
  const kRampStride = 16;
  const {
    FaustBaseWebAudioDsp: FaustBaseWebAudioDsp2,
    FaustWasmInstantiator: FaustWasmInstantiator2,
    FaustAudioWorkletProcessorCommunicator: FaustAudioWorkletProcessorCommunicator2
  } = dependencies;
  const { processorName, dspName, dspMeta, effectMeta, poly } = faustData;
  const analysePolyParameters = (item) => {
    const polyKeywords = [
      "/gate",
      "/freq",
      "/gain",
      "/key",
      "/vel",
      "/velocity"
    ];
    const isPolyReserved = "address" in item && !!polyKeywords.find((k) => item.address.endsWith(k));
    if (poly && isPolyReserved) return null;
    if (item.type === "vslider" || item.type === "hslider" || item.type === "nentry") {
      return {
        name: item.address,
        defaultValue: item.init || 0,
        minValue: item.min || 0,
        maxValue: item.max || 0
      };
    } else if (item.type === "button" || item.type === "checkbox") {
      return {
        name: item.address,
        defaultValue: item.init || 0,
        minValue: 0,
        maxValue: 1
      };
    }
    return null;
  };
  class FaustAudioWorkletProcessor extends AudioWorkletProcessor {
    constructor(options) {
      super(options);
      this.paramValuesCache = {};
      /**
       * Port messages waiting for the block they were timestamped for.
       *
       * Sorted by frame, then by arrival. `process` drains everything up to
       * the end of the block it is about to render; the rest waits.
       */
      this.fEventQueue = [];
      this.fEventSeq = 0;
      /**
       * The events of the block about to be rendered.
       *
       * Refilled rather than reallocated, so a quiet block allocates
       * nothing.
       */
      this.fBlockEvents = [];
      /**
       * Scratch space for the frames one control's automation changed on.
       * Reused for the same reason as `fBlockEvents`.
       */
      this.fChangedFrames = [];
      this.fCommunicator = new FaustAudioWorkletProcessorCommunicator2(
        this.port
      );
      const { parameterDescriptors } = this.constructor;
      parameterDescriptors.forEach((pd) => {
        this.paramValuesCache[pd.name] = pd.defaultValue || 0;
      });
      const { moduleId, instanceId } = options.processorOptions;
      if (!moduleId || !instanceId) return;
      this.wamInfo = { moduleId, instanceId };
    }
    static get parameterDescriptors() {
      const params = [];
      const origin = /* @__PURE__ */ new Map();
      const collect = (side) => (item) => {
        const param = analysePolyParameters(item);
        if (!param) return;
        const previous = origin.get(param.name);
        if (previous === side) {
          throw new Error(
            `Faust: control "${param.name}" is declared twice in the ${side}. Two widgets resolved to the same path, so one of them would be unreachable. Give them distinct labels or groups.`
          );
        }
        if (previous !== void 0) {
          throw new Error(
            `Faust: control "${param.name}" is declared both in the ${previous} and in the ${side}. A polyphonic DSP cannot share a control path between \`process\` and \`effect\`: setParamValue routes a path to one side only, so the other would keep its default. Declare it under a distinct path on each side and have the host write both.`
          );
        }
        origin.set(param.name, side);
        params.push(param);
      };
      FaustBaseWebAudioDsp2.parseUI(dspMeta.ui, collect("voice"));
      if (effectMeta)
        FaustBaseWebAudioDsp2.parseUI(effectMeta.ui, collect("effect"));
      return params;
    }
    setupWamEventHandler() {
      var _a;
      if (!this.wamInfo) return;
      const { moduleId, instanceId } = this.wamInfo;
      const { webAudioModules } = globalThis;
      const ModuleScope = webAudioModules.getModuleScope(
        moduleId
      );
      const paramMgrProcessor = (_a = ModuleScope == null ? void 0 : ModuleScope.paramMgrProcessors) == null ? void 0 : _a[instanceId];
      if (!paramMgrProcessor) return;
      if (paramMgrProcessor.handleEvent) return;
      paramMgrProcessor.handleEvent = (event) => {
        if (event.type === "wam-midi")
          this.atTime(
            event,
            () => this.midiMessage(event.data.bytes)
          );
      };
    }
    /**
     * Read a message's timestamp as a whole frame on the audio clock.
     * Null if it carries none, meaning now.
     *
     * Both routes round, and both reject anything non-finite. A fraction
     * would become a fractional slice count and a channel pointer partway
     * through a sample. A NaN compares false against every frame, so a
     * queued one would stay at the head of the queue and block every event
     * behind it.
     */
    messageFrame(msg) {
      const frame = Number.isFinite(msg.frame) ? msg.frame : Number.isFinite(msg.time) ? msg.time * sampleRate : null;
      return frame === null ? null : Math.round(frame);
    }
    /**
     * Apply `apply` now, or queue it for the frame the sender asked for.
     *
     * Untimed messages are applied on arrival, between two blocks, which
     * is equivalent to frame 0 of the next one. A throw from one of those
     * escapes the port handler and costs that message, as it always did.
     *
     * Timed ones have to catch. They run from inside `process`, and the
     * Web Audio spec's response to a `process` that throws is to fire
     * `processorerror` and stop calling the node -- so one bad message
     * would silence the device permanently.
     */
    atTime(msg, apply) {
      const frame = this.messageFrame(msg);
      if (frame === null) {
        apply();
        return;
      }
      const event = {
        frame,
        seq: this.fEventSeq++,
        apply: () => {
          try {
            apply();
          } catch (error) {
            console.error(
              `Faust: a message timed for frame ${frame} threw and was dropped`,
              error
            );
          }
        }
      };
      let i = this.fEventQueue.length;
      while (i > 0 && this.fEventQueue[i - 1].frame > frame) i--;
      this.fEventQueue.splice(i, 0, event);
    }
    /**
     * Cancel everything scheduled and not yet performed.
     *
     * A panic, or the end of the DSP's life, has to reach the notes that
     * have not sounded yet as well as the ones that have -- otherwise they
     * play afterwards, over a device that was told to be quiet.
     *
     * That means the queue and the rest of the block being rendered, whose
     * events have already left the queue. Messages only: automation and
     * sensor writes are the state of the controls through the block, and
     * an all-notes-off should not stop a filter sweep.
     */
    flushEvents() {
      this.fEventQueue.length = 0;
      for (const event of this.fBlockEvents) {
        if (event.seq >= 0) event.apply = kCancelled;
      }
    }
    /**
     * Whether a controller number silences the instrument.
     *
     * Exactly the two `FaustPolyWebAudioDsp.ctrlChange` treats as
     * all-notes-off. Not 121, which resets controllers without ending a
     * note, and not 122, which is a keyboard's local control.
     */
    isPanic(ctrl) {
      return ctrl === 120 || ctrl === 123;
    }
    /**
     * One control's automation for the block, as events.
     *
     * A control that holds arrives as a single value, worth an event only
     * if it differs from what the DSP has. A control that moves arrives as
     * 128, and each change is an edge due on its own frame.
     *
     * Reading only `[0]`, as this used to, pushes every `setValueAtTime`
     * out to the next block boundary and misses a `1 -> 0 -> 1` inside one
     * block completely -- a gate that never retriggers.
     *
     * Above `kRampChanges` the control is ramping rather than stepping,
     * and is followed at `kRampStride`. See the constants.
     */
    collectAutomation(path, automation, events) {
      const changes = this.fChangedFrames;
      changes.length = 0;
      let last = this.paramValuesCache[path];
      for (let i = 0; i < automation.length; i++) {
        if (automation[i] === last) continue;
        last = automation[i];
        changes.push(i);
      }
      if (changes.length === 0) return;
      const stride = changes.length > kRampChanges ? kRampStride : 1;
      for (let n = 0; n < changes.length; n += stride) {
        const frame = changes[n];
        events.push(this.paramEvent(path, automation[frame], frame));
      }
      const lastChange = changes.length - 1;
      if (lastChange % stride) {
        const frame = changes[lastChange];
        events.push(this.paramEvent(path, automation[frame], frame));
      }
    }
    paramEvent(path, value, frame) {
      return {
        frame,
        seq: kFromAutomation,
        apply: () => this.setParamValue(path, value)
      };
    }
    /**
     * Everything due inside the block starting at `start`.
     *
     * Three sources: the automation each `AudioParam` handed over, any new
     * sensor readings, and the port messages timestamped for a frame
     * inside the block.
     *
     * Sorted by frame, and on a tie by source -- see `FaustTimedEventSeq`.
     */
    collectEvents(parameters, start) {
      const events = this.fBlockEvents;
      events.length = 0;
      for (const path in parameters) {
        this.collectAutomation(path, parameters[path], events);
      }
      if (this.fCommunicator.getNewAccDataAvailable()) {
        const acc = this.fCommunicator.getAcc();
        if (acc) {
          this.fCommunicator.setNewAccDataAvailable(false);
          const { invert, ...data } = acc;
          events.push({
            frame: 0,
            seq: kFromSensors,
            apply: () => this.propagateAcc(data, invert)
          });
        }
      }
      if (this.fCommunicator.getNewGyrDataAvailable()) {
        const gyr = this.fCommunicator.getGyr();
        if (gyr) {
          this.fCommunicator.setNewGyrDataAvailable(false);
          events.push({
            frame: 0,
            seq: kFromSensors,
            apply: () => this.propagateGyr(gyr)
          });
        }
      }
      const end = start + kBlockSize;
      let ordinal = 0;
      while (this.fEventQueue.length && this.fEventQueue[0].frame < end) {
        const event = this.fEventQueue.shift();
        event.frame = Math.max(0, event.frame - start);
        event.seq = ordinal++;
        events.push(event);
      }
      if (events.length > 1) {
        events.sort((a, b) => a.frame - b.frame || a.seq - b.seq);
      }
      return events;
    }
    process(inputs, outputs, parameters) {
      const events = this.collectEvents(
        parameters,
        audioClock.currentFrame
      );
      return this.fDSPCode.compute(inputs[0], outputs[0], events);
    }
    handleMessageAux(e) {
      const msg = e.data;
      switch (msg.type) {
        // Generic MIDI message
        case "midi": {
          this.atTime(msg, () => {
            if (msg.data[0] >> 4 === 11 && this.isPanic(msg.data[1]))
              this.flushEvents();
            this.midiMessage(msg.data);
          });
          break;
        }
        // Typed MIDI message
        case "ctrlChange": {
          this.atTime(msg, () => {
            if (this.isPanic(msg.data[1])) this.flushEvents();
            this.ctrlChange(msg.data[0], msg.data[1], msg.data[2]);
          });
          break;
        }
        case "pitchWheel": {
          this.atTime(
            msg,
            () => this.pitchWheel(msg.data[0], msg.data[1])
          );
          break;
        }
        case "keyOn": {
          this.atTime(
            msg,
            () => this.keyOn(msg.data[0], msg.data[1], msg.data[2])
          );
          break;
        }
        case "keyOff": {
          this.atTime(
            msg,
            () => this.keyOff(msg.data[0], msg.data[1], msg.data[2])
          );
          break;
        }
        // Generic data message
        case "param": {
          this.atTime(
            msg,
            () => this.setParamValue(msg.data.path, msg.data.value)
          );
          break;
        }
        // Plot handler set on demand
        case "setPlotHandler": {
          if (msg.data) {
            this.fDSPCode.setPlotHandler(
              (output, index, events) => this.port.postMessage({
                type: "plot",
                value: output,
                index,
                events
              })
            );
          } else {
            this.fDSPCode.setPlotHandler(null);
          }
          break;
        }
        case "setupWamEventHandler": {
          this.setupWamEventHandler();
          break;
        }
        case "init": {
          this.fDSPCode.init();
          break;
        }
        case "instanceInit": {
          this.fDSPCode.instanceInit();
          break;
        }
        case "instanceClear": {
          this.flushEvents();
          this.fDSPCode.instanceClear();
          break;
        }
        case "instanceConstants": {
          this.fDSPCode.instanceConstants();
          break;
        }
        case "instanceResetUserInterface": {
          this.fDSPCode.instanceResetUserInterface();
          break;
        }
        case "start": {
          this.fDSPCode.start();
          break;
        }
        case "stop": {
          this.flushEvents();
          this.fDSPCode.stop();
          break;
        }
        case "destroy": {
          this.flushEvents();
          this.port.close();
          this.fDSPCode.destroy();
          break;
        }
        default:
          break;
      }
    }
    setParamValue(path, value) {
      this.fDSPCode.setParamValue(path, value);
      this.paramValuesCache[path] = value;
    }
    midiMessage(data) {
      this.fDSPCode.midiMessage(data);
    }
    ctrlChange(channel, ctrl, value) {
      this.fDSPCode.ctrlChange(channel, ctrl, value);
    }
    pitchWheel(channel, wheel) {
      this.fDSPCode.pitchWheel(channel, wheel);
    }
    keyOn(channel, pitch, velocity) {
      this.fDSPCode.keyOn(channel, pitch, velocity);
    }
    keyOff(channel, pitch, velocity) {
      this.fDSPCode.keyOff(channel, pitch, velocity);
    }
    propagateAcc(accelerationIncludingGravity, invert = false) {
      this.fDSPCode.propagateAcc(accelerationIncludingGravity, invert);
    }
    propagateGyr(event) {
      this.fDSPCode.propagateGyr(event);
    }
  }
  class FaustMonoAudioWorkletProcessor extends FaustAudioWorkletProcessor {
    constructor(options) {
      super(options);
      this.handleMessageAux = (e) => {
        super.handleMessageAux(e);
      };
      const { FaustMonoWebAudioDsp: FaustMonoWebAudioDsp2 } = dependencies;
      const { factory, sampleSize } = options.processorOptions;
      const instance = FaustWasmInstantiator2.createSyncMonoDSPInstance(factory);
      this.fDSPCode = new FaustMonoWebAudioDsp2(
        instance,
        sampleRate,
        sampleSize,
        128,
        factory.soundfiles
      );
      this.port.addEventListener("message", this.handleMessageAux);
      this.port.start();
      this.fDSPCode.setOutputParamHandler(
        (path, value) => this.port.postMessage({ path, value, type: "out-param" })
      );
      this.fDSPCode.setInputParamHandler(
        (path, value) => this.port.postMessage({ path, value, type: "in-param" })
      );
      this.fDSPCode.start();
    }
  }
  class FaustPolyAudioWorkletProcessor extends FaustAudioWorkletProcessor {
    constructor(options) {
      super(options);
      // The base switch already routes 'keyOn' and 'keyOff' through
      // `this.keyOn` / `this.keyOff`, overridden below. This exists only to
      // bind `this` for the port listener.
      this.handleMessageAux = (e) => {
        super.handleMessageAux(e);
      };
      const { FaustPolyWebAudioDsp: FaustPolyWebAudioDsp3 } = dependencies;
      const {
        voiceFactory,
        mixerModule,
        voices,
        effectFactory,
        sampleSize
      } = options.processorOptions;
      const instance = FaustWasmInstantiator2.createSyncPolyDSPInstance(
        voiceFactory,
        mixerModule,
        voices,
        effectFactory
      );
      const soundfiles = {
        ...effectFactory == null ? void 0 : effectFactory.soundfiles,
        ...voiceFactory.soundfiles
      };
      this.fDSPCode = new FaustPolyWebAudioDsp3(
        instance,
        sampleRate,
        sampleSize,
        128,
        soundfiles
      );
      this.port.addEventListener("message", this.handleMessageAux);
      this.port.start();
      this.fDSPCode.setOutputParamHandler(
        (path, value) => this.port.postMessage({ path, value, type: "out-param" })
      );
      this.fDSPCode.setInputParamHandler(
        (path, value) => this.port.postMessage({ path, value, type: "in-param" })
      );
      this.fDSPCode.start();
    }
    midiMessage(data) {
      const cmd = data[0] >> 4;
      const channel = data[0] & 15;
      const data1 = data[1];
      const data2 = data[2];
      if (cmd === 8 || cmd === 9 && data2 === 0)
        this.keyOff(channel, data1, data2);
      else if (cmd === 9) this.keyOn(channel, data1, data2);
      else super.midiMessage(data);
    }
    // Public API
    keyOn(channel, pitch, velocity) {
      this.fDSPCode.keyOn(channel, pitch, velocity);
    }
    keyOff(channel, pitch, velocity) {
      this.fDSPCode.keyOff(channel, pitch, velocity);
    }
    allNotesOff(hard) {
      this.fDSPCode.allNotesOff(hard);
    }
  }
  const Processor = poly ? FaustPolyAudioWorkletProcessor : FaustMonoAudioWorkletProcessor;
  if (register) {
    const name = processorName || dspName || (poly ? "mydsp_poly" : "mydsp");
    const scope = globalThis;
    if (!scope.__faustRegisteredProcessors) {
      scope.__faustRegisteredProcessors = /* @__PURE__ */ new Set();
    }
    if (!scope.__faustRegisteredProcessors.has(name)) {
      registerProcessor(name, Processor);
      scope.__faustRegisteredProcessors.add(name);
    }
  }
  return poly ? FaustPolyAudioWorkletProcessor : FaustMonoAudioWorkletProcessor;
})(dependencies, faustData);
