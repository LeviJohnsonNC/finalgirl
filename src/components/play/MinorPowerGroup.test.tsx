import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MinorPowerGroup } from "./MinorPowerGroup";
import { MinorPowerControl } from "./MinorPowerControl";
afterEach(cleanup);
const art = { src: "/example.webp" };
it("focuses recorded powers without imposing a single-power limit or losing zero/unknown evidence", () => {
  const changed = vi.fn();
  function Harness() {
    const [health, setHealth] = useState<Record<string, number | undefined>>({
      One: 2,
    });
    return (
      <MinorPowerGroup>
        {["One", "Two"].map((name) => (
          <MinorPowerControl
            key={name}
            name={name}
            health={health[name]}
            art={() => art}
            onChange={(n) => {
              changed(name, n);
              setHealth((v) => ({ ...v, [name]: n ?? undefined }));
            }}
          />
        ))}
      </MinorPowerGroup>
    );
  }
  render(<Harness />);
  expect(screen.queryByRole("button", { name: "Reveal Two" })).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Add another Minor Power" }),
  );
  expect(changed).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Reveal Two" }));
  expect(screen.getAllByRole("article")).toHaveLength(2);
  fireEvent.click(
    screen.getByRole("button", { name: "Remove one Two health, heart 1" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Remove one Two health, heart 1" }),
  );
  expect(screen.getByRole("article", { name: "Two" })).toHaveAttribute(
    "data-state",
    "removed",
  );
  expect(screen.queryByRole("button", { name: "Reveal Two" })).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Restore one Two health, heart 1" }),
  );
  expect(screen.getByRole("article", { name: "Two" })).toHaveAttribute(
    "data-state",
    "weakened",
  );
});
it("keeps alternatives available after a rejected reveal and preserves legacy unknown health", () => {
  const change = vi.fn(() => false);
  render(
    <MinorPowerGroup>
      <MinorPowerControl
        name="Old"
        previouslyRevealed
        art={() => art}
        onChange={change}
      />
      <MinorPowerControl
        name="New"
        art={() => art}
        onChange={change}
      />
    </MinorPowerGroup>,
  );
  expect(screen.queryByRole("button", { name: "Reveal New" })).toBeNull();
  expect(
    screen.getByText("Revealed earlier · health not recorded"),
  ).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "Add another Minor Power" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Reveal New" }));
  expect(screen.getByRole("button", { name: "Reveal New" })).toBeVisible();
  expect(screen.queryByRole("group", { name: "Old health" })).toBeNull();
  expect(change).toHaveBeenCalledTimes(1);
});
