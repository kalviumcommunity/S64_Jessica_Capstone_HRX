import { createContext, useContext, useEffect, useState } from "react";

const ThemeProviderContext = createContext({
  theme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "hrms-theme",
}) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const storedTheme = localStorage.getItem(storageKey);
    if (storedTheme) {
      return storedTheme;
    }
    
    // Then check system preference
    if (window.matchMedia) {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    
    // Default fallback
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Add transition class for smooth switching
    root.classList.add('transition-colors', 'duration-300');
    
    // Remove the old theme class
    root.classList.remove(theme === "dark" ? "light" : "dark");
    
    // Add the new theme class
    root.classList.add(theme);
    
    // Store the theme in localStorage
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};