import { useCallback, useEffect, useState } from "react";
import { listRepository } from "../repositories/listRepository";
import { ListRecord } from "../utils/types";

export const useLists = (isArchived: boolean) => {
  const [lists, setLists] = useState<ListRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await listRepository.getAll(isArchived);
    setLists(data);
    setIsLoading(false);
  }, [isArchived]);

  useEffect(() => {
    load();
  }, [load]);

  return { lists, isLoading, reload: load };
};
