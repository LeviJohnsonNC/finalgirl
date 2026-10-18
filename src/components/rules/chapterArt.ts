import type { RuleChapter } from '@/data/rules/types';
import cabin from '@/assets/rules/cabin.webp';
import archive from '@/assets/rules/archive.webp';
import dice from '@/assets/rules/dice.webp';
import weapon from '@/assets/rules/weapon.webp';
import hans from '@/assets/characters/ai/hans.png';
import minions from '@/assets/characters/ai/zombies.png';

export const rulebookArt = { cabin, archive, dice, weapon };

const coreArt: Record<string, string> = {
  'ch-overview': cabin, 'ch-boards': archive, 'ch-game-turn': dice,
  'ch-attacking': weapon, 'ch-bloodlust': hans, 'ch-tokens-cards': dice,
  'ch-minions': minions, 'ch-items': weapon, 'ch-end': cabin, 'ch-glossary': archive,
};
const entityArt = import.meta.glob<string>([
  '../../assets/characters/ai/*.png', '../../assets/locations/ai/*.png',
], { eager: true, import: 'default', query: '?url' });

/** Reuse the entity's portrait/location art for owned special-rule files. */
export function getChapterArt(chapter: RuleChapter): string {
  if (coreArt[chapter.id]) return coreArt[chapter.id];
  const slug = chapter.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const folder = chapter.id.startsWith('ch-location-') ? 'locations' : 'characters';
  return entityArt[`../../assets/${folder}/ai/${slug}.png`] ?? archive;
}
