import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'bonfire';

const STORAGE_KEY = 'theme';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** Bonfire crackle on/off (only plays in bonfire mode). */
  sound: boolean;
  setSound: (on: boolean) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'bonfire') return saved;
  } catch {
    // ignore
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Applies the theme as classes on <html>: bonfire is "dark bonfire" so dark: utilities apply. */
export function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme !== 'light');
  root.classList.toggle('bonfire', theme === 'bonfire');
  root.style.colorScheme = theme === 'light' ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  // Sound starts off on every visit: browsers only allow audio after a click anyway.
  const [sound, setSound] = useState(false);

  useEffect(() => {
    applyThemeClass(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    // Picking bonfire is a click, so it can start the fire sound right away.
    setSound(next === 'bonfire');
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme, sound, setSound }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
