import type { SoundMode, SoundPreset } from '../types';

export type SoundPresetDefinition = {
  name: string;
  subtitle: string;
  description: Record<SoundMode, string>;
  defaults: { brightness: number; space: number; texture: number };
};

/** Identity selects a DSP instrument; these settings only provide a starting point. */
export const SOUND_PRESETS: Record<SoundPreset, SoundPresetDefinition> = {
  moon: {
    name: '月面合唱',
    subtitle: '缓缓绽开的元音与声场',
    description: {
      ambient: '缓慢浮现、持续流动的元音合唱；长按逐渐绽开，质感控制人声漂移与共振。',
      vocoder: '跟随人声起音的持续合唱，漂移声部与宽阔尾音；长音持续，不等待铺底渐入。',
    },
    defaults: { brightness: 0.48, space: 0.74, texture: 0.68 },
  },
  glass: {
    name: '玻璃花园',
    subtitle: '清脆敲击，自然落入安静',
    description: {
      ambient: '换和弦或重按时敲响玻璃钟琴，长按自然衰减；质感控制金属泛音与余韵。',
      vocoder: '明亮的持续人声和弦叠加玻璃敲击；长音持续，换和弦、重按和新音节增添敲击。',
    },
    defaults: { brightness: 0.78, space: 0.27, texture: 0.62 },
  },
  warm: {
    name: '暖流簧风',
    subtitle: '干燥近景的簧片与管风琴',
    description: {
      ambient: '直接起音的簧片与八度管风琴，长按稳定持续；质感增加脉冲厚度与轻微饱和。',
      vocoder: '贴近前景的簧片人声，清楚的脉冲谐波与紧凑音节，保留持续发声。',
    },
    defaults: { brightness: 0.56, space: 0.1, texture: 0.64 },
  },
};

export const SOUND_PRESET_IDS: SoundPreset[] = ['moon', 'glass', 'warm'];
export const soundPresetIndex = (id?: SoundPreset): number => Math.max(0, SOUND_PRESET_IDS.indexOf(id ?? 'moon'));
