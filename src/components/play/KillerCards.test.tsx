import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { KillerCards } from "./KillerCards";
import { newPlayEvent, type PlayEvent } from "@/lib/play/events";
afterEach(cleanup);
it("hides alternatives after a reveal, opens correction without writes, and retains a failed correction for retry", () => {
  let accepting = true;
  const save = vi.fn(() => accepting);
  function Harness() {
    const [events, setEvents] = useState<PlayEvent[]>([
      newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
    ]);
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
    screen.queryByRole("button", { name: "Choose Volatile Temper" }),
  ).toBeNull();
  expect(screen.getByRole("heading", { name: "Rising Dread" })).toBeVisible();
  const calls = save.mock.calls.length;
  fireEvent.click(screen.getByRole("button", { name: "Change Dark Power" }));
  expect(save).toHaveBeenCalledTimes(calls);
  accepting = false;
  fireEvent.click(
    screen.getByRole("button", { name: "Choose Volatile Temper" }),
  );
  expect(screen.getByRole("heading", { name: "Rising Dread" })).toBeVisible();
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
    screen.queryByRole("button", { name: "Choose Rising Dread" }),
  ).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Clear Dark Power card name" }),
  );
  expect(screen.queryByRole("heading", { name: "Volatile Temper" })).toBeNull();
  expect(
    screen.getByRole("button", { name: "Choose Rising Dread" }),
  ).toBeVisible();
});
