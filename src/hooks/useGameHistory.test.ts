import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameHistory, GameResult } from "./useGameHistory";

// These tests exercise the signed-out (localStorage) path. useGameHistory now
// reads auth state via useAuth, which requires an AuthProvider — mock it with
// a resolved, signed-out session so the hook stays in guest mode.
vi.mock("./useAuth", () => ({
  useAuth: () => ({
    user: null,
    session: null,
    isLoading: false,
    isAuthReady: true,
    authError: null,
    isAuthenticated: false,
  }),
}));

describe("useGameHistory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const createMockGame = (overrides: Partial<Omit<GameResult, "id" | "timestamp">> = {}): Omit<GameResult, "id" | "timestamp"> => ({
    outcome: "won",
    killer: "Dr. Fright",
    location: "Creech Manor",
    finalGirl: "Nancy",
    ...overrides,
  });

  describe("recordGame", () => {
    it("adds a new game with generated id and timestamp", () => {
      const { result } = renderHook(() => useGameHistory());

      let recorded: GameResult;
      act(() => {
        recorded = result.current.recordGame(createMockGame());
      });

      expect(recorded!.id).toBeDefined();
      expect(recorded!.timestamp).toBeDefined();
      expect(result.current.gameHistory).toHaveLength(1);
      expect(result.current.gameHistory[0].killer).toBe("Dr. Fright");
    });

    it("adds new games at the beginning of history", () => {
      const { result } = renderHook(() => useGameHistory());

      act(() => {
        result.current.recordGame(createMockGame({ killer: "First" }));
      });
      act(() => {
        result.current.recordGame(createMockGame({ killer: "Second" }));
      });

      expect(result.current.gameHistory[0].killer).toBe("Second");
      expect(result.current.gameHistory[1].killer).toBe("First");
    });

    it("includes optional fields when provided", () => {
      const { result } = renderHook(() => useGameHistory());

      act(() => {
        result.current.recordGame(createMockGame({
          introStory: "A dark night...",
          gameHighlights: "Epic battle",
          finalHorrorLevel: 5,
          victimsSaved: 3,
          victimsKilled: 2,
        }));
      });

      const game = result.current.gameHistory[0];
      expect(game.introStory).toBe("A dark night...");
      expect(game.finalHorrorLevel).toBe(5);
      expect(game.victimsSaved).toBe(3);
    });
  });

  describe("updateGame", () => {
    it("updates an existing game by id", () => {
      const { result } = renderHook(() => useGameHistory());

      let gameId: string;
      act(() => {
        const game = result.current.recordGame(createMockGame());
        gameId = game.id;
      });

      act(() => {
        result.current.updateGame(gameId!, { endingNarration: "And she survived..." });
      });

      expect(result.current.gameHistory[0].endingNarration).toBe("And she survived...");
    });

    it("does not affect other games", () => {
      const { result } = renderHook(() => useGameHistory());

      let firstId: string;
      act(() => {
        const first = result.current.recordGame(createMockGame({ killer: "First" }));
        firstId = first.id;
        result.current.recordGame(createMockGame({ killer: "Second" }));
      });

      act(() => {
        result.current.updateGame(firstId!, { killer: "Updated" });
      });

      expect(result.current.gameHistory.find(g => g.id === firstId)?.killer).toBe("Updated");
      expect(result.current.gameHistory.find(g => g.killer === "Second")).toBeDefined();
    });
  });

  describe("deleteGame", () => {
    it("removes a game by id", () => {
      const { result } = renderHook(() => useGameHistory());

      let gameId: string;
      act(() => {
        const game = result.current.recordGame(createMockGame());
        gameId = game.id;
      });

      expect(result.current.gameHistory).toHaveLength(1);

      act(() => {
        result.current.deleteGame(gameId!);
      });

      expect(result.current.gameHistory).toHaveLength(0);
    });

    it("only removes the specified game", () => {
      const { result } = renderHook(() => useGameHistory());

      let targetId: string;
      act(() => {
        result.current.recordGame(createMockGame({ killer: "Keep1" }));
        const target = result.current.recordGame(createMockGame({ killer: "Delete" }));
        targetId = target.id;
        result.current.recordGame(createMockGame({ killer: "Keep2" }));
      });

      act(() => {
        result.current.deleteGame(targetId!);
      });

      expect(result.current.gameHistory).toHaveLength(2);
      expect(result.current.gameHistory.every(g => g.killer !== "Delete")).toBe(true);
    });
  });

  describe("clearHistory", () => {
    it("removes all games", () => {
      const { result } = renderHook(() => useGameHistory());

      act(() => {
        result.current.recordGame(createMockGame());
        result.current.recordGame(createMockGame());
        result.current.recordGame(createMockGame());
      });

      expect(result.current.gameHistory).toHaveLength(3);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.gameHistory).toHaveLength(0);
    });
  });

  describe("getStats", () => {
    it("returns zeros for empty history", () => {
      const { result } = renderHook(() => useGameHistory());
      const stats = result.current.getStats();

      expect(stats.totalGames).toBe(0);
      expect(stats.wins).toBe(0);
      expect(stats.losses).toBe(0);
      expect(stats.winRate).toBe(0);
    });

    it("calculates correct totals", () => {
      const { result } = renderHook(() => useGameHistory());

      act(() => {
        result.current.recordGame(createMockGame({ outcome: "won" }));
        result.current.recordGame(createMockGame({ outcome: "won" }));
        result.current.recordGame(createMockGame({ outcome: "lost" }));
      });

      const stats = result.current.getStats();
      expect(stats.totalGames).toBe(3);
      expect(stats.wins).toBe(2);
      expect(stats.losses).toBe(1);
    });

    it("calculates win rate correctly", () => {
      const { result } = renderHook(() => useGameHistory());

      act(() => {
        result.current.recordGame(createMockGame({ outcome: "won" }));
        result.current.recordGame(createMockGame({ outcome: "lost" }));
        result.current.recordGame(createMockGame({ outcome: "lost" }));
        result.current.recordGame(createMockGame({ outcome: "lost" }));
      });

      const stats = result.current.getStats();
      expect(stats.winRate).toBe(25); // 1/4 = 25%
    });

    it("aggregates stats by finalGirl", () => {
      const { result } = renderHook(() => useGameHistory());

      act(() => {
        result.current.recordGame(createMockGame({ finalGirl: "Nancy", outcome: "won" }));
        result.current.recordGame(createMockGame({ finalGirl: "Nancy", outcome: "won" }));
        result.current.recordGame(createMockGame({ finalGirl: "Nancy", outcome: "lost" }));
        result.current.recordGame(createMockGame({ finalGirl: "Laurie", outcome: "won" }));
      });

      const stats = result.current.getStats();
      expect(stats.byFinalGirl["Nancy"]).toEqual({ wins: 2, losses: 1 });
      expect(stats.byFinalGirl["Laurie"]).toEqual({ wins: 1, losses: 0 });
    });

    it("aggregates stats by killer", () => {
      const { result } = renderHook(() => useGameHistory());

      act(() => {
        result.current.recordGame(createMockGame({ killer: "Dr. Fright", outcome: "won" }));
        result.current.recordGame(createMockGame({ killer: "Dr. Fright", outcome: "lost" }));
        result.current.recordGame(createMockGame({ killer: "Poltergeist", outcome: "lost" }));
      });

      const stats = result.current.getStats();
      expect(stats.byKiller["Dr. Fright"]).toEqual({ wins: 1, losses: 1 });
      expect(stats.byKiller["Poltergeist"]).toEqual({ wins: 0, losses: 1 });
    });

    it("aggregates stats by location", () => {
      const { result } = renderHook(() => useGameHistory());

      act(() => {
        result.current.recordGame(createMockGame({ location: "Creech Manor", outcome: "won" }));
        result.current.recordGame(createMockGame({ location: "Camp Happy Trails", outcome: "lost" }));
        result.current.recordGame(createMockGame({ location: "Camp Happy Trails", outcome: "lost" }));
      });

      const stats = result.current.getStats();
      expect(stats.byLocation["Creech Manor"]).toEqual({ wins: 1, losses: 0 });
      expect(stats.byLocation["Camp Happy Trails"]).toEqual({ wins: 0, losses: 2 });
    });
  });

  describe("persistence", () => {
    it("persists games to localStorage", () => {
      const { result } = renderHook(() => useGameHistory());

      act(() => {
        result.current.recordGame(createMockGame({ killer: "Persisted" }));
      });

      const stored = JSON.parse(localStorage.getItem("final-girl-game-history") || "[]");
      expect(stored).toHaveLength(1);
      expect(stored[0].killer).toBe("Persisted");
    });

    it("loads existing games from localStorage on mount", () => {
      const existingGame: GameResult = {
        id: "existing-id",
        timestamp: Date.now(),
        outcome: "won",
        killer: "Loaded",
        location: "Test Location",
        finalGirl: "Test Girl",
      };
      localStorage.setItem("final-girl-game-history", JSON.stringify([existingGame]));

      const { result } = renderHook(() => useGameHistory());

      expect(result.current.gameHistory).toHaveLength(1);
      expect(result.current.gameHistory[0].killer).toBe("Loaded");
    });
  });
});
