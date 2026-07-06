import { createContext } from "react";

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
