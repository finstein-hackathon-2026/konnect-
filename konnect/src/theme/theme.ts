export const theme = {
  light: {
    background: '#FFFFFF',
    card: '#F5F5F7',
    primary: '#000000',
    secondaryText: '#6E6E73',
    border: '#E5E5EA',
    accent: '#007AFF',
    error: '#FF3B30',
    success: '#34C759',
  },
  dark: {
    background: '#0B0B0C',
    card: '#1C1C1E',
    primary: '#FFFFFF',
    secondaryText: '#A1A1A6',
    border: '#2C2C2E',
    accent: '#4F8CFF',
    error: '#FF453A',
    success: '#32D74B',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  typography: {
    h1: {
      fontSize: 34,
      fontWeight: '800' as const,
      letterSpacing: -1,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 13,
      fontWeight: '500' as const,
    },
  }
};

export type ThemeType = typeof theme.light;
