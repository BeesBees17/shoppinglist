import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { theme } from "../design/theme";
import { Chip } from "../components/Chip";
import { ListCard } from "../components/ListCard";
import { EmptyState } from "../components/EmptyState";
import { useLists } from "../hooks/useLists";
import { itemRepository } from "../repositories/itemRepository";
import { listRepository } from "../repositories/listRepository";
import { formatRelativeTime } from "../utils/time";
import { ItemRecord, ListRecord } from "../utils/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type CountMap = Record<string, { total: number; checked: number }>;
type UndoState =
  | { type: "archive"; list: ListRecord }
  | { type: "delete"; list: ListRecord; items: ItemRecord[] }
  | null;

export const HomeScreen = ({ navigation }: Props) => {
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const { lists, reload } = useLists(showArchived);
  const [counts, setCounts] = useState<CountMap>({});
  const [undoState, setUndoState] = useState<UndoState>(null);

  useEffect(() => {
    const loadCounts = async () => {
      const entries = await Promise.all(
        lists.map(async (list) => {
          const count = await itemRepository.getCounts(list.id);
          return [list.id, count] as const;
        })
      );
      setCounts(Object.fromEntries(entries));
    };
    loadCounts();
  }, [lists]);

  const filteredLists = lists.filter((list) =>
    list.shopName.toLowerCase().includes(query.trim().toLowerCase())
  );

  const handleArchive = async (list: ListRecord) => {
    const updated = { ...list, isArchived: true, updatedAt: Date.now() };
    await listRepository.update(updated);
    setUndoState({ type: "archive", list });
    await reload();
  };

  const handleDelete = async (list: ListRecord) => {
    const items = await itemRepository.getByListId(list.id);
    await itemRepository.deleteByListId(list.id);
    await listRepository.delete(list.id);
    setUndoState({ type: "delete", list, items });
    await reload();
  };

  const handleUndo = async () => {
    if (!undoState) return;
    if (undoState.type === "archive") {
      const restored = { ...undoState.list, isArchived: false, updatedAt: Date.now() };
      await listRepository.update(restored);
    }
    if (undoState.type === "delete") {
      await listRepository.create(undoState.list);
      await Promise.all(undoState.items.map((item) => itemRepository.create(item)));
    }
    setUndoState(null);
    await reload();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Lists</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate("NewList")}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>New list</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search lists"
        value={query}
        onChangeText={setQuery}
        accessibilityLabel="Search lists"
      />

      <View style={styles.chipRow}>
        <Chip
          label="Active"
          isActive={!showArchived}
          onPress={() => setShowArchived(false)}
        />
        <Chip
          label="Archived"
          isActive={showArchived}
          onPress={() => {
            setShowArchived(true);
            navigation.navigate("Archived");
          }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredLists.length === 0 ? (
          <EmptyState
            title="Ready to shop?"
            message="Create a list in seconds and check off items as you go."
          />
        ) : (
          filteredLists.map((list) => {
            const count = counts[list.id] ?? { total: 0, checked: 0 };
            return (
              <ListCard
                key={list.id}
                title={list.shopName}
                updatedLabel={formatRelativeTime(list.updatedAt)}
                checked={count.checked}
                total={count.total}
                onPress={() => navigation.navigate("ListDetail", { listId: list.id })}
                onLongPress={() =>
                  Alert.alert("Manage list", "Choose an action", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Archive", onPress: () => handleArchive(list) },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => handleDelete(list),
                    },
                  ])
                }
              />
            );
          })
        )}
      </ScrollView>
      {undoState && (
        <Pressable style={styles.undoBanner} onPress={handleUndo} accessibilityRole="button">
          <Text style={styles.undoText}>Undo last action</Text>
        </Pressable>
      )}
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
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  search: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
  },
  chipRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  undoBanner: {
    backgroundColor: theme.colors.chip,
    padding: theme.spacing.sm,
    borderRadius: 12,
    alignItems: "center",
  },
  undoText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
