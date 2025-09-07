'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {

    setMounted(true);

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    document.documentElement.classList.remove('light', 'dark', 'dracula');
    document.documentElement.classList.add(savedTheme);
  }, []);

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'dracula'];
    const currentIndex = themes.indexOf(theme);
    const next = themes[(currentIndex + 1) % themes.length];

    setTheme(next);
    localStorage.setItem('theme', next);

    document.documentElement.classList.remove('light', 'dark', 'dracula');
    document.documentElement.classList.add(next);
  };

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
