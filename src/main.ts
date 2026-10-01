import './style.css';
import { AudioEngine } from './audio/engine';
import { SOUND_PRESETS, SOUND_PRESET_IDS } from './audio/presets';
import { HandTracker } from './vision/hand-tracker';
import { mapWristTone } from './vision/gesture';
import { CHORD_TILT_BOUNDARIES_DEGREES } from './vision/twohand';
import { CHORDS, CHORD_QUALITIES, CHORD_QUALITY_NAMES, GESTURE_STYLE_NAMES, NOTE_NAMES, chordName, frequencies, midiNotes, noteName, positionToChord } from './harmony';
import { ChoirVisual, drawHand } from './visual';
import type { AudioMetrics, GestureFrame, PerformanceState, SoundMode, SoundPreset } from './types';
import type { ChordQuality, ChordVoicing, HarmonyMode, HarmonyOptions } from './harmony';

const icon = (name:string, size=18) => {
  const paths: Record<string,string> = {
    play: '<path d="m9 5 11 7-11 7V5Z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    camera: '<rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 10 5-3v10l-5-3"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/>',
    sound: '<path d="m11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute: '<path d="m11 4-6 5H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/>',
    headphones:'<path d="M4 14v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="12" width="4" height="8" rx="2"/><rect x="17" y="12" width="4" height="8" rx="2"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    sparkle: '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sparkle}</svg>`;
};
const emblem = `<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.2"><ellipse cx="20" cy="20" rx="8" ry="17"/><ellipse cx="20" cy="20" rx="8" ry="17" transform="rotate(60 20 20)"/><ellipse cx="20" cy="20" rx="8" ry="17" transform="rotate(120 20 20)"/></g></svg>`;
const handDrawing = `<svg class="hand-drawing" viewBox="0 0 180 190" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M66 166c-4-18-17-30-25-45-6-11-13-25-5-28 8-4 13 12 22 18L52 53c-1-13 12-15 14-1l9 49-2-69c0-14 13-13 14 0l5 67 6-72c1-13 14-12 13 2l-1 72 12-54c3-12 15-8 12 4l-11 65c-3 25-17 35-17 53"/><path d="M66 163c10 4 28 5 42 0M59 112c13 1 24 10 25 24M77 114c12-5 25-4 37 1"/><path opacity=".35" d="M66 52 77 111m9-79 8 77m17-80-7 82M47 119l22 10"/><g fill="currentColor" stroke="none"><circle cx="59" cy="48" r="3.5"/><circle cx="79" cy="28" r="3.5"/><circle cx="104" cy="24" r="3.5"/><circle cx="128" cy="45" r="3.5"/><circle cx="91" cy="153" r="3"/></g></g></svg>`;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="topbar">
    <a class="brand" href="./" aria-label="CHORA 首页"><span class="brand-mark">${emblem}</span>CHORA<span class="brand-caption">GESTURAL CHOIR</span></a>
    <div class="header-center"><span class="tiny-dot"></span> A SPACE BETWEEN VOICE & GESTURE</div>
    <button class="plain-button" id="help-button">演奏指南 ${icon('info',16)}</button>
  </header>
  <main>
    <section class="intro">
      <div><p class="eyebrow">AN INSTRUMENT FOR THE IN-BETWEEN</p><h1>让和声，在指间生长<span>。</span></h1><p class="intro-copy">左手选根音、倾腕切减／小／大／增；右手抬高管力度、倾腕塑造音色。</p></div>
      <div class="session-badge"><span class="status-dot" id="session-dot"></span><div><span id="session-label">准备好，让声音发生</span><small id="session-detail">耳机就绪 · 无需 MIDI 设备</small></div></div>
    </section>
    <div class="instrument">
      <aside class="sound-panel panel">
        <div class="panel-heading"><span class="eyebrow">01 / SOUND PALETTE</span>${icon('sparkle',16)}</div>
        <h2>声音的质地</h2>
        <div class="mode-switch" role="group" aria-label="音色模式"><button data-mode="ambient" class="selected" aria-pressed="true">Ambient</button><button data-mode="vocoder" aria-pressed="false">Vocoder</button></div>
        <div class="sound-description"><span class="sound-category" id="sound-category">空灵 · 绵延 · 有呼吸感</span><p id="sound-description">让温暖的和声缓缓展开，像一束穿过薄雾的光。</p></div>
        <div class="preset-list" role="group" aria-label="音色预设">
          ${SOUND_PRESET_IDS.map((id,i)=>`<button class="preset ${i===0?'selected':''}" data-preset="${id}" aria-pressed="${i===0}"><span class="preset-symbol ${id}"></span><span>${SOUND_PRESETS[id].name}<small>${['SLOW CHOIR','STRUCK GLASS','REED ORGAN'][i]}</small></span><span class="preset-dot"></span></button>`).join('')}
        </div>
        <div class="preset-actions"><span id="preset-status">原始配方</span><button id="compare-sounds" class="plain-button">同一和弦对比 ↗</button></div>
        <section id="vocoder-controls" class="vocoder-controls" hidden aria-label="Vocoder 人声设置">
          <label for="mic-gain">麦克风增益 <output id="mic-gain-value">+12 dB</output></label>
          <input id="mic-gain" type="range" min="0" max="24" value="12" step="1"/>
          <p id="mic-input-status">连接麦克风后，轻声试唱并调整增益。</p>
          <p id="vocoder-output-status" role="status">等待启动声音</p>
          <button id="mic-test-button" class="camera-button">只用麦克风试音</button>
          <p class="mic-test-hint">固定屏幕和弦试唱，无需手势；开启摄像头可返回双手演奏。</p>
        </section>
        <div class="rule"></div>
        <div class="parameter"><label for="space">空间 <span>SPACE</span><output id="space-value">72%</output></label><input id="space" type="range" min="0" max="100" value="72"/><div class="range-labels"><span>亲密</span><span>无边</span></div></div>
        <div class="parameter"><label for="brightness">明亮度 <span>COLOR</span><output id="brightness-value">55%</output></label><input id="brightness" type="range" min="0" max="100" value="55"/><div class="range-labels"><span>温润</span><span>通透</span></div></div>
        <div class="parameter"><label for="texture">质感 <span>TEXTURE</span><output id="texture-value">58%</output></label><input id="texture" type="range" min="0" max="100" value="58"/><div class="range-labels"><span id="texture-start">纯净</span><span id="texture-end">流动元音</span></div></div>
        <p class="parameter-help" id="color-status">明亮度设定底色；右腕独立塑造暗亮。</p>
        <div class="engine-note"><span class="tiny-dot"></span><span id="engine-label">FAUST · WEB AUDIO</span><span>↗</span></div>
      </aside>
      <section class="stage-panel panel">
        <div class="stage-header"><span class="eyebrow">YOUR HANDS. YOUR HARMONY.</span><div class="stage-actions"><button id="camera-button" class="camera-button">${icon('camera',14)} 开启摄像头</button><button id="view-button" class="plain-button" aria-pressed="false" title="只切换显示方式，不控制摄像头">切换为共振场</button><button id="fullscreen-button" class="icon-button" aria-label="全屏演奏">${icon('expand',15)}</button><div class="live-indicator"><span class="tiny-dot" id="live-dot"></span><span id="field-status">等待唤醒</span></div></div></div>
        <div class="resonance-field camera-stage" id="field" role="group" aria-label="双手演奏舞台：左手选和弦，右手控制力度与音色。试听时可按住拖动。">
          <video id="camera-video" autoplay playsinline muted></video>
          <canvas id="resonance" aria-label="和声粒子轨迹"></canvas>
          <canvas id="hand-overlay" width="640" height="480"></canvas>
          <div class="camera-placeholder" id="camera-placeholder"><div class="two-hands"><div>${handDrawing}<span>左手 · 选择和弦</span></div><div>${handDrawing}<span>右手 · 塑造声音</span></div></div><span id="camera-hint">让双手入镜，用一个和弦开始。</span><button id="camera-overlay-button" class="primary-button">${icon('camera',16)} 开启摄像头</button></div>
          <span class="camera-tag" id="camera-tag"><span class="tiny-dot"></span> CAMERA OFF</span>
          <div class="hand-role left-role" id="left-role">L / CHORD</div><div class="hand-role right-role" id="right-role">R / EXPRESSION</div>
          <div class="field-center"><span id="current-chord">C</span><span id="chord-mood">明亮 · 悬浮</span></div>
          <div class="field-hint" id="field-hint">先听见和弦，再让双手接管。</div>
          <div class="coordinate bottom-right" id="expression-label">EXPRESSION 65%</div>
        </div>
        <div id="connection-status" class="connection-status" role="status" aria-live="polite" hidden></div>
        <button id="enable-sound" class="camera-button enable-sound" hidden>点击启用声音</button>
        <div class="chord-options"><span class="eyebrow">CHORD HAND / SCALE DEGREE</span><div role="group" class="voicing-switch" aria-label="和弦结构"><button data-voicing="triad" class="selected" aria-pressed="true">三和弦</button><button data-voicing="seventh" aria-pressed="false">七和弦</button></div></div>
        <div class="harmony-controls"><label for="harmony-mode">和声方式<select id="harmony-mode"><option value="diatonic">顺阶伴奏</option>${CHORD_QUALITIES.map(quality=>`<option value="${quality}">自由 · 固定${CHORD_QUALITY_NAMES[quality]}</option>`).join('')}<option value="gesture" selected>自由 · 左腕四区</option></select></label><label class="check-control"><input id="gesture-voicing" type="checkbox"/>右手选择配器 / 八度</label></div>
        <div class="wrist-controls"><div class="wrist-control"><label class="check-control"><input id="left-wrist-toggle" type="checkbox" checked/>和弦手腕四区切换</label><div class="wrist-control-heading"><span id="left-wrist-name">左腕 · 和弦性质</span><output id="left-wrist-status">等待左手</output></div><div class="wrist-meter" role="meter" aria-label="和弦手腕倾斜" aria-valuemin="-60" aria-valuemax="60" aria-valuenow="0" id="left-wrist-meter">${CHORD_TILT_BOUNDARIES_DEGREES.map(degrees=>`<span class="wrist-boundary" style="left:${(degrees+60)/1.2}%"></span>`).join('')}<i id="left-wrist-marker"></i></div><div class="wrist-zone-labels">${CHORD_QUALITIES.map(quality=>`<span data-wrist-quality="${quality}" class="${quality==='major'?'active':''}">${CHORD_QUALITY_NAMES[quality]}<small>${quality==='major'?'回中 · 默认':quality==='diminished'?'大幅左倾':quality==='minor'?'小幅左倾':'右倾'}</small></span>`).join('')}</div></div><div class="wrist-control"><div class="wrist-control-heading"><label for="wrist-tone" id="right-wrist-name">右腕 · 音色暗亮</label><output id="wrist-tone-value">50% · 原色</output></div><input id="wrist-tone" type="range" min="0" max="100" value="50"/><div class="range-labels"><span>画面左倾 · 暗</span><span>右倾 · 亮</span></div><p id="wrist-tone-hint">可拖动试听，与右腕使用同一声音控制。</p></div></div>
        <p class="wrist-instruction">手掌朝向镜头，在画面中左右侧倾；不是向前后翻掌。左腕由左到右为减、小、大、增，回中恢复大和弦；右腕回中恢复原色。</p>
        <p class="harmony-status" id="harmony-status">左腕 · 大和弦 · 三和弦 · 原音区</p>
        <div class="chord-strip" role="group" aria-label="和弦选择">${CHORDS.map((c,i)=>`<button class="chord ${i===0?'selected':''}" data-chord="${i}" aria-pressed="${i===0}"><span>${c.degree}</span><strong data-chord-name="${i}">${chordName(i)}</strong><kbd>${i+1}</kbd></button>`).join('')}</div>
        <div class="voices-heading"><span class="eyebrow">VOICING / 四个声部自由组合</span><span id="voice-count">4 / 4 声部</span></div>
        <div class="voice-grid" role="group" aria-label="和声声部">${['根音','三音','五音','色彩音'].map((name,i)=>`<button class="voice selected" data-voice="${i}" aria-pressed="true"><span class="voice-light"></span><span><span data-voice-label="${i}">${name}</span><small data-voice-note="${i}">${noteName(midiNotes(0)[i])}</small></span><kbd>${['A','S','D','F'][i]}</kbd></button>`).join('')}</div>
      </section>
      <aside class="gesture-panel panel">
        <div class="panel-heading"><span class="eyebrow">02 / TWO-HAND PLAY</span>${icon('camera',16)}</div><h2>一手和弦，一手表情。</h2>
        <div class="hand-statuses"><div><span class="role-chip" id="chord-hand-chip">L</span><p>和弦手<small id="left-status">等待左手</small></p></div><div><span class="role-chip right" id="expression-hand-chip">R</span><p>表情手<small id="right-status">等待右手</small></p></div></div>
        <div class="tracking-line"><span class="tiny-dot" id="tracking-dot"></span><span id="tracking-label">双手入镜，手掌朝向摄像头</span></div>
        <div class="sign-chart" aria-label="和弦手指型">${CHORDS.map((c,i)=>`<div class="sign-card" data-sign="${i}"><span class="sign-glyph">${['☝','✌','Ⅲ','四','✋','🤘','🤟'][i]}</span><span><strong>${c.degree}</strong><small>${['食指','食指＋中指','再加无名指','四指 · 拇指收起','五指张开','食指＋小指','再加拇指'][i]}</small></span></div>`).join('')}</div>
        <div class="gesture-guide"><div><span class="gesture-glyph">↥</span><p>表情手抬高，加大力度<small>画面中左右侧倾，暗亮随手改变</small></p></div><div><span class="gesture-glyph">○</span><p>握拳，让声音退场<small>任一只手离开画面也会静音</small></p></div></div>
        <details class="advanced-guide"><summary>进阶：同时控制更多声音</summary><p>启用右手配器后，非拇指 1 / 2 / 3 / 4 指分别选择开放排列、第一转位、七和弦、色彩七和弦；伸出拇指降一个八度。</p><p>左腕由左到右选择减、小、大、增四种性质，回中为大；也可在和声方式中固定任一性质。七和弦与色彩配器会扩展或改变和弦，请以屏幕音名为准。</p></details>
        <button class="swap-hands" id="swap-hands" aria-pressed="false">交换左右手分工 ${icon('arrow',13)}</button>
        <div class="privacy-note"><span class="tiny-dot"></span> 原声演唱 + 合成伴奏 · 影像留在本机</div>
      </aside>
    </div>
    <section class="transport" aria-label="演奏控制">
      <div class="input-section"><span class="input-icon">${icon('mic',20)}</span><div><span class="transport-label">人声输入 <small id="mic-label">未连接</small></span><div class="meter" id="input-meter">${Array.from({length:20},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div></div><button class="icon-button" id="mic-button" aria-label="连接麦克风" title="连接麦克风">${icon('mic',16)}</button></div>
      <div class="key-section"><label for="key">调性 <span>KEY</span></label><select id="key" aria-label="选择调性">${NOTE_NAMES.map((n,i)=>`<option value="${i}">${n} major</option>`).join('')}</select></div>
      <div class="play-section"><button class="primary-button" id="start-button">${icon('play',17)}<span>开始演奏</span></button><button class="demo-button" id="demo-button">先试听探索 ${icon('arrow',16)}</button></div>
      <div class="output-section"><button class="icon-button" id="mute-button" aria-label="静音" aria-pressed="false">${icon('sound',18)}</button><input id="volume" aria-label="输出音量" type="range" min="0" max="100" value="55"/><output id="volume-value">55%</output></div>
    </section>
    <div class="message" id="message" role="status" aria-live="polite" hidden></div>
    <footer><span>${icon('headphones',14)} 建议佩戴耳机，让声音只向你靠近。</span><span>CHORA <span class="footer-cross">✳</span> MADE OF AIR, SHAPED BY YOU.</span><span>空格 静音 <span class="footer-divider">/</span> ESC 停止</span></footer>
  </main>
  <dialog id="help-dialog"><div class="dialog-heading"><span class="eyebrow">TWO HANDS, ONE INSTRUMENT</span><button class="icon-button" id="close-help" aria-label="关闭指南">${icon('close')}</button></div><h2>像指挥一样，给自己伴奏。</h2><p>这版沿用参考视频的双手分工：一只手选整组和弦，另一只手控制力度与音色。Ambient 可直接伴随自然演唱；Vocoder 则把歌声的频谱带入和声。</p><ol><li><strong>左手选择七个级数。</strong>食指 → I；食指＋中指 → ii；再加无名指 → iii；四指（拇指收起）→ IV；五指 → V；食指＋小指 → vi；食指＋小指＋拇指 → vii。保持完整手型片刻以确认。</li><li><strong>右手控制表情。</strong>抬高增加力度，在画面中左右侧倾，独立扫动音色暗亮。向左偏暗、向右偏亮、回中恢复原色；这与预设明亮度旋钮独立。开启「右手选择配器 / 八度」后，非拇指 1–4 指选择开放排列、第一转位、七和弦和色彩七和弦，拇指展开降八度。任一只手握拳或离开画面，以及右手只伸拇指，都会静音。左右识别与习惯不一致时，用「交换左右手分工」。</li><li><strong>从顺阶到自由。</strong>默认开启左腕四区：大幅左倾是减和弦、小幅左倾是小和弦、回中是大和弦、右倾是增和弦。分界约为 −30°、−10°、+25°，停稳片刻确认；默认使用大三和弦。关闭开关固定当前性质；也可选「顺阶伴奏」按调性决定性质。右手配器可单独开关，三 / 七和弦按钮恢复固定配器。色彩手型可能带入调外音。</li><li><strong>在演唱中切换音色。</strong>Ambient 只需摄像头；Vocoder 需要点击麦克风按钮连接。切换音色会保留和弦、声部和设备。三和弦的第四声部为高八度根音；七和弦则为七音。</li></ol><div class="guide-tip">先试听：1–7 选和弦，A / S / D / F 开关声部；按住舞台拖动也能演奏。空格静音，Esc 停止。Vocoder 试听使用标注的合成元音信号。</div><p class="guide-footnote">本页不会上传或录制影像与声音，麦克风原声不直通扬声器。优先使用桌面版 Chrome / Edge，双手完整入镜、光线均匀。</p><button class="primary-button" id="got-it">明白了，开始探索 ${icon('arrow',16)}</button></dialog>
  <dialog id="comparison-dialog" aria-labelledby="comparison-title"><div class="dialog-heading"><span class="eyebrow">SAME CHORDS. THREE INSTRUMENTS.</span><button class="icon-button" id="close-comparison" aria-label="关闭音色对比">${icon('close')}</button></div><h2 id="comparison-title">听见音色的区别。</h2><p>同一段 Cmaj7 → Am7 → Fmaj7 → G7，使用相同的明亮度、空间、质感与音量设置。每次只播放一段；演奏声音暂时静音，关闭后恢复。</p><div class="comparison-grid">${SOUND_PRESET_IDS.map(id=>`<section><h3>${SOUND_PRESETS[id].name}</h3><p>${SOUND_PRESETS[id].subtitle}</p>${(['ambient','vocoder'] as const).map(mode=>`<label>${mode==='ambient'?'Ambient · 合成伴奏':'Vocoder · 合成元音输入'}<audio controls preload="none" aria-label="${SOUND_PRESETS[id].name} ${mode} 对比试听" src="${import.meta.env.BASE_URL}audio/demos/${mode}-${id}.wav"></audio></label>`).join('')}</section>`).join('')}</div><p class="guide-footnote">Vocoder 使用同一段合成 /a/、/u/、/e/ 元音，并非真人录音。样本未分别做响度归一化；真实演唱效果请接麦克风试听。</p></dialog>
`;

const $ = <T extends HTMLElement = HTMLElement>(selector:string) => document.querySelector<T>(selector)!;
const audio = new AudioEngine();
const visual = new ChoirVisual($<HTMLCanvasElement>('#resonance'));
const video = $<HTMLVideoElement>('#camera-video');
let running = false, starting = false, cameraActive = false, demo = false, muted = false, generation = 0;
let manualInputOnly = false;
let selectedChord = 0, key = 0;
let voicing: ChordVoicing = 'triad';
let harmonyMode: HarmonyMode | 'gesture' = 'gesture';
let followVoicing = false;
let gestureHarmony: Omit<HarmonyOptions, 'mode'> & { mode?: ChordQuality } = {};
let gestureColor = 0.5;
let baseBrightness = SOUND_PRESETS.moon.defaults.brightness;
let presetEdited = false;
let comparisonOpen = false;
let gestureGate = false, swapped = false;
let latestGesture: GestureFrame | undefined;
let cameraDetail = '';
let cameraPhase = 'stopped', audioReady = false, audioPending = false, audioAttempt = 0;
let startupHiddenTimer: number | undefined;
let lastMetrics = 0, handPresent = false, microphoneWasConnected = false;
const state: PerformanceState = { frequencies:frequencies(0,0,'triad',{mode:'major'}), voices:[true,true,true,true], expression:.65, ...SOUND_PRESETS.moon.defaults, soundPreset:'moon', wristTone:.5, microphoneGainDb:12, volume:.55, mode:'ambient', active:false };
const tracker = new HandTracker(video, handleGesture, (reason:string) => {
  if (running || starting) { void stop(); message(reason,true); }
}, (status, detail?:string) => {
  if(!starting && !running)return;
  cameraPhase=status;cameraDetail=detail??'';
  cameraActive=status==='preview'||status==='model'||status==='ready';
  renderSession();
});

function message(text:string, error=false) {
  const el = $('#message'); el.textContent = text; el.hidden = !text; el.classList.toggle('error',error);
}
function updateAudio() {
  refreshGestureGate();
  state.brightness = baseBrightness;
  if(cameraActive)state.wristTone=mapWristTone(gestureColor);
  state.active = running && audioReady && !muted && !comparisonOpen && !document.hidden && (demo || gestureGate);
  audio.update(state);
  renderVocoderStatus();
  visual.voices = [...state.voices]; visual.brightness = state.wristTone ?? .5; visual.running = state.active;
}
function refreshGestureGate() {
  const frame=latestGesture;
  gestureGate=!!frame?.gate && (!followVoicing || (frame.chordStyle!==undefined&&frame.octaveShift!==undefined)) && (harmonyMode!=='gesture'||frame.chordMode!==undefined);
}
function renderVoices() {
  document.querySelectorAll<HTMLButtonElement>('[data-voice]').forEach((el,i)=> { el.classList.toggle('selected',state.voices[i]); el.setAttribute('aria-pressed',String(state.voices[i])); });
  $('#voice-count').textContent = `${state.voices.filter(Boolean).length} / 4 声部`;
  updateAudio();
}
function harmonyOptions(): HarmonyOptions {
  return {
    mode: harmonyMode==='gesture' ? gestureHarmony.mode ?? 'major' : harmonyMode,
    ...(followVoicing ? {style:gestureHarmony.style,octaveShift:gestureHarmony.octaveShift} : {}),
  };
}
function renderHarmony() {
  $<HTMLSelectElement>('#harmony-mode').value=harmonyMode;
  $<HTMLInputElement>('#left-wrist-toggle').checked=harmonyMode==='gesture';
  $<HTMLInputElement>('#left-wrist-toggle').disabled=demo;
  const options=harmonyOptions();
  const qualityLabel=options.mode==='diatonic'?'顺阶':CHORD_QUALITY_NAMES[options.mode ?? 'major'];
  const modeLabel=harmonyMode==='diatonic'?'顺阶':harmonyMode==='gesture'?`${demo?'试听固定':swapped?'右腕':'左腕'} · ${qualityLabel}`:`自由 · ${qualityLabel}`;
  const styleLabel=options.style?GESTURE_STYLE_NAMES[options.style]:voicing==='triad'?'三和弦':'七和弦';
  $('#harmony-status').textContent=`${modeLabel} · ${styleLabel} · ${options.octaveShift===-1?'低八度':'原音区'}${demo&&(followVoicing||harmonyMode==='gesture')?' · 试听中手势设置固定':followVoicing&&!options.style?' · 等待右手配器':''}`;
  document.querySelectorAll<HTMLButtonElement>('[data-voicing]').forEach(el=>{
    const selected=!options.style && el.dataset.voicing===voicing;
    el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));
  });
  document.querySelectorAll<HTMLOptionElement>('#key option').forEach((el,i)=>el.textContent=`${NOTE_NAMES[i]} ${harmonyMode==='diatonic'?'major':'参考音'}`);
  renderWristControls();
}
function renderWristControls() {
  const left=latestGesture?.leftHand;
  const right=latestGesture?.rightHand;
  const angle=Math.round(((left?.tilt??.5)-.5)*120);
  const accepted=latestGesture?.chordMode;
  const activeQuality=(harmonyOptions().mode==='diatonic'?undefined:harmonyOptions().mode) as ChordQuality|undefined;
  const modeText=accepted?CHORD_QUALITY_NAMES[accepted]:`等待确认 · ${gestureHarmony.mode?`保留${CHORD_QUALITY_NAMES[gestureHarmony.mode]}`:'默认大和弦'}`;
  document.querySelectorAll<HTMLElement>('[data-wrist-quality]').forEach(el=>el.classList.toggle('active',el.dataset.wristQuality===activeQuality));
  $('#left-wrist-name').textContent=`${swapped?'右':'左'}腕 · 和弦性质`;
  $('#right-wrist-name').textContent=`${swapped?'左':'右'}腕 · 音色暗亮`;
  $('#left-wrist-status').textContent=demo?`试听固定 · ${activeQuality?CHORD_QUALITY_NAMES[activeQuality]:'顺阶'}`:harmonyMode!=='gesture'?'已关闭 · 由和声方式决定':!left?`等待${swapped?'右':'左'}手 · ${gestureHarmony.mode?`保留${CHORD_QUALITY_NAMES[gestureHarmony.mode]}`:'默认大和弦'}`:`${angle>0?'+':''}${angle}° · ${modeText}${latestGesture?.chordModePending?' · 切换确认中':''}`;
  $('#left-wrist-marker').style.left=`${Math.max(0,Math.min(100,(left?.tilt??.5)*100))}%`;
  $('#left-wrist-meter').setAttribute('aria-valuenow',String(angle));
  $('#left-wrist-meter').setAttribute('aria-valuetext',$('#left-wrist-status').textContent!);
  $('#left-wrist-meter').classList.toggle('untracked',!cameraActive||!left);
  const value=Math.round((state.wristTone??.5)*100);
  const slider=$<HTMLInputElement>('#wrist-tone');slider.value=String(value);slider.style.setProperty('--value',`${value}%`);slider.disabled=cameraActive;
  $('#wrist-tone-value').textContent=`${value}% · ${value<45?'偏暗':value>55?'偏亮':'原色'}`;
  $('#wrist-tone-hint').textContent=cameraActive?right?`已识别 ${Math.round((right.tilt-.5)*120)}° · 向两侧各约30°覆盖全部暗亮`:`等待${swapped?'左':'右'}手；入镜后显示变化`:'可拖动试听，与右腕使用同一声音控制。';
}
function selectChord(index:number, repeat=false) {
  const options=harmonyOptions();
  selectedChord = index; state.frequencies = frequencies(index,key,voicing,options);
  $('#current-chord').textContent = chordName(index,key,voicing,options); $('#chord-mood').textContent = options.mode==='diatonic'&&!options.style?CHORDS[index].mood:`${CHORD_QUALITY_NAMES[options.mode as ChordQuality] ?? '自由和声'} · 自由配和声`;
  document.querySelectorAll<HTMLButtonElement>('[data-chord]').forEach((el,i)=> { el.classList.toggle('selected',i===index); el.setAttribute('aria-pressed',String(i===index)); });
  document.querySelectorAll<HTMLElement>('[data-chord-name]').forEach((el,i)=>el.textContent=chordName(i,key,voicing,options));
  document.querySelectorAll<HTMLElement>('[data-voice-note]').forEach((el,i)=>el.textContent=noteName(midiNotes(index,key,voicing,options)[i]));
  const labels=options.style==='open'?['根音','五音','高八度','高三音']:options.style==='inversion'?['三音低音','五音','高根音','高三音']:['根音','三音','五音',!options.style&&voicing==='triad'?'高八度':'七音'];
  document.querySelectorAll<HTMLElement>('[data-voice-label]').forEach((el,i)=>el.textContent=labels[i]);
  document.querySelectorAll<HTMLElement>('[data-chord] > span, [data-sign] strong').forEach((el,i)=>el.textContent=options.mode==='diatonic'?CHORDS[i%7].degree:['I','II','III','IV','V','VI','VII'][i%7]);
  document.querySelectorAll<HTMLElement>('[data-sign]').forEach((el,i)=>el.classList.toggle('selected',i===index));
  renderHarmony();
  updateAudio();
  if(repeat)audio.retrigger();
}
function renderVocoderStatus(metrics?:AudioMetrics) {
  const enabled=state.mode==='vocoder';
  $('#vocoder-controls').hidden=!enabled;
  if(!enabled)return;
  const gain=state.microphoneGainDb??12;
  $('#mic-gain-value').textContent=`+${gain} dB`;
  const test=$<HTMLButtonElement>('#mic-test-button');test.disabled=micConnecting;
  test.textContent=micConnecting?'正在连接麦克风…':demo&&audio.microphoneEnabled?'固定和弦试音中':'只用麦克风试音';
  if(!audio.microphoneEnabled)$('#mic-input-status').classList.remove('input-warning');
  if(!audio.microphoneEnabled)$('#mic-input-status').textContent=audio.demoModulatorEnabled?'当前为合成试听信号；麦克风尚未连接。':'连接麦克风后，轻声试唱并调整增益。';
  else if(metrics){
    const level=metrics.inputDb??-90;
    const text=metrics.rawInputClipped?'麦克风原始输入过载，请降低设备输入音量。':metrics.inputClipped?'增益过高，请调低麦克风增益。':level < -55?'等待人声；若正在唱，请检查麦克风设备。':level < -35?'输入偏弱，可提高麦克风增益或靠近一些。':'输入已收到，保持当前距离试唱。';
    $('#mic-input-status').textContent=text;
    $('#mic-input-status').classList.toggle('input-warning',!!metrics.rawInputClipped||!!metrics.inputClipped);
  }
  $('#vocoder-output-status').textContent= !running&&!starting?'等待启动声音':!audioReady?audioPending?'声音准备中…':'声音未就绪，请点击「启用声音」':muted?'已静音，点击音量旁的扬声器恢复':comparisonOpen?'音色对比中，实时人声暂时静音':!state.voices.some(Boolean)?'四个声部均已关闭，请打开至少一个':!audio.microphoneEnabled?(audio.demoModulatorEnabled?'合成信号试音中':'等待麦克风连接'):!demo&&(starting||!gestureGate)?(cameraPhase==='model'?'人声已连接，等待手势模型；可先只用麦克风试音':'人声已连接，等待有效双手姿势；可先只用麦克风试音'):!demo&&state.expression<.15?'右手偏低，抬高手掌可增加输出力度':demo?'固定和弦试音 · 1–7 或点击切换和弦':'双手演奏 · 人声持续跟随当前和弦';
}
function renderSound() {
  const preset=SOUND_PRESETS[state.soundPreset ?? 'moon'];
  $('#sound-category').textContent=preset.subtitle;
  $('#sound-description').textContent=preset.description[state.mode];
  $('#preset-status').textContent=presetEdited?'已微调 · 音色保留':'原始配方';
  $('#texture-end').textContent=state.soundPreset==='glass'?'金属光泽':state.soundPreset==='warm'?'木质簧风':'流动元音';
  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(el=>{
    const selected=el.dataset.preset===state.soundPreset;
    el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));
  });
}
function renderParameters() {
  for (const param of ['space','brightness','texture','volume'] as const) {
    const value = Math.round((param==='brightness'?baseBrightness:state[param] ?? .5)*100); const el = $<HTMLInputElement>(`#${param}`);
    el.value = String(value); el.style.setProperty('--value',`${value}%`); $(`#${param}-value`).textContent = `${value}%`;
  }
  $('#expression-label').textContent = `EXPRESSION ${Math.round(state.expression*100)}%`;
  $('#color-status').textContent=`底色 ${Math.round(baseBrightness*100)}% · 手腕音色独立调节`;
  renderWristControls();
}
function renderSession() {
  $<HTMLInputElement>('#gesture-voicing').disabled=demo;
  $<HTMLOptionElement>('#harmony-mode option[value="gesture"]').disabled=demo;
  renderHarmony();
  const button = $<HTMLButtonElement>('#start-button');
  button.innerHTML = `${icon(starting || running ? 'stop' : 'camera',17)}<span>${starting ? '取消连接' : running ? '结束演奏' : '开启摄像头并演奏'}</span>`;
  const cameraLabel=starting?'取消连接':cameraActive?'关闭摄像头':'开启摄像头';
  $('#camera-button').innerHTML=`${icon(cameraActive||starting?'stop':'camera',14)} ${cameraLabel}`;
  $('#camera-overlay-button').innerHTML=`${icon(starting?'stop':'camera',16)} ${starting?'取消连接':'开启摄像头'}`;
  const progress:Record<string,string>={permission:'正在等待摄像头授权，请查看浏览器或系统提示。',preview:'摄像头已连接，正在准备手势识别…',model:'摄像头画面已开启，正在加载手势识别…',ready:'手势识别就绪',stopped:''};
  const status=$('#connection-status');
  status.textContent=starting?(demo?'正在启动声音…':cameraDetail||progress[cameraPhase]||'正在连接摄像头…'):'';
  status.hidden=!starting;
  $('#enable-sound').hidden=(!running&&!starting)||audioReady;
  $<HTMLButtonElement>('#enable-sound').disabled=audioPending;
  $('#enable-sound').textContent=audioPending?'声音启动中…':'点击启用声音';
  $<HTMLButtonElement>('#demo-button').disabled = starting;
  $('#demo-button').innerHTML = `${running && !demo ? '切换为试听' : running ? '停止试听' : '先试听探索'} ${icon('arrow',16)}`;
  $('#session-label').textContent = starting ? '正在连接你的乐器…' : running ? (muted ? '已静音，留一点安静' : demo ? '试听模式 · 自由探索' : '共振中 · 让歌声加入') : '准备好，让声音发生';
  $('#session-detail').textContent = starting ? (cameraActive?'镜头已开启 · 手势识别加载中':'请完成浏览器的设备授权') : running ? (cameraActive ? '双手指挥 · 7 个根音位置' : '键盘 / 鼠标控制') : '耳机就绪 · 无需 MIDI 设备';
  $('#session-dot').classList.toggle('on',running); $('#live-dot').classList.toggle('on',running&&!muted);
  $('#field-status').textContent = starting ? (cameraActive?'镜头已连接':'正在连接') : running ? muted ? '已静音' : demo ? '试听中' : gestureGate ? '手势共振中' : '等待手势' : '等待唤醒';
  $('#field-hint').textContent = running ? demo ? '按住并拖动 · 左右切换和弦 / 上下打开音色' : '和弦手选和弦 · 表情手抬高控制力度' : '先听见和弦，再让双手接管。';
  $('#mic-label').textContent = audio.microphoneEnabled ? '已连接' : audio.demoModulatorEnabled && state.mode==='vocoder' ? '合成试听信号' : '未连接';
  $('#mic-button').classList.toggle('enabled',audio.microphoneEnabled);
  $('#mic-button').setAttribute('aria-label',audio.microphoneEnabled?'麦克风已连接，结束演奏以断开':'连接麦克风');
  $('#camera-tag').innerHTML = `<span class="tiny-dot ${cameraActive?'on':''}"></span> ${cameraActive?'CAMERA LIVE':starting&&!demo?'CONNECTING':demo?'MOUSE / KEYS':'CAMERA OFF'}`;
  $('#camera-placeholder').classList.toggle('is-hidden',cameraActive);
  $('#camera-hint').textContent = starting ? '请允许摄像头访问；连接期间可随时取消。' : demo ? '用鼠标与键盘，先感受声音' : '让双手入镜，用一个和弦开始。';
  if (!cameraActive) $('#tracking-label').textContent = starting ? '正在等待摄像头授权' : demo ? '试听模式 · 不使用摄像头' : '双手入镜，手掌朝向摄像头';
  $('#tracking-dot').classList.toggle('on',cameraActive&&gestureGate);
  document.body.classList.toggle('is-playing',running&&!muted);
  document.body.classList.toggle('camera-connected',cameraActive);
  $('#left-role').textContent=swapped?'R / CHORD':'L / CHORD';
  $('#chord-hand-chip').textContent=swapped?'R':'L';
  $('#expression-hand-chip').textContent=swapped?'L':'R';
  $('#right-role').textContent=swapped?'L / EXPRESSION':'R / EXPRESSION';
  if(!cameraActive){$('#left-status').textContent=demo?'按 1–7 选和弦':'等待和弦手';$('#right-status').textContent=demo?'拖动或调节滑杆':'等待表情手';$('#left-role').classList.remove('detected');$('#right-role').classList.remove('detected');}
}
function handleGesture(frame:GestureFrame) {
  if (!cameraActive) return;
  handPresent=frame.present;latestGesture=frame;refreshGestureGate();
  drawHand($<HTMLCanvasElement>('#hand-overlay'),frame);
  const before=JSON.stringify(harmonyOptions());
  if(frame.gate){
    if(frame.chordMode)gestureHarmony.mode=frame.chordMode;
    if(frame.chordStyle)gestureHarmony.style=frame.chordStyle;
    if(frame.octaveShift!==undefined)gestureHarmony.octaveShift=frame.octaveShift;
  }
  if(frame.chordIndex!==null && (frame.chordIndex!==selectedChord || before!==JSON.stringify(harmonyOptions()))) selectChord(frame.chordIndex);
  if(frame.rightHand) {
    gestureColor=frame.brightness;
    state.expression=frame.expression;
    visual.pointer={x:frame.rightHand.x,y:frame.rightHand.y};
  }else gestureColor=.5;
  $('#left-status').textContent=frame.leftHand?frame.leftHand.label:'请举起和弦手';
  $('#right-status').textContent=frame.rightHand?`${Math.round(frame.expression*100)}% 力度`:'请举起表情手';
  const musicalPending=(followVoicing&&frame.chordStylePending)||(harmonyMode==='gesture'&&frame.chordModePending);
  $('#tracking-label').textContent=frame.gate&&!gestureGate?'和声手势确认中 · 请停稳片刻':frame.gate?`${chordName(selectedChord,key,voicing,harmonyOptions())} · ${musicalPending?'和声变化确认中':'抬高变响，倾斜变亮'}`:frame.label;
  $('#tracking-dot').classList.toggle('on',gestureGate);
  $('#field-status').textContent=muted?'已静音':gestureGate?'双手共振中':'等待手势';
  $('#left-role').classList.toggle('detected',Boolean(frame.leftHand));
  $('#right-role').classList.toggle('detected',Boolean(frame.rightHand));
  updateAudio(); renderParameters();
}
function describeError(error:unknown) {
  const name = error instanceof DOMException ? error.name : '';
  if (name==='NotAllowedError') return '设备权限未开启。请在地址栏允许摄像头 / 麦克风后重试；也可以先用试听模式。';
  if (name==='NotFoundError') return '没有找到可用的摄像头或麦克风。连接设备后重试，或先试听探索。';
  if (name==='NotReadableError') return '设备暂时无法使用，可能被其他应用占用。关闭占用后重试。';
  return `连接未完成：${error instanceof Error ? error.message : String(error)}。可以重试或先使用试听模式。`;
}
async function stop() {
  ++generation; manualInputOnly=false; starting=false; running=false; cameraActive=false; handPresent=false; gestureGate=false; demo=false;
  latestGesture=undefined;
  microphoneWasConnected=false;cameraPhase='stopped';cameraDetail='';audioReady=false;audioPending=false;++audioAttempt;
  clearTimeout(startupHiddenTimer);
  gestureColor=.5;state.wristTone=.5;gestureHarmony={};
  state.active=false; tracker.stop(); updateAudio();
  const overlay=$<HTMLCanvasElement>('#hand-overlay');overlay.getContext('2d')!.clearRect(0,0,overlay.width,overlay.height);
  await audio.stop(); selectChord(selectedChord);renderParameters();renderSession();
}
async function startAudio(token:number, useDemo:boolean):Promise<boolean> {
  const attempt=++audioAttempt;audioPending=true;audioReady=false;renderSession();
  let timer:number|undefined;
  try {
    // start() runs inside the initiating click; camera permission does not wait for it.
    const ready=audio.start({microphone:false});
    audio.setDemoModulatorEnabled(useDemo);
    await Promise.race([ready,new Promise<never>((_,reject)=>{timer=window.setTimeout(()=>reject(new Error('声音资源加载或启动超时，请点击「启用声音」重试')),20000);})]);
    if(token!==generation||attempt!==audioAttempt)return false;
    audioReady=true;audioPending=false;updateAudio();renderSession();return true;
  } catch(error) {
    if(token!==generation||attempt!==audioAttempt)return false;
    audioPending=false;audioReady=false;await audio.stop();
    if(token!==generation||attempt!==audioAttempt)return false;
    renderSession();message(`声音未启动，摄像头可独立使用。${error instanceof Error?error.message:String(error)}`,true);return false;
  } finally {clearTimeout(timer);}
}
async function start(useDemo:boolean, microphoneTest=false) {
  if (starting) return;
  const keepAudio=audioReady;
  const heldHarmony={...gestureHarmony};
  const token=++generation;
  starting=true;running=false;cameraActive=false;handPresent=false;gestureGate=false;
  latestGesture=undefined;
  gestureColor=.5;state.wristTone=.5;gestureHarmony=useDemo?heldHarmony:{};selectChord(selectedChord);
  tracker.stop();cameraPhase='stopped';cameraDetail='';state.active=false;audioReady=keepAudio;updateAudio();
  demo=useDemo;manualInputOnly=useDemo&&microphoneTest;message('');
  if(!useDemo){$('#field').classList.remove('abstract-view');$('#view-button').textContent='切换为共振场';$('#view-button').setAttribute('aria-pressed','false');}
  // Preserve an already-running microphone/audio session when switching control modes.
  // A new audio session starts concurrently with the camera permission request.
  if(!keepAudio)void audio.stop();
  audio.setDemoModulatorEnabled(useDemo&&!microphoneTest);
  const audioTask=keepAudio?Promise.resolve(true):startAudio(token,useDemo&&!microphoneTest);
  try {
    if(!useDemo) await tracker.start();
    else {state.expression=.65;await audioTask;}
    if(token!==generation)return;
    running=true;starting=false;
    $('#engine-label').textContent='FAUST · AUDIOWORKLET';
    renderVoices();renderSession();
    if(useDemo&&audioReady&&!microphoneTest)message(state.mode==='vocoder'?'Vocoder 试听使用合成调制信号；连接麦克风后由歌声塑造和声。':'试听已开始。点击和弦与声部，或按住舞台拖动；空格静音。');
    else if(!useDemo)message(state.mode==='vocoder'?'摄像头已开启。点击麦克风按钮连接人声，再用双手控制和弦。':'摄像头已开启。和弦手先伸食指，表情手张开并抬高。左腕四区切减／小／大／增，回中为大；右腕侧倾扫音色；看舞台下方的实时指示。');
    if(document.hidden)scheduleHiddenStop();
  } catch(error) {
    if(token!==generation)return;
    await stop();message(`摄像头连接失败。${describeError(error)}`,true);
  }
}
function scheduleHiddenStop() {
  clearTimeout(startupHiddenTimer);
  startupHiddenTimer=window.setTimeout(()=>{if(document.hidden&&(running||starting)){void stop();message('页面持续处于后台，设备已停止。返回后可重新开启。');}},20000);
}

$('#start-button').addEventListener('click',()=> { if (running || starting) void stop(); else void start(false); });
for(const selector of ['#camera-button','#camera-overlay-button'])$(selector).addEventListener('click',()=>{if(starting||cameraActive)void stop();else void start(false);});
$('#enable-sound').addEventListener('click',()=>{if(!audioPending)void startAudio(generation,demo&&!manualInputOnly);});
$('#demo-button').addEventListener('click',()=> { if (running && demo) void stop(); else void start(true); });
let micConnecting=false;
$('#mic-gain').addEventListener('input',event=>{state.microphoneGainDb=Number((event.target as HTMLInputElement).value);updateAudio();});
$('#mic-test-button').addEventListener('click',async()=>{
  if(micConnecting)return;
  micConnecting=true;renderVocoderStatus();
  let token=generation;
  try{
    if(starting){++generation;starting=false;tracker.stop();cameraActive=false;}
    const task=start(true,true);token=generation;
    await task;
    if(token!==generation||!running||!audioReady)return;
    audio.setDemoModulatorEnabled(false);
    await audio.enableMicrophone();
    if(token!==generation)return;
    renderSession();updateAudio();message('固定和弦试音已开启：对麦克风唱一个长音，1–7切换和弦。点击开启摄像头可返回手势演奏。');
  }catch(error){if(token===generation)message(describeError(error),true);}
  finally{micConnecting=false;renderVocoderStatus();}
});
$('#mic-button').addEventListener('click',async()=> {
  if (micConnecting || starting) return;
  if (audio.microphoneEnabled) { message('麦克风已连接。点击「结束演奏」可断开所有设备。'); return; }
  micConnecting=true; let token=generation;
  try {
    if (!running) {const task=start(true);token=generation;await task;}
    if (token!==generation||!running) return;
    const current=token;
    if(!audioReady){message('请先点击「启用声音」，再连接麦克风。');return;}
    await audio.enableMicrophone();
    if (current!==generation) return;
    renderSession(); message('麦克风已连接。切换到 Vocoder，用歌声塑造和弦；手动和弦与声部控制仍可使用。');
  } catch(error) { if (token===generation) message(describeError(error),true); }
  finally {micConnecting=false;renderVocoderStatus();}
});
document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(el=>el.addEventListener('click',()=> {
  state.mode=el.dataset.mode as SoundMode;
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=> { b.classList.toggle('selected',b===el); b.setAttribute('aria-pressed',String(b===el)); });
  renderSound();updateAudio(); renderSession();
  if(running && !demo && state.mode==='vocoder' && !audio.microphoneEnabled) message('Vocoder 需要人声输入，请点击麦克风按钮连接。也可以切回 Ambient 继续手势演奏。');
  if (running && demo) message(state.mode==='vocoder' && !audio.microphoneEnabled
    ? audio.demoModulatorEnabled ? 'Vocoder 试听使用合成调制信号。连接麦克风，让你的歌声成为调制源。' : '麦克风未连接。点击麦克风按钮重新连接，或重新启动试听来使用合成调制信号。'
    : '用键盘或鼠标自由演奏。当前调性中的固定和弦音，为你的歌声伴奏。');
}));
document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(el=>el.addEventListener('click',()=> {
  state.soundPreset=el.dataset.preset as SoundPreset;
  Object.assign(state,SOUND_PRESETS[state.soundPreset].defaults);
  baseBrightness=state.brightness;presetEdited=false;
  updateAudio();renderParameters();renderSound();
}));
document.querySelectorAll<HTMLButtonElement>('[data-chord]').forEach(el=>el.addEventListener('click',()=>selectChord(Number(el.dataset.chord),true)));
document.querySelectorAll<HTMLButtonElement>('[data-voice]').forEach(el=>el.addEventListener('click',()=> {
  const i=Number(el.dataset.voice); state.voices[i]=!state.voices[i]; renderVoices();
}));
document.querySelectorAll<HTMLButtonElement>('[data-voicing]').forEach(el=>el.addEventListener('click',()=> {
  voicing=el.dataset.voicing as ChordVoicing;
  followVoicing=false;$<HTMLInputElement>('#gesture-voicing').checked=false;
  selectChord(selectedChord);
}));
$('#harmony-mode').addEventListener('change',event=>{
  harmonyMode=(event.target as HTMLSelectElement).value as HarmonyMode|'gesture';selectChord(selectedChord);
});
$('#left-wrist-toggle').addEventListener('change',event=>{
  const enabled=(event.target as HTMLInputElement).checked;
  harmonyMode=enabled?'gesture':(gestureHarmony.mode ?? 'major');
  selectChord(selectedChord);
});
$('#wrist-tone').addEventListener('input',event=>{
  if(cameraActive)return;
  state.wristTone=Number((event.target as HTMLInputElement).value)/100;
  updateAudio();renderWristControls();
});
$('#gesture-voicing').addEventListener('change',event=>{
  followVoicing=(event.target as HTMLInputElement).checked;selectChord(selectedChord);
});
$('#swap-hands').addEventListener('click',()=> {
  swapped=!swapped;tracker.setSwapHands(swapped);latestGesture=undefined;gestureGate=false;gestureHarmony={};gestureColor=.5;state.wristTone=.5;selectChord(selectedChord);renderParameters();
  $('#swap-hands').setAttribute('aria-pressed',String(swapped));renderSession();
  message(swapped?'已交换：右手选和弦，左手控制力度与音色。':'已恢复：左手选和弦，右手控制力度与音色。');
});
$('#view-button').addEventListener('click',()=> {
  const field=$('#field');const abstract=field.classList.toggle('abstract-view');
  $('#view-button').textContent=abstract?'显示摄像头画面':'切换为共振场';$('#view-button').setAttribute('aria-pressed',String(abstract));
});
$('#fullscreen-button').addEventListener('click',async()=> {
  try { if(document.fullscreenElement)await document.exitFullscreen();else await $('.stage-panel').requestFullscreen(); }
  catch {message('当前浏览器不支持页面全屏，可以使用窗口最大化。');}
});
$<HTMLSelectElement>('#key').addEventListener('change',event=> { key=Number((event.target as HTMLSelectElement).value); selectChord(selectedChord); });
for (const param of ['space','brightness','texture','volume'] as const) {
  $<HTMLInputElement>(`#${param}`).addEventListener('input',event=> {
    state[param]=Number((event.target as HTMLInputElement).value)/100;
    if(param==='brightness')baseBrightness=state.brightness;
    if (param!=='volume')presetEdited=true;
    updateAudio();renderParameters();renderSound();
  });
}
function toggleMute() {
  muted=!muted; $('#mute-button').innerHTML=icon(muted?'mute':'sound',18); $('#mute-button').setAttribute('aria-pressed',String(muted)); $('#mute-button').setAttribute('aria-label',muted?'取消静音':'静音');
  updateAudio(); renderSession();
}
$('#mute-button').addEventListener('click',toggleMute);
let dragging=false;
const field=$('#field');
function pointerPerform(event:PointerEvent) {
  if (!dragging || !running || !demo) return;
  const rect=field.getBoundingClientRect();
  const x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)), y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
  selectChord(positionToChord(x,selectedChord)); state.wristTone=1-y;visual.pointer={x,y};updateAudio();renderParameters();
}
field.addEventListener('pointerdown',event=> { if (demo&&running) { dragging=true; field.setPointerCapture(event.pointerId); pointerPerform(event); } });
field.addEventListener('pointermove',pointerPerform);
field.addEventListener('pointerup',()=>dragging=false); field.addEventListener('pointercancel',()=>dragging=false);
const dialog=$<HTMLDialogElement>('#help-dialog');
const comparisonDialog=$<HTMLDialogElement>('#comparison-dialog');
const samples=Array.from(document.querySelectorAll<HTMLAudioElement>('#comparison-dialog audio'));
$('#compare-sounds').addEventListener('click',()=>{
  samples.forEach(sample=>{if(sample.readyState===0){sample.preload='metadata';sample.load();}});
  comparisonOpen=true;updateAudio();comparisonDialog.showModal();
});
$('#close-comparison').addEventListener('click',()=>comparisonDialog.close());
comparisonDialog.addEventListener('close',()=>{
  samples.forEach(sample=>{sample.pause();sample.currentTime=0;});
  comparisonOpen=false;updateAudio();
});
samples.forEach(sample=>sample.addEventListener('play',()=>samples.filter(other=>other!==sample).forEach(other=>other.pause())));
$('#help-button').addEventListener('click',()=>dialog.showModal());
$('#close-help').addEventListener('click',()=>dialog.close()); $('#got-it').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=> { if(event.target===dialog) {const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();} });
document.addEventListener('keydown',event=> {
  if(dialog.open || comparisonDialog.open || event.repeat) return;
  if(event.code==='Escape'){event.preventDefault();void stop();return;}
  if((event.target as HTMLElement).matches('input,select,textarea,[contenteditable="true"]')) return;
  if(event.code==='Space'){event.preventDefault();toggleMute();}
  if(/^[1-7]$/.test(event.key))selectChord(Number(event.key)-1,true);
  const i=['a','s','d','f'].indexOf(event.key.toLowerCase());
  if(i>=0){state.voices[i]=!state.voices[i];renderVoices();}
});
document.addEventListener('visibilitychange',()=> {
  clearTimeout(startupHiddenTimer);
  if(document.hidden){
    samples.forEach(sample=>sample.pause());
    if(starting){updateAudio();scheduleHiddenStop();}
    else if(running){void stop();message('页面已离开前台，演奏与设备连接已停止。返回后可重新开始。');}
  }else updateAudio();
});
window.addEventListener('pagehide',()=> {void stop();});
function animate(time:number) {
  if(time-lastMetrics>50) {
    lastMetrics=time; const metrics=audio.metrics();
    const connected=audio.microphoneEnabled;
    if(running && microphoneWasConnected && !connected) {
      renderSession();
      message('麦克风已断开。Vocoder 等待人声输入；点击麦克风按钮重新连接，或切回 Ambient 继续演奏。',true);
    }
    microphoneWasConnected=connected;
    visual.setLevel(metrics.outputLevel);
    const level=running||starting?metrics.inputLevel:0;
    renderVocoderStatus(metrics);
    document.querySelectorAll<HTMLElement>('#input-meter i').forEach((el,i)=>el.classList.toggle('lit',i<level*20));
  }
  requestAnimationFrame(animate);
}
renderParameters();renderSound();renderSession();selectChord(0);requestAnimationFrame(animate);
