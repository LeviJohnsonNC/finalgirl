import { describe, it, expect } from 'vitest';
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
