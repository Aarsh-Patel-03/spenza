import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

const ThemeToggle = ({ style }) => {
  const { themeMode, toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name={
          themeMode === "dark" ? "moon-waning-crescent" : "white-balance-sunny"
        }
        size={24}
        color={theme.text}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ThemeToggle;
