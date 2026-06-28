import { createContext, useEffect, useState, type ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
  setTheme: (dark: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggle: () => {},
  setTheme: () => {},
});

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return true;

  const stored = localStorage.getItem('theme');
  if (stored === 'dark') return true;
  if (stored === 'light') return false;

  // Default to dark to preserve existing branding
  return true;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => getInitialTheme());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);
  const setTheme = (dark: boolean) => setIsDark(dark);

  // Prevent flash of wrong theme on first render
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ isDark: true, toggle, setTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
