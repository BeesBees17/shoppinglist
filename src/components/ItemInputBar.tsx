import { View, TextInput, Pressable, Text, StyleSheet, Keyboard } from "react-native";
import { theme } from "../design/theme";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  keepKeyboardOpen?: boolean;
};

export const ItemInputBar = ({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  autoFocus,
  keepKeyboardOpen = false,
}: Props) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        returnKeyType="done"
        onSubmitEditing={() => {
          onSubmit();
          if (!keepKeyboardOpen) {
            Keyboard.dismiss();
          }
        }}
        autoFocus={autoFocus}
        accessibilityLabel={placeholder ?? "Add item"}
      />
      <Pressable style={styles.button} onPress={onSubmit} accessibilityRole="button">
        <Text style={styles.buttonText}>Add</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.muted,
  },
  input: {
    flex: 1,
    padding: theme.spacing.sm,
    ...theme.typography.body,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
