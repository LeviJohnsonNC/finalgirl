import { useLayoutEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TypedDeleteField } from "./TypedDeleteField";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmationKey?: string;
}
export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Destroy Evidence?",
  description = "This record will be permanently erased from your scrapbook. This action cannot be undone.",
  confirmLabel = "Delete Forever",
  cancelLabel = "Keep It",
  confirmationKey,
}: DeleteConfirmModalProps) => {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const opener = useRef<HTMLElement | null>(null);
  const scope = useRef(confirmationKey);
  scope.current = confirmationKey;
  useLayoutEffect(() => {
    setTyped("");
    setError("");
  }, [isOpen, confirmationKey]);
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !pending.current) onClose();
      }}
    >
      <AlertDialogContent
        className="delete-confirm-modal"
        onOpenAutoFocus={() => {
          opener.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
        }}
        onCloseAutoFocus={(event) => {
          if (opener.current?.isConnected) {
            event.preventDefault();
            opener.current.focus();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (pending.current) event.preventDefault();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-horror text-2xl text-center">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="delete-description text-sm text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <TypedDeleteField value={typed} onChange={setTyped} disabled={busy} />
        {error && (
          <p role="alert" className="text-sm text-primary">
            {error}
          </p>
        )}
        <AlertDialogFooter className="flex-row justify-center gap-4 sm:justify-center">
          <AlertDialogCancel
            disabled={busy}
            className="delete-modal-cancel min-h-[44px]"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <button
            type="button"
            disabled={busy || typed !== "DELETE"}
            className="delete-modal-confirm min-h-[44px] rounded px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={async () => {
              if (typed !== "DELETE" || pending.current) return;
              const target = scope.current;
              pending.current = true;
              setBusy(true);
              setError("");
              try {
                await onConfirm();
                if (scope.current === target) onClose();
              } catch (reason) {
                if (scope.current === target)
                  setError(
                    reason instanceof Error
                      ? reason.message
                      : "Deletion failed. Please retry.",
                  );
              } finally {
                pending.current = false;
                setBusy(false);
              }
            }}
          >
            {busy ? "Deleting…" : confirmLabel}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
