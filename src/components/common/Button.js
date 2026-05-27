import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";

const Button = ({
  onPress,
  title,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = "primary",
}) => {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;
  const styles = getStyles(theme);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`button_${variant}`],
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.surface} />
      ) : (
        <Text style={[styles.buttonText, styles[`text_${variant}`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    button: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
    },
    button_primary: {
      backgroundColor: theme.primary,
    },
    button_secondary: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    text_primary: {
      color: theme.surface,
    },
    text_secondary: {
      color: theme.primary,
    },
  });

export default Button;
