/* Color Palette - TypeScript Definitions */

export type ThemeMode = 'light' | 'dark';

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Main brand color
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  danger: ColorScale;
  neutral: ColorScale;

  // Semantic Colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };

  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
  };

  border: {
    default: string;
    hover: string;
    focus: string;
    disabled: string;
  };

  // Component Colors
  card: {
    background: string;
    foreground: string;
  };

  popover: {
    background: string;
    foreground: string;
  };

  input: {
    background: string;
    border: string;
  };

  sidebar: {
    background: string;
    foreground: string;
    primary: string;
    accent: string;
    border: string;
  };

  // Charts
  chart: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };
}

// Light Theme Colors
export const lightColors: ColorPalette = {
  primary: {
    50: '#e6f2ff',
    100: '#cce5ff',
    200: '#99cbff',
    300: '#66b1ff',
    400: '#3397ff',
    500: '#2563eb', // Main brand color
    600: '#0a5fe6',
    700: '#0747b3',
    800: '#052f80',
    900: '#02184d',
  },
  secondary: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
  background: {
    primary: '#d1d5db',
    secondary: '#ffffff',
    tertiary: '#e5e7eb',
    inverse: '#1c1917',
  },
  text: {
    primary: '#1c1917',
    secondary: '#57534e',
    tertiary: '#78716c',
    inverse: '#ffffff',
    disabled: '#a8a29e',
  },
  border: {
    default: '#d6d3d1',
    hover: '#a8a29e',
    focus: '#2563eb',
    disabled: '#e7e5e4',
  },
  card: {
    background: '#ffffff',
    foreground: '#1c1917',
  },
  popover: {
    background: '#ffffff',
    foreground: '#1c1917',
  },
  input: {
    background: '#ffffff',
    border: '#e7e5e4',
  },
  sidebar: {
    background: '#ffffff',
    foreground: '#1c1917',
    primary: '#2563eb',
    accent: '#f5f5f4',
    border: '#e7e5e4',
  },
  chart: {
    1: '#2563eb',
    2: '#10b981',
    3: '#8b5cf6',
    4: '#f59e0b',
    5: '#ec4899',
  },
};

// Dark Theme Colors
export const darkColors: ColorPalette = {
  primary: {
    50: '#1e3a5f',
    100: '#1e40af',
    200: '#1d4ed8',
    300: '#2563eb',
    400: '#3b82f6',
    500: '#3b82f6', // Main brand color (brighter in dark mode)
    600: '#60a5fa',
    700: '#93c5fd',
    800: '#bfdbfe',
    900: '#dbeafe',
  },
  secondary: {
    50: '#0f172a',
    100: '#1e293b',
    200: '#334155',
    300: '#475569',
    400: '#64748b',
    500: '#94a3b8',
    600: '#cbd5e1',
    700: '#e2e8f0',
    800: '#f1f5f9',
    900: '#f8fafc',
  },
  success: {
    50: '#064e3b',
    100: '#065f46',
    200: '#047857',
    300: '#059669',
    400: '#10b981',
    500: '#34d399',
    600: '#6ee7b7',
    700: '#a7f3d0',
    800: '#d1fae5',
    900: '#ecfdf5',
  },
  warning: {
    50: '#78350f',
    100: '#92400e',
    200: '#b45309',
    300: '#d97706',
    400: '#f59e0b',
    500: '#fbbf24',
    600: '#fcd34d',
    700: '#fde68a',
    800: '#fef3c7',
    900: '#fffbeb',
  },
  danger: {
    50: '#7f1d1d',
    100: '#991b1b',
    200: '#b91c1c',
    300: '#dc2626',
    400: '#ef4444',
    500: '#f87171',
    600: '#fca5a5',
    700: '#fecaca',
    800: '#fee2e2',
    900: '#fef2f2',
  },
  neutral: {
    50: '#0f172a',
    100: '#1e293b',
    200: '#334155',
    300: '#475569',
    400: '#64748b',
    500: '#94a3b8',
    600: '#cbd5e1',
    700: '#e2e8f0',
    800: '#f1f5f9',
    900: '#f8fafc',
  },
  background: {
    primary: '#000000',
    secondary: '#1a1a1a',
    tertiary: '#2a2a2a',
    inverse: '#ffffff',
  },
  text: {
    primary: '#ffffff',
    secondary: '#e5e7eb',
    tertiary: '#d1d5db',
    inverse: '#1c1917',
    disabled: '#9ca3af',
  },
  border: {
    default: '#333333',
    hover: '#404040',
    focus: '#3b82f6',
    disabled: '#333333',
  },
  card: {
    background: '#1a1a1a',
    foreground: '#ffffff',
  },
  popover: {
    background: '#1a1a1a',
    foreground: '#ffffff',
  },
  input: {
    background: '#1a1a1a',
    border: '#333333',
  },
  sidebar: {
    background: '#1a1a1a',
    foreground: '#ffffff',
    primary: '#3b82f6',
    accent: '#2a2a2a',
    border: '#333333',
  },
  chart: {
    1: '#60a5fa',
    2: '#34d399',
    3: '#a78bfa',
    4: '#fbbf24',
    5: '#f472b6',
  },
};

// Get theme colors
export const getThemeColors = (mode: ThemeMode): ColorPalette => {
  return mode === 'dark' ? darkColors : lightColors;
};

// Export current theme (can be used with reactive state)
export const colors = {
  light: lightColors,
  dark: darkColors,
};

