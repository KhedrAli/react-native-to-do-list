import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppTheme, DARK_THEME, LIGHT_THEME } from '../constants/themes';
import { loadDarkModePreference, saveDarkModePreference } from '../utils/storage';

interface ThemeContextValue {
  theme: AppTheme;
  isDark: boolean;
  toggleDarkMode: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: LIGHT_THEME,
  isDark: false,
  toggleDarkMode: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadDarkModePreference().then(setIsDark);
  }, []);

  const toggleDarkMode = async () => {
    const next = !isDark;
    setIsDark(next);
    await saveDarkModePreference(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: isDark ? DARK_THEME : LIGHT_THEME,
        isDark,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);