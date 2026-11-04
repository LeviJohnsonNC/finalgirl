import { useEffect, useId, useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown } from 'lucide-react';
import { compareDropdownLabels } from '@/lib/dropdownOrder';
import '@/styles/dropdowns.css';

/** Editable combobox with board suggestions and a free-text value. */
export function SuggestionInput({ label, value, onChange, options, placeholder, browseLabel }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  browseLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const browse = useRef<HTMLButtonElement>(null);
  const items = useRef<Array<HTMLLIElement | null>>([]);
  const listId = useId();
  const choices = ['', ...[...new Set(options)].sort(compareDropdownLabels)
    .filter(option => option.toLowerCase().includes(query.trim().toLowerCase()))];

  useEffect(() => {
    if (open && active >= 0) items.current[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const pick = (option: string) => {
    onChange(option);
    setOpen(false);
    setQuery('');
    setActive(-1);
  };
  const showAll = () => {
    setQuery('');
    setActive(-1);
    setOpen(true);
  };

  return <Popover.Root open={open} onOpenChange={setOpen}>
    <Popover.Anchor asChild>
      <div className="themed-suggestion-control">
        <input ref={input} type="text" role="combobox" aria-label={label}
          aria-expanded={open} aria-autocomplete="list" aria-controls={open ? listId : undefined}
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off" value={value} placeholder={placeholder}
          onChange={event => {
            onChange(event.target.value);
            setQuery(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={event => {
            if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
            if (event.key === 'Tab') setOpen(false);
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              setOpen(true);
              if (!open) setQuery('');
              setActive(index => event.key === 'ArrowDown'
                ? Math.min(index + 1, choices.length - 1)
                : index < 0 ? choices.length - 1 : Math.max(0, index - 1));
            }
            if (event.key === 'Enter' && open && active >= 0) {
              event.preventDefault();
              pick(choices[active]);
            }
          }} />
        <button ref={browse} type="button" className="themed-suggestion-browse"
          aria-label={browseLabel ?? `Browse ${label.toLowerCase()} suggestions`}
          onClick={() => {
            if (open) { setOpen(false); return; }
            input.current?.focus();
            showAll();
          }}>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
      </div>
    </Popover.Anchor>
    <Popover.Portal>
      <Popover.Content className="themed-search-menu" sideOffset={5} collisionPadding={12}
        onOpenAutoFocus={event => event.preventDefault()}
        onCloseAutoFocus={event => event.preventDefault()}
        onInteractOutside={event => {
          if (event.target === input.current || browse.current?.contains(event.target as Node)) event.preventDefault();
        }}>
        <ul className="themed-suggestion-list" id={listId} role="listbox" aria-label={`${label} suggestions`}>
          {choices.map((option, index) => <li key={option} id={`${listId}-${index}`} role="option"
            ref={node => { items.current[index] = node; }} aria-selected={active === index}
            onMouseDown={event => event.preventDefault()} onClick={() => pick(option)}>{option || 'Not recorded'}</li>)}
          <li className="themed-suggestion-empty" role="presentation">
            {choices.length === 1 && query ? 'No matches. ' : ''}Type to use a custom value.
          </li>
        </ul>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>;
}
