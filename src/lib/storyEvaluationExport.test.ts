import { beforeEach, describe, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ requests: [] as Record<string, unknown>[], reply: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: (table: string) => {
  const args: Record<string, unknown> = { table };
  const query = {
    select: (value: string) => { args.select = value; return query; },
    eq: (key: string, value: unknown) => { args[key] = value; return query; },
    gt: (_key: string, value: unknown) => { args.after = value; return query; },
    lte: (_key: string, value: unknown) => { args.ceiling = value; return query; },
    order: () => query, limit: () => query,
    abortSignal: async () => { mock.requests.push(args); return mock.reply(args); },
  };
  return query;
} } }));
import { loadStoryEvaluations, loadStoryReview, loadSavedStoryReview, storyEvaluationDocument } from './storyEvaluationExport';
const signal = () => new AbortController().signal;

describe('evaluation JSON export', () => {
  beforeEach(() => { mock.requests = []; mock.reply.mockReset(); });
  it('loads every page for the owner and preserves full prose/prompts without account identifiers', async () => {
    mock.reply.mockImplementation(args => {
      if (args.select === 'sequence') return { data: [{ sequence: 121 }] };
      const start = Number(args.after) + 1;
      return { data: Array.from({ length: Math.min(50, 122 - start) }, (_, i) => ({
        id: `id-${start + i}`, sequence: start + i, user_id: 'owner', kind: 'opening', status: 'complete',
        story_text: 'Full prose. '.repeat(1000), system_prompt: 'exact', user_prompt: 'exact user',
      })) };
    });
    const attempts = await loadStoryEvaluations('owner', signal());
    expect(attempts).toHaveLength(121); expect(mock.requests).toHaveLength(4);
    expect(mock.requests.every(r => r.user_id === 'owner')).toBe(true);
    expect(mock.requests.slice(1).every(r => r.ceiling === 121)).toBe(true);
    const document = JSON.parse(JSON.stringify(storyEvaluationDocument(attempts)));
    expect(document.attemptCount).toBe(121);
    expect(document.attempts[120].story_text).toBe('Full prose. '.repeat(1000));
    expect(document.attempts[0].system_prompt).toBe('exact');
    expect(document.attempts[0].user_id).toBeUndefined(); expect(document.attempts[0].sequence).toBeUndefined();
  });
  it('fails the whole export on a read failure rather than presenting partial data', async () => {
    mock.reply.mockResolvedValueOnce({ data: [{ sequence: 51 }] }).mockResolvedValueOnce({ data: [{ sequence: 50 }] }).mockResolvedValue({ error: new Error('offline') });
    await expect(loadStoryReview('owner', signal())).rejects.toThrow('offline');
    expect(mock.requests.every(r => r.table === 'story_evaluations')).toBe(true);
  });
  it('fails explicitly when captured rows disappear before the ceiling is reached', async () => {
    mock.reply.mockResolvedValueOnce({ data: [{ sequence: 51 }] }).mockResolvedValueOnce({ data: [{ sequence: 50 }] }).mockResolvedValue({ data: [] });
    await expect(loadStoryEvaluations('owner', signal())).rejects.toThrow('changed during export');
  });
  it.each(['PGRST205', '42P01', 'empty'])('falls back to owner-scoped, bounded saved stories when capture is %s', async code => {
    const games = Array.from({ length: 41 }, (_, i) => ({ id: String(i + 1).padStart(4, '0'),
      intro_story: `Opening ${i}. `.repeat(1000), ending_narration: i % 2 ? null : 'Ending.',
      victims_saved: 0, final_girl_health: null, play_events: [],
    }));
    mock.reply.mockImplementation(args => {
      if (args.table === 'story_evaluations') return code === 'empty' ? { data: [] } : { error: { code } };
      if (args.select === 'id') return { data: [{ id: '0041' }] };
      return { data: games.filter(g => g.id > (args.after ?? '') && g.id <= args.ceiling).slice(0, 20) };
    });
    const report = await loadStoryReview('owner', signal());
    expect(report.attempts).toEqual([]);
    expect(report.review?.captureStatus).toBe(code === 'empty' ? 'empty' : 'unavailable');
    expect(report.review?.games).toHaveLength(41);
    expect(report.review?.games[40]).toMatchObject({ intro_story: 'Opening 40. '.repeat(1000), victims_saved: 0, final_girl_health: null,
      provenance: 'saved-game', system_prompt: null, user_prompt: null, model: null,
    });
    expect(mock.requests.every(r => r.user_id === 'owner')).toBe(true);
    const pages = mock.requests.filter(r => r.table === 'game_history' && r.select !== 'id');
    expect(pages).toHaveLength(3);
    expect(pages.every(r => r.ceiling === '0041')).toBe(true);
    expect(pages.map(r => r.select).join(',')).not.toMatch(/image|poster|user_id/);
  });
  it('never conceals permission, authentication, timeout or network errors with a fallback', async () => {
    for (const code of ['42501', 'PGRST301', '57014', 'FETCH_FAILED']) {
      mock.requests = []; mock.reply.mockResolvedValue({ error: { code } });
      await expect(loadStoryReview('owner', signal())).rejects.toEqual({ code });
      expect(mock.requests.map(r => r.table)).toEqual(['story_evaluations']);
    }
  });
  it('never downloads partial saved stories on a later page failure or stalled cursor', async () => {
    for (const last of [{ error: new Error('offline') }, { data: [] }, { data: [{ id: '0001' }] }]) {
      mock.reply.mockReset().mockResolvedValueOnce({ data: [{ id: '0002' }] })
        .mockResolvedValueOnce({ data: [{ id: '0001', intro_story: 'Opening.' }] }).mockResolvedValue(last);
      await expect(loadSavedStoryReview('owner', signal())).rejects.toThrow();
    }
  });
  it('does not call archived stories when captured attempts exist', async () => {
    mock.reply.mockResolvedValueOnce({ data: [{ sequence: 1 }] }).mockResolvedValue({ data: [{ sequence: 1, story_text: 'Captured.' }] });
    expect((await loadStoryReview('owner', signal())).review).toBeUndefined();
    expect(mock.requests.every(r => r.table === 'story_evaluations')).toBe(true);
  });
  it('omits story-less records and never invents prose for them', async () => {
    mock.reply.mockResolvedValueOnce({ data: [{ id: '0001' }] }).mockResolvedValue({ data: [{ id: '0001', intro_story: ' ', ending_narration: null }] });
    expect(await loadSavedStoryReview('owner', signal())).toEqual([]);
  });
});
