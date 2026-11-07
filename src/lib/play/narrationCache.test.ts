import { describe, it, expect } from 'vitest';
import { clearDiscardedNarration } from '../discardNarration';
import { getFilmIdByLocation } from '@/types/gameData';
import {
  getNarrationClip,
  putNarrationClip,
  narrationKey,
} from './narrationCache';
describe('device audio cache', () => {
  it('scopes clips by owner and exact text/casting', async () => {
    const key = await narrationKey('Saved scene', {
      kind: 'death',
      deathSceneId: 'one',
    });
    const clip = new Blob(['audio']);
    await putNarrationClip('cache-A', key, clip);
    expect(await getNarrationClip('cache-A', key)).toBe(clip);
    expect(await getNarrationClip('cache-B', key)).toBeNull();
    expect(
      await narrationKey('Changed scene', {
        kind: 'death',
        deathSceneId: 'one',
      }),
    ).not.toBe(key);
    expect(await narrationKey('Saved scene', { kind: 'intro' })).not.toBe(key);
  });
  it('evicts old clips instead of growing memory without bound', async () => {
    for (let i = 0; i < 25; i++)
      await putNarrationClip('cache-limit', 'clip-' + i, new Blob(['audio']));
    expect(await getNarrationClip('cache-limit', 'clip-0')).toBeNull();
    expect(await getNarrationClip('cache-limit', 'clip-24')).not.toBeNull();
  });
});


it('discard removes an old unassociated v2 recording while retaining another owner’s clip', async () => {
  const text = 'An old saved opening.';
  const casting = { kind: 'intro', filmId: getFilmIdByLocation('Camp Happy Trails') };
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify({ version: 2, text, casting })));
  const legacyKey = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  const clip = new Blob(['legacy audio']);
  await putNarrationClip('legacy-owner', legacyKey, clip);
  await putNarrationClip('other-owner', legacyKey, clip);
  await clearDiscardedNarration('legacy-owner', 'discarded-game', { discarded: true, history: { intro_story: text, location: 'Camp Happy Trails' } });
  expect(await getNarrationClip('legacy-owner', legacyKey)).toBeNull();
  expect(await getNarrationClip('other-owner', legacyKey)).toBe(clip);
});
