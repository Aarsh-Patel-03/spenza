import React from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthNavigator } from "./AuthNavigator";
import AppTabNavigator from "./AppTabNavigator";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { isLoading, userToken } = useAuth();
  const { theme, themeMode, isThemeLoading } = useTheme();

  if (isLoading || isThemeLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme?.background ?? "#fff" },
        ]}
      >
        <ActivityIndicator size="large" color={theme?.primary ?? "#6366F1"} />
      </View>
    );
  }

  const navigationTheme = {
    dark: themeMode === "dark",
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: theme.secondary,
    },
    fonts: {
      regular: { fontFamily: Platform.OS === "ios" ? "System" : "sans-serif" },
      medium: {
        fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
      },
      bold: {
        fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-bold",
      },
      heavy: {
        fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-black",
      },
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <Stack.Group>
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen
              name="AppTabs"
              component={AppTabNavigator}
              options={{ title: "App" }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "600",
  },
});
