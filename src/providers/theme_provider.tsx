import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "sunset" | "ocean";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "watchlist-theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Load theme from localStorage or default to dark
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return (savedTheme as Theme) || "dark";
  });

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;

    // Remove all theme attributes
    root.removeAttribute("data-theme");

    // Apply new theme (dark is default in :root, so no data-theme needed)
    if (theme !== "dark") {
      root.setAttribute("data-theme", theme);
    }

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
