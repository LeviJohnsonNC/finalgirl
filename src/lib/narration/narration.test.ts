import { describe, it, expect } from 'vitest';
import { narrationChunks, narrationMessages, spokenText } from '../../../supabase/functions/_shared/narration';
const encoder = new TextEncoder();
describe('spoken text and provider framing', () => {
  it('preserves prose and paragraph breaks while stripping display markup and injected directions', () => {
    expect(spokenText('**Laurie** whispered, *“Run.”*\n\n[shout] Go to [the door](https://example.test).')).toBe('Laurie whispered, “Run.”\n\nshout Go to the door.');
  });
  it('splits long text at quoted sentences, preserves words, and fits provider limits', () => {
    const text = Array.from({ length: 100 }, () => 'Laurie said, “Nobody goes alone.”\n\nThe door opened.').join(' ');
    const parts = narrationChunks(text, 300);
    expect(parts.length).toBeGreaterThan(5);
    expect(parts.every(part => part.length <= 300)).toBe(true);
    expect(parts.join(' ').replace(/\s+/g, ' ')).toBe(text.replace(/\s+/g, ' '));
    expect(narrationChunks('x'.repeat(301) + '😱', 302).join('')).toBe('x'.repeat(301) + '😱');
  });
  it('reads split UTF-8, coalesced records and the final unterminated record', async () => {
    const bytes = encoder.encode('{"type":"audio","text":"é"}\n{"type":"done"}');
    const stream = new ReadableStream<Uint8Array>({ start(c) { for (const byte of bytes) c.enqueue(new Uint8Array([byte])); c.close(); } });
    const messages = []; for await (const message of narrationMessages(stream)) messages.push(message);
    expect(messages).toEqual([{ type: 'audio', text: 'é' }, { type: 'done' }]);
  });
  it('cancels its upstream reader when a consumer stops early', async () => {
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(encoder.encode('{"type":"audio"}\n')); }, cancel() { cancelled = true; } });
    for await (const message of narrationMessages(stream)) { expect(message.type).toBe('audio'); break; }
    expect(cancelled).toBe(true);
  });
});
