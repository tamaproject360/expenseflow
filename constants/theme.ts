export const Colors = {
  canvas: '#F8FAFB',
  surface: '#FFFFFF',
  primary: '#10B981',
  accent: '#F59E0B',
  textPrimary: '#1A202C',
  textSecondary: '#64748B',
  danger: '#EF4444',
  success: '#22C55E',
  border: '#E2E8F0',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const CategoryColors = {
  food: '#F59E0B',
  transport: '#3B82F6',
  shopping: '#EC4899',
  entertainment: '#8B5CF6',
  coffee: '#92400E',
  health: '#EF4444',
  bills: '#64748B',
  other: '#10B981',
};

export const Typography = {
  h1: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    lineHeight: 28.8,
    letterSpacing: -0.48,
  },
  h2: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  body: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyLarge: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 28,
    lineHeight: 33.6,
  },
  label: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    letterSpacing: 0.24,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
  },
  caption: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 21,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BorderRadius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 100,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fab: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const Animation = {
  fast: 200,
  normal: 300,
  slow: 500,
  chart: 800,
};

export const TouchTarget = {
  minHeight: 44,
  minWidth: 44,
};
