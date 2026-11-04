import { useId } from 'react';

export function OutcomeChoices({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  const name = useId();
  return <fieldset className="outcome-choices">
    <legend>{label}</legend>
    <div>
      {[['', 'Not recorded'], ...options].map(([id, text]) => <label key={id}>
        <input type="radio" name={name} value={id} checked={value === id} onChange={() => onChange(id)} />
        <span>{text}</span>
      </label>)}
    </div>
  </fieldset>;
}
