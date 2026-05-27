import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../hooks/useTheme";
import GroupsList from "../screens/groups/GroupsList";
import GroupDetail from "../screens/groups/GroupDetail";
import ExpenseDetail from "../screens/groups/ExpenseDetail";

const Stack = createNativeStackNavigator();

const GroupsStackNavigator = () => {
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
        name="GroupsList"
        component={GroupsList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExpenseDetail"
        component={ExpenseDetail}
        options={{ title: "Expense Details" }}
      />
    </Stack.Navigator>
  );
};

export default GroupsStackNavigator;
