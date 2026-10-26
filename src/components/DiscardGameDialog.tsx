import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActiveGame } from "@/lib/activeGame";
import "@/styles/discard-game.css";
import { TypedDeleteField } from "./TypedDeleteField";

export function DiscardGameDialog({
  game,
  onClose,
  onConfirm,
}: {
  game: ActiveGame | null;
  onClose: () => void;
  onConfirm: (game: ActiveGame) => Promise<void>;
}) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  const pending = useRef(false),
    cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setError(null);
    setTyped("");
  }, [game?.id]);
  return (
    <Dialog
      open={Boolean(game)}
      onOpenChange={(open) => {
        if (!open && !pending.current) onClose();
      }}
    >
      <DialogContent
        className="discard-game-modal"
        data-busy={busy}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cancel.current?.focus();
        }}
        onEscapeKeyDown={(event) => {
          if (pending.current) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (pending.current) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Discard this game?</DialogTitle>
          {game && (
            <p className="discard-game-cast">
              {game.selection.finalGirl} vs {game.selection.killer}
              <span>{game.selection.location}</span>
            </p>
          )}
          <DialogDescription className="discard-game-description">
            This permanently removes this game’s progress, results, stories, and
            generated images from your history, stats, and scrapbooks. This
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <TypedDeleteField value={typed} onChange={setTyped} disabled={busy} />
        {error && (
          <p role="alert" className="discard-game-error">
            {error}
          </p>
        )}
        <div className="discard-game-actions">
          <button ref={cancel} type="button" disabled={busy} onClick={onClose}>
            {error ? "Close" : "Keep playing"}
          </button>
          <button
            type="button"
            className="discard-game-confirm"
            disabled={busy || typed !== "DELETE"}
            onClick={async () => {
              if (!game || typed !== "DELETE" || pending.current) return;
              pending.current = true;
              setBusy(true);
              setError(null);
              try {
                await onConfirm(game);
              } catch (reason) {
                setError(
                  reason instanceof Error
                    ? reason.message
                    : "Discard could not be confirmed. Reconnect and try again.",
                );
              } finally {
                pending.current = false;
                setBusy(false);
              }
            }}
          >
            {busy ? "Discarding…" : error ? "Retry discard" : "Discard game"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
