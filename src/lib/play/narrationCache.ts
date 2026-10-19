import { isGameDiscarded } from "@/lib/discardedGames";
/** Owner-scoped, bounded device audio cache. Storage failure never prevents playback. */
const MAX_BYTES = 12 * 1024 * 1024,
  MAX_ENTRIES = 24;
interface Entry {
  id: string;
  owner: string;
  used: number;
  blob: Blob;
  gameIds?: string[];
}
const memory = new Map<string, Entry>();
const id = (owner: string, key: string) => owner + ':' + key;
export async function narrationKey(text: string, casting: unknown) {
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify({ version: 2, text, casting })),
  );
  return Array.from(new Uint8Array(hash), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}
function database(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    let finished = false;
    let request: IDBOpenDBRequest;
    const finish = (value: IDBDatabase | null) => {
      if (finished) {
        value?.close();
        return;
      }
      finished = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), 1000);
    try {
      request = indexedDB.open('final-girl-narration-cache-v1', 1);
    } catch {
      finish(null);
      return;
    }
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('clips'))
        request.result.createObjectStore('clips', { keyPath: 'id' });
    };
    request.onsuccess = () => finish(request.result);
    request.onerror = () => finish(null);
    request.onblocked = () => finish(null);
  });
}
function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error);
    tx.onerror = () => reject(tx.error);
  });
}
function remember(entry: Entry) {
  memory.delete(entry.id);
  memory.set(entry.id, entry);
  let bytes = Array.from(memory.values()).reduce((n, e) => n + e.blob.size, 0);
  while (memory.size > MAX_ENTRIES || bytes > MAX_BYTES) {
    const oldest = memory.keys().next().value;
    if (!oldest) break;
    bytes -= memory.get(oldest)!.blob.size;
    memory.delete(oldest);
  }
}
export async function getNarrationClip(
  owner: string,
  key: string,
  gameId?: string,
): Promise<Blob | null> {
  if (gameId && isGameDiscarded(owner,gameId)) return null;
  const entry = memory.get(id(owner, key));
  if (entry) {
    remember({ ...entry, used: Date.now() });
    if (gameId) void putNarrationClip(owner,key,entry.blob,gameId);
    return entry.blob;
  }
  const db = await database();
  if (!db) return null;
  try {
    const tx = db.transaction('clips', 'readonly');
    const read = tx.objectStore('clips').get(id(owner, key));
    const stored = await requestResult<Entry | undefined>(read);
    if (
      !stored ||
      stored.owner !== owner ||
      !(stored.blob instanceof Blob) ||
      !stored.blob.size ||
      stored.blob.size > MAX_BYTES
    )
      return null;
    remember({ ...stored, used: Date.now() });
    if (gameId) void putNarrationClip(owner,key,stored.blob,gameId);
    return stored.blob;
  } catch {
    return null;
  } finally {
    db.close();
  }
}
export async function putNarrationClip(
  owner: string,
  key: string,
  blob: Blob,
  gameId?: string,
): Promise<void> {
  if (!blob.size || blob.size > MAX_BYTES || gameId && isGameDiscarded(owner,gameId)) return;
  const gameIds = [...new Set([...(memory.get(id(owner,key))?.gameIds ?? []), ...(gameId ? [gameId] : [])])];
  const entry = { id: id(owner, key), owner, used: Date.now(), blob, ...(gameIds.length && {gameIds}) };
  remember(entry);
  const db = await database();
  if (!db) return;
  try {
    if (gameId && isGameDiscarded(owner,gameId)) return;
    // One transaction serializes simultaneous cache writes and their eviction.
    const tx = db.transaction('clips', 'readwrite');
    const completion = done(tx).catch(() => {});
    const store = tx.objectStore('clips');
    store.put(entry);
    const all = await requestResult<Entry[]>(store.getAll());
    const owned = all
      .filter((e) => e.owner === owner)
      .sort((a, b) => b.used - a.used);
    let bytes = 0;
    owned.forEach((e, index) => {
      bytes += e.blob.size;
      if (index >= MAX_ENTRIES || bytes > MAX_BYTES) store.delete(e.id);
    });
    await completion;
  } catch {
    /* Private mode or quota exhaustion: the in-memory clip still replays. */
  } finally {
    db.close();
  }
}

/** Remove this game's clips, including known legacy keys which predate game association. */
export async function removeGameNarration(owner: string, gameId: string, keys: string[] = []) {
  const ids = new Set(keys.map(key => id(owner,key)));
  const belongs = (entry: Entry) => entry.owner === owner && (entry.gameIds?.includes(gameId) || ids.has(entry.id));
  for (const [key, entry] of memory) if (belongs(entry)) {
    const retained = entry.gameIds?.filter(id => id !== gameId) ?? [];
    if (retained.length) memory.set(key,{...entry,gameIds:retained}); else memory.delete(key);
  }
  const db = await database();
  if (!db) return;
  try {
    const tx = db.transaction('clips','readwrite');
    const completion = done(tx);
    const store = tx.objectStore('clips');
    const entries = await requestResult<Entry[]>(store.getAll());
    for (const entry of entries) if (belongs(entry)) {
      const retained = entry.gameIds?.filter(id => id !== gameId) ?? [];
      if (retained.length) store.put({...entry,gameIds:retained}); else store.delete(entry.id);
    }
    await completion;
  } finally { db.close(); }
}
