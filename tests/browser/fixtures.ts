import {deathFacts,deathSignature,isCompleteDeathText} from '../../src/lib/play/death';
import type {PlayEvent} from '../../src/lib/play/events';
import type {DeathScene} from '../../src/lib/play/death';
import { test as base, expect, Page } from '@playwright/test';

export const userId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'qa@example.test', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const session = { access_token: 'test.access.token', refresh_token: 'test-refresh', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user };
export const selection = { killer: 'Hans', location: 'Camp Happy Trails', finalGirl: 'Laurie', setupScenario: null, startingEvent: null, mission: null, filmId: 's1-camp-happy-trails' };
export const gameId = '11111111-1111-4111-8111-111111111111';
export const opening = 'The lights went out at Camp Happy Trails. Laurie heard a branch snap behind the cabins. Hans was waiting in the dark.';
export const activeGame = { version: 1, id: gameId, phase: 'nowPlaying', selection, introStory: opening };

// PostgreSQL JSONB does not preserve the browser's object insertion order.
// Mirror the real storage boundary so death fingerprints are tested honestly.
function jsonbRoundTrip(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(jsonbRoundTrip);
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.entries(value).sort(([a], [b]) => Buffer.byteLength(a) - Buffer.byteLength(b) || Buffer.compare(Buffer.from(a), Buffer.from(b)))
      .map(([key, entry]) => [key, jsonbRoundTrip(entry)]),
  );
  return value;
}

export class ArchiveMock {
  sessions: Array<{id:string;revision:number;state:Record<string,unknown>;closed:boolean}> = [];
  deathScenes: DeathScene[] = [];
  failDeaths=false;
  holdDeath=false;
  releaseDeath:(()=>void)|null=null;
  holdDeathRead=false;
  releaseDeathRead:(()=>void)|null=null;
  deathSignatureOverride:string|null=null;
  deathText='The ceiling gave a soft, dusty sigh. Nobody looked up until the light fitting dropped, trailing a bright knot of wires. A scream vanished beneath the crash. When the dust cleared, the broken fixture still swung against the wall, tapping out the last few seconds of someone’s night.';
  holdCollection=false;
  collectionWaiters:Array<()=>void>=[];
  releaseCollection=()=>{this.holdCollection=false;this.collectionWaiters.splice(0).forEach(done=>done());};
  films = ['s1-camp-happy-trails'];
  history: Array<Record<string, unknown>> = [];
  calls: string[] = [];
  generationRequests: Array<{ name: string; body: Record<string, unknown> }> = [];
  storyText = opening;
  endingText = 'Laurie reached the road. She had survived the night.';
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
        this.generationRequests.push({ name, body: request.postDataJSON() });
        if(name==='narrate-story')return json({audioContent:'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',voiceId:'Test',persona:'cold'});
        if(name==='generate-death-scene') {
          if(this.failDeaths)return json({error:'Scene unavailable. The death is still recorded.'},503);
          const b=request.postDataJSON();const session=this.sessions.find(r=>r.id===b.sessionId);
          const f=session?deathFacts(session.state.selection as typeof selection,session.state.playEvents as PlayEvent[],b.eventId):null;
          if(!f)return json({error:'Sync the recorded death first.'},409);
          const signature=this.deathSignatureOverride ?? await deathSignature(f);
          let scene=this.deathScenes.find(r=>r.session_id===b.sessionId&&r.event_id===b.eventId&&r.signature===signature&&r.take===b.take);
          const cached=!!scene && isCompleteDeathText(scene.scene_text);
          if(scene && !cached)scene.scene_text=this.deathText;
          if(!scene){scene={id:String(this.deathScenes.length+1).padStart(8,'0')+'-dddd-4ddd-8ddd-dddddddddddd',session_id:b.sessionId,event_id:b.eventId,signature,take:b.take,scene_text:this.deathText,model:'test-cheap',status:'ready'};this.deathScenes.push(scene);}
          if(this.holdDeath)await new Promise<void>(r=>{this.releaseDeath=r;});
          return json({scene,cached});
        }
        if (name === 'generate-story'  || name === 'generate-ending') {
          if (this.failStory) return json({ error: 'Generation temporarily unavailable' }, 503);
          const text = name === 'generate-story' ? this.storyText : this.endingText;
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
      if(path.endsWith('/play_death_scenes')) {
        const snapshot=this.deathScenes.filter(r=>r.session_id===url.searchParams.get('session_id')?.replace(/^eq\./,''));
        if(this.holdDeathRead)await new Promise<void>(done=>{this.releaseDeathRead=done;});
        return json(snapshot);
      }
      if (path.endsWith('/play_sessions')) return json(this.sessions.filter(row=>!row.closed));
      if (path.endsWith('/rpc/save_play_session')) {
        if(this.failWrites) return json({message:'offline'},503);
        const b=request.postDataJSON();let row=this.sessions.find(r=>r.id===b.p_id);
        b.p_state=jsonbRoundTrip(b.p_state);
        if(!row){row={id:b.p_id,revision:1,state:b.p_state,closed:b.p_closed};this.sessions.push(row);return json({ok:true,revision:1});}
        if(JSON.stringify(row.state)===JSON.stringify(b.p_state)&&row.closed===b.p_closed)return json({ok:true,revision:row.revision});
        if(b.p_revision!==row.revision)return json({ok:false,...row});
        Object.assign(row,{revision:row.revision+1,state:b.p_state,closed:b.p_closed});return json({ok:true,revision:row.revision});
      }
      if (path.endsWith('/rpc/get_game_history_summary')) return json(this.history);
      if (path.endsWith('/rpc/apply_collection_delta')) {
        if (this.failWrites) return json({ message: 'offline', code: 'TEST' }, 503);
        const body = request.postDataJSON();
        this.films = [...new Set([...this.films.filter(id => !body.p_remove.includes(id)), ...body.p_add])];
        return json(this.films);
      }
      if (path.endsWith('/user_image_settings')) return json(request.headers().accept?.includes('vnd.pgrst.object') ? { auto_generate_images: this.autoImages, use_ai_casting_art: false } : [{ auto_generate_images: this.autoImages, use_ai_casting_art: false }]);
      if (path.endsWith('/user_settings')) {if(this.holdCollection && request.method()==='GET')await new Promise<void>(done=>this.collectionWaiters.push(done));return json({ owned_films: this.films });}
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

/** A silent deterministic audio device. The tests still exercise the real hook/cache. */
export async function installTestAudio(page:Page) {
 await page.addInitScript(()=>{
  const state={active:new Set<MockAudio>(),maxActive:0};
  class MockAudio extends EventTarget {
   src:string;currentTime=0;duration=60;volume=1;paused=true;
   onended:(()=>void)|null=null;onerror:(()=>void)|null=null;ontimeupdate:(()=>void)|null=null;
   constructor(src=''){super();this.src=src;}
   play(){this.paused=false;if(this.src.startsWith('blob:')){state.active.add(this);state.maxActive=Math.max(state.maxActive,state.active.size);this.ontimeupdate?.();}return Promise.resolve();}
   pause(){this.paused=true;state.active.delete(this);}
  }
  Object.defineProperty(window,'Audio',{configurable:true,value:MockAudio});
  Object.defineProperty(window,'__qaNarrators',{value:{count:()=>state.active.size,max:()=>state.maxActive}});
 });
}
