import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useImageGeneration } from './useImageGeneration';
const mock = vi.hoisted(() => ({ user: { id: 'A' }, load: vi.fn(), session: vi.fn() }));
vi.mock('./useAuth', () => ({ useAuth: () => ({ user: mock.user, isAuthenticated: true }) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { getSession: () => mock.session() }, from: () => {
  const builder = { select: () => builder, eq: () => builder, abortSignal: () => builder, maybeSingle: () => mock.load() };
  return builder;
} } }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
beforeEach(() => { mock.load.mockReset(); mock.user = { id: 'A' }; mock.session.mockImplementation(async () => ({ data: { session: { access_token: 'test', user: mock.user } } })); });

describe('image preference readiness', () => {
  it('enables casting artwork and scene photography for a player without saved preferences', async () => {
    mock.load.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(useImageGeneration);
    await waitFor(() => expect(result.current.settingsReady).toBe(true));
    expect(result.current.autoGenerate).toBe(true);
    expect(result.current.useAiCastingArt).toBe(true);
  });
  it('does not authorize auto-generation until the saved opt-out loads', async () => {
    let complete: (value: unknown) => void;
    mock.load.mockReturnValue(new Promise(resolve => { complete = resolve; }));
    const { result } = renderHook(useImageGeneration);
    expect(result.current.settingsReady).toBe(false);
    await act(async () => { complete!({ data: { auto_generate_images: false, use_ai_casting_art: true }, error: null }); });
    expect(result.current.settingsReady).toBe(true);
    expect(result.current.autoGenerate).toBe(false);
  });
  it('keeps auto-generation gated when preferences fail to load', async () => {
    mock.load.mockResolvedValue({ data: null, error: { message: 'offline' } });
    const { result } = renderHook(useImageGeneration);
    await waitFor(() => expect(result.current.settingsError).toBe('offline'));
    expect(result.current.settingsReady).toBe(false);
  });
  it('ignores a late preference response from the old account', async () => {
    let complete: (value: unknown) => void;
    mock.load.mockReturnValueOnce(new Promise(resolve => { complete = resolve; })).mockResolvedValue({ data: { auto_generate_images: false, use_ai_casting_art: false }, error: null });
    const { result, rerender } = renderHook(useImageGeneration);
    mock.user = { id: 'B' }; rerender();
    await waitFor(() => expect(result.current.settingsReady).toBe(true));
    await act(async () => { complete!({ data: { auto_generate_images: true, use_ai_casting_art: true }, error: null }); });
    expect(result.current.autoGenerate).toBe(false);
    expect(result.current.useAiCastingArt).toBe(false);
  });
});

describe('image request isolation', () => {
  const context = { story: 'Synthetic scene.', killer: 'Hans', finalGirl: 'Laurie', location: 'Camp Happy Trails', sceneType: 'beginning' as const };
  const response = (body: unknown) => ({ ok: true, json: async () => body }) as Response;
  beforeEach(() => { mock.load.mockResolvedValue({ data: null, error: null }); });
  it('does not deliver an old account picture after switching away and back', async () => {
    let finish!: (value: Response) => void;
    const fetch = vi.fn(() => new Promise<Response>(resolve => { finish = resolve; }));
    vi.stubGlobal('fetch', fetch);
    const { result, rerender } = renderHook(useImageGeneration);
    let pending!: Promise<string | null>;
    await act(async () => { pending = result.current.generateImage(context); });
    expect(fetch).toHaveBeenCalledOnce();
    mock.user = { id: 'B' }; rerender();
    mock.user = { id: 'A' }; rerender();
    await act(async () => { finish(response({ imageUrl: 'old-private-picture' })); expect(await pending).toBeNull(); });
    expect(result.current.isGeneratingImage).toBe(false);
    expect(result.current.imageError).toBeNull();
  });
  it('does not let a superseded failure clear a newer request or replace its result', async () => {
    const finishes: Array<(value: Response) => void> = [];
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => { finishes.push(resolve); })));
    const { result } = renderHook(useImageGeneration);
    let first!: Promise<string | null>, second!: Promise<string | null>;
    await act(async () => { first = result.current.generateImage(context); });
    await act(async () => { second = result.current.generateImage(context); });
    await act(async () => { finishes[0](response({ error: 'Old failure' })); expect(await first).toBeNull(); });
    expect(result.current.isGeneratingImage).toBe(true);
    expect(result.current.imageError).toBeNull();
    await act(async () => { finishes[1](response({ imageUrl: 'current-picture' })); expect(await second).toBe('current-picture'); });
    expect(result.current.isGeneratingImage).toBe(false);
  });
  it('does not return old visual continuity to a different account', async () => {
    let finish!: (value: Response) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => { finish = resolve; })));
    const { result, rerender } = renderHook(useImageGeneration);
    let pending!: Promise<string | undefined>;
    await act(async () => { pending = result.current.generateVisualBible(context); });
    mock.user = { id: 'B' }; rerender();
    await act(async () => { finish(response({ visualBible: 'Old private continuity' })); expect(await pending).toBeUndefined(); });
  });
  it('never submits one account context under another account token', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    mock.session.mockResolvedValue({ data: { session: { access_token: 'other', user: { id: 'B' } } } });
    const { result } = renderHook(useImageGeneration);
    await act(async () => { expect(await result.current.generateImage(context)).toBeNull(); });
    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.imageError).toContain('account changed');
  });
  it('rechecks the session even if the originating screen has unmounted', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let finish!: (value: Response) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => { finish = resolve; })));
    const { result, unmount } = renderHook(useImageGeneration);
    let pending!: Promise<string | null>;
    await act(async () => { pending = result.current.generateImage(context); });
    unmount(); mock.user = { id: 'B' };
    finish(response({ imageUrl: 'old-private-picture' }));
    expect(await pending).toBeNull();
  });
});

