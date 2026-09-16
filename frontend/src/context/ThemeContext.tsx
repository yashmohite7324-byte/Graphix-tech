import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** What the user chose: light, dark, or follow the OS */
  theme: Theme;
  /** What is actually on screen right now */
  resolved: 'light' | 'dark';
  setTheme: (t: Theme) => void;
  /** Flip between light and dark, leaving "system" behind */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'graphix-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
  });

  const [resolved, setResolved] = useState<'light' | 'dark'>(() =>
    theme === 'system' ? getSystemTheme() : theme
  );

  // Apply the class to <html> so every CSS variable switches at once
  useEffect(() => {
    const actual = theme === 'system' ? getSystemTheme() : theme;
    setResolved(actual);

    const root = document.documentElement;
    root.classList.toggle('dark', actual === 'dark');
    // Keeps native controls (scrollbars, form widgets) in the right mode
    root.style.colorScheme = actual;

    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Follow the OS live, but only while the user is on "system"
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const actual = getSystemTheme();
      setResolved(actual);
      document.documentElement.classList.toggle('dark', actual === 'dark');
      document.documentElement.style.colorScheme = actual;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggle = () => setThemeState(resolved === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
