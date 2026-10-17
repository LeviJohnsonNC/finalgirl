import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { useNarration } from './useNarration';
const h = vi.hoisted(() => ({
  owner: 'owner-A',
  audio: [] as Array<{
    src: string;
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    currentTime: number;
    duration: number;
    onended: () => void;
    onerror: () => void;
    ontimeupdate: () => void;
  }>,
  clips: new Map<string, Blob>(),
}));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: h.owner } }),
}));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: async () => ({
        data: { session: { access_token: 'test', user: { id: h.owner } } },
      }),
    },
  },
}));
vi.mock('@/lib/audioUtils', () => ({
  createPrimedAudio: () => {
    const a = {
      src: '',
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      currentTime: 0,
      duration: 60,
      onended: () => {},
      onerror: () => {},
      ontimeupdate: () => {},
    };
    h.audio.push(a);
    return a;
  },
  base64ToBlob: () => new Blob(['audio']),
}));
vi.mock('@/lib/play/narrationCache', () => ({
  narrationKey: async (text: string, casting: unknown) =>
    JSON.stringify([text, casting]),
  getNarrationClip: async (owner: string, key: string) =>
    h.clips.get(owner + key) ?? null,
  putNarrationClip: async (owner: string, key: string, blob: Blob) => {
    h.clips.set(owner + key, blob);
  },
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
beforeEach(() => {
  h.owner = 'owner-A';
  h.audio.length = 0;
  h.clips.clear();
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ audioContent: 'dGVzdA==' }), {
          status: 200,
        }),
      ),
  );
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn().mockReturnValue('blob:test'),
    revokeObjectURL: vi.fn(),
  });
});
afterEach(() => vi.unstubAllGlobals());
describe('owned single-narrator playback', () => {
  it('replays a saved clip without another provider request and revokes the old URL', async () => {
    const hook = renderHook(() => useNarration());
    await act(() =>
      hook.result.current.toggleNarration('An original death scene.', {
        kind: 'death',
        deathSceneId: 'scene',
      }),
    );
    expect(hook.result.current.isPlaying).toBe(true);
    act(() => hook.result.current.stopNarration());
    await act(() =>
      hook.result.current.toggleNarration('An original death scene.', {
        kind: 'death',
        deathSceneId: 'scene',
      }),
    );
    expect(fetch).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
    expect(h.audio[0].pause).toHaveBeenCalled();
    hook.unmount();
  });
  it('stops an introduction before a death narration can play', async () => {
    const intro = renderHook(() => useNarration()),
      death = renderHook(() => useNarration());
    await act(() =>
      intro.result.current.toggleNarration('An ominous introduction.', {
        kind: 'intro',
      }),
    );
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ audioContent: 'dGVzdA==' }), {
        status: 200,
      }),
    );
    await act(() =>
      death.result.current.toggleNarration('An original death scene.', {
        kind: 'death',
        deathSceneId: 'scene',
      }),
    );
    expect(intro.result.current.isPlaying).toBe(false);
    expect(death.result.current.isPlaying).toBe(true);
    expect(h.audio[0].pause).toHaveBeenCalled();
    intro.unmount();
    death.unmount();
  });
  it('ignores a late provider response after closing the panel', async () => {
    let resolve!: (r: Response) => void;
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const hook = renderHook(() => useNarration());
    let request!: Promise<void>;
    act(() => {
      request = hook.result.current.toggleNarration(
        'An original death scene.',
        { kind: 'death', deathSceneId: 'scene' },
      );
    });
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    hook.unmount();
    await act(async () => {
      resolve(
        new Response(JSON.stringify({ audioContent: 'dGVzdA==' }), {
          status: 200,
        }),
      );
      await request;
    });
    expect(h.audio[0].play).not.toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
  it('does not play or cache an old account response after account switching', async () => {
    let resolve!: (r: Response) => void;
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const hook = renderHook(() => useNarration());
    let request!: Promise<void>;
    act(() => {
      request = hook.result.current.toggleNarration('An original death scene.');
    });
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    h.owner = 'owner-B';
    hook.rerender();
    await act(async () => {
      resolve(
        new Response(JSON.stringify({ audioContent: 'dGVzdA==' }), {
          status: 200,
        }),
      );
      await request;
    });
    expect(h.audio[0].play).not.toHaveBeenCalled();
    expect(h.clips.size).toBe(0);
    hook.unmount();
  });
});
