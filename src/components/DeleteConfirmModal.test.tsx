import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
afterEach(cleanup);
it("requires exact DELETE, clears acknowledgement for a different target, and cancels without deleting", () => {
  const onConfirm = vi.fn(),
    onClose = vi.fn();
  const { rerender } = render(
    <DeleteConfirmModal
      isOpen
      onClose={onClose}
      onConfirm={onConfirm}
      confirmationKey="one"
    />,
  );
  const field = screen.getByLabelText("Type DELETE to confirm");
  const action = screen.getByRole("button", { name: "Delete Forever" });
  for (const value of ["", "delete", "DELETE "]) {
    fireEvent.change(field, { target: { value } });
    expect(action).toBeDisabled();
    fireEvent.click(action);
  }
  expect(onConfirm).not.toHaveBeenCalled();
  fireEvent.change(field, { target: { value: "DELETE" } });
  expect(action).toBeEnabled();
  rerender(
    <DeleteConfirmModal
      isOpen
      onClose={onClose}
      onConfirm={onConfirm}
      confirmationKey="two"
    />,
  );
  expect(field).toHaveValue("");
  expect(action).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Keep It" }));
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onConfirm).not.toHaveBeenCalled();
});
it("keeps a failed deletion open and prevents repeated submissions while pending", async () => {
  let reject!: (reason: Error) => void;
  const onConfirm = vi.fn(
      () =>
        new Promise<void>((_, r) => {
          reject = r;
        }),
    ),
    onClose = vi.fn();
  render(<DeleteConfirmModal isOpen onClose={onClose} onConfirm={onConfirm} />);
  fireEvent.change(screen.getByLabelText("Type DELETE to confirm"), {
    target: { value: "DELETE" },
  });
  const action = screen.getByRole("button", { name: "Delete Forever" });
  fireEvent.click(action);
  fireEvent.click(action);
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
  reject(new Error("Archive unavailable"));
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("Archive unavailable"),
  );
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Delete Forever" })).toBeEnabled();
});
