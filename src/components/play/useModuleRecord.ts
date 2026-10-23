import { useRef, useState } from "react";
import type { PlayEvent } from "@/lib/play/events";

/** Suppress the same stale-render action, while allowing unrelated observations.
 * Failed durable writes remain retryable and never advance the displayed state. */
export function useModuleRecord(
  events: PlayEvent[],
  onEvent: (event: PlayEvent) => boolean,
) {
  const [message, setMessage] = useState("");
  const revision = events.map((event) => event.id).join(",");
  const pending = useRef({ revision, actions: new Set<string>() });
  if (pending.current.revision !== revision)
    pending.current = { revision, actions: new Set() };
  const record = (event: PlayEvent) => {
    const { id: _id, at: _at, ...observation } = event;
    const key = JSON.stringify(observation);
    if (pending.current.actions.has(key)) return false;
    pending.current.actions.add(key);
    const ok = onEvent(event);
    if (!ok) pending.current.actions.delete(key);
    setMessage(ok ? "" : "This change could not be saved. Please try again.");
    return ok;
  };
  return { record, message };
}
