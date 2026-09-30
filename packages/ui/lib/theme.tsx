import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
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
  defaultMode = 'system',
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

  const toggleTheme = useCallback(() => {
    // Resolve against the *effective* scheme so toggling from 'system'
    // flips the theme the user actually sees instead of always landing dark.
    setMode((prev) => {
      const effective: 'light' | 'dark' =
        prev === 'system' ? resolvedScheme : prev;
      return effective === 'dark' ? 'light' : 'dark';
    });
  }, [resolvedScheme]);

  const value = useMemo<ThemeContextType>(
    () => ({
      mode,
      colorScheme: resolvedScheme,
      colors: activeColors,
      setMode,
      toggleTheme,
      isDark,
    }),
    [mode, resolvedScheme, activeColors, toggleTheme, isDark],
  );

  return (
    <ThemeContext.Provider value={value}>
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
