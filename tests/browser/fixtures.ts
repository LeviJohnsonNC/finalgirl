import { test as base, expect, Page } from '@playwright/test';

export const userId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'qa@example.test', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const session = { access_token: 'test.access.token', refresh_token: 'test-refresh', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user };
export const selection = { killer: 'Hans', location: 'Camp Happy Trails', finalGirl: 'Laurie', setupScenario: null, startingEvent: null, mission: null, filmId: 's1-camp-happy-trails' };
export const gameId = '11111111-1111-4111-8111-111111111111';
export const opening = 'The lights went out at Camp Happy Trails. Laurie heard a branch snap behind the cabins. Hans was waiting in the dark.';
export const activeGame = { version: 1, id: gameId, phase: 'nowPlaying', selection, introStory: opening };

export class ArchiveMock {
  films = ['s1-camp-happy-trails'];
  history: Array<Record<string, unknown>> = [];
  calls: string[] = [];
  failWrites = false;
  failStory = false;
  autoImages = false;
  releaseImage: (() => void) | null = null;

  async install(page: Page, { signedIn = true, draft = null as unknown } = {}) {
    await page.addInitScript(({ session, signedIn, draft, userId }) => {
      if (sessionStorage.getItem('qa-seeded')) return;
      if (signedIn) localStorage.setItem('sb-cdyvccecrovyjkabfcnx-auth-token', JSON.stringify(session));
      if (draft) localStorage.setItem('final-girl-active-game-v1:' + (signedIn ? userId : 'guest'), JSON.stringify(draft));
      sessionStorage.setItem('qa-seeded', 'yes');
    }, { session, signedIn, draft, userId });

    // No real user, provider or production requests are allowed from these tests.
    await page.route('**/*', async route => {
      const request = route.request(); const url = new URL(request.url());
      if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue();
      if (!url.hostname.endsWith('.supabase.co')) return route.abort();
      const path = url.pathname;
      const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
      const json = (body: unknown, status = 200) => route.fulfill({ status, headers: cors, contentType: 'application/json', body: JSON.stringify(body) });
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      if (path.endsWith('/auth/v1/token')) return json(session);
      if (path.endsWith('/auth/v1/user')) return json(user);
      if (path.endsWith('/auth/v1/logout')) return route.fulfill({ status: 204, headers: cors });
      if (path.includes('/functions/v1/')) {
        const name = path.split('/').pop()!; this.calls.push(name);
        if (name === 'generate-story' || name === 'generate-ending') {
          if (this.failStory) return json({ error: 'Generation temporarily unavailable' }, 503);
          const text = name === 'generate-story' ? opening : 'Laurie reached the road. She had survived the night.';
          return route.fulfill({ headers: cors, contentType: 'text/event-stream', body: 'data: ' + JSON.stringify({ choices: [{ delta: { content: text } }] }) + '\n\ndata: [DONE]\n\n' });
        }
        if (name === 'generate-visual-bible') return json({ visualBible: 'Cold moonlight and worn red cabins.' });
        if (name === 'generate-scene-image') {
          await new Promise<void>(resolve => { this.releaseImage = resolve; });
          const body = request.postDataJSON();
          const imageUrl = 'https://example.test/poster.png';
          const record = this.history.find(game => game.id === body.gameId);
          if (record) record[body.sceneType === 'ending' ? 'poster_image_url' : 'scene_image_url'] = imageUrl;
          return json({ imageUrl });
        }
        return json({ error: 'Unmocked generation' }, 500);
      }
      if (path.endsWith('/rpc/get_game_history_summary')) return json(this.history);
      if (path.endsWith('/rpc/apply_collection_delta')) {
        if (this.failWrites) return json({ message: 'offline', code: 'TEST' }, 503);
        const body = request.postDataJSON();
        this.films = [...new Set([...this.films.filter(id => !body.p_remove.includes(id)), ...body.p_add])];
        return json(this.films);
      }
      if (path.endsWith('/user_image_settings')) return json(request.headers().accept?.includes('vnd.pgrst.object') ? { auto_generate_images: this.autoImages, use_ai_casting_art: false } : [{ auto_generate_images: this.autoImages, use_ai_casting_art: false }]);
      if (path.endsWith('/user_settings')) return json({ owned_films: this.films });
      if (path.endsWith('/game_history')) {
        const id = url.searchParams.get('id')?.replace(/^eq\./, '');
        if (request.method() === 'POST') {
          if (this.failWrites) return json({ message: 'offline', code: 'TEST' }, 503);
          const record = request.postDataJSON();
          if (!this.history.some(game => game.id === record.id)) this.history.push(record);
          return route.fulfill({ status: 201, headers: cors });
        }
        if (request.method() === 'PATCH') {
          if (this.failWrites) return json({ message: 'offline', code: 'TEST' }, 503);
          const record = this.history.find(game => game.id === id);
          if (!record) return json(null);
          Object.assign(record, request.postDataJSON());
          return json({ id });
        }
        return json(this.history.find(game => game.id === id) ?? null);
      }
      return json({ message: 'Unmocked archive request: ' + path }, 500);
    });
  }
}
export const test = base.extend<{ archive: ArchiveMock }>({ archive: async ({ page: _page }, provide) => { await provide(new ArchiveMock()); } });
export { expect };
