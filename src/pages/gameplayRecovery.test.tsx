import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NowPlaying from './NowPlaying';
import TheEnd from './TheEnd';
import { GameOutcomeForm } from '@/components/GameOutcomeForm';
const mock = vi.hoisted(() => ({ stream: vi.fn(), image: vi.fn(), settingsReady: true, autoGenerate: true }));
vi.mock('@/lib/streamChatCompletion', () => ({ streamChatCompletion: mock.stream }));
vi.mock('@/hooks/useNarration', () => ({ useNarration: () => ({ isNarrating: false, isPlaying: false, progress: {}, toggleNarration: vi.fn() }) }));
vi.mock('@/hooks/useImageGeneration', () => ({ useImageGeneration: () => ({ isAuthenticated: true, settingsReady: mock.settingsReady, autoGenerate: mock.autoGenerate, generateImage: mock.image, generateVisualBible: vi.fn().mockResolvedValue('A look'), isGeneratingImage: false, imageError: null }) }));
vi.mock('@/components/StickyOutcomeBar', () => ({ StickyOutcomeBar: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('@/components/ProjectorLeader', () => ({ ProjectorLeader: () => <div>Generating</div> }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
beforeEach(() => {
  mock.stream.mockReset(); mock.image.mockReset(); mock.settingsReady = true; mock.autoGenerate = true;
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const result = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', timestamp: 1, outcome: 'won' as const, killer: 'Hans', location: 'Camp Happy Trails', finalGirl: 'Laurie' };
const formData = { finalHorrorLevel: 4, finalGirlHealth: 1, killerHealth: 0, weaponUsed: '', victimsSaved: 0, victimsKilled: 0, endingSubLocation: '', gameHighlights: '' };
const opening = 'The lights went out at camp. Laurie stepped into the darkness and heard a branch snap.';

describe('gameplay without AI dependencies', () => {
  it('keeps Billy outcome details with Billy at another Location and checkpoints them', () => {
    const save = vi.fn(); const draft = vi.fn().mockReturnValue(true);
    render(<GameOutcomeForm result={{ ...result, killer: 'Billy the Bear', finalGirl: 'Rena' }} initialDraft={{ buddiesInPlay: 2, powerSuppliesShutDown: true }} onDraftChange={draft} onSaveResult={save} onContinue={vi.fn()} onDiscard={vi.fn()} />);
    expect(screen.getByLabelText('Buddies in Play at End (0–7)')).toHaveValue('2');
    expect(screen.getByLabelText('All Power Sources Inactive')).toBeChecked();
    fireEvent.change(screen.getByLabelText('Buddies in Play at End (0–7)'), { target: { value: '1' } });
    expect(draft).toHaveBeenCalledWith({ buddiesInPlay: 1 });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE RESULT WITHOUT NARRATION' }));
    expect(save.mock.calls[0][0]).toMatchObject({ finalGirlHealth: undefined });
    expect(save.mock.calls[0][0].gameHighlights).toContain('Buddies in play at end: 1');
    expect(save.mock.calls[0][0].gameHighlights).toContain('All Power Sources Inactive');
  });
  it('does not attach Billy mechanics to a different killer visiting Buddyland', () => {
    const save = vi.fn();
    render(<GameOutcomeForm result={{ ...result, location: 'Buddyland', finalGirl: 'Gwynn' }} onSaveResult={save} onContinue={vi.fn()} onDiscard={vi.fn()} />);
    expect(screen.queryByLabelText('All Power Sources Inactive')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'SAVE RESULT WITHOUT NARRATION' }));
    expect(save.mock.calls[0][0]).toMatchObject({ finalGirlHealth: undefined, gameHighlights: '' });
  });
  it('keeps an unreported Buddy count unknown and records the Power Surge ending explicitly', () => {
    const save = vi.fn();
    render(<GameOutcomeForm result={{ ...result, killer: 'Billy the Bear' }} onSaveResult={save} onContinue={vi.fn()} onDiscard={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'SAVE RESULT WITHOUT NARRATION' }));
    expect(save.mock.calls[0][0].gameHighlights).toBe('');
    fireEvent.change(screen.getByLabelText('Billy Finale (optional)'), { target: { value: 'Power Surge' } });
    fireEvent.change(screen.getByLabelText('Boris at Game End'), { target: { value: 'defeated' } });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE RESULT WITHOUT NARRATION' }));
    expect(save.mock.calls[1][0].gameHighlights).toContain('Billy Finale: Power Surge. Boris: defeated');
  });
  it('sends Buddyland cards and the selected biography to opening generation', async () => {
    mock.stream.mockResolvedValue('Rena stepped between the silent arcade cabinets.');
    render(<NowPlaying killer="Billy the Bear" location="Buddyland" finalGirl="Rena" sessionId={result.id} filmId="s4-buddyland" setupScenario="Birthday Bash" startingEvent="Birthday Girl" onBack={vi.fn()} onCheckpoint={vi.fn()} onGameEnd={vi.fn()} />);
    await waitFor(() => expect(mock.stream).toHaveBeenCalled());
    const { body } = mock.stream.mock.calls[0][0];
    expect(JSON.stringify(body)).toContain('therapist');
    expect(JSON.stringify(body)).toContain('4 Time');
    expect(JSON.stringify(body)).toContain('Six Victims');
    expect(JSON.stringify(body)).toContain('1 Time');
  });
  it('gives the ending the selected biography and reported Power Surge state', async () => {
    mock.autoGenerate = false;
    mock.stream.mockResolvedValue('Gwynn put down her tools. The machines were finally silent.');
    render(<TheEnd result={{ ...result, killer: 'Billy the Bear', location: 'Buddyland', finalGirl: 'Gwynn' }} introStory="Gwynn heard a motor turning behind the Prize Counter." formData={{ ...formData, gameHighlights: 'Billy Finale: Power Surge. Boris: defeated', victimsSaved: 4 }} onCheckpoint={vi.fn()} onSave={vi.fn()} onDiscard={vi.fn()} />);
    await waitFor(() => expect(mock.stream).toHaveBeenCalled());
    const { body } = mock.stream.mock.calls[0][0];
    expect(body.finalGirl.backstory).toContain('mechanic');
    expect(body.finalGirlMaxHealth).toBe(5);
    expect(body.gameHighlights).toContain('Boris: defeated');
    expect(body.killer.specialRules).toContain('cannot be attacked');
    expect(body.victimsSaved).toBe(4);
  });
  it('records a result when opening generation fails', async () => {
    mock.stream.mockRejectedValue(new Error('Credits unavailable'));
    const end = vi.fn();
    render(<NowPlaying {...result} sessionId={result.id} filmId="s1-camp-happy-trails" setupScenario={null} startingEvent={null} onBack={vi.fn()} onCheckpoint={vi.fn()} onGameEnd={end} />);
    await screen.findByText('Credits unavailable');
    fireEvent.click(screen.getByRole('button', { name: 'WON' }));
    expect(end).toHaveBeenCalledWith('won', undefined, undefined, 'A look');
  });
  it('saves the result even when no intro exists for an ending', async () => {
    const save = vi.fn();
    render(<TheEnd result={result} formData={formData} onCheckpoint={vi.fn()} onSave={save} onDiscard={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'SAVE RESULT' }));
    expect(save).toHaveBeenCalledWith('', undefined);
    expect(mock.stream).not.toHaveBeenCalled();
  });
  it('keeps a late poster completion attached after Save unmounts the screen', async () => {
    let complete: (url: string) => void;
    mock.image.mockReturnValue(new Promise(resolve => { complete = resolve; }));
    const checkpoint = vi.fn(); const save = vi.fn();
    const view = render(<TheEnd result={result} introStory={opening} initialEndingStory="Laurie made it home." formData={formData} onCheckpoint={checkpoint} onSave={save} onDiscard={vi.fn()} />);
    await waitFor(() => expect(mock.image).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: 'SAVE' }));
    expect(save).toHaveBeenCalledWith('Laurie made it home.', undefined);
    view.unmount();
    await act(async () => { complete!('https://example.test/poster.png'); });
    expect(checkpoint).toHaveBeenCalledWith({ posterImageUrl: 'https://example.test/poster.png' });
  });
  it('does not generate artwork before saved preferences are known', async () => {
    mock.settingsReady = false;
    render(<TheEnd result={result} introStory={opening} initialEndingStory="Laurie made it home." formData={formData} onCheckpoint={vi.fn()} onSave={vi.fn()} onDiscard={vi.fn()} />);
    await act(async () => {});
    expect(mock.image).not.toHaveBeenCalled();
  });
  it('restores and checkpoints special outcome fields and can save without narration', () => {
    const save = vi.fn(); const draft = vi.fn().mockReturnValue(true);
    render(<GameOutcomeForm result={{ ...result, killer: 'Poltergeist' }} initialDraft={{ weaponUsed: 'Axe', foundCarolyn: true, victimsSaved: 0 }} onDraftChange={draft} onSaveResult={save} onContinue={vi.fn()} onDiscard={vi.fn()} />);
    expect(screen.getByDisplayValue('Axe')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Found Carolyn' })).toBeChecked();
    fireEvent.change(screen.getByPlaceholderText('Machete, Axe, Fire...'), { target: { value: 'Knife' } });
    expect(draft).toHaveBeenCalledWith({ weaponUsed: 'Knife' });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE RESULT WITHOUT NARRATION' }));
    expect(save.mock.calls[0][0]).toMatchObject({ weaponUsed: 'Knife', victimsSaved: 0 });
    expect(save.mock.calls[0][0].gameHighlights).toContain('Found Carolyn');
  });
});
