import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "../hooks/useTheme";
import AppBottomNav from "../components/layout/AppBottomNav";
import AppTopBar from "../components/layout/AppTopBar";
import InnerHome from "../screens/InnerHome";
import ProfileScreen from "../screens/profile/ProfileScreen";
import GroupsStackNavigator from "./GroupsStackNavigator";
import AnalyticsStackNavigator from "./AnalyticsStackNavigator";

const Tab = createBottomTabNavigator();

const AppTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <AppTopBar />
      <View style={styles.content}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.textSecondary,
          }}
          tabBar={(props) => <AppBottomNav {...props} />}
        >
          <Tab.Screen
            name="HomeTab"
            component={InnerHome}
            options={{
              title: "Home",
            }}
          />
          <Tab.Screen
            name="GroupsTab"
            component={GroupsStackNavigator}
            options={{
              title: "Groups",
            }}
          />
          <Tab.Screen
            name="AnalyticsTab"
            component={AnalyticsStackNavigator}
            options={{
              title: "Analytics",
            }}
          />
          <Tab.Screen
            name="ProfileTab"
            component={ProfileScreen}
            options={{
              title: "Profile",
            }}
          />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default AppTabNavigator;
