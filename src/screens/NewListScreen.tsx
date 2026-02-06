import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { theme } from "../design/theme";
import { ItemInputBar } from "../components/ItemInputBar";
import { Chip } from "../components/Chip";
import { createItemRecord, createListRecord, createStoreRef } from "../utils/listState";
import { listRepository } from "../repositories/listRepository";
import { itemRepository } from "../repositories/itemRepository";
import { getSuggestions } from "../ai/suggestions";
import { features } from "../config/features";
import { ShoppingItem, StoreRef } from "../utils/types";

const quickSuggestions = ["Milk", "Eggs", "Bread"];
const recentStores = ["Trader Joe's", "Whole Foods", "Target"];

type Props = NativeStackScreenProps<RootStackParamList, "NewList">;

export const NewListScreen = ({ navigation }: Props) => {
  const [listName, setListName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [step, setStep] = useState<"details" | "items">("details");
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestedAdds, setSuggestedAdds] = useState<string[]>([]);
  const listRef = useRef<FlatList<ShoppingItem>>(null);

  useEffect(() => {
    if (features.suggestionsEnabled && items.length >= 3) {
      getSuggestions(items.map((item) => item.text), storeName || listName).then(setSuggestedAdds);
    } else {
      setSuggestedAdds([]);
    }
  }, [items, storeName, listName]);

  const handleAddItem = (name: string) => {
    if (!name.trim()) return;
    const normalized = name.trim().toLowerCase();
    const duplicate = items.find((item) => item.text.toLowerCase() === normalized);
    const add = () => {
      Haptics.selectionAsync();
      const next = createItemRecord("draft", name.trim(), items.length + 1);
      setItems((prev) => [...prev, next]);
      setInputValue("");
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    };

    if (duplicate) {
      Alert.alert("Duplicate item", "Already on the list. Add anyway?", [
        { text: "Cancel", style: "cancel" },
        { text: "Add anyway", onPress: add },
      ]);
      return;
    }

    add();
  };

  const canContinue = listName.trim().length > 0;

  const resolvedStore: StoreRef | null = storeName.trim()
    ? createStoreRef(storeName)
    : null;

  const handleSave = async () => {
    if (items.length === 0) {
      Alert.alert("No items yet", "Save this list without items?", [
        { text: "Keep adding", style: "cancel" },
        {
          text: "Save empty list",
          onPress: async () => {
            const list = createListRecord(listName.trim(), resolvedStore);
            await listRepository.create(list);
            navigation.navigate("Home");
          },
        },
      ]);
      return;
    }

    const list = createListRecord(listName.trim(), resolvedStore);
    await listRepository.create(list);
    await Promise.all(
      items.map((item, index) =>
        itemRepository.create({
          ...item,
          id: `item-${list.id}-${index}`,
          listId: list.id,
          position: index,
        })
      )
    );
    navigation.navigate("Home");
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemText}>
        {item.text}
        {item.isRecommended ? " ★" : item.isSuggested ? " •" : ""}
      </Text>
    </View>
  );

  const suggestedChips = useMemo(() => {
    if (items.length > 0) {
      return [] as string[];
    }
    return quickSuggestions;
  }, [items.length]);

  return (
    <View style={styles.container}>
      {step === "details" ? (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Name your list</Text>
          <TextInput
            value={listName}
            onChangeText={setListName}
            placeholder="e.g. Weekly staples"
            style={styles.input}
            autoFocus
            accessibilityLabel="List name"
          />
          <Text style={styles.sectionLabel}>Store (optional)</Text>
          <TextInput
            value={storeName}
            onChangeText={setStoreName}
            placeholder="Select a store"
            style={styles.input}
            accessibilityLabel="Store selection"
          />
          <Text style={styles.sectionLabel}>Recent stores</Text>
          <View style={styles.chipRow}>
            {recentStores.map((store) => (
              <Chip key={store} label={store} onPress={() => setStoreName(store)} />
            ))}
          </View>
          <Pressable
            style={[styles.primaryButton, !canContinue && styles.buttonDisabled]}
            disabled={!canContinue}
            onPress={() => setStep("items")}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Add items</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>{listName || "New list"}</Text>
          <FlatList
            ref={listRef}
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyItems}>
                <Text style={styles.emptyTitle}>Start adding items</Text>
                <Text style={styles.emptyMessage}>
                  Type an item and tap Add to keep the list rolling.
                </Text>
                <View style={styles.chipRow}>
                  {suggestedChips.map((suggestion) => (
                    <Chip
                      key={suggestion}
                      label={suggestion}
                      onPress={() =>
                        setItems((prev) => [
                          ...prev,
                          createItemRecord("draft", suggestion, prev.length + 1, Date.now(), {
                            isSuggested: true,
                          }),
                        ])
                      }
                    />
                  ))}
                </View>
              </View>
            }
          />
          <View style={styles.suggestionsWrapper}>
            {suggestedAdds.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Suggested additions</Text>
                <View style={styles.chipRow}>
                  {suggestedAdds.map((suggestion) => (
                    <Chip
                      key={suggestion}
                      label={suggestion}
                      onPress={() =>
                        setItems((prev) => [
                          ...prev,
                          createItemRecord("draft", suggestion, prev.length + 1, Date.now(), {
                            isRecommended: true,
                          }),
                        ])
                      }
                    />
                  ))}
                </View>
              </>
            )}
          </View>
          <ItemInputBar
            value={inputValue}
            onChangeText={setInputValue}
            onSubmit={() => handleAddItem(inputValue)}
            placeholder="Add item"
            autoFocus
            keepKeyboardOpen
          />
          <Pressable style={styles.doneButton} onPress={handleSave} accessibilityRole="button">
            <Text style={styles.doneButtonText}>Done for now</Text>
          </Pressable>
        </View>
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
  stepContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.title,
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
  },
  input: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 12,
    ...theme.typography.body,
  },
  sectionLabel: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  primaryButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
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
  itemText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  emptyItems: {
    marginTop: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  emptyMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  suggestionsWrapper: {
    marginVertical: theme.spacing.md,
  },
  doneButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.success,
    padding: theme.spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
