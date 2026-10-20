import { useEffect, useId, useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { compareDropdownLabels } from '@/lib/dropdownOrder';
import '@/styles/dropdowns.css';

/** Editable combobox: browse every suggestion, or retain any custom text. */
export function SuggestionInput({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (value: string) => void;
  options: readonly string[]; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const items = useRef<Array<HTMLLIElement | null>>([]);
  const listId = useId();
  const choices = [...new Set(options)].sort(compareDropdownLabels)
    .filter(option => option.toLowerCase().includes(query.trim().toLowerCase()));
  useEffect(() => {
    if (open && active >= 0) items.current[active]?.scrollIntoView({block:'nearest'});
  },[open,active]);
  const show = () => { if (!open) {setQuery('');setActive(-1);setOpen(true);} };
  const pick = (option: string) => {onChange(option);setOpen(false);setQuery('');setActive(-1);};
  if (!options.length) return <input type="text" aria-label={label} value={value}
    onChange={event => onChange(event.target.value)} placeholder={placeholder} />;
  return <Popover.Root open={open} onOpenChange={setOpen}>
    <Popover.Anchor asChild>
      <input ref={input} type="text" role="combobox" aria-label={label}
        aria-expanded={open} aria-autocomplete="list" aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off" value={value} placeholder={placeholder}
        onChange={event => {onChange(event.target.value);setQuery(event.target.value);setActive(-1);setOpen(true);}}
        onFocus={show} onClick={show}
        onKeyDown={event => {
          if (event.key === 'Escape') {event.preventDefault();setOpen(false);}
          if (event.key === 'Tab') setOpen(false);
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();setOpen(true);
            setActive(index => event.key === 'ArrowDown' ? Math.min(index+1,choices.length-1) : index < 0 ? choices.length-1 : Math.max(0,index-1));
          }
          if (event.key === 'Enter' && open && choices[active]) {event.preventDefault();pick(choices[active]);}
        }} />
    </Popover.Anchor>
    <Popover.Portal>
      <Popover.Content className="themed-search-menu" sideOffset={5} collisionPadding={12}
        onOpenAutoFocus={event => event.preventDefault()}
        onCloseAutoFocus={event => event.preventDefault()}
        onInteractOutside={event => { if (event.target === input.current) event.preventDefault(); }}>
        <ul className="themed-suggestion-list" id={listId} role="listbox" aria-label={`${label} suggestions`}>
          {choices.map((option,index) => <li key={option} id={`${listId}-${index}`} role="option"
            ref={node => {items.current[index]=node;}} aria-selected={active===index}
            onMouseDown={event => event.preventDefault()} onClick={() => pick(option)}>{option}</li>)}
          {choices.length === 0 && <li className="themed-suggestion-empty" role="presentation">No matching suggestions. You can enter your own.</li>}
        </ul>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>;
}
