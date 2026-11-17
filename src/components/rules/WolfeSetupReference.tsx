import {useState} from 'react';
import {WOLFE_SETUPS} from '../../../supabase/functions/_shared/play/wolfeCatalog';
import {PlaySelect} from '@/components/play/PlaySelect';

const setupPhotos=import.meta.glob<string>('/src/assets/rules/wolfe/setup-*.webp',{eager:true,query:'?url',import:'default'});
export function WolfeSetupReference() {
  const [index,setIndex]=useState(0);
  return <figure className="my-4 max-w-sm space-y-2">
    <PlaySelect aria-label="Wolfe Asylum setup diagram" value={String(index)} onChange={event=>setIndex(Number(event.target.value))}>
      {WOLFE_SETUPS.map((name,index)=><option value={String(index)} key={name}>{name}</option>)}
    </PlaySelect>
    <img className="w-full rounded-md border border-border" width={360} height={510}
      src={setupPhotos[`/src/assets/rules/wolfe/setup-${index+1}.webp`]}
      alt={`${WOLFE_SETUPS[index]} diagram showing the printed starting positions and Pill placements`} loading="lazy"/>
  </figure>;
}
