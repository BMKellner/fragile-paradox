"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "foliage-theme";
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function getThemeFromStorage() {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "light" || savedTheme === "dark" ? savedTheme : null;
}

function resolvePreferredTheme(): Theme {
  const savedTheme = getThemeFromStorage();
  if (savedTheme) return savedTheme;
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initialTheme = resolvePreferredTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);

    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      const savedTheme = getThemeFromStorage();
      if (savedTheme) return;

      const nextTheme: Theme = event.matches ? "dark" : "light";
      setTheme(nextTheme);
      applyTheme(nextTheme);
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const setThemePreference = useCallback((nextTheme: Theme) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme: Theme = currentTheme === "light" ? "dark" : "light";
      applyTheme(nextTheme);
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      return nextTheme;
    });
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    setTheme: setThemePreference,
    toggleTheme,
  };
}
