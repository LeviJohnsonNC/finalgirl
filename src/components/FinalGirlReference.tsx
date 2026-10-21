import { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, Heart, LockKeyhole, ZoomIn } from 'lucide-react';
import { getFinalGirlCard, getFinalGirlReference } from '@/data/finalGirlReferences';
import { usePersonalItem, usePersonalUnlocks, type PersonalItem } from '@/contexts/PersonalItemsContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog,AlertDialogContent,AlertDialogHeader,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction } from '@/components/ui/alert-dialog';
import '@/styles/final-girl-reference.css';

function PrivateItemPhoto({item}:{item:PersonalItem}) {
  const unlocks=usePersonalUnlocks();
  const [open,setOpen]=useState(false);
  const [photo,setPhoto]=useState<{key:string;url:string}|null>(null);
  const [error,setError]=useState(false);
  const allowed=unlocks.isUnlocked(item.girl);
  const key=`${unlocks.owner}:${unlocks.revision}:${item.image_path}`;
  useEffect(()=>{
    let live=true;let url:string|undefined;
    setError(false);
    if(!open || !allowed)return;
    void supabase.storage.from('final-girl-secret-items').download(item.image_path).then(({data,error})=>{
      if(!live)return;
      if(error || !data){setError(true);return;}
      url=URL.createObjectURL(data);setPhoto({key,url});
    });
    return()=>{live=false;if(url)URL.revokeObjectURL(url);};
  },[open,allowed,key,item.image_path]);
  return <div>
    <button className="girl-reference-link" onClick={()=>setOpen(value=>!value)} aria-expanded={open}><ZoomIn size={15}/>{open?'Close item card':'View item card'}</button>
    {open && allowed && (photo?.key===key?<img className="girl-private-card" src={photo.url} alt={`${item.name} card`} />:error?<p role="status">The card image could not be reached. Close it and try again.</p>:<p role="status">Developing card reference…</p>)}
  </div>;
}

export function SecretItemReference({name}:{name:string}) {
  const unlocks=usePersonalUnlocks();
  const unlocked=unlocks.isUnlocked(name);
  const {item,error,loading,retry}=usePersonalItem(name);
  const [confirm,setConfirm]=useState(false);
  return <section className={`girl-secret-reference ${unlocked?'is-revealed':''}`} aria-label={`${name} secret item`}>
    <div className="girl-reference-eyebrow"><LockKeyhole size={14}/>{unlocked?'PERSONAL UNLOCK':'SEALED FILE'}</div>
    {!unlocked?<>
      <h4>Secret item — not revealed</h4>
      <p>Keep the discovery at your table. Reveal this reference only after unlocking the physical item.</p>
      {!unlocks.owner?<p className="girl-reference-note">Sign in to keep your personal unlocks.</p>:<button className="girl-reference-action" disabled={!unlocks.ready || unlocks.pending>0} onClick={()=>setConfirm(true)}>{unlocks.pending?'Saving unlock changes…':'I have unlocked this item'}</button>}
    </>:<>
      {loading?<p role="status">Opening your item reference…</p>:error?<p role="alert">{error} <button onClick={retry}>Retry reference</button></p>:item?<>
        <h4>{item.name}</h4><p className="girl-reference-card-text">{item.effect}</p><PrivateItemPhoto item={item}/>
        <p className="girl-reference-note">A reference only. Unlocking does not equip this item or add it to your game.</p>
      </>:<p role="status">Your unlock is recorded. A verified reference for this item has not been added yet.</p>}
      <button className="girl-reference-link" onClick={()=>unlocks.change(name,false)}>Hide this item again</button>
    </>}
    {unlocks.error && <p className="girl-reference-note" role="status">{unlocks.error} <button onClick={unlocks.retry}>Retry unlock sync</button></p>}
    {unlocked && <p className="girl-reference-note">Saved stories and images may show Items you recorded. Hiding this reference does not remove them from past games.</p>}
    <AlertDialog open={confirm} onOpenChange={setConfirm}>
      <AlertDialogContent className="girl-unlock-confirm">
        <AlertDialogHeader><AlertDialogTitle>Have you unlocked {name}’s item in your physical game?</AlertDialogTitle><AlertDialogDescription>Confirming reveals its identity and card details for your account. It will not add anything to your current game.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Keep it hidden</AlertDialogCancel><AlertDialogAction onClick={()=>unlocks.change(name,true)}>Confirm my unlock</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>;
}

export function FinalGirlReference({name,ultimate=false,showSecret=true}:{name:string;ultimate?:boolean;showSecret?:boolean}) {
  const ref=getFinalGirlReference(name);
  const [face,setFace]=useState(ultimate);
  useEffect(()=>setFace(ultimate),[ultimate,name]);
  if(!ref)return <p className="girl-reference-note">A verified character-card reference has not been added for {name} yet.</p>;
  const image=getFinalGirlCard(name,face);
  return <div className="girl-reference">
    <div className="girl-reference-topline"><span className="girl-reference-eyebrow">CHARACTER REFERENCE</span><span className="girl-health"><Heart size={14}/>{ref.startingHealth} starting health{ref.ultimateHealth!==ref.startingHealth?` · ${ref.ultimateHealth} after flip`:''}</span></div>
    <div className="girl-reference-face" role="group" aria-label={`${name} card face`}>
      <button aria-pressed={!face} onClick={()=>setFace(false)}>Starting side</button><button aria-pressed={face} onClick={()=>setFace(true)}>Ultimate side</button>
    </div>
    {image && <Dialog><DialogTrigger asChild><button className="girl-card-button" aria-label={`Enlarge ${name} ${face?'Ultimate':'starting'} card`}><img src={image} alt={`${name} ${face?'Ultimate':'starting'} card`} width={600} height={400} loading="lazy"/><span><ZoomIn size={14}/> Inspect card</span></button></DialogTrigger><DialogContent className="girl-card-zoom"><DialogHeader><DialogTitle>{name} · {face?'Ultimate':'Starting'} side</DialogTitle><DialogDescription>Photographed physical card. A readable reference appears below the card in the character file.</DialogDescription></DialogHeader><img src={image} alt={`${name} ${face?'Ultimate':'starting'} card enlarged`} /></DialogContent></Dialog>}
    {face?<section className="girl-reference-copy"><h4>Ultimate ability</h4><p>{ref.ultimate}</p><h4>Each additional Victim saved</h4><p>{ref.additionalReward}</p></section>:<section className="girl-reference-copy"><h4>{ref.startingRule?'Rescuing Victims':'Rescue rewards'}</h4>{ref.startingRule?<p>{ref.startingRule}</p>:<><p className="girl-reference-note">Choose an available reward on your physical card. This list follows printed reading order, not a required order of play.</p><ul className="girl-rescue-rewards">{ref.rescueRewards.map((reward,index)=><li key={index}>{reward}</li>)}</ul></>}</section>}
    <p className="girl-reference-note">Viewing a card changes no game state. Record Ultimate unlocked in Remember this when it happens at your table.</p>
    {showSecret && <SecretItemReference key={name} name={name}/>}
  </div>;
}

export function FinalGirlReferenceDialog({name}:{name:string}) {
  return <Dialog><DialogTrigger asChild><button className="girl-reference-link" aria-label={`Open ${name} character reference`}><BookOpen size={14}/>{name}</button></DialogTrigger><DialogContent className="girl-reference-dialog"><DialogHeader><DialogTitle>{name} · Character file</DialogTitle><DialogDescription>Card references and your personal unlocks.</DialogDescription></DialogHeader><FinalGirlReference name={name}/></DialogContent></Dialog>;
}

export function PlayFinalGirlReference({name,ultimate}:{name:string;ultimate:boolean}) {
  if(!getFinalGirlReference(name))return null;
  return <details className="play-panel girl-play-file"><summary><span><BookOpen size={17}/>{name}’s character file</span><span>{ultimate?'Ultimate recorded':'Starting side'}<ChevronDown size={16}/></span></summary><FinalGirlReference name={name} ultimate={ultimate}/></details>;
}
