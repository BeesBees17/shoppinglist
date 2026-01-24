import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initializeDb } from "../db";
import { AppNavigator } from "../navigation/AppNavigator";

export const AppRoot = () => {
  useEffect(() => {
    initializeDb();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
};
