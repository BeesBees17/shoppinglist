import { Pressable, Text, StyleSheet } from "react-native";
import { theme } from "../design/theme";

type Props = {
  label: string;
  isActive?: boolean;
  onPress: () => void;
};

export const Chip = ({ label, isActive = false, onPress }: Props) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, isActive && styles.activeChip]}
    accessibilityRole="button"
  >
    <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.muted,
    marginRight: theme.spacing.sm,
  },
  activeChip: {
    backgroundColor: theme.colors.chip,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  activeLabel: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
