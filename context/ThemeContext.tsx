import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  colors: typeof Colors;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  isDark: false,
  colors: Colors,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('app_theme');
      if (storedTheme) {
        setThemeState(storedTheme as Theme);
      }
    } catch (e) {
      console.error('Failed to load theme', e);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem('app_theme', newTheme);
  };

  const isDark = theme === 'system' ? systemScheme === 'dark' : theme === 'dark';

  // In a real implementation, we would return a full color object here based on isDark.
  // For now, we reuse the existing Colors object but could extend it.
  const activeColors = isDark ? {
    ...Colors,
    canvas: '#111827',
    surface: '#1F2937',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
  } : Colors;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, colors: activeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
