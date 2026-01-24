import { View, Text, StyleSheet } from "react-native";
import { theme } from "../design/theme";

type Props = {
  title: string;
  message: string;
};

export const EmptyState = ({ title, message }: Props) => (
  <View style={styles.container} accessibilityRole="summary">
    <Text style={styles.emoji}>🛒</Text>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  emoji: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.subtitle,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
