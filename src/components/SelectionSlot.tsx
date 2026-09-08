import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SelectionSlotProps {
  label: string;
  value: string | null;
  options: string[];
  onRandomize: () => void;
  onSelect: (value: string) => void;
  icon: React.ReactNode;
  accentColor: 'primary' | 'secondary' | 'accent';
}

export const SelectionSlot = ({
  label,
  value,
  options,
  onRandomize,
  onSelect,
  icon,
  accentColor,
}: SelectionSlotProps) => {
  const colorClasses = {
    primary: {
      text: 'text-primary',
      glow: 'blood-glow',
      border: 'border-primary/50',
      shadow: 'shadow-blood',
    },
    secondary: {
      text: 'text-secondary',
      glow: 'neon-text',
      border: 'border-secondary/50',
      shadow: 'shadow-neon',
    },
    accent: {
      text: 'text-accent',
      glow: '',
      border: 'border-accent/50',
      shadow: 'shadow-yellow',
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <div className={cn(
      "glass-card p-4 rounded-lg",
      value && colors.border,
      value && colors.shadow
    )}>
      <div className="flex items-center gap-3 mb-3">
        <span className={cn("shrink-0", colors.text)}>{icon}</span>
        <span className="font-title text-2xl text-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>

      <div className={cn(
        "min-h-[60px] flex items-center justify-center mb-3 bg-background/50 rounded border border-border",
        value && "border-opacity-50"
      )}>
        {value ? (
          <span className={cn(
            "font-horror text-2xl text-center px-2",
            colors.text,
            colors.glow
          )}>
            {value}
          </span>
        ) : (
          <span className="type-label text-muted-foreground">
            [ NO SELECTION ]
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRandomize}
          disabled={options.length === 0}
          className="flex-1 vcr-button glitch-hover font-vhs"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          RANDOM
        </Button>

        <Select value={value || ''} onValueChange={onSelect}>
          <SelectTrigger className="flex-1 vcr-button type-label">
            <SelectValue placeholder="SELECT" />
          </SelectTrigger>
          <SelectContent className="glass-card border-border max-h-60">
            {options.map((option) => (
              <SelectItem 
                key={option} 
                value={option}
                className="type-label hover:bg-primary/20 cursor-pointer"
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
