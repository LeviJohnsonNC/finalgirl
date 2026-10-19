import { MoreHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "@/styles/discard-game.css";

export function SessionOptions({ onDiscard }: { onDiscard: () => void }) {
  const openingConfirmation = useRef(false);
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (open) openingConfirmation.current = false;
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="session-options-trigger"
          aria-label="Session options"
          title="Session options"
        >
          <MoreHorizontal size={20} aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="session-options-menu"
        align="end"
        collisionPadding={12}
        onCloseAutoFocus={(event) => {
          if (openingConfirmation.current) event.preventDefault();
        }}
      >
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            openingConfirmation.current = true;
            setOpen(false);
            requestAnimationFrame(onDiscard);
          }}
        >
          Discard game…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
