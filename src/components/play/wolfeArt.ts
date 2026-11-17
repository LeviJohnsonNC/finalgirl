import type {ModuleArt} from './ModuleArtwork';

const photographs=import.meta.glob<string>('/src/assets/play/photos/wolfe/*.webp',{eager:true,query:'?url',import:'default'});
export function wolfeArt(id:string):ModuleArt {
  const path=(key:string)=>photographs['/src/assets/play/photos/wolfe/'+key+'.webp'];
  const faces=['hannibal','dr-death','dr-sunshine'].some(name=>id===name||id===name+'-saved');
  const position=id==='banner'?'50% 61%':id.startsWith('gurney')?'50% 58%':faces?'50% 31%':
    id.startsWith('madhouse')?'50% 66%':id==='death-candy'?'50% 74%':'center';
  return {src:path(id)??path('banner'),fit:'slice',position};
}
