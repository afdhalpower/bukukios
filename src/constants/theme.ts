export type ColorTokens = {
  primary: string; onPrimary: string; primaryContainer: string; onPrimaryContainer: string;
  primaryFixed: string; primaryFixedDim: string; onPrimaryFixed: string; onPrimaryFixedVariant: string;
  inversePrimary: string;
  secondary: string; onSecondary: string; secondaryContainer: string; onSecondaryContainer: string;
  secondaryFixed: string; secondaryFixedDim: string; onSecondaryFixed: string; onSecondaryFixedVariant: string;
  tertiary: string; onTertiary: string; tertiaryContainer: string; onTertiaryContainer: string;
  tertiaryFixed: string; tertiaryFixedDim: string; onTertiaryFixed: string; onTertiaryFixedVariant: string;
  error: string; onError: string; errorContainer: string; onErrorContainer: string;
  surface: string; onSurface: string; surfaceDim: string; surfaceBright: string;
  surfaceContainerLowest: string; surfaceContainerLow: string; surfaceContainer: string;
  surfaceContainerHigh: string; surfaceContainerHighest: string;
  onSurfaceVariant: string; inverseSurface: string; inverseOnSurface: string;
  outline: string; outlineVariant: string; surfaceTint: string;
  background: string; onBackground: string; surfaceVariant: string;
};

export const colors: ColorTokens = {
  primary: '#4648d4',
  onPrimary: '#ffffff',
  primaryContainer: '#6063ee',
  onPrimaryContainer: '#fffbff',
  primaryFixed: '#e1e0ff',
  primaryFixedDim: '#c0c1ff',
  onPrimaryFixed: '#07006c',
  onPrimaryFixedVariant: '#2f2ebe',
  inversePrimary: '#c0c1ff',
  secondary: '#a93349',
  onSecondary: '#ffffff',
  secondaryContainer: '#fe7488',
  onSecondaryContainer: '#730425',
  secondaryFixed: '#ffdadc',
  secondaryFixedDim: '#ffb2b9',
  onSecondaryFixed: '#400010',
  onSecondaryFixedVariant: '#891933',
  tertiary: '#006949',
  onTertiary: '#ffffff',
  tertiaryContainer: '#00855d',
  onTertiaryContainer: '#f5fff7',
  tertiaryFixed: '#68fcbf',
  tertiaryFixedDim: '#45dfa4',
  onTertiaryFixed: '#002114',
  onTertiaryFixedVariant: '#005137',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  surface: '#f9f9ff',
  onSurface: '#111c2d',
  surfaceDim: '#cfdaf2',
  surfaceBright: '#f9f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  surfaceContainer: '#e7eeff',
  surfaceContainerHigh: '#dee8ff',
  surfaceContainerHighest: '#d8e3fb',
  onSurfaceVariant: '#464554',
  inverseSurface: '#263143',
  inverseOnSurface: '#ecf1ff',
  outline: '#767586',
  outlineVariant: '#c7c4d7',
  surfaceTint: '#494bd6',
  background: '#f9f9ff',
  onBackground: '#111c2d',
  surfaceVariant: '#d8e3fb',
};

export const borderRadius = {
  lg: 16,
  xl: 32,
  full: 9999,
};

export const spacing = {
  base: 4,
  stackSm: 8,
  stackMd: 16,
  stackLg: 32,
  containerPadding: 16,
  gutter: 24,
};

export const typography = {
  displayLg: {
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -0.02,
    fontWeight: '800' as const,
  },
  headlineLg: {
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.01,
    fontWeight: '700' as const,
  },
  headlineMd: {
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
  },
  titleLg: {
    fontFamily: 'HankenGrotesk_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  bodyLg: {
    fontFamily: 'HankenGrotesk_400Regular',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400' as const,
  },
  bodyMd: {
    fontFamily: 'HankenGrotesk_400Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  labelLg: {
    fontFamily: 'HankenGrotesk_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.01,
    fontWeight: '600' as const,
  },
  labelSm: {
    fontFamily: 'HankenGrotesk_500Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.02,
    fontWeight: '500' as const,
  },
  labelBold: {
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.05,
    fontWeight: '700' as const,
  },
};
