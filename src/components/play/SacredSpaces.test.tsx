import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SacredSpaces } from "./SacredSpaces";
afterEach(cleanup);
it("opening unknown placements never writes; explicit editing changes only the chosen token", () => {
  const change = vi.fn();
  render(<SacredSpaces state={{ fire: "holy" }} onChange={change} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Cycle tokens: Burial Ground" }),
  );
  expect(change).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "Closed at Burial Ground" }),
  );
  expect(change).toHaveBeenCalledWith({ closed: "burial" });
});
it("disabled cycling and token editing cannot submit observations", () => {
  const change = vi.fn();
  render(
    <SacredSpaces
      disabled
      state={{ closed: "none", fire: "none", hallowed: "none" }}
      onChange={change}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Cycle tokens: Burial Ground" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Closed at Burial Ground" }),
  );
  expect(change).not.toHaveBeenCalled();
});
