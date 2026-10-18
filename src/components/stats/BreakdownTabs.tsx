import { ComputedStats } from '@/hooks/useGameStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useActiveImages } from '@/hooks/useActiveImages';

interface BreakdownTabsProps {
  stats: ComputedStats;
}

/**
 * Win rate as a number and a bar. The bar costs nothing — the numeric columns
 * are sized to their content, so the table had the width spare — and it turns
 * "33% vs 75%" from arithmetic into something the eye does.
 */
const RateCell = ({ rate }: { rate: number }) => {
  const rounded = Math.round(rate);
  const winning = rate >= 50;
  return (
    <div className="breakdown-rate">
      <span className="breakdown-rate-meter">
        <span
          className={`breakdown-rate-fill ${winning ? 'breakdown-rate-fill-win' : 'breakdown-rate-fill-loss'}`}
          style={{ width: `${rate}%` }}
        />
      </span>
      <span className={winning ? 'text-neon-cyan' : 'text-blood-red'}>{rounded}%</span>
    </div>
  );
};

export const BreakdownTabs = ({ stats }: BreakdownTabsProps) => {
  const { characterImages: CHARACTER_IMAGES, locationImages: LOCATION_IMAGES } = useActiveImages();

  if (stats.gamesPlayed === 0) {
    return null;
  }

  return (
    <div className="breakdown-section">
      <Tabs defaultValue="finalGirls" className="w-full">
        <TabsList className="breakdown-tabs-list">
          <TabsTrigger value="finalGirls" className="breakdown-tab">
            Final Girls
          </TabsTrigger>
          <TabsTrigger value="killers" className="breakdown-tab">
            Killers
          </TabsTrigger>
          <TabsTrigger value="locations" className="breakdown-tab">
            Locations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="finalGirls" className="breakdown-content">
          <div className="breakdown-scroll" tabIndex={0} role="region" aria-label="Scroll all records">
            <table className="w-full caption-bottom text-sm">
              <TableHeader>
                <TableRow className="breakdown-table-header">
                  <TableHead scope="col">Final Girl</TableHead>
                  <TableHead scope="col" className="text-right">Plays</TableHead>
                  <TableHead scope="col" className="text-right">Wins</TableHead>
                  <TableHead scope="col" className="text-right">Win %</TableHead>
                  <TableHead scope="col" className="text-right hidden sm:table-cell">Saved</TableHead>
                  <TableHead scope="col" className="text-right hidden sm:table-cell">Killed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.byFinalGirl.map((fg) => (
                  <TableRow key={fg.name} className="breakdown-table-row">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {CHARACTER_IMAGES[fg.name] && (
                          <img src={CHARACTER_IMAGES[fg.name]} alt="" className="breakdown-avatar" loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} />
                        )}
                        <span className="breakdown-name" title={fg.name}>{fg.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{fg.plays}</TableCell>
                    <TableCell className="text-right text-neon-cyan">{fg.wins}</TableCell>
                    <TableCell className="text-right">
                      <RateCell rate={fg.winRate} />
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-neon-cyan">
                      {fg.totalSaved}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-blood-red">
                      {fg.totalKilled}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="killers" className="breakdown-content">
          <div className="breakdown-scroll" tabIndex={0} role="region" aria-label="Scroll all records">
            <table className="w-full caption-bottom text-sm">
              <TableHeader>
                <TableRow className="breakdown-table-header">
                  <TableHead scope="col">Killer</TableHead>
                  <TableHead scope="col" className="text-right">Faced</TableHead>
                  <TableHead scope="col" className="text-right">Wins</TableHead>
                  <TableHead scope="col" className="text-right">Win %</TableHead>
                  <TableHead scope="col" className="text-right hidden sm:table-cell">Avg Saved</TableHead>
                  <TableHead scope="col" className="text-right hidden sm:table-cell">Avg Killed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.byKiller.map((k) => (
                  <TableRow key={k.name} className="breakdown-table-row">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {CHARACTER_IMAGES[k.name] && (
                          <img src={CHARACTER_IMAGES[k.name]} alt="" className="breakdown-avatar" loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} />
                        )}
                        <span className="breakdown-name" title={k.name}>{k.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{k.plays}</TableCell>
                    <TableCell className="text-right text-neon-cyan">{k.wins}</TableCell>
                    <TableCell className="text-right">
                      <RateCell rate={k.winRate} />
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-neon-cyan">
                      {k.avgVictimsSaved?.toFixed(1) || '—'}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-blood-red">
                      {k.avgVictimsKilled?.toFixed(1) || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="breakdown-content">
          <div className="breakdown-scroll" tabIndex={0} role="region" aria-label="Scroll all records">
            <table className="w-full caption-bottom text-sm">
              <TableHeader>
                <TableRow className="breakdown-table-header">
                  <TableHead scope="col">Location</TableHead>
                  <TableHead scope="col" className="text-right">Plays</TableHead>
                  <TableHead scope="col" className="text-right">Wins</TableHead>
                  <TableHead scope="col" className="text-right">Win %</TableHead>
                  <TableHead scope="col" className="text-right hidden sm:table-cell">Saved</TableHead>
                  <TableHead scope="col" className="text-right hidden sm:table-cell">Killed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.byLocation.map((loc) => (
                  <TableRow key={loc.name} className="breakdown-table-row">
                    <TableCell className="font-medium !p-1">
                      <div className="relative h-9 min-w-[120px] sm:min-w-[170px] overflow-hidden rounded-sm">
                        {LOCATION_IMAGES[loc.name] && (
                          <img 
                            src={LOCATION_IMAGES[loc.name]} 
                            alt=""
                            loading="lazy"
                            onError={event => { event.currentTarget.style.display = 'none'; }}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                        <div className="relative h-full flex items-center px-3">
                          <span className="breakdown-name font-display tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                            {loc.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{loc.plays}</TableCell>
                    <TableCell className="text-right text-neon-cyan">{loc.wins}</TableCell>
                    <TableCell className="text-right">
                      <RateCell rate={loc.winRate} />
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-neon-cyan">
                      {loc.totalSaved}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-blood-red">
                      {loc.totalKilled}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
