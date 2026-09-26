import React, { createContext, useContext, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { colors, ColorScheme } from './colors';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  mode: ThemeMode;
  colorScheme: 'light' | 'dark';
  colors: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ApexRNProvider({
  children,
  defaultMode = 'light',
}: {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}) {
  const systemColorScheme = useRNColorScheme();
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  const resolvedScheme: 'light' | 'dark' =
    mode === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : mode;

  const activeColors = colors[resolvedScheme];
  const isDark = resolvedScheme === 'dark';

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colorScheme: resolvedScheme,
        colors: activeColors,
        setMode,
        toggleTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    // Safe fallback if rendered outside provider
    return {
      mode: 'light',
      colorScheme: 'light',
      colors: colors.light,
      setMode: () => {},
      toggleTheme: () => {},
      isDark: false,
    };
  }
  return context;
}
