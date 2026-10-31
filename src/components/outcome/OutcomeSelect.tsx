import { Children, isValidElement, type ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY = "__outcome_unrecorded__";

/** Retain the existing module option catalogs in a themed, keyboard-ready menu. */
export function OutcomeSelect({
  id,
  label,
  value,
  onValueChange,
  children,
}: {
  id?: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <Select
      value={value || EMPTY}
      onValueChange={(next) => onValueChange(next === EMPTY ? "" : next)}
    >
      <SelectTrigger id={id} aria-label={label} className="outcome-select">
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        className="outcome-select-menu"
        position="popper"
        collisionPadding={12}
      >
        {Children.toArray(children).map((child) => {
          if (!isValidElement<{ value: string; children: ReactNode; disabled?: boolean }>(child))
            return null;
          return (
            <SelectItem
              key={child.props.value || EMPTY}
              value={child.props.value || EMPTY}
              disabled={child.props.disabled}
            >
              {child.props.children}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
