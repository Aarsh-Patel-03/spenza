import React from "react";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "./src/context/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";
import { GroupProvider } from "./src/context/GroupContext";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GroupProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </GroupProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
