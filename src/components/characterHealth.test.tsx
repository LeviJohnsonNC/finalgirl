import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { GameOutcomeForm } from "./GameOutcomeForm";
import { ScrapbookStoryPage } from "./ScrapbookStoryPage";
import type { GameResult } from "@/hooks/useGameHistory";

vi.mock("./play/RecordedDeathScenes", () => ({
  RecordedDeathScenes: () => null,
}));
const game: GameResult = {
  id: "health-game",
  timestamp: 1,
  outcome: "won",
  killer: "Hans",
  location: "Camp Happy Trails",
  finalGirl: "Kate",
  finalGirlHealth: 4,
};
afterEach(cleanup);

describe("session-specific character health", () => {
  it.each([
    { name: "Kate", maximum: 7, expected: 7 },
    { name: "Kate", maximum: 4, expected: 4 },
    { name: "Kate", maximum: undefined, expected: 6 },
    { name: "Alice", maximum: undefined, expected: 5 },
    { name: "Alice", maximum: 4, expected: 4 },
  ])(
    "uses $expected as the outcome limit for $name with snapshot $maximum",
    ({ name, maximum, expected }) => {
      render(
        <GameOutcomeForm
          result={{ ...game, finalGirl: name, finalGirlMaxHealth: maximum }}
          onContinue={vi.fn()}
          onDiscard={vi.fn()}
        />,
      );
      const input = screen.getByLabelText("Final Girl Health", { exact: true });
      fireEvent.change(input, { target: { value: String(expected) } });
      expect(input).toHaveValue(String(expected));
      fireEvent.change(input, { target: { value: String(expected + 1) } });
      expect(input).toHaveValue(String(expected));
    },
  );
  it.each([
    { name: "Kate", maximum: 7, expected: "4/7" },
    { name: "Kate", maximum: undefined, expected: "4/6" },
    { name: "Alice", maximum: undefined, expected: "4/5" },
    { name: "Alice", maximum: 4, expected: "4/4" },
  ])(
    "shows $expected in the scrapbook without rewriting history",
    ({ name, maximum, expected }) => {
      render(
        <ScrapbookStoryPage
          game={{ ...game, finalGirl: name, finalGirlMaxHealth: maximum }}
          type="finalGirl"
        />,
      );
      expect(screen.getByText(expected, { exact: true })).toBeInTheDocument();
    },
  );
});
