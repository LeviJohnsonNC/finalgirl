import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Moon,
  Sun,
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
  boilerGeometry,
  boilerAttack,
  legalDirections,
  DIRECTION_NAMES,
  REVEAL_NAMES,
  type Direction,
  type FrightState,
} from "../../../supabase/functions/_shared/play/fright";
import room from "@/assets/play/fright/room.webp";
import doctor from "@/assets/play/fright/doctor.webp";

const icons = { U: ArrowUp, D: ArrowDown, L: ArrowLeft, R: ArrowRight };
const order: Direction[] = ["U", "L", "D", "R"];
interface Props {
  state: FrightState;
  blocked: boolean;
  message: string;
  onSlide: (d: Direction) => void;
  onDefended: () => void;
  onSleep: () => void;
  onUndo: () => void;
}
/** Only exposed quadrants are mounted. No hidden card IDs, alt text or preview images. */
function BoilerArtwork({
  path,
  deal,
  awake,
  onSlide,
  disabled,
  large,
}: {
  path: string;
  deal: string;
  awake: boolean;
  onSlide: (d: Direction) => void;
  disabled: boolean;
  large: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const geometry = boilerGeometry(path)!;
  const positions = [geometry.cover, ...geometry.cards];
  const left = Math.min(...positions.map((p) => p.x)),
    top = Math.min(...positions.map((p) => p.y));
  const right = Math.max(...positions.map((p) => p.x + 2)),
    bottom = Math.max(...positions.map((p) => p.y + 2));
  const viewBox = `${left * 100 - 12} ${top * 140 - 12} ${(right - left) * 100 + 24} ${(bottom - top) * 140 + 24}`;
  const pointer = useRef<{ x: number; y: number; id: number } | null>(null);
  const [preview, setPreview] = useState<Direction | null>(null);
  const choose = (x: number, y: number): Direction | null =>
    Math.max(Math.abs(x), Math.abs(y)) < 34
      ? null
      : Math.abs(x) > Math.abs(y)
        ? x > 0
          ? "R"
          : "L"
        : y > 0
          ? "D"
          : "U";
  const allowed = legalDirections(path);
  return (
    <div
      className={`boiler-stage${large ? " boiler-stage--large" : ""}${disabled ? "" : " boiler-stage--ready"}`}
      role="group"
      aria-label="Boiler Room revealed cards"
      onPointerDown={(e) => {
        if (disabled || e.button !== 0) return;
        pointer.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!pointer.current) return;
        const d = choose(
          e.clientX - pointer.current.x,
          e.clientY - pointer.current.y,
        );
        setPreview(d && allowed.includes(d) ? d : null);
      }}
      onPointerUp={(e) => {
        const start = pointer.current;
        pointer.current = null;
        setPreview(null);
        if (!start || disabled) return;
        const d = choose(e.clientX - start.x, e.clientY - start.y);
        if (d && allowed.includes(d)) onSlide(d);
      }}
      onPointerCancel={() => {
        pointer.current = null;
        setPreview(null);
      }}
    >
      <svg viewBox={viewBox} aria-hidden="true" className="boiler-tableau">
        <defs>
          <linearGradient id={`${id}-cover`} x2="1" y2="1">
            <stop stopColor="#211e19" />
            <stop offset=".45" stopColor="#090e0e" />
            <stop offset="1" stopColor="#321711" />
          </linearGradient>
        </defs>
        {geometry.cards
          .map((p, i) => ({ p, i }))
          .reverse()
          .map(({ p, i }) => {
            const visible = geometry.visible[i];
            const q = Number(deal[i]);
            return (
              <g
                key={i}
                className="boiler-card-layer"
                style={{
                  transform: `translate(${p.x * 100}px,${p.y * 140}px)`,
                }}
              >
                <defs>
                  <clipPath id={`${id}-card-${i}`}>
                    <rect width="200" height="280" rx="8" />
                  </clipPath>
                </defs>
                <g clipPath={`url(#${id}-card-${i})`}>
                  <rect width="200" height="280" fill="#0b0908" />
                  <image
                    href={room}
                    width="200"
                    height="280"
                    preserveAspectRatio="xMidYMid slice"
                  />
                  {visible.includes(q) && (
                    <image
                      href={doctor}
                      x={(q % 2) * 100 + 4}
                      y={Math.floor(q / 2) * 140 + 4}
                      width="92"
                      height="132"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  )}
                  <path
                    d="M100 0V280M0 140H200"
                    stroke="#e1a85a"
                    strokeOpacity=".32"
                    strokeWidth="1"
                  />
                </g>
                <rect
                  x="1"
                  y="1"
                  width="198"
                  height="278"
                  rx="8"
                  fill="none"
                  stroke="#a77549"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        <g
          className="boiler-card-layer boiler-cover"
          style={{
            transform: `translate(${geometry.cover.x * 100}px,${geometry.cover.y * 140}px)`,
          }}
        >
          <rect
            width="200"
            height="280"
            rx="9"
            fill={`url(#${id}-cover)`}
            stroke="#8e6f4b"
            strokeWidth="3"
          />
          <rect
            x="8"
            y="8"
            width="184"
            height="264"
            rx="5"
            fill="none"
            stroke="#806b48"
            strokeDasharray="3 5"
            strokeOpacity=".65"
          />
          <circle
            cx="100"
            cy="113"
            r="38"
            stroke="#b58b55"
            fill="#161614"
            strokeWidth="2"
          />
          {awake ? (
            <Sun x="77" y="90" width="46" height="46" color="#dabd7e" />
          ) : (
            <Moon x="77" y="90" width="46" height="46" color="#dabd7e" />
          )}
          <text
            x="100"
            y="183"
            textAnchor="middle"
            fill="#eddec2"
            fontFamily="Georgia,serif"
            fontSize="23"
            letterSpacing="3"
          >
            {awake ? "AWAKE" : "ASLEEP"}
          </text>
          <text
            x="100"
            y="206"
            textAnchor="middle"
            fill="#b5a184"
            fontFamily="Arial,sans-serif"
            fontSize="8"
            letterSpacing="3"
          >
            THE BOILER ROOM
          </text>
        </g>
      </svg>
      {preview && (
        <div className="boiler-drag-preview" aria-hidden="true">
          Slide {DIRECTION_NAMES[preview]}
          <span>Release to reveal</span>
        </div>
      )}
    </div>
  );
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
  const [animating, setAnimating] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setAnimating(true);
    const timer = window.setTimeout(() => setAnimating(false), 300);
    return () => window.clearTimeout(timer);
  }, [state.eventId]);
  const [large, setLarge] = useState(false);
  const [dismissedTrip, setDismissedTrip] = useState<string | null>(null);
  const completed = Boolean(
    state.lastPath && !state.path && dismissedTrip !== state.eventId,
  );
  const path = completed ? state.lastPath : state.path;
  const deal = completed ? state.lastDeal : state.deal;
  const canSlide =
    state.sleep === "asleep" && !state.pending && !completed && !blocked && !animating;
  const buttons = order.map((d) => {
    const Icon = icons[d];
    return (
      <button
        key={d}
        type="button"
        className={`boiler-direction boiler-direction--${d}`}
        aria-label={`Slide ${DIRECTION_NAMES[d]}; reveal ${REVEAL_NAMES[d]}`}
        disabled={!canSlide || !legalDirections(state.path).includes(d)}
        onClick={() => onSlide(d)}
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="boiler-dialog">
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
                onClick={() => setLarge(!large)}
              >
                {large ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
            <BoilerArtwork
              path={path}
              deal={deal}
              awake={state.sleep === "awake"}
              onSlide={onSlide}
              disabled={!canSlide}
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
              onClick={() => setOpen(false)}
            >
              Back to game
            </button>
            {state.pending ? (
              <button
                type="button"
                className="boiler-primary"
                disabled={blocked}
                onClick={onDefended}
              >
                Attack resolved
              </button>
            ) : completed && state.sleep === "asleep" ? (
              <button
                type="button"
                className="boiler-primary"
                disabled={blocked}
                onClick={() => setDismissedTrip(state.eventId)}
              >
                Continue nightmare
              </button>
            ) : state.sleep === "awake" ? (
              <button
                type="button"
                className="boiler-primary"
                disabled={blocked}
                onClick={onSleep}
              >
                Record falling Asleep
              </button>
            ) : (
              <button
                type="button"
                className="boiler-back"
                disabled={blocked || !state.path}
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
