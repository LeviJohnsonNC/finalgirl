import '@/styles/play-birds.css';
import { BIRDS_LOSS_CHOICES, type BirdsReason } from '../../supabase/functions/_shared/play/birds';

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
    <label className="birds-review-loss">
      <span>Loss reason</span>
      <select value={value === 'rescued' ? '' : value} onChange={event=>onChange(event.target.value as BirdsReason|'')}>
        <option value="">Choose the physical result</option>
        {BIRDS_LOSS_CHOICES.map(choice=><option key={choice.value} value={choice.value}>{choice.label}</option>)}
      </select>
    </label>
  );
}
