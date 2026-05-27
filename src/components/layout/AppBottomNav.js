import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

const TAB_CONFIG = {
  HomeTab: {
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  GroupsTab: {
    label: "Groups",
    icon: "account-group-outline",
    activeIcon: "account-group",
  },
  AnalyticsTab: {
    label: "Analytics",
    icon: "chart-bar",
    activeIcon: "chart-bar",
  },
  ProfileTab: {
    label: "Profile",
    icon: "account-outline",
    activeIcon: "account",
  },
};

const AppBottomNav = ({ state, navigation }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.bottomNav,
        { backgroundColor: theme.surface, borderTopColor: theme.border },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name];

        if (!config) {
          return null;
        }

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <React.Fragment key={route.key}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={onPress}
              accessibilityLabel={config.label}
            >
              {isFocused && (
                <View
                  style={[styles.navPip, { backgroundColor: theme.primary }]}
                />
              )}
              <MaterialCommunityIcons
                name={isFocused ? config.activeIcon : config.icon}
                size={24}
                color={isFocused ? theme.primary : theme.textSecondary}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: isFocused ? theme.primary : theme.textSecondary },
                ]}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingBottom: 8,
    position: "relative",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
    position: "relative",
  },
  navPip: {
    position: "absolute",
    top: 0,
    width: 20,
    height: 2,
    borderRadius: 2,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});

export default AppBottomNav;
