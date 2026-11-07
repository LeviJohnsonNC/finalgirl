import { test, expect, gameId, selection, opening } from './fixtures';
const draft = { version: 1, id: gameId, phase: 'nowPlaying', selection, introStory: opening };
async function installStream(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const original = window.fetch;
    const state = window as unknown as { narrationCalls: number; finishNarration: (fail?: boolean) => void; cancelledNarration: boolean };
    state.narrationCalls = 0; state.cancelledNarration = false;
    window.fetch = async (input, init) => {
      if (!String(input).includes('/functions/v1/narrate-story')) return original(input, init);
      state.narrationCalls++;
      const encoder = new TextEncoder();
      // Real Web Audio playback of deterministic PCM; no provider/voice-quality claim.
      const samples = new Int16Array(48000 * 6);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.sin(i * 2 * Math.PI * 220 / 48000) * 100;
      const bytes = new Uint8Array(samples.buffer); let binary = '';
      for (const byte of bytes) binary += String.fromCharCode(byte);
      const body = new ReadableStream({ start(controller) {
        const send = (value: unknown) => controller.enqueue(encoder.encode(JSON.stringify(value) + '\n'));
        send({ type: 'start', sampleRate: 48000, profile: 'cinematic-tts2-v1', model: 'inworld-tts-2', voiceId: 'test' });
        send({ type: 'audio', audio: btoa(binary) });
        state.finishNarration = (fail = false) => { send(fail ? { type: 'error', error: 'Connection interrupted.' } : { type: 'done' }); controller.close(); };
        init?.signal?.addEventListener('abort', () => { state.cancelledNarration = true; controller.error(new DOMException('Aborted', 'AbortError')); }, { once: true });
      }, cancel() { state.cancelledNarration = true; } });
      return new Response(body, { headers: { 'Content-Type': 'application/x-ndjson' } });
    };
  });
}
async function resume(page: import('@playwright/test').Page) {
  await page.goto('/'); await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await page.getByRole('button', { name: 'Narrate', exact: true }).waitFor();
}
test('stream plays before completion; pause, seek and cached reload replay keep their positions', async ({ page, archive }, info) => {
  await archive.install(page, { draft }); await installStream(page); await resume(page);
  await page.getByRole('button', { name: 'Narrate', exact: true }).click();
  const slider = page.getByRole('slider', { name: 'Seek narration' });
  await expect(page.getByRole('button', { name: 'Pause narration', exact: true })).toBeVisible();
  await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(.25);
  await page.getByRole('button', { name: 'Pause narration', exact: true }).click();
  const position = Number(await slider.inputValue()); await page.waitForTimeout(350);
  expect(Number(await slider.inputValue())).toBeCloseTo(position, 1);
  await slider.fill('3'); await expect(slider).toHaveValue('3');
  await page.getByRole('button', { name: 'Rewind narration 10 seconds' }).click(); await expect(slider).toHaveValue('0');
  await page.getByRole('button', { name: 'Resume narration', exact: true }).click();
  await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(.1);
  await page.evaluate(() => (window as unknown as { finishNarration: () => void }).finishNarration());
  await expect(page.locator('.narration-timecode').last()).toHaveText('00:06');
  await page.screenshot({ path: info.outputPath('streamed-player.png'), fullPage: true });
  if (info.project.name === 'desktop') {
    await page.setViewportSize({ width: 1280, height: 640 });
    await expect(page.getByRole('button', { name: 'Pause narration', exact: true })).toBeInViewport();
    await expect(page.getByRole('button', { name: 'WON', exact: true })).toBeInViewport();
  }
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await page.reload(); await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await page.getByRole('button', { name: 'Narrate', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause narration', exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { narrationCalls: number }).narrationCalls)).toBe(0);
});
test('mid-stream failure does not cache the partial take and retry requests fresh audio', async ({ page, archive }) => {
  await archive.install(page, { draft }); await installStream(page); await resume(page);
  await page.getByRole('button', { name: 'Narrate', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause narration', exact: true })).toBeVisible();
  await page.evaluate(() => (window as unknown as { finishNarration: (fail: boolean) => void }).finishNarration(true));
  await expect(page.getByText('Narration failed', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Narrate', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause narration', exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { narrationCalls: number }).narrationCalls)).toBe(2);
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { cancelledNarration: boolean }).cancelledNarration)).toBe(true);
});
