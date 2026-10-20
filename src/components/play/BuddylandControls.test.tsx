import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useCallback, useState } from 'react';
import { BuddylandControls } from './BuddylandControls';
import { newPlayEvent, summarizePlay, type PlayEvent } from '@/lib/play/events';
import { moduleState } from '@/lib/play/modules';
afterEach(cleanup);
const start = () => newPlayEvent({kind:'start',saved:0,killed:0,round:1});
function Harness({ initial, killer = 'Billy the Bear', location = 'Camp Happy Trails', fail = false }: {initial:PlayEvent[];killer?:string;location?:string;fail?:boolean}) {
  const [events,setEvents] = useState(initial);
  const onEvent = useCallback((event:PlayEvent) => { if(fail)return false; setEvents(events => [...events,event]);return true; },[fail]);
  return <><BuddylandControls killer={killer} location={location} finalGirl="Rena" events={events} onEvent={onEvent}/><output data-testid="events">{JSON.stringify(events)}</output></>;
}
const log = () => JSON.parse(screen.getByTestId('events').textContent!) as PlayEvent[];
describe('Billy power source controls', () => {
  it('initializes once, preserves saved off states, includes/removes the fifth, and survives resume at another location', () => {
    const off = newPlayEvent({kind:'module',moduleData:{module:'billy',changes:{'source.2.status':'inactive'}}});
    const view = render(<Harness initial={[start(),off]}/>);
    expect(screen.getByRole('button',{name:'Power source 1, On. Turn off'})).toHaveAttribute('aria-pressed','true');
    expect(screen.getByRole('button',{name:'Power source 2, Off. Turn on'})).toHaveAttribute('aria-pressed','false');
    fireEvent.click(screen.getByRole('button',{name:'Add fifth power source'}));
    fireEvent.click(screen.getByRole('button',{name:'Power source 5, On. Turn off'}));
    const saved = log();
    expect(saved.filter(e => e.moduleData?.changes.powerSourcesReady)).toHaveLength(1);
    view.unmount();render(<Harness initial={saved}/>);
    expect(screen.getByRole('button',{name:'Power source 5, Off. Turn on'})).toBeVisible();
    expect(log()).toHaveLength(saved.length);
    fireEvent.click(screen.getByRole('button',{name:'Remove fifth'}));
    expect(screen.getByRole('button',{name:'Add fifth power source'})).toBeVisible();
    const state = moduleState(summarizePlay(log()).entries,'billy');
    expect(state['source.1.status']).toBe('active');
    expect(state['source.2.status']).toBe('inactive');
    expect(state['source.5.status']).toBe('set-aside');
  });
  it('does not attach Billy sources to another killer visiting Buddyland', () => {
    render(<Harness initial={[start()]} killer="Hans" location="Buddyland"/>);
    expect(screen.queryByRole('group',{name:'Power sources'})).toBeNull();
    expect(log()).toHaveLength(1);
    expect(screen.queryByText('Rena reference')).toBeNull();
  });
  it('does not claim a failed token write succeeded', () => {
    render(<Harness initial={[start()]} fail/>);
    fireEvent.click(screen.getByRole('button',{name:'Power source 1, On. Turn off'}));
    expect(screen.getByRole('button',{name:'Power source 1, On. Turn off'})).toBeVisible();
    expect(screen.getByText('This change could not be saved. Please try again.')).toBeVisible();
    expect(log()).toHaveLength(1);
  });
});
