import banner from '@/assets/play/photos/birds/banner.webp';
import birdWall from '@/assets/play/photos/birds/bird-wall.webp';
import birdnado from '@/assets/play/photos/birds/birdnado.webp';
import endlessSwarm from '@/assets/play/photos/birds/endless-swarm.webp';
import fowlAgression from '@/assets/play/photos/birds/fowl-agression.webp';
import insurmountableOdds from '@/assets/play/photos/birds/insurmountable-odds.webp';
import rescue from '@/assets/play/photos/birds/rescue.webp';
import runForYourLife from '@/assets/play/photos/birds/run-for-your-life.webp';
import waitingToStrike from '@/assets/play/photos/birds/waiting-to-strike.webp';
import type { ModuleArt } from './ModuleArtwork';

const images:Readonly<Record<string,string>> = {
  banner,
  'bird-wall':birdWall,
  birdnado,
  'endless-swarm':endlessSwarm,
  'fowl-agression':fowlAgression,
  'insurmountable-odds':insurmountableOdds,
  rescue,
  'run-for-your-life':runForYourLife,
  'waiting-to-strike':waitingToStrike,
};
export function birdsArt(id:string): ModuleArt {
  return {src:images[id],position:id === 'banner' ? '57% 51%' : id === 'rescue' ? '69% 53%' : '50% center',fit:'slice'};
}
