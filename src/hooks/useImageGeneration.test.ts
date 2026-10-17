import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useImageGeneration } from './useImageGeneration';
const mock = vi.hoisted(() => ({ user: { id: 'A' }, load: vi.fn() }));
vi.mock('./useAuth', () => ({ useAuth: () => ({ user: mock.user, isAuthenticated: true }) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: () => {
  const builder = { select: () => builder, eq: () => builder, abortSignal: () => builder, maybeSingle: () => mock.load() };
  return builder;
} } }));
afterEach(cleanup);
beforeEach(() => { mock.load.mockReset(); mock.user = { id: 'A' }; });

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

