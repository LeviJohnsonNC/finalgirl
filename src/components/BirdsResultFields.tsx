import '@/styles/play-birds.css';
import { BIRDS_LOSS_CHOICES, type BirdsReason } from '../../supabase/functions/_shared/play/birds';
import { OutcomeSelect } from './outcome/OutcomeSelect';

export function BirdsResultFields({outcome, value, onChange}: {
  outcome:'won'|'lost'; value:BirdsReason|''; onChange:(value:BirdsReason|'')=>void;
}) {
  if (outcome === 'won') return (
    <label className="birds-review-check">
      <input type="checkbox" checked={value === 'rescued'} onChange={event=>onChange(event.target.checked ? 'rescued' : '')} />
      <span>All required Special Victims were rescued</span>
    </label>
  );
  return (
    <OutcomeSelect label="Loss reason" value={value === 'rescued' ? '' : value} onValueChange={next => onChange(next as BirdsReason | '')}>
      <option value="">Choose the physical result</option>
      {BIRDS_LOSS_CHOICES.map(choice=><option key={choice.value} value={choice.value}>{choice.label}</option>)}
    </OutcomeSelect>
  );
}
