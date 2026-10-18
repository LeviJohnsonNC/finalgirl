import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
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
  return (
    <Popover.Root
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
      >
        <span>{value || placeholder}</span>
        <ChevronDown size={16} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="play-search-menu"
          sideOffset={5}
          collisionPadding={12}
        >
          <Command>
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
              {value && (
                <CommandItem value="Clear selection" onSelect={() => pick("")}>
                  Clear selection
                </CommandItem>
              )}
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => pick(option)}
                >
                  {option}
                </CommandItem>
              ))}
              {allowCustom &&
                search.trim() &&
                !options.some(
                  (o) => o.toLowerCase() === search.trim().toLowerCase(),
                ) && (
                  <CommandItem
                    value={search}
                    onSelect={() => pick(search.trim())}
                  >
                    Use “{search.trim()}”
                  </CommandItem>
                )}
              {!allowCustom && <CommandEmpty>No matching cards.</CommandEmpty>}
            </CommandList>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
