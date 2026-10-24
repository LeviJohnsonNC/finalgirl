import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  boilerGeometry,
  legalDirections,
  DIRECTION_NAMES,
  type Direction,
} from "../../../supabase/functions/_shared/play/fright";
import {
  boilerFrame,
  dragPosition,
  frameText,
  HALF_HEIGHT,
  HALF_WIDTH,
  slideOffset,
  type Axis,
  type Frame,
  type Offset,
} from "./boilerPresentation";
import room from "@/assets/play/fright/room.webp";
import doctor from "@/assets/play/fright/doctor.webp";
import awakeBack from "@/assets/play/fright/awake-back.webp";
import asleepBack from "@/assets/play/fright/asleep-back.webp";

export interface BoilerArtworkHandle {
  slide: (direction: Direction) => void;
  cancel: () => void;
}
type Scene = { path: string; deal: string; awake: boolean };
type Phase =
  "idle" | "dragging" | "returning" | "settling" | "revealing" | "gathering";
type Pointer = {
  id: number;
  x: number;
  y: number;
  inverse: DOMMatrix;
  start: DOMPoint;
  axis: Axis | null;
  viewport: { width: number; height: number };
};
interface Props extends Scene {
  revision: string;
  disabled: boolean;
  large: boolean;
  describedBy?: string;
  onSlide: (direction: Direction) => boolean;
  onBusyChange: (busy: boolean) => void;
}
const sameScene = (a: Scene, b: Scene) =>
  a.path === b.path && a.deal === b.deal && a.awake === b.awake;

/** Dragging paints public artwork only; a successful saved slide authorizes new faces. */
export const BoilerArtwork = forwardRef<BoilerArtworkHandle, Props>(
  function BoilerArtwork(props, ref) {
    const id = useId().replace(/:/g, "");
    const [scene, setScene] = useState<Scene>({
      path: props.path,
      deal: props.deal,
      awake: props.awake,
    });
    const sceneRef = useRef(scene);
    const latest = useRef(props);
    latest.current = props;
    const stage = useRef<HTMLDivElement>(null);
    const svg = useRef<SVGSVGElement>(null);
    const stack = useRef<SVGGElement>(null);
    const pointer = useRef<Pointer | null>(null);
    const offset = useRef<Offset>({ x: 0, y: 0 });
    const phaseRef = useRef<Phase>("idle");
    const [phase, setPhase] = useState<Phase>("idle");
    const [cue, setCue] = useState<string | null>(null);
    const [pop, setPop] = useState<number[]>([]);
    const expected = useRef<{ path: string; deal: string } | null>(null);
    const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
    const cameraRaf = useRef(0);
    const initialFrame = useRef(boilerFrame(props.path, !props.awake));
    const frame = useRef(initialFrame.current);
    const reduced = useRef(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const callbacks = useRef({ cancel: (_immediate = false) => {} });

    function phaseTo(value: Phase) {
      phaseRef.current = value;
      setPhase(value);
      latest.current.onBusyChange(value !== "idle");
    }
    function later(callback: () => void, ms: number) {
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        callback();
      }, ms);
      timers.current.add(timer);
    }
    function clearMotion() {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
      cancelAnimationFrame(cameraRaf.current);
    }
    function paintOffset(value: Offset, animate = false) {
      offset.current = value;
      if (!stack.current) return;
      stack.current.style.transition =
        animate && !reduced.current
          ? "transform 220ms cubic-bezier(.2,.8,.2,1)"
          : "none";
      stack.current.style.transform = `translate(${value.x * HALF_WIDTH}px, ${value.y * HALF_HEIGHT}px)`;
    }
    function releasePointer() {
      const active = pointer.current;
      pointer.current = null;
      if (active && stage.current?.hasPointerCapture(active.id))
        stage.current.releasePointerCapture(active.id);
    }
    function show(value: Scene) {
      sceneRef.current = value;
      setScene({ path: value.path, deal: value.deal, awake: value.awake });
    }
    function cancel(immediate = false) {
      const wasDragging = phaseRef.current === "dragging";
      releasePointer();
      clearMotion();
      expected.current = null;
      setCue(null);
      setPop([]);
      if (wasDragging && !immediate && !reduced.current) {
        phaseTo("returning");
        paintOffset({ x: 0, y: 0 }, true);
        later(() => phaseTo("idle"), 220);
      } else {
        paintOffset({ x: 0, y: 0 });
        show(latest.current);
        frame.current = boilerFrame(latest.current.path, !latest.current.awake);
        svg.current?.setAttribute("viewBox", frameText(frame.current));
        phaseTo("idle");
      }
    }
    callbacks.current.cancel = cancel;

    function slide(direction: Direction) {
      if (
        latest.current.disabled ||
        !["idle", "dragging"].includes(phaseRef.current) ||
        !legalDirections(sceneRef.current.path).includes(direction)
      )
        return;
      const before = sceneRef.current;
      releasePointer();
      setCue(null);
      expected.current = { path: before.path + direction, deal: before.deal };
      phaseTo("settling");
      if (!latest.current.onSlide(direction)) {
        expected.current = null;
        phaseTo("returning");
        paintOffset({ x: 0, y: 0 }, true);
        later(() => phaseTo("idle"), reduced.current ? 0 : 220);
        return;
      }
      paintOffset(slideOffset(direction), true);
      later(
        () => {
          const after = latest.current;
          if (
            after.path !== expected.current?.path ||
            after.deal !== expected.current?.deal
          ) {
            cancel(true);
            return;
          }
          const oldGeometry = boilerGeometry(before.path)!;
          const geometry = boilerGeometry(after.path)!;
          // Only newly public cutouts enter. Defense, reload and Undo never trigger this.
          const entering = geometry.visible.flatMap((visible, i) =>
            visible.includes(Number(after.deal[i])) &&
            !oldGeometry.visible[i]?.includes(Number(after.deal[i]))
              ? [i]
              : [],
          );
          expected.current = null;
          paintOffset({ x: 0, y: 0 });
          show(after);
          setPop(reduced.current ? [] : entering);
          phaseTo("revealing");
          later(
            () => {
              setPop([]);
              phaseTo("idle");
            },
            reduced.current ? 0 : 320,
          );
        },
        reduced.current ? 0 : 220,
      );
    }
    useImperativeHandle(ref, () => ({ slide, cancel: () => cancel(true) }));

    useLayoutEffect(() => {
      const next = latest.current;
      if (
        expected.current &&
        phaseRef.current === "settling" &&
        next.path === expected.current.path &&
        next.deal === expected.current.deal
      )
        return;
      if (sceneRef.current.path && !next.path && !reduced.current) {
        // A saved wake/reset gathers only public layers, then removes them.
        // Historical layouts never reconstruct the live scene.
        releasePointer();
        clearMotion();
        expected.current = null;
        setCue(null);
        setPop([]);
        paintOffset({ x: 0, y: 0 });
        phaseTo("gathering");
        later(() => {
          show(latest.current);
          phaseTo("idle");
        }, 240);
        return;
      }
      if (phaseRef.current !== "idle") callbacks.current.cancel(true);
      else if (!sameScene(sceneRef.current, next)) show(next);
    }, [props.path, props.deal, props.awake, props.revision]);
    useEffect(() => {
      if (props.disabled && phaseRef.current === "dragging")
        callbacks.current.cancel(true);
    }, [props.disabled]);

    useLayoutEffect(() => {
      const target = boilerFrame(scene.path, !scene.awake);
      const from = frame.current;
      cancelAnimationFrame(cameraRaf.current);
      // A restored/new deck starts fully framed before it accepts a pointer.
      // Only our committed slide eases its camera after settling.
      if (reduced.current || phaseRef.current === "idle") {
        frame.current = target;
        svg.current?.setAttribute("viewBox", frameText(target));
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / 180);
        const eased = 1 - (1 - progress) ** 3;
        const next = Object.fromEntries(
          Object.keys(target).map((key) => [
            key,
            from[key as keyof Frame] +
              (target[key as keyof Frame] - from[key as keyof Frame]) * eased,
          ]),
        ) as Frame;
        frame.current = next;
        svg.current?.setAttribute("viewBox", frameText(next));
        if (progress < 1) cameraRaf.current = requestAnimationFrame(tick);
      };
      cameraRaf.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(cameraRaf.current);
    }, [scene.path, scene.awake]);

    useEffect(() => {
      const stop = () => {
        if (phaseRef.current !== "idle") callbacks.current.cancel(true);
      };
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      const preference = () => {
        reduced.current = media.matches;
        stop();
      };
      window.addEventListener("resize", stop);
      window.addEventListener("blur", stop);
      media.addEventListener?.("change", preference);
      // Cache both cover states before a wake/sleep transition.
      for (const src of [awakeBack, asleepBack, doctor, room]) {
        const image = new Image();
        image.src = src;
      }
      return () => {
        clearMotion();
        releasePointer();
        window.removeEventListener("resize", stop);
        window.removeEventListener("blur", stop);
        media.removeEventListener?.("change", preference);
        latest.current.onBusyChange(false);
      };
    }, []);

    function position(clientX: number, clientY: number) {
      const active = pointer.current!;
      const point = new DOMPoint(clientX, clientY).matrixTransform(
        active.inverse,
      );
      const dx = clientX - active.x,
        dy = clientY - active.y;
      if (!active.axis && Math.max(Math.abs(dx), Math.abs(dy)) >= 6)
        active.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      const movement = dragPosition(
        point.x - active.start.x,
        point.y - active.start.y,
        active.axis,
        legalDirections(sceneRef.current.path),
      );
      return { ...movement, distance: Math.max(Math.abs(dx), Math.abs(dy)) };
    }
    const geometry = boilerGeometry(scene.path)!;
    return (
      <div
        ref={stage}
        className={`boiler-stage${props.large ? " boiler-stage--large" : ""}${!props.disabled ? " boiler-stage--ready" : ""}`}
        role="group"
        aria-label="Boiler Room revealed cards"
        aria-describedby={props.describedBy}
        aria-disabled={props.disabled}
        aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
        tabIndex={props.disabled ? -1 : 0}
        data-phase={phase}
        onPointerDown={(e) => {
          if (
            props.disabled ||
            phaseRef.current !== "idle" ||
            e.button !== 0 ||
            !e.isPrimary ||
            !(e.target as Element).closest(".boiler-moving-stack")
          )
            return;
          const inverse = svg.current?.getScreenCTM()?.inverse();
          if (!inverse) return;
          cancelAnimationFrame(cameraRaf.current);
          pointer.current = {
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY,
            inverse,
            start: new DOMPoint(e.clientX, e.clientY).matrixTransform(inverse),
            axis: null,
            viewport: { width: window.innerWidth, height: window.innerHeight },
          };
          e.currentTarget.setPointerCapture(e.pointerId);
          e.currentTarget.focus({ preventScroll: true });
          paintOffset({ x: 0, y: 0 });
          phaseTo("dragging");
        }}
        onPointerMove={(e) => {
          if (pointer.current?.id !== e.pointerId) return;
          if (
            pointer.current.viewport.width !== window.innerWidth ||
            pointer.current.viewport.height !== window.innerHeight
          ) {
            cancel(true);
            return;
          }
          const movement = position(e.clientX, e.clientY);
          paintOffset(movement.offset);
          setCue(
            movement.direction
              ? movement.legal
                ? `${DIRECTION_NAMES[movement.direction]} · Release to reveal`
                : "Direction unavailable"
              : null,
          );
        }}
        onPointerUp={(e) => {
          if (pointer.current?.id !== e.pointerId) return;
          if (
            latest.current.disabled ||
            pointer.current.viewport.width !== window.innerWidth ||
            pointer.current.viewport.height !== window.innerHeight
          ) {
            cancel(true);
            return;
          }
          const movement = position(e.clientX, e.clientY);
          if (
            movement.legal &&
            movement.direction &&
            movement.progress >= 0.32 &&
            movement.distance >= 12
          )
            slide(movement.direction);
          else cancel();
        }}
        onPointerCancel={(e) => {
          if (pointer.current?.id === e.pointerId) cancel();
        }}
        onLostPointerCapture={(e) => {
          if (pointer.current?.id === e.pointerId) cancel();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && phaseRef.current !== "idle") {
            e.stopPropagation();
            cancel();
          }
          const direction = (
            {
              ArrowUp: "U",
              ArrowDown: "D",
              ArrowLeft: "L",
              ArrowRight: "R",
            } as const
          )[e.key];
          if (direction && !props.disabled) {
            e.preventDefault();
            slide(direction);
          }
        }}
      >
        <svg
          ref={svg}
          viewBox={frameText(initialFrame.current)}
          aria-hidden="true"
          className="boiler-tableau"
        >
          <defs>
            <clipPath id={`${id}-card`}>
              <rect width="200" height="300" rx="9" />
            </clipPath>
          </defs>
          <g className="boiler-concealed-surface" clipPath={`url(#${id}-card)`}>
            <rect width="200" height="300" fill="#0b0908" />
            <image
              href={room}
              width="200"
              height="300"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
          <g ref={stack} className="boiler-moving-stack">
            {geometry.cards
              .map((p, i) => ({ p, i }))
              .reverse()
              .map(({ p, i }) => {
                const visible = geometry.visible[i];
                const quadrant = Number(scene.deal[i]);
                return (
                  <g
                    key={i}
                    className="boiler-card-layer"
                    transform={`translate(${p.x * HALF_WIDTH},${p.y * HALF_HEIGHT})`}
                  >
                    <defs>
                      <clipPath id={`${id}-visible-${i}`}>
                        {visible.map((q) => (
                          <rect
                            key={q}
                            x={(q % 2) * HALF_WIDTH}
                            y={Math.floor(q / 2) * HALF_HEIGHT}
                            width={HALF_WIDTH}
                            height={HALF_HEIGHT}
                          />
                        ))}
                      </clipPath>
                    </defs>
                    <g clipPath={`url(#${id}-card)`}>
                      <rect width="200" height="300" fill="#0b0908" />
                      <image
                        href={room}
                        width="200"
                        height="300"
                        preserveAspectRatio="xMidYMid slice"
                      />
                      {visible.includes(quadrant) && (
                        <g clipPath={`url(#${id}-visible-${i})`}>
                          <g
                            className={`boiler-doctor${pop.includes(i) ? " boiler-doctor--entering" : ""}`}
                            style={{
                              transformOrigin: `${(quadrant % 2) * HALF_WIDTH + 50}px ${Math.floor(quadrant / 2) * HALF_HEIGHT + 145}px`,
                            }}
                          >
                            <image
                              href={doctor}
                              x={(quadrant % 2) * HALF_WIDTH + 4}
                              y={Math.floor(quadrant / 2) * HALF_HEIGHT + 4}
                              width="92"
                              height="142"
                              preserveAspectRatio="xMidYMid meet"
                            />
                          </g>
                        </g>
                      )}
                      <path
                        d="M100 0V300M0 150H200"
                        stroke="#e1a85a"
                        strokeOpacity=".32"
                        strokeWidth="1"
                      />
                    </g>
                    <rect
                      x="1"
                      y="1"
                      width="198"
                      height="298"
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
              transform={`translate(${geometry.cover.x * HALF_WIDTH},${geometry.cover.y * HALF_HEIGHT})`}
            >
              <image
                href={scene.awake ? awakeBack : asleepBack}
                width="200"
                height="300"
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          </g>
        </svg>
        {cue && (
          <div className="boiler-drag-preview" aria-hidden="true">
            {cue}
          </div>
        )}
      </div>
    );
  },
);
