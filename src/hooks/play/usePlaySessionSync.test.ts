import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { usePlaySessionSync } from './usePlaySessionSync';
import type { ActiveGame } from '@/lib/activeGame';
const mock=vi.hoisted(()=>({ user:{id:'owner-A'}, rpc:vi.fn(), load:vi.fn() }));
vi.mock('@/hooks/useAuth',()=>({useAuth:()=>({user:mock.user,isAuthReady:true})}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{
 rpc:(_name:string,args:unknown)=>({abortSignal:()=>mock.rpc(args)}),
 from:()=>{const chain={select:()=>chain,eq:()=>chain,order:()=>chain,limit:()=>chain,abortSignal:()=>mock.load()};return chain;},
}}));
const game:ActiveGame={version:1,id:'11111111-1111-4111-8111-111111111111',phase:'nowPlaying',selection:{killer:'Hans',location:'Camp Happy Trails',finalGirl:'Laurie',filmId:'s1-camp-happy-trails',setupScenario:null,startingEvent:null,mission:null}};
beforeEach(()=>{localStorage.clear();mock.user={id:'owner-A'};mock.rpc.mockReset().mockResolvedValue({data:{ok:true,revision:1},error:null});mock.load.mockReset().mockResolvedValue({data:[],error:null});});
afterEach(cleanup);
it('persists an offline write and retries the same session safely',async()=>{
 mock.rpc.mockResolvedValue({data:null,error:{message:'offline'}});
 const first=renderHook(()=>usePlaySessionSync(game));
 await waitFor(()=>expect(first.result.current.pendingCount).toBe(1));
 await waitFor(()=>expect(first.result.current.error).toContain('saved on this device'));
 first.unmount();mock.rpc.mockResolvedValue({data:{ok:true,revision:1},error:null});
 const second=renderHook(()=>usePlaySessionSync(game));
 await waitFor(()=>expect(second.result.current.pendingCount).toBe(0));
 expect(mock.rpc.mock.calls[0][0]).toMatchObject({p_id:game.id,p_revision:0});
});
it('preserves both versions before an explicit cloud handoff',async()=>{
 const cloud={...game,introStory:'The cloud version'};
 mock.rpc.mockResolvedValue({data:{ok:false,revision:4,state:cloud,closed:false},error:null});
 const view=renderHook(({draft})=>usePlaySessionSync(draft),{initialProps:{draft:game}});
 await waitFor(()=>expect(view.result.current.conflict?.revision).toBe(4));
 const persist=vi.fn().mockReturnValue(true);
 act(()=>{expect(view.result.current.adopt(view.result.current.conflict!,persist)).toBe(true);});
 expect(persist).toHaveBeenCalledWith(cloud);
 const backup=JSON.parse(localStorage.getItem('final-girl-play-backup-v1:owner-A:'+game.id)!);
 expect(backup.local).toEqual(game);expect(backup.cloud.state).toEqual(cloud);
});
it('does not apply a late cloud response to another account',async()=>{
 let finish:(value:unknown)=>void=()=>{};
 mock.rpc.mockReturnValue(new Promise(resolve=>{finish=resolve;}));
 const {result,rerender}=renderHook(()=>usePlaySessionSync(game));
 await waitFor(()=>expect(mock.rpc).toHaveBeenCalled());
 mock.user={id:'owner-B'};rerender();
 await act(async()=>{finish({data:{ok:true,revision:5},error:null});});
 expect(result.current.conflict).toBeNull();
 expect(localStorage.getItem('final-girl-play-revisions-v1:owner-B')).toBeNull();
});
