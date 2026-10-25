import { useId, useRef, useState } from "react";
import { ShieldCheck, Moon, Undo2, Maximize2, Minimize2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  boilerAttack,
  boilerAwaitingWake,
  type Direction,
  type FrightState,
} from "../../../supabase/functions/_shared/play/fright";
import { BoilerArtwork, type BoilerArtworkHandle } from "./BoilerArtwork";
import { FrightSleepControls } from "./FrightSleepControls";

interface Props {
  state: FrightState;
  blocked: boolean;
  message: string;
  forced: boolean;
  forcedReason?: string;
  onSlide: (d: Direction) => boolean;
  onDefended: () => void;
  onSleepChange: (sleep: "awake" | "asleep") => void;
  onUndo: () => void;
}
export function BoilerRoom({
  state,
  blocked,
  message,
  forced,
  forcedReason = "Face Your Fright",
  onSlide,
  onDefended,
  onSleepChange,
  onUndo,
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [large, setLarge] = useState(false);
  const artwork = useRef<BoilerArtworkHandle>(null);
  const progressId = useId();
  const changeOpen = (value: boolean) => {
    if (!value) artwork.current?.cancel();
    setOpen(value);
  };
  const awaitingWake = boilerAwaitingWake(state, forced);
  const path = awaitingWake ? state.lastPath : state.path;
  const deal = awaitingWake ? state.lastDeal : state.deal;
  const canSlide =
    state.sleep === "asleep" && !state.pending && !awaitingWake && !blocked;
  const announcement = state.pending
    ? "Dr. Fright attacks."
    : state.sleep === "awake"
      ? "You woke up. The next deck is shuffled and concealed."
      : awaitingWake
        ? "Four cards revealed. Select Awake to wake up and shuffle the deck."
        : !state.path
          ? "Choose your first direction."
          : boilerAttack(state.deal, state.path)
            ? "Attack resolved."
            : "No attack from this reveal.";
  return (
    <>
      <button
        type="button"
        className="fright-enter"
        onClick={() => changeOpen(true)}
      >
        <span>
          <strong>
            {state.sleep === "awake"
              ? "Enter the Boiler Room"
              : "Continue Boiler Room"}
          </strong>
          <small>
            {state.sleep === "awake"
              ? "Digital cards · Ready for your next nightmare"
              : `${path.length}/4 revealed${state.pending ? " · Attack pending" : ""}`}
          </small>
        </span>
        <Moon size={24} />
      </button>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent
          className={`boiler-dialog${large ? " boiler-dialog--large" : ""}`}
          onEscapeKeyDown={(event) => {
            if (busy) {
              event.preventDefault();
              artwork.current?.cancel();
            }
          }}
        >
          <header className="boiler-heading">
            <div>
              <p className="play-eyebrow">DR. FRIGHT / THE DREAM DOCTOR</p>
              <DialogTitle>The Boiler Room</DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              Drag the covered stack to reveal a card, or focus the cards and
              use the arrow keys. Use Awake and Asleep to record your sleep
              state.
            </DialogDescription>
            <button
              type="button"
              className="boiler-inspect"
              aria-label={
                large
                  ? "Fit Boiler Room artwork"
                  : "Enlarge Boiler Room artwork"
              }
              aria-pressed={large}
              onClick={() => {
                artwork.current?.cancel();
                setLarge(!large);
              }}
            >
              {large ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </header>
          <div className="boiler-body">
            <p
              id={progressId}
              className="sr-only"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {announcement} {path.length} of 4 Boiler Room cards revealed.
            </p>
            <BoilerArtwork
              ref={artwork}
              revision={state.eventId}
              onBusyChange={setBusy}
              path={path}
              deal={deal}
              awake={state.sleep === "awake"}
              onSlide={onSlide}
              disabled={!canSlide || !open}
              large={large}
              describedBy={progressId}
            />
            <div className="boiler-controls">
              <FrightSleepControls
                compact
                sleep={state.sleep}
                forced={forced}
                forcedReason={forcedReason}
                pending={state.pending}
                disabled={blocked || busy}
                onChange={onSleepChange}
              />
            </div>
          </div>
          <footer className="boiler-footer">
            {(blocked || state.pending || forced || awaitingWake) && (
              <p className="boiler-notice" role="status">
                {blocked ? (
                  <strong>Choose which saved game to continue.</strong>
                ) : state.pending ? (
                  "Dr. Fright attacks. Defend normally; record damage separately."
                ) : awaitingWake ? (
                  "Four cards revealed. Select Awake to wake up and shuffle the deck."
                ) : (
                  `${forcedReason} ${forcedReason.includes(" and ") ? "keep" : "keeps"} you Asleep. Each completed deck resets automatically.`
                )}
              </p>
            )}
            {message && (
              <p role="alert" className="boiler-error">
                {message}
              </p>
            )}
            <button
              type="button"
              className="boiler-back"
              onClick={() => changeOpen(false)}
            >
              Back to game
            </button>
            {state.pending ? (
              <button
                type="button"
                className="boiler-primary boiler-resolve"
                disabled={blocked || busy}
                onClick={onDefended}
              >
                <ShieldCheck size={21} aria-hidden="true" />
                <span>Attack resolved</span>
              </button>
            ) : (
              <button
                type="button"
                className="boiler-back"
                disabled={
                  blocked ||
                  busy ||
                  !["slide", "defended", "awake", "asleep"].includes(
                    state.command,
                  )
                }
                onClick={onUndo}
              >
                <Undo2 size={15} /> Undo last step
              </button>
            )}
          </footer>
        </DialogContent>
      </Dialog>
    </>
  );
}
