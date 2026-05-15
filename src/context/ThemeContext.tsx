import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { colors, ColorTokens } from '@/constants/theme';
import { darkColors } from '@/constants/themeDark';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

function applyColors(source: typeof colors) {
  (Object.keys(source) as (keyof ColorTokens)[]).forEach((key) => {
    colors[key] = source[key];
  });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    applyColors(theme === 'dark' ? darkColors : lightThemeColors);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}

const lightThemeColors = Object.fromEntries(
  Object.keys(darkColors).map((k) => [k, (colors as any)[k]])
) as typeof colors;
