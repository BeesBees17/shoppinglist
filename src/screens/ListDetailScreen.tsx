import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  TextInput,
} from "react-native";
import * as Haptics from "expo-haptics";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { theme } from "../design/theme";
import { listRepository } from "../repositories/listRepository";
import { itemRepository } from "../repositories/itemRepository";
import { useListItems } from "../hooks/useListItems";
import { ShoppingItem, ShoppingList, StoreRef } from "../utils/types";
import { calculateProgress, createItemRecord, createStoreRef, sortItemsForDisplay, toggleItemChecked } from "../utils/listState";
import { ItemInputBar } from "../components/ItemInputBar";

const createUndoTimeout = (callback: () => void) => setTimeout(callback, 4000);

type Props = NativeStackScreenProps<RootStackParamList, "ListDetail">;

export const ListDetailScreen = ({ route, navigation }: Props) => {
  const { listId } = route.params;
  const { items, setItems, reload } = useListItems(listId);
  const [list, setList] = useState<ShoppingList | null>(null);
  const [showChecked, setShowChecked] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [lastToggled, setLastToggled] = useState<ShoppingItem | null>(null);
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [lastDeleted, setLastDeleted] = useState<ShoppingItem | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [storeInput, setStoreInput] = useState("");

  useEffect(() => {
    listRepository.getById(listId).then(setList);
  }, [listId]);

  useEffect(() => {
    if (list) {
      setNameInput(list.name);
      setStoreInput(list.store?.name ?? "");
    }
  }, [list]);

  useEffect(() => {
    if (!list || list.isArchived || list.isActive) {
      return;
    }
    const updated = { ...list, isActive: true, updatedAt: Date.now() };
    listRepository.update(updated).then(() => setList(updated));
  }, [list]);

  const displayItems = useMemo(() => {
    const sorted = sortItemsForDisplay(items);
    return showChecked ? sorted : sorted.filter((item) => !item.isChecked);
  }, [items, showChecked]);

  const progress = calculateProgress(items);

  const handleToggleItem = async (item: ShoppingItem) => {
    Haptics.selectionAsync();
    const updated = toggleItemChecked(item);
    setItems((prev) => prev.map((entry) => (entry.id === item.id ? updated : entry)));
    await itemRepository.update(updated);
    setLastToggled(updated);
    if (undoTimer) clearTimeout(undoTimer);
    setUndoTimer(createUndoTimeout(() => setLastToggled(null)));
  };

  const handleUndoToggle = async () => {
    if (!lastToggled) return;
    const reverted = toggleItemChecked(lastToggled);
    setItems((prev) => prev.map((entry) => (entry.id === lastToggled.id ? reverted : entry)));
    await itemRepository.update(reverted);
    setLastToggled(null);
  };

  const handleAddItem = async () => {
    if (!inputValue.trim()) return;
    Haptics.selectionAsync();
    const newItem = createItemRecord(listId, inputValue.trim(), items.length + 1);
    const updatedList = items.concat(newItem);
    setItems(updatedList);
    setInputValue("");
    await itemRepository.create(newItem);
    await reload();
  };

  const handleDeleteItem = (item: ShoppingItem) => {
    Alert.alert("Remove item", `Delete ${item.text}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await itemRepository.delete(item.id);
          setItems((prev) => prev.filter((entry) => entry.id !== item.id));
          setLastDeleted(item);
        },
      },
    ]);
  };

  const handleUndoDelete = async () => {
    if (!lastDeleted) return;
    await itemRepository.create(lastDeleted);
    setItems((prev) => [...prev, lastDeleted]);
    setLastDeleted(null);
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <Pressable
      style={[styles.itemRow, item.isChecked && styles.checkedItem]}
      onPress={() => handleToggleItem(item)}
      onLongPress={() => handleDeleteItem(item)}
      accessibilityRole="button"
    >
      <View style={styles.itemTextRow}>
        <Text style={[styles.itemText, item.isChecked && styles.checkedText]}>{item.text}</Text>
        {(item.isRecommended || item.isSuggested) && (
          <Text style={styles.recoBadge}>{item.isRecommended ? "Recommended" : "Suggested"}</Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {isEditingName ? (
          <View style={styles.editInputs}>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              style={styles.nameInput}
              accessibilityLabel="Edit list name"
            />
            <TextInput
              value={storeInput}
              onChangeText={setStoreInput}
              style={styles.nameInput}
              placeholder="Store (optional)"
              accessibilityLabel="Edit store"
            />
          </View>
        ) : (
          <View>
            <Text style={styles.title}>{list?.name ?? "List"}</Text>
            <Text style={styles.subtitle}>{list?.store?.name ?? "No store selected"}</Text>
          </View>
        )}
        <Pressable
          style={styles.toggleButton}
          onPress={() => setShowChecked((prev) => !prev)}
          accessibilityRole="button"
        >
          <Text style={styles.toggleText}>{showChecked ? "Hide checked" : "Show checked"}</Text>
        </Pressable>
      </View>
      <View style={styles.actionRow}>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => setIsEditingName((prev) => !prev)}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryText}>{isEditingName ? "Cancel" : "Edit details"}</Text>
        </Pressable>
        {list && (
          <Pressable
            style={styles.secondaryButton}
            onPress={async () => {
              const updated = { ...list, isActive: !list.isActive, updatedAt: Date.now() };
              await listRepository.update(updated);
              setList(updated);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryText}>{list.isActive ? "Remove active" : "Keep active"}</Text>
          </Pressable>
        )}
        {isEditingName && (
          <Pressable
            style={styles.secondaryButton}
            onPress={async () => {
              if (!list) return;
              const trimmedName = nameInput.trim();
              const trimmedStore = storeInput.trim();
              const store: StoreRef | null = trimmedStore ? createStoreRef(trimmedStore) : null;
              const updated = {
                ...list,
                name: trimmedName || list.name,
                store,
                updatedAt: Date.now(),
              };
              await listRepository.update(updated);
              setList(updated);
              setIsEditingName(false);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryText}>Save</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.progressLabel}>{`${progress.checked} of ${progress.total} checked`}</Text>

      <FlatList
        data={displayItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      {lastToggled && (
        <Pressable style={styles.undoBanner} onPress={handleUndoToggle} accessibilityRole="button">
          <Text style={styles.undoText}>Undo last check</Text>
        </Pressable>
      )}

      {lastDeleted && (
        <Pressable style={styles.undoBanner} onPress={handleUndoDelete} accessibilityRole="button">
          <Text style={styles.undoText}>Undo delete</Text>
        </Pressable>
      )}

      <ItemInputBar
        value={inputValue}
        onChangeText={setInputValue}
        onSubmit={handleAddItem}
        placeholder="Add item"
      />
      <Pressable
        style={styles.archiveButton}
        onPress={async () => {
          if (!list) return;
          const updated = { ...list, isArchived: true, isActive: false, updatedAt: Date.now() };
          await listRepository.update(updated);
          navigation.goBack();
        }}
        accessibilityRole="button"
      >
        <Text style={styles.archiveText}>Archive list</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  toggleButton: {
    backgroundColor: theme.colors.chip,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
  },
  toggleText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  progressLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  secondaryButton: {
    backgroundColor: theme.colors.muted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 12,
  },
  secondaryText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  nameInput: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: 12,
    width: "100%",
    ...theme.typography.subtitle,
  },
  editInputs: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  itemRow: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
  },
  itemTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkedItem: {
    backgroundColor: theme.colors.muted,
  },
  itemText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  recoBadge: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  checkedText: {
    textDecorationLine: "line-through",
    color: theme.colors.textSecondary,
  },
  undoBanner: {
    backgroundColor: theme.colors.chip,
    padding: theme.spacing.sm,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  undoText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  archiveButton: {
    marginTop: theme.spacing.md,
    alignItems: "center",
  },
  archiveText: {
    color: theme.colors.textSecondary,
  },
});
