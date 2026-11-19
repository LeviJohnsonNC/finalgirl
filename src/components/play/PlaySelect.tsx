import {
  Children,
  isValidElement,
  type ReactNode,
  type ChangeEvent,
} from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/** A themed, keyboard-accessible replacement for the small native status menus. */
export function PlaySelect({
  id,
  disabled = false,
  value,
  onChange,
  children,
  "aria-label": label,
}: {
  id?: string;
  disabled?: boolean;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  "aria-label": string;
}) {
  const options: { value: string; label: ReactNode; disabled?: boolean }[] = [];
  const visit = (nodes: ReactNode) =>
    Children.forEach(nodes, (child) => {
      if (
        !isValidElement<{
          value?: string | number;
          children?: ReactNode;
          disabled?: boolean;
        }>(child)
      )
        return;
      if (child.type === "option")
        options.push({
          value: String(child.props.value ?? child.props.children),
          label: child.props.children,
          disabled: child.props.disabled,
        });
      else visit(child.props.children);
    });
  visit(children);
  return (
    <Select
      disabled={disabled}
      value={value || "__empty__"}
      onValueChange={(next) =>
        onChange({
          target: { value: next === "__empty__" ? "" : next },
        } as ChangeEvent<HTMLSelectElement>)
      }
    >
      <SelectTrigger id={id} className="play-select-trigger" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="play-select-menu" position="popper">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value || "__empty__"}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
