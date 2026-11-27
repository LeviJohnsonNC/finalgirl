import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { KillerCards } from "./KillerCards";
import { newPlayEvent, summarizePlay, type PlayEvent } from "@/lib/play/events";
afterEach(cleanup);
it("clears only the Dark Power name, retains its permanent reveal, and retries rejected clear/reselection", () => {
  let accepting = true;
  let saved: PlayEvent[] = [];
  const save = vi.fn(() => accepting);
  function Harness() {
    const [events, setEvents] = useState<PlayEvent[]>([
      newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
    ]);
    saved = events;
    return (
      <KillerCards
        killer="Inkanyamba"
        typeOnly="dark-power"
        events={events}
        onEvent={(e) => {
          const ok = save();
          if (ok) setEvents((v) => [...v, e]);
          return ok;
        }}
      />
    );
  }
  render(<Harness />);
  fireEvent.click(screen.getByRole("button", { name: "Choose Rising Dread" }));
  expect(
    screen.queryByRole("button", { name: "Change Dark Power" }),
  ).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Choose Volatile Temper" }),
  ).toBeNull();
  accepting = false;
  fireEvent.click(
    screen.getByRole("button", { name: "Clear Dark Power card name" }),
  );
  expect(screen.getByRole("heading", { name: "Rising Dread" })).toBeVisible();
  accepting = true;
  fireEvent.click(
    screen.getByRole("button", { name: "Clear Dark Power card name" }),
  );
  expect(screen.queryByRole("heading", { name: "Rising Dread" })).toBeNull();
  expect(screen.getByRole("heading", { name: "Dark Power Revealed" })).toBeVisible();
  expect(screen.queryByRole("button", { name: "Clear Dark Power card name" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Reveal without a card name (Dark Power)" })).toBeNull();
  accepting = false;
  fireEvent.click(
    screen.getByRole("button", { name: "Choose Volatile Temper" }),
  );
  expect(
    screen.getByRole("button", { name: "Choose Volatile Temper" }),
  ).toBeVisible();
  accepting = true;
  fireEvent.click(
    screen.getByRole("button", { name: "Choose Volatile Temper" }),
  );
  expect(
    screen.getByRole("heading", { name: "Volatile Temper" }),
  ).toBeVisible();
  expect(
    saved.filter((e) => e.kind === "moment" && e.momentType === "dark-power"),
  ).toHaveLength(1);
  expect(
    summarizePlay(saved).entries.find((e) => e.momentType === "dark-power")
      ?.killerCard,
  ).toBe("Volatile Temper");
});

it("keeps an earlier recorded name available for correction outside the current catalog", () => {
  const reveal = newPlayEvent({
    kind: "moment",
    momentType: "finale",
    killerCard: "Earlier Finale name",
    permanent: true,
  });
  const save = vi.fn(() => true);
  render(<KillerCards killer="Inkanyamba" typeOnly="finale" events={[reveal]} onEvent={save} />);

  expect(screen.getByRole("heading", { name: "Finale Revealed" })).toBeVisible();
  expect(screen.getByText("Earlier Finale name", { exact: true })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Clear Finale card name" }));
  expect(save).toHaveBeenCalledWith(expect.objectContaining({
    kind: "details", target: reveal.id, killerCard: "",
  }));
});
