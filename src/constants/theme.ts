export const COLORS = {
  // Light mode
  light: {
    background: '#FAF8F4',
    backgroundSecondary: '#F0EDE8',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    card: '#FFFFFF',
  },
  // Dark mode
  dark: {
    background: '#1A1A1A',
    backgroundSecondary: '#252525',
    text: '#F5F5F0',
    textSecondary: '#A0A0A0',
    card: '#2A2A2A',
  },
  // Accent colors (same for both modes)
  primary: '#FF5722',
  primarySoft: '#FF8A65',
  accent: '#FF7043',
  star: '#FFE4A0',
  starGlow: '#FFF5D6',

  // Pastel accents
  lavender: '#DBC4F0',
  coral: '#FFB5A7',
  mint: '#B5E7DD',

  // Utility
  success: '#7CB342',
  error: '#E57373',
  divider: 'rgba(0,0,0,0.08)',
  dividerDark: 'rgba(255,255,255,0.08)',
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardLifted: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
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
  xxl: 24,
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

export const HERO_COLORS = {
  light: {
    skyTop: '#FFB5A0',
    skyBottom: '#B5A7D6',
    mountainFar: '#8B7EB8',
    mountainMid: '#6B5E9E',
    mountainNear: '#3D3566',
    trees: '#1A1533',
  },
  dark: {
    skyTop: '#1A1533',
    skyBottom: '#2D2456',
    mountainFar: '#3D3566',
    mountainMid: '#2D2456',
    mountainNear: '#1A1533',
    trees: '#0D0A1A',
  },
};

export const GLASS_COLORS = {
  cardBlue: 'rgba(74, 91, 124, 0.4)',
  cardPink: 'rgba(181, 149, 167, 0.4)',
  border: 'rgba(255, 255, 255, 0.15)',
  pillInactive: 'rgba(74, 91, 124, 0.15)',
  pillActive: '#4A5B7C',
  pillText: '#4A5B7C',
  textOnCard: '#FFFFFF',
  sectionTitle: '#2D3E50',
  sectionSubtle: '#6B7B9E',
};

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
