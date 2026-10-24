import { useRef, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Moon,
  Undo2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  boilerAttack,
  legalDirections,
  DIRECTION_NAMES,
  REVEAL_NAMES,
  type Direction,
  type FrightState,
} from "../../../supabase/functions/_shared/play/fright";
import { BoilerArtwork, type BoilerArtworkHandle } from "./BoilerArtwork";

const icons = { U: ArrowUp, D: ArrowDown, L: ArrowLeft, R: ArrowRight };
const order: Direction[] = ["U", "L", "D", "R"];
interface Props {
  state: FrightState;
  blocked: boolean;
  message: string;
  onSlide: (d: Direction) => boolean;
  onDefended: () => void;
  onSleep: () => void;
  onUndo: () => void;
}
export function BoilerRoom({
  state,
  blocked,
  message,
  onSlide,
  onDefended,
  onSleep,
  onUndo,
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const artwork = useRef<BoilerArtworkHandle>(null);
  const changeOpen = (value: boolean) => {
    if (!value) artwork.current?.cancel();
    setOpen(value);
  };
  const [large, setLarge] = useState(false);
  const [dismissedTrip, setDismissedTrip] = useState<string | null>(null);
  const completed = Boolean(
    state.lastPath && !state.path && dismissedTrip !== state.eventId,
  );
  const path = completed ? state.lastPath : state.path;
  const deal = completed ? state.lastDeal : state.deal;
  const canSlide =
    state.sleep === "asleep" && !state.pending && !completed && !blocked;
  const buttons = order.map((d) => {
    const Icon = icons[d];
    return (
      <button
        key={d}
        type="button"
        className={`boiler-direction boiler-direction--${d}`}
        aria-label={`Slide ${DIRECTION_NAMES[d]}; reveal ${REVEAL_NAMES[d]}`}
        disabled={!canSlide || busy || !legalDirections(state.path).includes(d)}
        onClick={() => artwork.current?.slide(d)}
      >
        <Icon size={19} />
        <span>
          {DIRECTION_NAMES[d]}
          <small>Reveal {REVEAL_NAMES[d]}</small>
        </span>
      </button>
    );
  });
  return (
    <>
      <button
        type="button"
        className="fright-enter"
        onClick={() => setOpen(true)}
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
              : `${state.path.length}/4 revealed${state.pending ? " · Attack pending" : ""}`}
          </small>
        </span>
        <Moon size={24} />
      </button>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent
          className="boiler-dialog"
          onEscapeKeyDown={(event) => {
            if (busy) {
              event.preventDefault();
              artwork.current?.cancel();
            }
          }}
        >
          <header className="boiler-heading">
            <p className="play-eyebrow">DR. FRIGHT / THE DREAM DOCTOR</p>
            <DialogTitle>The Boiler Room</DialogTitle>
            <DialogDescription>
              {completed
                ? "Four cards revealed."
                : state.sleep === "awake"
                  ? "Fall Asleep after resolving a Rest or another game effect."
                  : "Resolve any number in the Action phase; one at the end of the Killer phase, unless an effect changes this."}
            </DialogDescription>
          </header>
          <div className="boiler-body">
            <div className="boiler-meter">
              <span className="boiler-sleep">
                <Moon size={15} />
                {state.sleep === "awake" ? "Awake" : "Asleep"}
              </span>
              <ol
                aria-label={`${completed ? 4 : state.path.length} of 4 Boiler Room cards revealed`}
              >
                {[0, 1, 2, 3].map((i) => (
                  <li
                    key={i}
                    className={
                      i < (completed ? 4 : state.path.length)
                        ? "is-revealed"
                        : ""
                    }
                  >
                    <span className="sr-only">Card {i + 1}</span>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                className="boiler-inspect"
                aria-label={
                  large
                    ? "Fit Boiler Room artwork"
                    : "Enlarge Boiler Room artwork"
                }
                onClick={() => {
                  artwork.current?.cancel();
                  setLarge(!large);
                }}
              >
                {large ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
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
            />
            <div
              className="boiler-result"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {blocked ? (
                <>
                  <strong>Choose which saved game to continue.</strong>
                  <span>
                    Resolve the device conflict before revealing another card.
                  </span>
                </>
              ) : state.pending ? (
                <>
                  <strong>Dr. Fright attacks.</strong>
                  <span>
                    Target the Final Girl and attack, wherever he is. Defend
                    normally; record damage separately.
                  </span>
                </>
              ) : completed ? (
                <>
                  <strong>
                    {state.sleep === "awake"
                      ? "You woke up."
                      : "The nightmare continues."}
                  </strong>
                  <span>
                    {state.sleep === "awake"
                      ? "The next deck is shuffled and concealed."
                      : "Face Your Fright keeps you Asleep. A fresh deck is ready."}
                  </span>
                </>
              ) : state.sleep === "awake" ? (
                <>
                  <strong>Outside the dream.</strong>
                  <span>
                    Normal Awake restrictions apply unless a revealed card
                    changes them.
                  </span>
                </>
              ) : state.path ? (
                <>
                  <strong>
                    {boilerAttack(deal, path)
                      ? "Attack resolved."
                      : "No attack from this reveal."}
                  </strong>
                  <span>{state.path.length}/4 cards resolved.</span>
                </>
              ) : (
                <>
                  <strong>Choose your first direction.</strong>
                  <span>Slide the cover or use the direction controls.</span>
                </>
              )}
            </div>
            <div
              className="boiler-directions"
              role="group"
              aria-label="Boiler Room directions"
            >
              {buttons}
            </div>
          </div>
          <footer className="boiler-footer">
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
                className="boiler-primary"
                disabled={blocked || busy}
                onClick={onDefended}
              >
                Attack resolved
              </button>
            ) : completed && state.sleep === "asleep" ? (
              <button
                type="button"
                className="boiler-primary"
                disabled={blocked || busy}
                onClick={() => setDismissedTrip(state.eventId)}
              >
                Continue nightmare
              </button>
            ) : state.sleep === "awake" ? (
              <button
                type="button"
                className="boiler-primary"
                disabled={blocked || busy}
                onClick={onSleep}
              >
                Record falling Asleep
              </button>
            ) : (
              <button
                type="button"
                className="boiler-back"
                disabled={blocked || busy || !state.path}
                onClick={onUndo}
              >
                <Undo2 size={15} /> Undo Boiler Room step
              </button>
            )}
          </footer>
        </DialogContent>
      </Dialog>
    </>
  );
}
