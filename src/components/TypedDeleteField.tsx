import { useId } from "react";

/** Explicit acknowledgement shared by every manual destructive-data flow. */
export function TypedDeleteField({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-2 text-left">
      <label htmlFor={id} className="block text-sm font-normal text-foreground">
        Type <strong>DELETE</strong> to confirm
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        autoCapitalize="characters"
        className="min-h-[44px] w-full rounded border border-muted-foreground/40 bg-background px-3 py-2 text-base font-sans text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
      />
    </div>
  );
}
