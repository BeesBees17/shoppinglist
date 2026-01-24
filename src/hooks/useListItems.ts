import { useCallback, useEffect, useState } from "react";
import { itemRepository } from "../repositories/itemRepository";
import { ItemRecord } from "../utils/types";

export const useListItems = (listId: string) => {
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await itemRepository.getByListId(listId);
    setItems(data);
    setIsLoading(false);
  }, [listId]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, isLoading, reload: load, setItems };
};
