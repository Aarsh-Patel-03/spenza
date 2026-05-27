import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../hooks/useTheme";
import AnalyticsDashboard from "../screens/analytics/AnalyticsDashboard";
import GroupAnalytics from "../screens/analytics/GroupAnalytics";

const Stack = createNativeStackNavigator();

const AnalyticsStackNavigator = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="AnalyticsDashboard"
        component={AnalyticsDashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupAnalytics"
        component={GroupAnalytics}
        options={{ title: "Group Analytics" }}
      />
    </Stack.Navigator>
  );
};

export default AnalyticsStackNavigator;
