export interface ThemePreset {
  id: string;
  name: string;
  colors: {
    background: string;
    backgroundSecondary: string;
    text: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'Default',
    colors: {
      background: '#FAF8F4',
      backgroundSecondary: '#F0EDE8',
      text: '#1A1A1A',
    },
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    colors: {
      background: '#FFF3E0',
      backgroundSecondary: '#FFE0B2',
      text: '#3E2723',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    colors: {
      background: '#F3E5F5',
      backgroundSecondary: '#E1BEE7',
      text: '#311B92',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      background: '#E0F7FA',
      backgroundSecondary: '#B2EBF2',
      text: '#004D40',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      background: '#E8F5E9',
      backgroundSecondary: '#C8E6C9',
      text: '#1B5E20',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      background: '#1A1A2E',
      backgroundSecondary: '#16213E',
      text: '#E8E8E8',
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    colors: {
      background: '#FCE4EC',
      backgroundSecondary: '#F8BBD0',
      text: '#880E4F',
    },
  },
  {
    id: 'cream',
    name: 'Cream',
    colors: {
      background: '#FFFDE7',
      backgroundSecondary: '#FFF9C4',
      text: '#33302A',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      background: '#FAFAFA',
      backgroundSecondary: '#F5F5F5',
      text: '#212121',
    },
  },
];
