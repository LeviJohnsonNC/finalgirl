/** Bump whenever casting, spoken-text preparation or delivery changes. */
export const NARRATION_PROFILE = 'midnight-host-tts2-v2';
/** Existing clients validate this field before decoding the PCM stream. */
export const NARRATION_STREAM_PROFILE = 'cinematic-tts2-v1';
export const DEFAULT_NARRATOR = 'Vincent';
export const NARRATION_MODEL = 'inworld-tts-2';
export const NARRATION_SAMPLE_RATE = 48000;
export const delivery: Record<string, string> = {
  dread: 'You host a 1980s midnight horror movie on local TV. Draw one viewer in with a conspiratorial smile. Keep the setup moving. Take a beat before the first unsettling detail, then let the smile leave your voice.',
  survivor: 'The midnight horror host returns for the final reel. Allow one wry lift where the words earn it. Let the cost of the night catch up with you. Give the final image a clean, unhurried landing.',
  cold: 'Close the midnight broadcast as a theatrical horror host. The playfulness has drained away. Let a little silence gather before the final image, then deliver it with crisp, quiet finality.',
  death: 'A short cutaway from a 1980s midnight horror host. Stay close to the microphone and keep the scene moving. Catch the turn with one dry, precise emphasis, then let the silence speak.',
};

/** Display markup and arbitrary bracketed directions must never become voice instructions.
 * Keep names verbatim until their pronunciation has been auditioned. */
export function spokenText(text: string): string {
  return text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '').replace(/[[\]`*_#]/g, '')
    .replace(/\bDr\.(?=\s+[A-Z])/g, 'Doctor').replace(/\bMark V\b/g, 'Mark Five')
    .replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
}

export function narrationChunks(text: string, limit: number): string[] {
  const chunks: string[] = [];
  let rest = spokenText(text);
  while (rest.length > limit) {
    const head = rest.slice(0, limit);
    const boundaries = [...head.matchAll(/[.!?][”"’']?(?:\s+|$)|\n\s*\n/g)];
    const last = boundaries[boundaries.length - 1];
    let end = last && last.index! > limit * .3 ? last.index! + last[0].length : head.lastIndexOf(' ');
    if (end < limit * .3) end = limit;
    // Never split a UTF-16 surrogate pair.
    if (/[\uD800-\uDBFF]/.test(rest[end - 1])) end--;
    chunks.push(rest.slice(0, end).trim()); rest = rest.slice(end).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

/** Handles fragmented lines, multiple messages/read, EOF without newline, and
 * in-band errors after HTTP 200. Used on both sides of the edge relay. */
export async function* narrationMessages(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader(); const decoder = new TextDecoder(); let pending = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      pending += decoder.decode(value, { stream: !done });
      if (pending.length > 4_000_000) throw new Error('Narration message exceeded its limit.');
      let newline: number;
      while ((newline = pending.indexOf('\n')) >= 0) {
        const line = pending.slice(0, newline).trim(); pending = pending.slice(newline + 1);
        if (line) yield JSON.parse(line);
      }
      if (done) { if (pending.trim()) yield JSON.parse(pending); break; }
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
