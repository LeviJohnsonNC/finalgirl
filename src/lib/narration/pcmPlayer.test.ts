import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { NarrationPcmPlayer } from './pcmPlayer';
class Context {
  static active: Context;
  currentTime = 0; state = 'running';
  destination = {}; starts: number[][] = [];
  constructor() { Context.active = this; }
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
  createBuffer(_channels: number, length: number, rate: number) { const data = new Float32Array(length); return { duration: length / rate, getChannelData: () => data }; }
  createBufferSource() { return { connect() {}, disconnect() {}, stop() {}, onended: null, start: (...args: number[]) => this.starts.push(args), buffer: null }; }
}
const second = () => btoa('\0'.repeat(96000));
beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal('AudioContext', Context); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('streamed PCM transport', () => {
  it('plays before completion, pauses at its position and resumes/seeks without another synthesis', async () => {
    const update = vi.fn(), end = vi.fn(); const player = new NarrationPcmPlayer(update, end);
    player.append(second());
    expect(Context.active.starts).toHaveLength(1);
    Context.active.currentTime = .535; vi.advanceTimersByTime(250);
    expect(player.elapsed).toBeCloseTo(.5);
    player.pause(); Context.active.currentTime = 10; vi.advanceTimersByTime(250);
    expect(player.elapsed).toBeCloseTo(.5);
    player.append(second()); await player.resume();
    expect(Context.active.starts[1][1]).toBeCloseTo(.5);
    player.seek(.25); expect(player.elapsed).toBeCloseTo(.25);
    expect(end).not.toHaveBeenCalled(); player.dispose(); expect(Context.active.close).toHaveBeenCalledOnce();
  });
  it('buffers an underrun and restarts without skipping received samples', () => {
    const update = vi.fn(); const player = new NarrationPcmPlayer(update, vi.fn());
    player.append(second()); Context.active.currentTime = 2; vi.advanceTimersByTime(250);
    expect(update.mock.lastCall?.[0].buffering).toBe(true);
    player.append(second()); expect(Context.active.starts[1][1]).toBe(0);
    Context.active.currentTime = 10; player.append(second());
    expect(Context.active.starts[2][1]).toBe(0);
    expect(player.elapsed).toBe(2); player.dispose();
  });
  it('assembles one WAV and rejects partial frames or unfinished cache entries', async () => {
    const player = new NarrationPcmPlayer(vi.fn(), vi.fn());
    player.append(btoa('\x01')); expect(() => player.finish()).toThrow('incomplete');
    player.append(btoa('\x02\x03\x04'));
    expect(() => player.toBlob()).toThrow('unfinished'); player.finish();
    const blob = player.toBlob(); expect(blob.type).toBe('audio/wav'); expect(blob.size).toBe(48);
    player.dispose();
  });
});
