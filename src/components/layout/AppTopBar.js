import React from "react";
import {
  Platform,
  StatusBar,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import ThemeToggle from "../common/ThemeToggle";

const AppTopBar = () => {
  const { theme } = useTheme();
  const { sign_out } = useAuth();

  return (
    <View
      style={[
        styles.topBar,
        { backgroundColor: theme.surface, borderBottomColor: theme.border },
      ]}
    >
      <View style={styles.logoRow}>
        <Text style={[styles.logoText, { color: theme.text }]}>Spenza</Text>
      </View>

      <View style={styles.topBarActions}>
        <ThemeToggle
          style={[
            styles.iconBtn,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        />
        <TouchableOpacity
          style={[
            styles.iconBtn,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
          onPress={sign_out}
          accessibilityLabel="Log out"
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="logout" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 8 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 40,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "600",
  },
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBtn: {
    width: 40,
    height: 40,
    padding: 0,
    // borderWidth: 1,
    // borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AppTopBar;
