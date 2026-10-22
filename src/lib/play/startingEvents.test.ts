import { describe, expect, it } from 'vitest';
import {
  startingEventObservations,
  validModuleObservation,
  moduleState,
} from './modules';
import { newPlayEvent, summarizePlay } from './events';

describe('starting event observations', () => {
  it.each([
    ['Camp Happy Trails', 'Boyfriend', 'camp', 'victim.boyfriend', 'in-play'],
    ['Camp Happy Trails', 'Girlfriend', 'camp', 'victim.girlfriend', 'in-play'],
    ['Camp Happy Trails', 'Vengeance', 'camp', 'victim.the-damned', 'in-play'],
    ['Buddyland', 'Nick the Janitor', 'buddyland', 'victim.nick', 'on-board'],
    [
      'Buddyland',
      'Birthday Girl',
      'buddyland',
      'victim.birthday-girl',
      'on-board',
    ],
    [
      'Buddyland',
      'Pizza Delivery',
      'buddyland',
      'victim.pizza-guy',
      'on-board',
    ],
  ])(
    '%s / %s puts only the established special character in play',
    (location, startingEvent, module, key, value) => {
      const setup = startingEventObservations({ location, startingEvent });
      expect(setup).toEqual([{ module, changes: { [key]: value } }]);
      expect(setup.every(validModuleObservation)).toBe(true);
      const summary = summarizePlay([
        newPlayEvent({ kind: 'start', saved: 0, killed: 0, round: 1 }),
        ...setup.map((moduleData) =>
          newPlayEvent({ kind: 'module', moduleData }),
        ),
      ]);
      expect([summary.saved, summary.killed, summary.round]).toEqual([0, 0, 1]);
    },
  );
  it('activates persistent Camp effects without choosing tunnel endpoints or resolving casualties', () => {
    for (const name of [
      'Clingy Campers',
      'Dark Waters',
      'Deathwish',
      'Secret Tunnel',
      'Star Crossed Lovers',
      'Stubborn Kids',
    ]) {
      const setup = startingEventObservations({
        location: 'Camp Happy Trails',
        startingEvent: name,
      });
      expect(setup).toHaveLength(1);
      expect(setup.every(validModuleObservation)).toBe(true);
      expect(Object.values(setup[0].changes)).toEqual(['active']);
      expect(
        moduleState(
          setup.map((moduleData) => ({ kind: 'module', moduleData })),
          'camp',
        ),
      ).not.toHaveProperty('tunnel.a');
    }
  });
  it('leaves immediate, unknown, absent and mismatched-location events alone', () => {
    for (const [location, startingEvent] of [
      ['Camp Happy Trails', 'Fresh Meat'],
      ['Camp Happy Trails', null],
      ['Camp Happy Trails', 'Birthday Girl'],
      ['Buddyland', 'Girlfriend'],
      ['Creech Manor', 'Girlfriend'],
      ['Buddyland', 'Tragic Collapse'],
      ['Buddyland', 'Unknown event'],
    ])
      expect(
        startingEventObservations({ location: location!, startingEvent }),
      ).toEqual([]);
  });
});
