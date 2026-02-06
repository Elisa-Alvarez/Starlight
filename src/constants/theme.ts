export const COLORS = {
  // Light mode
  light: {
    background: '#FFF9F0',
    backgroundSecondary: '#FFEFD5',
    text: '#3D3D3D',
    textSecondary: '#6B6B6B',
    card: '#FFFFFF',
  },
  // Dark mode
  dark: {
    background: '#1B1E2F',
    backgroundSecondary: '#252839',
    text: '#F5F5F0',
    textSecondary: '#A0A0A0',
    card: '#2D3142',
  },
  // Accent colors (same for both modes)
  primary: '#FFC850',
  primarySoft: '#FFD88D',
  accent: '#FFB84D',
  star: '#FFE4A0',
  starGlow: '#FFF5D6',

  // Utility
  success: '#7CB342',
  error: '#E57373',
  divider: 'rgba(0,0,0,0.08)',
  dividerDark: 'rgba(255,255,255,0.08)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  affirmation: 26,
};

// Default notification times
export const DEFAULT_NOTIFICATION_TIMES = [
  { id: 'morning', label: 'Morning motivation', hour: 8, minute: 0, enabled: true },
  { id: 'midday', label: 'Midday check-in', hour: 12, minute: 30, enabled: true },
  { id: 'afternoon', label: 'Afternoon boost', hour: 15, minute: 30, enabled: false },
  { id: 'evening', label: 'Evening wind-down', hour: 19, minute: 0, enabled: true },
  { id: 'night', label: 'Before bed', hour: 21, minute: 30, enabled: false },
];

// All categories enabled by default
export const ALL_CATEGORIES = [
  'anxiety',
  'winter',
  'energy',
  'self-care',
  'mindfulness',
  'sleep',
  'focus',
  'overthinking',
  'peace',
  'hard-days',
] as const;
