import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { useState } from "react";
import { OutcomeNumberField } from "./OutcomeNumberField";
afterEach(cleanup);
function Field({ min = 0, max = 7 }: { min?: number; max?: number }) {
  const [value, setValue] = useState<number | null>(null);
  return (
    <OutcomeNumberField
      label="Recorded count"
      accessibleLabel="Recorded count"
      value={value}
      onChange={setValue}
      min={min}
      max={max}
    />
  );
}
it("keeps unknown, explicit zero, corrections, and clear distinct", () => {
  render(<Field />);
  const input = screen.getByLabelText("Recorded count", { exact: true });
  expect(input).toHaveValue("");
  expect(
    screen.getByRole("button", { name: "Decrease Recorded count" }),
  ).toBeDisabled();
  fireEvent.click(
    screen.getByRole("button", { name: "Increase Recorded count" }),
  );
  expect(input).toHaveValue("1");
  fireEvent.click(
    screen.getByRole("button", { name: "Decrease Recorded count" }),
  );
  expect(input).toHaveValue("0");
  fireEvent.click(screen.getByRole("button", { name: "Clear Recorded count" }));
  expect(input).toHaveValue("");
});
it("bounds direct edits and steppers using the same inclusive range", () => {
  render(<Field min={1} max={3} />);
  const input = screen.getByLabelText("Recorded count", { exact: true });
  fireEvent.change(input, { target: { value: "0" } });
  expect(input).toHaveValue("1");
  expect(
    screen.getByRole("button", { name: "Decrease Recorded count" }),
  ).toBeDisabled();
  fireEvent.change(input, { target: { value: "999" } });
  expect(input).toHaveValue("3");
  expect(
    screen.getByRole("button", { name: "Increase Recorded count" }),
  ).toBeDisabled();
  fireEvent.change(input, { target: { value: "" } });
  expect(input).toHaveValue("");
});
