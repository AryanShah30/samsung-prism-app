import { Colors } from './colors';

export const Spacing = {
  xs: 4,    
  sm: 8,     
  md: 12,   
  lg: 16,     
  xl: 20,    
  '2xl': 24,  
  '3xl': 32,  
  '4xl': 40,  
  '5xl': 48,  
  '6xl': 64,  
  '7xl': 80,  
  '8xl': 96,  
};

export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 16,
  },
};

export const getShadow = (size = 'sm') => {
  return Shadows[size] || Shadows.sm;
};

export const ComponentVariants = {
  button: {
    primary: {
      backgroundColor: '#6366F1',
      borderColor: '#6366F1',
      textColor: '#FFFFFF',
    },
    secondary: {
      backgroundColor: '#F3F4F6',
      borderColor: '#D1D5DB',
      textColor: '#111827',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: '#6366F1',
      textColor: '#6366F1',
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textColor: '#6366F1',
    },
    danger: {
      backgroundColor: '#EF4444',
      borderColor: '#EF4444',
      textColor: '#FFFFFF',
    },
  },
  
  card: {
    default: {
      backgroundColor: '#FFFFFF',
      borderColor: '#F3F4F6',
      shadow: 'sm',
    },
    elevated: {
      backgroundColor: '#FFFFFF',
      borderColor: 'transparent',
      shadow: 'md',
    },
    outlined: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      shadow: 'none',
    },
  },
  
  input: {
    default: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      textColor: '#111827',
    },
    focused: {
      backgroundColor: '#FFFFFF',
      borderColor: '#6366F1',
      textColor: '#111827',
    },
    error: {
      backgroundColor: '#FFFFFF',
      borderColor: '#EF4444',
      textColor: '#111827',
    },
    disabled: {
      backgroundColor: '#F9FAFB',
      borderColor: '#E5E7EB',
      textColor: '#9CA3AF',
    },
  },
};

export const Layout = {
  screenPadding: Spacing.lg,
  
  headerHeight: 60,
  
  tabBarHeight: 80,
  
  cardPadding: Spacing.lg,
  
  buttonHeight: {
    sm: 32,
    md: 40,
    lg: 48,
  },
  
  inputHeight: {
    sm: 32,
    md: 40,
    lg: 48,
  },

  iconSize: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
  },
};

export const Animation = {
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
};

export const ZIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

export default {
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
  ComponentVariants,
  Layout,
  Animation,
  ZIndex,
};
