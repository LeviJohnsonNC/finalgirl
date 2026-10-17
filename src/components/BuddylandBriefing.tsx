import { Bolt, Gamepad2, Heart, ChevronDown } from 'lucide-react';
import { BUDDYLAND_DETAILS } from '@/data/buddyland';
import { getFinalGirlHealth } from '@/data/finalGirlHealth';

interface Props { killer: string | null; location: string | null; finalGirl: string | null }

/** A casting reference, not a second board-state tracker. Each module travels with its entity. */
export function BuddylandBriefing({ killer, location, finalGirl }: Props) {
  const billy = killer === 'Billy the Bear';
  const arcade = location === 'Buddyland';
  const girl = BUDDYLAND_DETAILS.finalGirls.find(g => g.name === finalGirl);
  if (!billy && !arcade && !girl) return null;

  return (
    <section aria-label="Buddyland case notes" className="w-full max-w-3xl px-4 mb-8">
      <div className="relative overflow-hidden border border-secondary/30 bg-background/90">
        <div className="h-1 bg-gradient-to-r from-secondary via-accent to-primary" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="font-vhs text-secondary text-sm tracking-[0.18em]">FF16 // AFTER HOURS</span>
            <span className="type-caption text-muted-foreground">CASTING NOTES</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-foreground">
            {arcade ? 'The party never ends.' : billy ? 'He brought his friends.' : 'Everyone has a reason to stay.'}
          </h2>
          <p className="type-body-sm text-muted-foreground mt-2 max-w-xl">
            {arcade ? 'The cabinets are still glowing. The doors should have stayed closed.' : billy ? 'A familiar smile. A failing power circuit. Something moving behind him.' : girl?.name === 'Rena' ? 'She came to face the nightmare. Tonight, it faces her back.' : 'She came to see how the machines worked. Now she needs to make it out.'}
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            {billy && <div className="flex gap-3"><Bolt aria-hidden="true" className="h-5 w-5 shrink-0 text-accent mt-0.5" /><p className="type-body-sm text-foreground/90"><strong className="block font-display tracking-wide text-accent">CUT THE POWER</strong>4 sources start Active. Spend 1 Time in a source’s space to deactivate it. Buddies sharing Billy’s space protect him from attacks.</p></div>}
            {arcade && <div className="flex gap-3"><Gamepad2 aria-hidden="true" className="h-5 w-5 shrink-0 text-secondary mt-0.5" /><p className="type-body-sm text-foreground/90"><strong className="block font-display tracking-wide text-secondary">WATCH THE ARCADE</strong>4 marked central spaces. 5 setups. 10 Events. Check your starting Event before the first move.</p></div>}
          </div>
          {girl && <details className="group mt-5 border-t border-border/60 pt-4">
            <summary className="flex items-center gap-2 cursor-pointer min-h-[44px] font-display text-sm tracking-wide text-foreground list-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary">
              <Heart aria-hidden="true" className="h-4 w-4 text-primary" />{girl.name.toUpperCase()} // {getFinalGirlHealth(girl.name)} HEALTH
              <span className="text-muted-foreground ml-auto text-xs">ULTIMATE</span><ChevronDown aria-hidden="true" className="h-4 w-4 text-secondary group-open:rotate-180 transition-transform" />
            </summary>
            <div className="pt-3 space-y-2 type-body-sm text-muted-foreground">
              <p>{girl.ultimateAbility}</p><p>{girl.additionalSaveReward}</p>
              <p className="type-caption">Available after unlocking the reverse side of your Final Girl card.</p>
            </div>
          </details>}
        </div>
      </div>
    </section>
  );
}
