import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { compareDropdownLabels } from "@/lib/dropdownOrder";
import "@/styles/dropdowns.css";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";

/** Search known facts or enter a fact from a card that is not in the catalog yet. */
export function PlaySearch({
  label,
  value,
  options,
  onChange,
  placeholder = "Choose or enter…",
  onSearch,
  allowCustom = true,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void | boolean;
  placeholder?: string;
  onSearch?: (value: string) => void;
  allowCustom?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pick = (next: string) => {
    if (onChange(next) !== false) setOpen(false);
  };
  const choices = [...new Set(options)].map(option => ({id:`option:${option}`,label:option,value:option}));
  if (value) choices.push({id:'clear',label:'Clear selection',value:''});
  if (allowCustom && search.trim() && !options.some(option => option.toLowerCase() === search.trim().toLowerCase()))
    choices.push({id:'custom',label:`Use “${search.trim()}”`,value:search.trim()});
  const visible = choices.filter(option => option.label.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a,b) => compareDropdownLabels(a.label,b.label));
  return (
    <Popover.Root modal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setSearch("");
      }}
    >
      <Popover.Trigger
        className="play-select-trigger"
        aria-label={label}
        role="combobox"
        aria-expanded={open}
        onKeyDown={event => {
          if (open && event.key === "Escape") {event.preventDefault();event.stopPropagation();setOpen(false);}
        }}
      >
        <span>{value || placeholder}</span>
        <ChevronDown size={16} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="play-search-menu themed-search-menu"
          sideOffset={5}
          collisionPadding={12}
          onKeyDownCapture={event => {
            if (event.key === "Escape") {event.preventDefault();event.stopPropagation();setOpen(false);}
          }}
          onEscapeKeyDown={event => {
            // Dismiss only this picker, even inside another modal's focus scope.
            event.preventDefault();event.stopPropagation();setOpen(false);
          }}
        >
          <Command shouldFilter={false}>
            <CommandInput
              aria-label={`Search ${label}`}
              value={search}
              onValueChange={(next) => {
                setSearch(next);
                onSearch?.(next);
              }}
              placeholder="Search or type your own…"
              maxLength={160}
            />
            <CommandList aria-label={`${label} options`}>
              {visible.map(option => <CommandItem key={option.id} value={option.id}
                onSelect={() => pick(option.value)}>{option.label}</CommandItem>)}
              {visible.length === 0 && <CommandEmpty>No matching cards.</CommandEmpty>}
            </CommandList>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
