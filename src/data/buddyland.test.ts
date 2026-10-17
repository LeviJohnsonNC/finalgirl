import { describe, expect, it } from 'vitest';
import { BUDDYLAND_DETAILS } from './buddyland';
import { getFinalGirlHealth } from './finalGirlHealth';
import { getKillerMaxHealth } from './killerHealth';
import { ENTITY_RULE_MODULES, buildEntityChapter, getModulePromptContext } from './rules/moduleRules';
import { FEATURE_FILMS, getOwnedContent, getFilmIdByKiller, getFilmIdByLocation, getFilmIdByFinalGirl, CHARACTER_IMAGES, CHARACTER_IMAGES_AI, LOCATION_IMAGES, LOCATION_IMAGES_AI } from '@/types/gameData';
import { getSetupCardsForLocation, getEventsForLocation } from '@/types/featureFilmDetails';

describe('Bad Times at Buddyland', () => {
  it('unlocks the complete cast with consistent film lookups and correct health', () => {
    expect(getOwnedContent(['s4-buddyland'])).toEqual({ killers: ['Billy the Bear'], locations: ['Buddyland'], finalGirls: ['Rena', 'Gwynn'] });
    expect(getFilmIdByKiller('Billy the Bear')).toBe('s4-buddyland');
    expect(getFilmIdByLocation('Buddyland')).toBe('s4-buddyland');
    for (const girl of ['Rena', 'Gwynn']) expect(getFilmIdByFinalGirl(girl)).toBe('s4-buddyland');
    expect([getKillerMaxHealth('Billy the Bear'), getFinalGirlHealth('Rena'), getFinalGirlHealth('Gwynn')]).toEqual([8, 6, 5]);
  });

  it('registers five setups and all ten distinct starting Events', () => {
    const setups = getSetupCardsForLocation('s4-buddyland');
    const events = getEventsForLocation('s4-buddyland');
    expect(setups.map(s => s.name)).toEqual(['Hide and Seek', 'Playin’ Hooky', 'Buddy Day', 'Pizza Party', 'Birthday Bash']);
    expect(events).toHaveLength(10);
    expect(new Set(events.map(e => e.name)).size).toBe(10);
    expect(events.map(e => e.name)).toEqual(expect.arrayContaining(['Nick the Janitor', 'Birthday Girl', 'Pizza Delivery', 'Sing-A-Long']));
    expect(events.find(e => e.name === 'Birthday Girl')?.description).toContain('4 Time');
    expect(events.find(e => e.name === 'Buddy Up')?.description).toContain('at least 2');
  });

  it('has real, distinct artwork in both casting preferences and a cover', () => {
    for (const name of ['Billy the Bear', 'Rena', 'Gwynn']) {
      expect(CHARACTER_IMAGES[name]).toMatch(/\.png/);
      expect(CHARACTER_IMAGES_AI[name]).toBe(CHARACTER_IMAGES[name]);
    }
    expect(new Set(['Billy the Bear', 'Rena', 'Gwynn'].map(n => CHARACTER_IMAGES[n])).size).toBe(3);
    expect(LOCATION_IMAGES.Buddyland).toMatch(/buddyland\.png/);
    expect(LOCATION_IMAGES_AI.Buddyland).toBe(LOCATION_IMAGES.Buddyland);
    expect(FEATURE_FILMS.find(f => f.id === 's4-buddyland')?.boxArt).toMatch(/bad-times-at-buddyland\.png/);
  });

  it('keeps killer mechanics and location context independent in mixed games', () => {
    const away = getModulePromptContext('Billy the Bear', 'Camp Happy Trails')!;
    expect(away.rulesSummary).toContain('1 Time');
    expect(away.rulesSummary).toContain('cannot be attacked');
    expect(away.visualGuidance).not.toContain('pizza restaurant');
    const visitor = getModulePromptContext('Hans', 'Buddyland')!;
    expect(visitor.rulesSummary).toContain('Four central');
    expect(visitor.rulesSummary).not.toContain('Billy starts');
    expect(visitor.visualGuidance).not.toContain('animatronic bear');
  });

  it('publishes searchable setup and rules chapters for both owned entities', () => {
    const mods = ENTITY_RULE_MODULES.filter(m => m.filmId === 's4-buddyland');
    expect(mods.map(m => m.kind).sort()).toEqual(['killer', 'location']);
    const sections = mods.flatMap(m => buildEntityChapter(m, '16').sections);
    expect(sections).toHaveLength(4);
    const text = JSON.stringify(sections);
    for (const term of ['1 Time', 'next Killer phase', 'Inactive', 'Power Surge', 'Arcade spaces']) expect(text).toContain(term);
  });

  it('preserves the distinct supplied biographies and unlocked abilities', () => {
    const [rena, gwynn] = BUDDYLAND_DETAILS.finalGirls;
    expect(rena.backstory).toContain('therapist');
    expect(gwynn.backstory).toContain('mechanic');
    expect(rena.ultimateAbility).toContain('0 Time');
    expect(gwynn.ultimateAbility).toContain('only 1 die');
  });
});
