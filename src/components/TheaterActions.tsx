import { Play } from 'lucide-react';
import type { ActiveGame } from '@/lib/activeGame';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface TheaterActionsProps {
  game?: ActiveGame | null;
  cloud?: boolean;
  onStart: () => void;
  onStartAnother?: () => boolean;
}

export const TheaterActions = ({ game, cloud, onStart, onStartAnother }: TheaterActionsProps) => (
  <div className="theater-actions">
    <button className="theater-play" onClick={onStart}>
      <span className="theater-play-icon"><Play size={22} fill="currentColor" aria-hidden="true" /></span>
      <span className="theater-play-label">{game ? cloud ? 'RESUME CLOUD GAME' : 'RESUME GAME' : 'START THE TAPE'}</span>
    </button>
    {game ? <>
      <p className="theater-action-hint">{game.selection.finalGirl} vs. {game.selection.killer}</p>
      {onStartAnother && (cloud ? <button className="theater-new-tape" onClick={onStartAnother}>Start another tape</button> : (
        <AlertDialog>
          <AlertDialogTrigger asChild><button className="theater-new-tape">Start another tape</button></AlertDialogTrigger>
          <AlertDialogContent className="theater-confirm max-w-[calc(100vw-2rem)] sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-2xl">Start another tape?</AlertDialogTitle>
              <AlertDialogDescription className="font-vhs text-xl">This closes your unfinished game with {game.selection.finalGirl} against {game.selection.killer}. Any result already recorded stays in your case files.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:space-x-0">
              <AlertDialogCancel className="font-vhs text-lg min-h-[44px]">Keep this game</AlertDialogCancel>
              <AlertDialogAction className="font-vhs text-lg min-h-[44px] h-auto whitespace-normal" onClick={event => { if (!onStartAnother()) event.preventDefault(); }}>Close game &amp; start another</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </> : null}
  </div>
);

