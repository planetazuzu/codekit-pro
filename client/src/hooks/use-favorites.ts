import { useState, useEffect, useCallback } from "react";
import { storageService } from "@/services/storage.service";
import { STORAGE_KEYS } from "@/lib/constants";

export type FavoriteType = "prompt" | "snippet" | "link" | "guide";

export interface Favorite {
  type: FavoriteType;
  id: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    if (typeof window === "undefined") return [];
    return storageService.getFavorites();
  });

  useEffect(() => {
    storageService.setFavorites(favorites);
  }, [favorites]);

  const addFavorite = useCallback((type: FavoriteType, id: string) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.type === type && f.id === id);
      if (exists) return prev;
      return [...prev, { type, id }];
    });
  }, []);

  const removeFavorite = useCallback((type: FavoriteType, id: string) => {
    setFavorites((prev) => prev.filter((f) => !(f.type === type && f.id === id)));
  }, []);

  const toggleFavorite = useCallback((type: FavoriteType, id: string) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.type === type && f.id === id);
      if (exists) {
        return prev.filter((f) => !(f.type === type && f.id === id));
      } else {
        return [...prev, { type, id }];
      }
    });
  }, []);

  const isFavorite = useCallback(
    (type: FavoriteType, id: string) => {
      return favorites.some((f) => f.type === type && f.id === id);
    },
    [favorites]
  );

  const getFavoritesByType = useCallback(
    (type: FavoriteType) => {
      return favorites.filter((f) => f.type === type).map((f) => f.id);
    },
    [favorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoritesByType,
    clearFavorites,
  };
}



