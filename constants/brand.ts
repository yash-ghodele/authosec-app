/**
 * AuthoSec Brand Colors - Matching Website Dark Theme
 */
export const brandColors = {
  // Primary Orange (Firebase orange - matching website)
  primary: {
    50: '#fef3e7',
    100: '#fde0bc',
    200: '#fccc91',
    300: '#fbb866',
    400: '#faa43b',
    500: '#f9ab00',
    600: '#e09100',
    700: '#c77700',
    800: '#ae5d00',
    900: '#954300',
  },
  
  // Firebase Colors
  firebase: {
    orange: '#f9ab00',
    yellow: '#ffca28',
    blue: '#039be5',
    navy: '#1a237e',
    purple: '#4a148c',
  },
  
  // Success Green
  success: {
    500: '#10b981',
    600: '#059669',
  },
  
  // Warning Yellow
  warning: {
    500: '#f59e0b',
    600: '#d97706',
  },
  
  // Error Red
  error: {
    500: '#ef4444',
    600: '#dc2626',
  },
  
  // Dark Theme (matching website)
  dark: {
    50: '#f5f5f5',
    100: '#e8eaed',
    200: '#dadce0',
    300: '#bdc1c6',
    400: '#9aa0a6',
    500: '#5f6368',
    600: '#3c4043',
    700: '#303134',
    800: '#202124',
    900: '#171717',
  },
  
  // Light Theme (for text on dark backgrounds)
  light: {
    50: '#ffffff',
    100: '#fafafa',
    200: '#f5f5f5',
    300: '#e5e5e5',
    400: '#d4d4d4',
    500: '#a3a3a3',
    600: '#737373',
    700: '#525252',
    800: '#404040',
    900: '#262626',
    950: '#171717',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

// Gradient utilities
export const gradients = {
  firebase: ['#f9ab00', '#ffca28'],
  firebaseDark: ['#1a237e', '#4a148c'],
  primary: ['#f9ab00', '#ffca28'],
  dark: ['#202124', '#171717'],
};

// Animation constants (matching website)
export const animations = {
  fadeIn: {
    duration: 500,
    easing: 'ease-in',
  },
  slideUp: {
    duration: 500,
    easing: 'ease-out',
  },
  slideDown: {
    duration: 300,
    easing: 'ease-out',
  },
};

// Glass effect style (for cards)
export const glassEffect = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
};
