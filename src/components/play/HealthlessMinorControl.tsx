import { IllustratedTile } from './IllustratedTile';
import { ModuleArtwork, type ModuleArt } from './ModuleArtwork';
import { PlaySelect } from './PlaySelect';
/** Ongoing Minor effects whose printed cards have no damageable Health. */
export function HealthlessMinorControl({ name, value, art, disabled, activationBlocked, onActivate, onEnd, onCorrect }: {
    name: string;
    value?: string;
    art: ModuleArt;
    disabled: boolean;
    activationBlocked: boolean;
    onActivate: () => void;
    onEnd: () => void;
    onCorrect: (value: string | null) => void;
}) {
    const active = value === 'active';
    const removed = value === 'removed';
    return <article className="module-minor module-cinematic-minor polter-healthless-minor" data-module-control="minor-effect" data-active={active} data-state={value ?? 'unknown'}>
    {active ? <IllustratedTile className="module-control-tile" art={art} title={name} status="Active · Click to end" aria-label={`End effect: ${name}`} aria-pressed={true} aria-disabled={disabled} onClick={() => { if (!disabled)
            onEnd(); }}/> :
            <button type="button" className="module-minor-choice" aria-label={`Activate ${name}`} aria-disabled={disabled || removed || activationBlocked} onClick={() => { if (!disabled && !removed && !activationBlocked)
                onActivate(); }}><span className="module-minor-art"><ModuleArtwork art={art}/></span><span className="module-minor-choice-copy"><span className="cinematic-eyebrow">Minor Dark Power</span><strong>{name}</strong><span className="module-health-status">{removed ? 'Removed from the game' : value === 'inactive' ? 'Inactive' : 'Not recorded'}</span></span></button>}
    <details className="module-correction"><summary>Correct record<span className="sr-only">: {name}</span></summary><PlaySelect aria-label={`${name} status`} value={value ?? ''} disabled={disabled} onChange={e => onCorrect(e.target.value || null)}><option value="">Not recorded</option><option value="inactive">Inactive</option><option value="active">Active</option><option value="removed">Removed from the game</option></PlaySelect></details>
  </article>;
}
