import { readStoredValue } from "@/hooks/useLocalStorage";

const volatile = new Map<string, Set<string>>();
export const discardedGamesKey = (owner: string) =>
  `final-girl-discarded-games-v1:${owner}`;
const notify = (key: string) =>
  window.dispatchEvent(
    new CustomEvent("final-girl-storage-change", { detail: key }),
  );
export function isGameDiscarded(owner: string, id: string) {
  return (
    volatile.get(owner)?.has(id) ||
    readStoredValue<Record<string, boolean>>(discardedGamesKey(owner), {})[
      id
    ] === true
  );
}
export function markGameDiscarded(owner: string, id: string) {
  const ids = volatile.get(owner) ?? new Set<string>();
  ids.add(id);
  volatile.set(owner, ids);
  const key = discardedGamesKey(owner);
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ ...readStoredValue(key, {}), [id]: true }),
    );
    ids.delete(id);
  } catch {
    /* The marker remains in memory; clearing the large active draft frees space below. */
  }
  notify(key);
}
function rewrite(key: string, change: (value: unknown) => unknown) {
  const current = readStoredValue<unknown>(key, null);
  if (current === null) return;
  const next = change(current);
  if (next === null) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(next));
  notify(key);
}

/** Remove only this ID. Queued/in-flight sends also consult the marker before and after await. */
export function purgeLocalGame(owner: string, id: string) {
  markGameDiscarded(owner, id);
  rewrite(`final-girl-active-game-v1:${owner}`, (value) =>
    (value as { id?: string }).id === id ? null : value,
  );
  for (const key of [
    `final-girl-history-v3:${owner}`,
    "final-girl-game-history",
  ])
    rewrite(key, (value) =>
      Array.isArray(value) ? value.filter((game) => game?.id !== id) : value,
    );
  for (const key of [
    `final-girl-history-outbox-v1:${owner}`,
    `final-girl-play-outbox-v1:${owner}`,
  ])
    rewrite(key, (value) =>
      Array.isArray(value)
        ? value.filter(
            (item) => (item?.value?.game?.id ?? item?.value?.id) !== id,
          )
        : value,
    );
  rewrite(`final-girl-play-revisions-v1:${owner}`, (value) => {
    const next = { ...(value as Record<string, unknown>) };
    delete next[id];
    return next;
  });
  localStorage.removeItem(`final-girl-play-backup-v1:${owner}:${id}`);
  localStorage.removeItem(`final-girl-discard-intent-v1:${owner}:${id}`);
  // Retry durable marker persistence after dropping the potentially large draft.
  markGameDiscarded(owner, id);
}
