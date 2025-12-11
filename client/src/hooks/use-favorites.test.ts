import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "./use-favorites";

// Mock storage service
vi.mock("@/services/storage.service", () => ({
  storageService: {
    getFavorites: vi.fn(() => []),
    setFavorites: vi.fn(),
  },
}));

import { storageService } from "@/services/storage.service";

describe("useFavorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storageService.getFavorites).mockReturnValue([]);
  });

  it("initializes with empty favorites", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it("loads favorites from storage", () => {
    const mockFavorites = [
      { type: "prompt" as const, id: "1" },
      { type: "snippet" as const, id: "2" },
    ];
    vi.mocked(storageService.getFavorites).mockReturnValue(mockFavorites);

    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual(mockFavorites);
  });

  it("toggles favorite", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite("prompt", "1");
    });

    expect(result.current.isFavorite("prompt", "1")).toBe(true);
    expect(storageService.setFavorites).toHaveBeenCalled();
  });

  it("removes favorite when toggled again", () => {
    const mockFavorites = [{ type: "prompt" as const, id: "1" }];
    vi.mocked(storageService.getFavorites).mockReturnValue(mockFavorites);

    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite("prompt", "1");
    });

    expect(result.current.isFavorite("prompt", "1")).toBe(false);
  });
});

