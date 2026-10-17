import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CastingRoom from './CastingRoom';
vi.mock('@/hooks/useOwnedFilms', () => ({ useOwnedFilms: () => ({ ownedFilms: ['s1-camp-happy-trails', 's3-falconwood-files'], isLoading: false, loadError: null }) }));
vi.mock('@/components/CastingSlot', () => ({ CastingSlot: ({ type, onChoose }: { type: string; onChoose: () => void }) => <button onClick={onChoose}>Choose {type}</button> }));
vi.mock('@/components/CastingPicker', () => ({ CastingPicker: ({ options, onSelect }: { options: string[]; onSelect: (value: string) => void }) => <div>{options.map(option => <button key={option} onClick={() => onSelect(option)}>{option}</button>)}</div> }));
vi.mock('@/components/ScenarioDropdowns', () => ({ ScenarioDropdowns: ({ onSetupChange, onEventChange, onMissionChange }: { onSetupChange: (value: string) => void; onEventChange: (value: string) => void; onMissionChange: (value: string) => void }) => <button onClick={() => { onSetupChange('Old setup'); onEventChange('Old event'); onMissionChange('Old mission'); }}>Choose scenario</button> }));

describe('casting scenario ownership', () => {
  it('does not carry setup, event or mission into a different location', () => {
    const start = vi.fn();
    render(<CastingRoom onStartGame={start} onGoToArchive={vi.fn()} />);
    for (const [slot, value] of [['killer', 'Hans'], ['location', 'Falconwood'], ['finalGirl', 'Laurie']]) {
      fireEvent.click(screen.getByRole('button', { name: 'Choose ' + slot }));
      fireEvent.click(screen.getByRole('button', { name: value }));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Choose scenario' }));
    fireEvent.click(screen.getByRole('button', { name: 'Choose location' }));
    fireEvent.click(screen.getByRole('button', { name: 'Camp Happy Trails' }));
    fireEvent.click(screen.getByRole('button', { name: 'Press Play' }));
    expect(start).toHaveBeenCalledWith(expect.objectContaining({ location: 'Camp Happy Trails', setupScenario: null, startingEvent: null, mission: null }));
  });
});
