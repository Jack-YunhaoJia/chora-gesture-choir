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
      ambient: '柔和起音的合唱铺底，细微漂移与流动共振峰；质感控制元音和空气感。',
      vocoder: '人声驱动的柔软合唱，圆润载波、舒缓音节与扩散尾音。',
    },
    defaults: { brightness: 0.52, space: 0.7, texture: 0.58 },
  },
  glass: {
    name: '玻璃花园',
    subtitle: '清透敲击，停留时仍有余韵',
    description: {
      ambient: '换和弦时响起玻璃般的 FM 琴音，落入持续泛音；质感控制敲击的金属光泽。',
      vocoder: '清晰敏捷的水晶人声，明亮 FM 载波与短促音节，保留唱词轮廓。',
    },
    defaults: { brightness: 0.68, space: 0.5, texture: 0.52 },
  },
  warm: {
    name: '暖流簧风',
    subtitle: '贴近身体的簧片与柔和饱和',
    description: {
      ambient: '温暖簧片与柔和脉冲，起音直接、重心靠前；质感增加木质谐波和呼吸起伏。',
      vocoder: '浓密的模拟簧片人声，中频饱满、音节紧凑，带少量饱和质感。',
    },
    defaults: { brightness: 0.43, space: 0.36, texture: 0.48 },
  },
};

export const SOUND_PRESET_IDS: SoundPreset[] = ['moon', 'glass', 'warm'];
export const soundPresetIndex = (id?: SoundPreset): number => Math.max(0, SOUND_PRESET_IDS.indexOf(id ?? 'moon'));
