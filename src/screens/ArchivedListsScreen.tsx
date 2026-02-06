import { View, Text, StyleSheet, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { theme } from "../design/theme";
import { useLists } from "../hooks/useLists";
import { EmptyState } from "../components/EmptyState";
import { ListCard } from "../components/ListCard";
import { itemRepository } from "../repositories/itemRepository";
import { useEffect, useState } from "react";
import { formatRelativeTime } from "../utils/time";

type Props = NativeStackScreenProps<RootStackParamList, "Archived">;

type CountMap = Record<string, { total: number; checked: number }>;

export const ArchivedListsScreen = ({ navigation }: Props) => {
  const { lists } = useLists(true);
  const [counts, setCounts] = useState<CountMap>({});

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Archived Lists</Text>
      <ScrollView contentContainerStyle={styles.listContent}>
        {lists.length === 0 ? (
          <EmptyState
            title="No archived lists"
            message="Archive lists to hide them from your active view."
          />
        ) : (
          lists.map((list) => {
            const count = counts[list.id] ?? { total: 0, checked: 0 };
            return (
              <ListCard
                key={list.id}
                title={list.name}
                subtitle={list.store?.name ?? "No store selected"}
                updatedLabel={formatRelativeTime(list.updatedAt)}
                checked={count.checked}
                total={count.total}
                onPress={() => navigation.navigate("ListDetail", { listId: list.id })}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
});
