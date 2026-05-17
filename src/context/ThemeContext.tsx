import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { colors as lightColors, ColorTokens } from '@/constants/theme';
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

const ColorsContext = createContext<ColorTokens>(lightColors);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [currentColors, setCurrentColors] = useState<ColorTokens>(lightColors);

  useEffect(() => {
    setCurrentColors(theme === 'dark' ? darkColors : lightColors);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ColorsContext.Provider value={currentColors}>
        {children}
      </ColorsContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}

export function useColors(): ColorTokens {
  return useContext(ColorsContext);
}
