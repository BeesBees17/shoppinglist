import { View, Text, StyleSheet, Pressable } from "react-native";
import { theme } from "../design/theme";

type Props = {
  title: string;
  updatedLabel: string;
  checked: number;
  total: number;
  onPress: () => void;
  onLongPress?: () => void;
};

export const ListCard = ({ title, updatedLabel, checked, total, onPress, onLongPress }: Props) => {
  const progress = total === 0 ? 0 : Math.round((checked / total) * 100);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.card}
      accessibilityRole="button"
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.progress}>{`${checked}/${total}`}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.caption}>{updatedLabel}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 16,
    marginBottom: theme.spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...theme.typography.subtitle,
    color: theme.colors.textPrimary,
  },
  progress: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: theme.colors.muted,
    borderRadius: 4,
    marginTop: theme.spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  caption: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
  },
});
