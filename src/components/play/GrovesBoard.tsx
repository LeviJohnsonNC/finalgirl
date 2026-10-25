import { useId } from "react";
import {
  GROVES_EDGES,
  GROVES_SPACES,
  GROVES_SETUPS,
  grovesEdgeId,
  grovesSpaceName,
  grovesSetupDescription,
} from "../../../supabase/functions/_shared/play/groves";
import "@/styles/play-groves-board.css";
/** Exact connectivity; positional aliases are UI aids, not new canonical places. */
export function GrovesBoard({
  setup,
  edge,
}: {
  setup?: string;
  edge?: string;
}) {
  const title = useId();
  const s = GROVES_SETUPS.find((s) => s.name === setup);
  return (
    <figure className="groves-board">
      <svg viewBox="0 0 1000 1030" role="img" aria-labelledby={title}>
        <title id={title}>
          {s ? `${s.name} setup diagram` : "Sacred Groves connection reference"}
          . Positional aliases identify unnamed spaces.
        </title>
        <rect x="0" y="0" width="1000" height="1030" rx="25" fill="#111d17" />
        <path
          d="M650 260 Q870 350 800 650 Q750 860 620 900 Q640 650 610 560Z"
          fill="#173c43"
          stroke="#355651"
          strokeWidth="4"
        />
        {GROVES_EDGES.map((pair) => {
          const a = GROVES_SPACES.find((s) => s.id === pair[0])!,
            b = GROVES_SPACES.find((s) => s.id === pair[1])!;
          return (
            <line
              key={grovesEdgeId(pair)}
              x1={a.x * 9 + 40}
              y1={a.y * 9 + 35}
              x2={b.x * 9 + 40}
              y2={b.y * 9 + 35}
              stroke={grovesEdgeId(pair) === edge ? "#ffd069" : "#6d7965"}
              strokeWidth={grovesEdgeId(pair) === edge ? 12 : 5}
            />
          );
        })}
        {GROVES_SPACES.map((space, i) => (
          <g
            key={space.id}
            transform={`translate(${space.x * 9 + 40},${space.y * 9 + 35})`}
          >
            <circle
              r="34"
              fill={
                space.type === "sacred"
                  ? "#67382e"
                  : space.type === "search"
                    ? "#735327"
                    : space.type === "exit"
                      ? "#315c3d"
                      : "#28332b"
              }
              stroke="#b4ad8e"
              strokeWidth="2"
            />
            <text
              textAnchor="middle"
              y="7"
              fill="#f4ead2"
              fontSize="22"
              fontWeight="bold"
            >
              {String.fromCharCode(65 + i)}
            </text>
            {s &&
              (s.victims[space.id] ||
                s.girl === space.id ||
                s.killer === space.id) && (
                <g transform="translate(25,-23)">
                  <circle
                    r="22"
                    fill={
                      s.girl === space.id
                        ? "#d5ae4b"
                        : s.killer === space.id
                          ? "#9f352b"
                          : "#e2d7be"
                    }
                  />
                  <text
                    textAnchor="middle"
                    y="7"
                    fontSize="22"
                    fontWeight="bold"
                    fill={s.killer === space.id ? "#fff" : "#161b16"}
                  >
                    {s.girl === space.id
                      ? "F"
                      : s.killer === space.id
                        ? "K"
                        : s.victims[space.id]}
                  </text>
                </g>
              )}
          </g>
        ))}
      </svg>
      <figcaption>
        {s ? (
          <>
            <strong>{s.name}</strong>
            <p>F · Final Girl &nbsp; K · Killer &nbsp; Numbers · Victims</p>
            <p>{grovesSetupDescription(s)}</p>
          </>
        ) : (
          <p>
            Diagram labels identify spaces, not movement or panic instructions.
            Choose a connection from the list.
          </p>
        )}
      </figcaption>
      <details>
        <summary>Space key</summary>
        <dl>
          {GROVES_SPACES.map((s, i) => (
            <div key={s.id}>
              <dt>{String.fromCharCode(65 + i)}</dt>
              <dd>
                {grovesSpaceName(s.id)}
                {s.type === "sacred"
                  ? " · Sacred"
                  : s.type === "search"
                    ? " · Search"
                    : ""}
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </figure>
  );
}
