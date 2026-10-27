import stiff_wind from '@/assets/play/photos/poltergeist/stiff-wind.webp';
import eternal_despair from '@/assets/play/photos/poltergeist/eternal-despair.webp';
import invisible_barrier from '@/assets/play/photos/poltergeist/invisible-barrier.webp';
import forgetting_something from '@/assets/play/photos/poltergeist/forgetting-something.webp';
import relentless_assault from '@/assets/play/photos/poltergeist/relentless-assault.webp';
import nothing_is_easy from '@/assets/play/photos/poltergeist/nothing-is-easy.webp';
import she_will_soon_be_lost from '@/assets/play/photos/poltergeist/she-will-soon-be-lost.webp';
import psychic_confusion from '@/assets/play/photos/poltergeist/psychic-confusion.webp';
import unseen_forces from '@/assets/play/photos/poltergeist/unseen-forces.webp';
import carolyn from '@/assets/play/photos/poltergeist/carolyn.webp';
import floppy from '@/assets/play/photos/poltergeist/floppy.webp';
import type { ModuleArt } from './ModuleArtwork';
const photographs: Record<string, string> = { carolyn, floppy, 'stiff-wind': stiff_wind, 'eternal-despair': eternal_despair, 'invisible-barrier': invisible_barrier, 'forgetting-something': forgetting_something, 'relentless-assault': relentless_assault, 'nothing-is-easy': nothing_is_easy, 'she-will-soon-be-lost': she_will_soon_be_lost, 'psychic-confusion': psychic_confusion, 'unseen-forces': unseen_forces };
/** Named mappings precede alphabetical chooser sorting; no atlas crops or fallback art. */
export function poltergeistArt(id: string): ModuleArt {
    if (!photographs[id])
        throw new Error('Unmapped Poltergeist photograph: ' + id);
    return { src: photographs[id], fit: 'slice', position: id === 'carolyn' ? '75% center' : '65% center' };
}
