// Swiss Design System - Monochromatic with Single Accent
// Principles: Minimalism, Grid-based, Typography-focused, Functional

export const colors = {
  // Monochromatic Base
  black: '#0A0A0A',
  white: '#FFFFFF',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E8E8E8',
    300: '#D1D1D1',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Single Accent Color - Electric Blue
  accent: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Primary accent
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Role Colors (minimal, professional)
  admin: '#0A0A0A',    // Pure black
  teacher: '#525252',  // Medium gray
  student: '#3B82F6',  // Accent blue
};

export const typography = {
  // Swiss design favors strong hierarchy
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },

  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '4rem',     // 64px
    '7xl': '5rem',     // 80px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  // Swiss design uses precise grid-based spacing
  grid: 8, // Base grid unit (8px)
  xs: '0.5rem',  // 8px
  sm: '1rem',    // 16px
  md: '1.5rem',  // 24px
  lg: '2rem',    // 32px
  xl: '3rem',    // 48px
  '2xl': '4rem', // 64px
  '3xl': '6rem', // 96px
  '4xl': '8rem', // 128px
};

export const layout = {
  // Grid-based layout system
  maxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  containerPadding: {
    mobile: '1.5rem',  // 24px
    tablet: '2rem',    // 32px
    desktop: '3rem',   // 48px
  },
};

export const effects = {
  // Minimal shadows - Swiss design prefers clean edges
  shadow: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },

  // Swiss design uses subtle borders
  border: {
    width: '1px',
    color: colors.gray[200],
  },

  // Minimal border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    md: '0.25rem',  // 4px
    lg: '0.5rem',   // 8px
  },
};

export const animation = {
  // Swiss design prefers subtle, functional animations
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },

  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
  },
};

// Design Principles:
// 1. Use grid-based layouts (multiples of 8px)
// 2. Emphasize typography and hierarchy
// 3. Minimal color - black/white/gray + single accent
// 4. Lots of white space
// 5. Clean edges and precise alignment
// 6. Functional over decorative
// 7. Asymmetric but balanced compositions
