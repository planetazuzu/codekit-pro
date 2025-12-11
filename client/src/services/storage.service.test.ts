import { describe, it, expect, beforeEach, vi } from "vitest";
import { storageService } from "./storage.service";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("storageService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("get", () => {
    it("returns null for non-existent key", () => {
      expect(storageService.get("non-existent")).toBeNull();
    });

    it("returns parsed value for existing key", () => {
      localStorage.setItem("test-key", JSON.stringify({ foo: "bar" }));
      expect(storageService.get("test-key")).toEqual({ foo: "bar" });
    });

    it("returns null when parse fails", () => {
      localStorage.setItem("test-key", "invalid-json");
      expect(storageService.get("test-key")).toBeNull();
    });
  });

  describe("set", () => {
    it("stores string value", () => {
      storageService.set("test-key", "value");
      expect(localStorage.getItem("test-key")).toBe('"value"');
    });

    it("stores object value as JSON", () => {
      const obj = { foo: "bar" };
      storageService.set("test-key", obj);
      expect(localStorage.getItem("test-key")).toBe(JSON.stringify(obj));
    });
  });

  describe("remove", () => {
    it("removes existing key", () => {
      localStorage.setItem("test-key", "value");
      storageService.remove("test-key");
      expect(localStorage.getItem("test-key")).toBeNull();
    });
  });

  describe("clear", () => {
    it("clears all storage", () => {
      localStorage.setItem("key1", "value1");
      localStorage.setItem("key2", "value2");
      storageService.clear();
      expect(localStorage.getItem("key1")).toBeNull();
      expect(localStorage.getItem("key2")).toBeNull();
    });
  });
});

