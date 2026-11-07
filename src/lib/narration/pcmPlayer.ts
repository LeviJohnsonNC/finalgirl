export interface PlaybackSnapshot { elapsed: number; duration: number; playing: boolean; buffering: boolean; complete: boolean }
const RATE = 48000;
const MAX_BYTES = 96 * 1024 * 1024;
interface Section { start: number; buffer: AudioBuffer; bytes: Uint8Array<ArrayBuffer> }

/** PCM16 mono queue. Small scheduling horizon, continuous sample clock, bounded
 * memory, and no decoding/re-encoding or MP3 frame joins on the audible path. */
export class NarrationPcmPlayer {
  private context: AudioContext;
  private sections: Section[] = [];
  private sources = new Set<AudioBufferSourceNode>();
  private offset = 0;
  private anchor = 0;
  private scheduled = 0;
  private total = 0;
  private byteCount = 0;
  private pendingByte: number | undefined;
  private paused = false;
  private finished = false;
  private disposed = false;
  private running = false;
  private interval: ReturnType<typeof setInterval>;

  constructor(private update: (state: PlaybackSnapshot) => void, private ended: () => void) {
    this.context = new AudioContext({ sampleRate: RATE });
    // Called synchronously inside the user's click, before auth/cache/network awaits.
    void this.context.resume().catch(() => {});
    this.interval = setInterval(() => this.pump(), 200);
  }
  get duration() { return this.total; }
  get elapsed() { return Math.min(this.total, this.offset + (this.running ? Math.max(0, this.context.currentTime - this.anchor) : 0)); }

  append(base64: string) {
    if (this.disposed) return;
    const binary = atob(base64);
    this.byteCount += binary.length;
    if (this.byteCount > MAX_BYTES) throw new Error('This narration exceeds the playback limit.');
    const raw = new Uint8Array(binary.length + (this.pendingByte === undefined ? 0 : 1));
    let at = 0;
    if (this.pendingByte !== undefined) raw[at++] = this.pendingByte;
    for (let i = 0; i < binary.length; i++) raw[at++] = binary.charCodeAt(i);
    this.pendingByte = raw.length % 2 ? raw[raw.length - 1] : undefined;
    const bytes = raw.slice(0, raw.length - raw.length % 2);
    if (!bytes.length) return;
    const buffer = this.context.createBuffer(1, bytes.length / 2, RATE);
    const samples = buffer.getChannelData(0), view = new DataView(bytes.buffer);
    for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
    // Freeze the old end before extending it: a late packet must not skip samples.
    if (this.running && this.elapsed >= this.total) this.silence();
    this.sections.push({ start: this.total, buffer, bytes });
    this.total += buffer.duration;
    this.pump();
  }
  finish() {
    if (this.pendingByte !== undefined || !this.total) throw new Error('The narration audio was incomplete.');
    this.finished = true;
  }
  private silence() {
    this.offset = this.elapsed; this.running = false;
    for (const source of this.sources) { source.onended = null; source.stop(); source.disconnect(); }
    this.sources.clear(); this.scheduled = this.offset;
  }
  pause() { this.silence(); this.paused = true; this.pump(); }
  async resume() { await this.context.resume(); if (this.disposed) return; this.paused = false; this.pump(); }
  seek(seconds: number) {
    this.silence(); this.offset = Math.max(0, Math.min(seconds, this.total)); this.scheduled = this.offset; this.pump();
  }
  private pump() {
    if (this.disposed) return;
    if (this.running && this.elapsed >= this.total) this.silence();
    // Begin with 180ms buffered; recover underruns using the same threshold.
    const available = this.total - this.offset;
    if (!this.running && !this.paused && this.context.state === 'running' && available > 0 && (available >= .18 || this.finished)) {
      this.anchor = this.context.currentTime + .035; this.running = true; this.scheduled = this.offset;
    }
    if (this.running) {
      const head = this.elapsed;
      for (const section of this.sections) {
        const end = section.start + section.buffer.duration;
        if (end <= this.scheduled + .000001) continue;
        const begin = Math.max(section.start, this.scheduled, head);
        if (begin > head + 1.5) break;
        const source = this.context.createBufferSource(); source.buffer = section.buffer; source.connect(this.context.destination);
        source.onended = () => { this.sources.delete(source); source.disconnect(); };
        source.start(Math.max(this.context.currentTime, this.anchor + begin - this.offset), begin - section.start);
        this.sources.add(source); this.scheduled = end;
      }
    }
    this.update({ elapsed: this.elapsed, duration: this.total, playing: !this.paused && this.context.state === 'running', buffering: !this.paused && this.context.state === 'running' && !this.running && !this.finished, complete: this.finished });
    if (this.finished && !this.paused && this.elapsed >= this.total && this.total > 0) this.ended();
  }
  /** A single correct WAV header, only after an explicit successful end marker. */
  toBlob(): Blob {
    if (!this.finished) throw new Error('Cannot save an unfinished narration.');
    const size = this.sections.reduce((sum, section) => sum + section.bytes.length, 0);
    const header = new ArrayBuffer(44), v = new DataView(header);
    const word = (at: number, text: string) => { for (let i = 0; i < text.length; i++) v.setUint8(at + i, text.charCodeAt(i)); };
    word(0, 'RIFF'); v.setUint32(4, 36 + size, true); word(8, 'WAVE'); word(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, RATE, true); v.setUint32(28, RATE * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    word(36, 'data'); v.setUint32(40, size, true);
    return new Blob([header, ...this.sections.map(section => section.bytes)], { type: 'audio/wav' });
  }
  dispose() {
    if (this.disposed) return;
    this.silence(); this.disposed = true; clearInterval(this.interval); this.sections = [];
    void this.context.close().catch(() => {});
  }
}
