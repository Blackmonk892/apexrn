import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { presets, type ColorScheme, type Elevation, type PresetName } from './colors';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  mode: ThemeMode;
  colorScheme: 'light' | 'dark';
  colors: ColorScheme;
  preset: PresetName;
  elevation: Elevation;
  scrimOpacity: number;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

let warnedMissingProvider = false;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ApexRNProvider({
  children,
  defaultMode = 'system',
  preset = 'neo',
}: {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  preset?: PresetName;
}) {
  const systemColorScheme = useRNColorScheme();
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  const resolvedScheme: 'light' | 'dark' =
    mode === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : mode;

  const active = presets[preset];
  const activeColors = active[resolvedScheme];
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
      preset,
      elevation: active.elevation,
      scrimOpacity: active.scrimOpacity[resolvedScheme],
      setMode,
      toggleTheme,
      isDark,
    }),
    [mode, resolvedScheme, activeColors, preset, active, toggleTheme, isDark],
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
    // The fallback keeps components renderable in isolation; the dev warning
    // exposes the missing provider, which otherwise leaves the theme silently stuck on light.
    if (__DEV__ && !warnedMissingProvider) {
      warnedMissingProvider = true;
      console.warn(
        '[apexrn] useTheme() was called outside <ApexRNProvider>. Falling back to the light theme; wrap your app root in <ApexRNProvider>.',
      );
    }
    return {
      mode: 'light',
      colorScheme: 'light',
      colors: presets.neo.light,
      preset: 'neo',
      elevation: presets.neo.elevation,
      scrimOpacity: presets.neo.scrimOpacity.light,
      setMode: () => {},
      toggleTheme: () => {},
      isDark: false,
    };
  }
  return context;
}
