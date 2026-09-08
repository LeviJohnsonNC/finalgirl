import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface NarrativeBadgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  value: string;
  subtext: string;
  image?: string;
  type?: 'killer' | 'location' | 'finalGirl';
}

const BADGE_DESCRIPTIONS: Record<string, string> = {
  'Nemesis': 
    'The one who keeps dragging you into the dark. This killer has handed you more defeats than any other — a recurring nightmare you can\'t seem to shake. Every encounter feels personal, every loss a wound that festers. They know your weaknesses, and they exploit them without mercy.',
  'The Usual Suspect': 
    'Your favorite punching bag. This killer has fallen to you more than any other, a reliable adversary you\'ve learned to read like a worn-out script. You know their tricks, their patterns, their tells. When this one shows up, you already know how the story ends.',
  'Cursed Site': 
    'Something is wrong with this place. No matter how many times you walk through those doors, the outcome is always the same — blood, screams, and defeat. The walls remember your failures. Maybe it\'s time to stop going back… or maybe you\'re not done until you break the curse.',
  'Home Turf': 
    'You own this ground. When the horrors come knocking at this location, you know every hiding spot, every escape route, every advantage the terrain offers. This is where you thrive, where the odds tilt in your favor. Welcome home.',
  'Comfort Zone': 
    'Your ride-or-die survivor. This Final Girl has pulled you through more victories than any other — a trusted companion whose instincts align perfectly with yours. When the night gets dark and the odds get long, you reach for her every time.',
  'Cursed Pick': 
    'She tries. You try. It never works. This Final Girl has seen more defeat under your command than any other. Whether it\'s bad luck, bad matchups, or bad decisions, the result is always the same. Maybe some stories aren\'t meant to have happy endings.',
  'Grinder': 
    'Your most-played survivor, win or lose. You keep coming back to this Final Girl — not because she always wins, but because there\'s something about her story that won\'t let you go. She\'s earned her place through sheer persistence.',
  'Lost Cause': 
    'The numbers don\'t lie. Of all the Final Girls you\'ve played enough to judge, this one has the worst track record. A statistical tragedy. But every lost cause is just a redemption arc waiting to happen… right?',
};

export const NarrativeBadgeModal = ({
  open,
  onOpenChange,
  label,
  value,
  subtext,
  image,
  type = 'killer',
}: NarrativeBadgeModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wider text-primary blood-glow uppercase">
            {label}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground type-caption uppercase">
            {value} • {subtext}
          </DialogDescription>
        </DialogHeader>

        {image && (
          <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden my-2">
            <img
              src={image}
              alt={value}
              className={`w-full h-full object-cover ${type === 'location' ? 'object-center' : 'object-top'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
        )}

        <p className="type-body-sm text-foreground/80 leading-relaxed">
          {BADGE_DESCRIPTIONS[label] || 'No data available.'}
        </p>
      </DialogContent>
    </Dialog>
  );
};
