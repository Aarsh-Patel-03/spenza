import React, { createContext, useState, useEffect, useCallback } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LIGHT_THEME, DARK_THEME } from "../theme/themes";

export const ThemeContext = createContext();
const STORAGE_KEY = "appThemeMode";

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState("light");
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(STORAGE_KEY);
        const systemMode = Appearance.getColorScheme();
        const initialMode = storedMode || systemMode || "light";

        setThemeMode(initialMode === "dark" ? "dark" : "light");
      } catch (error) {
        setThemeMode("light");
      } finally {
        setIsThemeLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setMode = useCallback(async (mode) => {
    try {
      const nextMode = mode === "dark" ? "dark" : "light";
      setThemeMode(nextMode);
      await AsyncStorage.setItem(STORAGE_KEY, nextMode);
    } catch (error) {
      console.error("Failed to save theme mode", error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(themeMode === "dark" ? "light" : "dark");
  }, [themeMode, setMode]);

  const theme = themeMode === "dark" ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider
      value={{ theme, themeMode, toggleTheme, setMode, isThemeLoading }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
