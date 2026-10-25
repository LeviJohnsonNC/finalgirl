import { useState } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { InkanyambaControls } from "./InkanyambaControls";
import { newPlayEvent, type PlayEvent } from "@/lib/play/events";
afterEach(cleanup);
const props = {
  killer: "Inkanyamba",
  location: "Camp Happy Trails",
  finalGirl: "Laurie",
};
const start = () =>
  newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 });
const moduleEvent = (wrath: number) =>
  newPlayEvent({
    kind: "module",
    moduleData: { module: "inkanyamba", changes: { wrath } },
  });
describe("Inkanyamba player controls", () => {
  it("does not write on mount, opening details, or viewing unknown state", () => {
    const onEvent = vi.fn(() => true);
    render(<InkanyambaControls {...props} events={[]} onEvent={onEvent} />);
    fireEvent.click(screen.getByText("Atonement & corrections"));
    fireEvent.click(screen.getByText("Wrath reference"));
    expect(onEvent).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Increase Killer Wrath" }),
    ).toBeDisabled();
  });
  it("retains displayed state after failure and permits retry, suppressing the same stale tap", () => {
    const onEvent = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    render(
      <InkanyambaControls
        {...props}
        events={[start(), moduleEvent(5)]}
        onEvent={onEvent}
      />,
    );
    const up = screen.getByRole("button", { name: "Increase Killer Wrath" });
    fireEvent.click(up);
    expect(screen.getByRole("alert")).toHaveTextContent("could not be saved");
    expect(screen.getByLabelText("Current Killer Wrath")).toHaveTextContent(
      "5/10",
    );
    fireEvent.click(up);
    fireEvent.click(up);
    expect(onEvent).toHaveBeenCalledTimes(2);
    expect(onEvent.mock.calls[1][0].moduleData.changes).toEqual({ wrath: 6 });
  });
  it("records a three-health Minor Power without adding killer health or casualties", () => {
    const onEvent = vi.fn((_event: PlayEvent) => true);
    render(<InkanyambaControls {...props} events={[]} onEvent={onEvent} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Reveal Boiling Anger" }),
    );
    expect(onEvent.mock.calls[0][0].moduleData.changes).toEqual({
      "minor.boiling-anger.health": 3,
    });
  });
  it("uses saved Wrath for Atonement and never resolves other counters", () => {
    function Harness() {
      const [events, set] = useState<PlayEvent[]>([start(), moduleEvent(5)]);
      return (
        <InkanyambaControls
          {...props}
          events={events}
          onEvent={(e) => {
            set((a) => [...a, e]);
            return true;
          }}
        />
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByText("Atonement & corrections"));
    fireEvent.click(screen.getByRole("button", { name: "2 successes 5 → 2" }));
    expect(screen.getByLabelText("Current Killer Wrath")).toHaveTextContent(
      "2/10",
    );
    expect(document.querySelector(".ink-unleash p")).toHaveTextContent(
      "Increase Killer Wrath by 2.",
    );
  });
  it("disables every mutation while a save conflict is known", () => {
    const onEvent = vi.fn(() => true);
    const { container } = render(
      <InkanyambaControls
        {...props}
        events={[start(), moduleEvent(3)]}
        onEvent={onEvent}
        blocked
      />,
    );
    for (const button of container.querySelectorAll("button"))
      expect(button).toBeDisabled();
    expect(onEvent).not.toHaveBeenCalled();
  });
});
