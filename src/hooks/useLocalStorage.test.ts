import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("returns initial value when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("returns stored value from localStorage", () => {
    localStorage.setItem("existing-key", JSON.stringify("stored-value"));
    const { result } = renderHook(() => useLocalStorage("existing-key", "default"));
    expect(result.current[0]).toBe("stored-value");
  });

  it("updates localStorage when setValue is called", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
    expect(JSON.parse(localStorage.getItem("test-key") || "")).toBe("updated");
  });

  it("supports function updates", () => {
    const { result } = renderHook(() => useLocalStorage<number>("counter", 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(6);
  });

  it("handles complex objects", () => {
    const initialObj = { name: "test", count: 0, nested: { value: true } };
    const { result } = renderHook(() => useLocalStorage("obj-key", initialObj));

    expect(result.current[0]).toEqual(initialObj);

    act(() => {
      result.current[1]({ ...initialObj, count: 5 });
    });

    expect(result.current[0].count).toBe(5);
  });

  it("handles arrays", () => {
    const { result } = renderHook(() => useLocalStorage<string[]>("arr-key", []));

    act(() => {
      result.current[1](["item1", "item2"]);
    });

    expect(result.current[0]).toEqual(["item1", "item2"]);
  });

  it("returns initial value on JSON parse error", () => {
    localStorage.setItem("bad-json", "not-valid-json{");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage("bad-json", "fallback"));

    expect(result.current[0]).toBe("fallback");
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("maintains separate state for different keys", () => {
    const { result: result1 } = renderHook(() => useLocalStorage("key1", "value1"));
    const { result: result2 } = renderHook(() => useLocalStorage("key2", "value2"));

    expect(result1.current[0]).toBe("value1");
    expect(result2.current[0]).toBe("value2");

    act(() => {
      result1.current[1]("updated1");
    });

    expect(result1.current[0]).toBe("updated1");
    expect(result2.current[0]).toBe("value2");
  });
});


describe('durable local storage', () => {
  it('retains the last saved value when storage is full', () => {
    localStorage.setItem('history', JSON.stringify(['previous']));
    const { result } = renderHook(() => useLocalStorage('history', [] as string[]));
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('full', 'QuotaExceededError'); });
    act(() => { expect(result.current[1](['next'])).toBe(false); });
    expect(result.current[0]).toEqual(['previous']);
    expect(JSON.parse(localStorage.getItem('history')!)).toEqual(['previous']);
    spy.mockRestore();
  });

  it('switches keys without showing or writing the previous account value', () => {
    localStorage.setItem('A', JSON.stringify(['private']));
    const { result, rerender } = renderHook(({ key }) => useLocalStorage(key, [] as string[]), { initialProps: { key: 'A' } });
    rerender({ key: 'B' });
    expect(result.current[0]).toEqual([]);
    act(() => { result.current[1](['B only']); });
    expect(JSON.parse(localStorage.getItem('A')!)).toEqual(['private']);
    expect(JSON.parse(localStorage.getItem('B')!)).toEqual(['B only']);
  });

  it('keeps functional updates in one event and other consumers in sync', () => {
    const first = renderHook(() => useLocalStorage('shared', 0));
    const second = renderHook(() => useLocalStorage('shared', 0));
    act(() => {
      first.result.current[1](value => value + 1);
      first.result.current[1](value => value + 1);
    });
    expect(first.result.current[0]).toBe(2);
    expect(second.result.current[0]).toBe(2);
  });
});
