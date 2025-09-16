'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');
  const [size, setSizeState] = useState('medium'); // <-- NOVO ESTADO
  const [mounted, setMounted] = useState(false);

  const applyTheme = (newTheme) => {
    document.documentElement.classList.remove('light', 'dark', 'dracula');
    document.documentElement.classList.add(newTheme);
  };

  // <-- NOVA FUNÇÃO para aplicar o tamanho da fonte -->
  const applySize = (newSize) => {
    document.documentElement.classList.remove('text-small', 'text-medium', 'text-giga');
    document.documentElement.classList.add(`text-${newSize}`);
  };

  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setThemeState(savedTheme);
    applyTheme(savedTheme);

    // <-- NOVO: Carrega o tamanho salvo ao iniciar -->
    const savedSize = localStorage.getItem('size') || 'medium';
    setSizeState(savedSize);
    applySize(savedSize);
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // <-- NOVA FUNÇÃO para alterar o tamanho -->
  const setSize = (newSize) => {
    setSizeState(newSize);
    localStorage.setItem('size', newSize);
    applySize(newSize);
  };

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'dracula'];
    const currentIndex = themes.indexOf(theme);
    const next = themes[(currentIndex + 1) % themes.length];
    setTheme(next);
  };

  if (!mounted) return null;

  return (
      // <-- Adicione 'size' e 'setSize' ao value do Provider -->
      <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, size, setSize }}>
        {children}
      </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);