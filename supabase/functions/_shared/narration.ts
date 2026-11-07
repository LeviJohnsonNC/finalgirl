/** Bump whenever casting, spoken-text preparation or delivery changes. */
export const NARRATION_PROFILE = 'cinematic-tts2-v1';
export const NARRATION_MODEL = 'inworld-tts-2';
export const NARRATION_SAMPLE_RATE = 48000;
export const delivery: Record<string, string> = {
  dread: 'Intimate, watchful suspense narration. Natural conversational pacing, clear words, restrained tension. No theatrical growling or exaggerated whispering.',
  survivor: 'Quiet, exhausted relief after surviving a frightening night. Warm but unsettled. Understated cinematic narration, never a triumphant advertisement.',
  cold: 'Grave, restrained horror narration. Clear, measured and human, with quiet finality. No relish, villain voice, shouting or exaggerated whispering.',
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
