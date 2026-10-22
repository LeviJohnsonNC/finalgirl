import { act,cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react';
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest';
import { PersonalItemsProvider,usePersonalItem,usePersonalUnlocks } from './PersonalItemsContext';
import { SecretItemReference } from '@/components/FinalGirlReference';
const mock=vi.hoisted(()=>({owner:'account-a' as string|null,rpc:vi.fn()}));
vi.mock('@/hooks/useAuth',()=>({useAuth:()=>({user:mock.owner?{id:mock.owner}:null,isAuthReady:true})}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{rpc:(name:string,args:unknown)=>({abortSignal:()=>mock.rpc(name,args)})}}));
const item={girl:'Laurie',name:'Private test reference',effect:'Synthetic effect used only by this test.'};
function Probe(){const u=usePersonalUnlocks();const i=usePersonalItem('Laurie');return <><div data-testid="owner">{u.owner}</div><div data-testid="item">{i.item?.name??'Hidden'}</div><button onClick={()=>u.change('Laurie',false)}>Hide fixture</button></>;}
const wrap=(child=<Probe/>)=><PersonalItemsProvider>{child}</PersonalItemsProvider>;
beforeEach(()=>{mock.owner='account-a';mock.rpc.mockReset();});
afterEach(cleanup);
describe('personal item boundary',()=>{
  it('does not retrieve an identity before explicit confirmation and server acknowledgement',async()=>{
    let acknowledge:(value:unknown)=>void;
    mock.rpc.mockImplementation((name:string)=>{
      if(name==='get_final_girl_unlocks')return Promise.resolve({data:[],error:null});
      if(name==='set_final_girl_unlock')return new Promise(resolve=>{acknowledge=resolve;});
      return Promise.resolve({data:item,error:null});
    });
    render(wrap(<SecretItemReference name="Laurie"/>));
    fireEvent.click(screen.getByText("Personal item"));
    const reveal=screen.getByRole('button',{name:'Unlock personal item'});
    await waitFor(()=>expect(reveal).toBeEnabled());
    fireEvent.click(reveal);
    expect(mock.rpc.mock.calls.map(c=>c[0])).toEqual(['get_final_girl_unlocks']);
    fireEvent.click(screen.getByRole('button',{name:'Confirm unlock'}));
    await waitFor(()=>expect(mock.rpc).toHaveBeenCalledWith('set_final_girl_unlock',{p_girl:'Laurie',p_unlocked:true,p_owner:'account-a'}));
    expect(screen.queryByText(item.name)).not.toBeInTheDocument();
    expect(mock.rpc.mock.calls.some(c=>c[0]==='get_final_girl_item')).toBe(false);
    await act(async()=>acknowledge({data:[{girl:'Laurie',unlocked:true}],error:null}));
    await screen.findByText(item.name);
    expect(JSON.stringify(localStorage)).not.toContain(item.name);
    expect(mock.rpc).toHaveBeenCalledWith('get_final_girl_item',{p_girl:'Laurie',p_owner:'account-a'});
  });
  it('suppresses a previous account\'s late reference and never persists secret text',async()=>{
    let release:(value:unknown)=>void;
    mock.rpc.mockImplementation((name:string)=>name==='get_final_girl_item'?new Promise(resolve=>{release=resolve;}):Promise.resolve({data:mock.owner==='account-a'?[{girl:'Laurie',unlocked:true}]:[],error:null}));
    const view=render(wrap());
    await waitFor(()=>expect(release).toBeTypeOf('function'));
    mock.owner='account-b';view.rerender(wrap());
    expect(screen.getByTestId('item')).toHaveTextContent('Hidden');
    await act(async()=>release({data:item,error:null}));
    expect(screen.getByTestId('item')).toHaveTextContent('Hidden');
    expect(JSON.stringify(localStorage)).not.toContain(item.effect);
  });
  it('conceals immediately when an offline hide is durably queued',async()=>{
    mock.rpc.mockImplementation((name:string)=>Promise.resolve(name==='get_final_girl_item'?{data:item,error:null}:name==='set_final_girl_unlock'?{data:null,error:{message:'offline'}}:{data:[{girl:'Laurie',unlocked:true}],error:null}));
    render(wrap());await screen.findByText(item.name);
    fireEvent.click(screen.getByRole('button',{name:'Hide fixture'}));
    expect(screen.getByTestId('item')).toHaveTextContent('Hidden');
    await waitFor(()=>expect(localStorage.getItem('final-girl-unlocks-outbox-v1:account-a')).toContain('false'));
    expect(JSON.stringify(localStorage)).not.toContain(item.name);
  });
  it('fails concealed when unlock loading fails and cannot authorize a queued reveal offline',async()=>{
    localStorage.setItem('final-girl-unlocks-outbox-v1:account-a',JSON.stringify([{id:'queued',value:{girl:'Laurie',unlocked:true}}]));
    mock.rpc.mockResolvedValue({data:null,error:{message:'offline'}});
    render(wrap());
    await waitFor(()=>expect(mock.rpc).toHaveBeenCalled());
    expect(screen.getByTestId('item')).toHaveTextContent('Hidden');
    expect(mock.rpc.mock.calls.some(c=>c[0]==='get_final_girl_item')).toBe(false);
  });
});
