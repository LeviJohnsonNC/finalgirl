import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDurableQueue } from '@/hooks/useDurableQueue';
import { supabase } from '@/integrations/supabase/client';
import { getFinalGirlReference } from '@/data/finalGirlReferences';

interface Unlock { girl: string; unlocked: boolean }
export interface PersonalItem { girl: string; name: string; effect: string }
interface UnlockContext {
  owner: string | null; ready: boolean; revision: number; error: string | null; pending: number;
  isUnlocked: (girl: string) => boolean;
  change: (girl: string, unlocked: boolean) => boolean;
  retry: () => void;
  refreshItems: () => void;
}
const Context = createContext<UnlockContext>({ owner: null, ready: false, revision: 0, error: null, pending: 0,
  isUnlocked: () => false, change: () => false, retry: () => {}, refreshItems: () => {} });
export const usePersonalUnlocks = () => useContext(Context);
const rpc = (name: string, args?: Record<string,unknown>) => supabase.rpc(name as never,args as never).abortSignal(AbortSignal.timeout(15000));
function readUnlocks(data: unknown): Unlock[] {
  if (!Array.isArray(data) || !data.every(row => row && typeof row.girl === 'string' && typeof row.unlocked === 'boolean' && getFinalGirlReference(row.girl)))
    throw new Error('Your unlock records could not be verified.');
  return data;
}
export function PersonalItemsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthReady } = useAuth();
  const owner = user?.id ?? null;
  const current = useRef(owner); current.current = owner;
  const request = useRef(0);
  const [state,setState] = useState<{ owner: string | null; rows: Unlock[]; revision: number }>({ owner: null, rows: [], revision: 0 });
  const [failure,setFailure] = useState<{ owner: string | null; message: string } | null>(null);
  const [loading,setLoading] = useState(true);
  const accept = useCallback((rows: Unlock[]) => {
    setState(prev => ({ owner, rows, revision: prev.revision+1 }));
    setFailure(null); setLoading(false);
  },[owner]);
  const load = useCallback(async () => {
    if (!owner || !isAuthReady) return;
    const id=++request.current;
    setLoading(true);
    try {
      const { data,error }=await rpc('get_final_girl_unlocks',{p_owner:owner});
      if(error)throw new Error('Your unlocks could not be reached. Secret items stay hidden.');
      if(current.current===owner && request.current===id)accept(readUnlocks(data));
    } catch(error) {
      if(current.current===owner && request.current===id){setFailure({owner,message:error instanceof Error?error.message:'Secret items stay hidden.'});setLoading(false);}
    }
  },[owner,isAuthReady,accept]);
  const send=useCallback(async (change: Unlock) => {
    if(!owner || current.current!==owner)throw new Error('Sign in to save your unlocks.');
    const {data,error}=await rpc('set_final_girl_unlock',{p_girl:change.girl,p_unlocked:change.unlocked,p_owner:owner});
    if(error)throw new Error('Your unlock change is saved on this device and will retry.');
    const rows=readUnlocks(data);
    if(current.current===owner){++request.current;accept(rows);}
  },[owner,accept]);
  const queue=useDurableQueue<Unlock>(`final-girl-unlocks-outbox-v1:${owner ?? 'guest'}`,Boolean(owner && isAuthReady),send);
  useEffect(()=>{
    void load();
    const refresh=()=>{void load();};
    const counter=request;
    window.addEventListener('focus',refresh);window.addEventListener('online',refresh);
    return()=>{++counter.current;window.removeEventListener('focus',refresh);window.removeEventListener('online',refresh);};
  },[load]);
  // Pending unlocks never authorize a read. A pending hide conceals immediately.
  const isUnlocked=(girl:string)=>Boolean(owner && state.owner===owner && !loading && !(failure?.owner===owner) &&
    state.rows.some(row=>row.girl===girl && row.unlocked) && !queue.pending.some(row=>row.girl===girl && !row.unlocked));
  const change=(girl:string,unlocked:boolean)=>{
    if(!owner || !getFinalGirlReference(girl))return false;
    try{queue.enqueue({girl,unlocked});return true;}catch(error){setFailure({owner,message:error instanceof Error?error.message:'Could not save your unlock.'});return false;}
  };
  const retry=()=>{void queue.flush();void load();};
  // Retry every mounted reader together so character details and Play suggestions agree.
  // This preserves the verified unlock rows and never authorizes a pending unlock.
  const refreshItems=()=>setState(previous=>previous.owner===owner ? {...previous,revision:previous.revision+1} : previous);
  return <Context.Provider value={{owner,ready:Boolean(owner && state.owner===owner && !loading && !(failure?.owner===owner)),revision:state.revision,error:failure?.owner===owner?failure.message:queue.error,pending:queue.pending.length,isUnlocked,change,retry,refreshItems}}>{children}</Context.Provider>;
}

/** Secret text stays in memory, keyed to both account and authorization revision.
 * No localStorage, query cache, prefetch, log, or public URL contains this data.
 */
export function usePersonalItem(girl:string,enabled=true) {
  const unlocks=usePersonalUnlocks();
  const allowed=enabled && unlocks.isUnlocked(girl);
  const key=`${unlocks.owner}:${girl}:${unlocks.revision}`;
  const [state,setState]=useState<{key:string;item:PersonalItem|null;error:string|null}>();
  useEffect(()=>{
    let live=true;
    if(!allowed){setState(undefined);return;}
    void (async()=>{
      try{
        const {data,error}=await rpc('get_final_girl_item',{p_girl:girl,p_owner:unlocks.owner});
        if(error)throw new Error('The item reference could not be reached.');
        const item=data as unknown as PersonalItem|null;
        if(item && (item.girl!==girl || typeof item.name!=='string' || !item.name.trim() || typeof item.effect!=='string' || !item.effect.trim()))throw new Error('The item reference could not be verified.');
        if(live)setState({key,item:item ? {girl:item.girl,name:item.name,effect:item.effect} : null,error:null});
      }catch(error){if(live)setState({key,item:null,error:error instanceof Error?error.message:'Reference unavailable.'});}
    })();
    return()=>{live=false;};
  },[allowed,key,girl,unlocks.owner]);
  return {item:allowed && state?.key===key?state.item:null,error:allowed && state?.key===key?state.error:null,loading:allowed && state?.key!==key,retry:unlocks.refreshItems};
}
