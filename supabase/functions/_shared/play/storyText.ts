/** Select complete facts; a tight budget must never manufacture half a rule. */
export function fitStoryFacts(facts: readonly string[], budget: number): string {
  const chosen: string[] = [];
  let used = 0;
  for (const raw of facts) {
    const fact = raw.trim();
    const cost = fact.length + (chosen.length ? 1 : 0);
    if (!fact || used + cost > budget) continue;
    chosen.push(fact);
    used += cost;
  }
  return chosen.join('\n');
}

/** Owner summaries contain complete sentences or newline-delimited status facts. */
export function fitStoryText(text: string, budget: number): string {
  if (text.length <= budget) return text;
  return fitStoryFacts(text.split(/\n|(?<!\bMr\.)(?<!\bMrs\.)(?<!\bDr\.)(?<!\bMs\.)(?<=[.!?])\s+/u), budget);
}

interface VictimObservation {
  kind: string;
  victim?: string;
  quantity?: number;
  moduleData?: { module: string; changes: Record<string, unknown> };
}

/** Narrative projection only. Never changes the roster, ledger or victim totals. */
export function storyVictimStatus(
  name: string, status: string, module: string, key: string,
  entries: readonly VictimObservation[],
): string {
  const normalize = (value: string) => value.trim().replace(/’/g, "'").replace(/\s+/g, ' ').toLowerCase();
  let death = -1, roster = -1;
  entries.forEach((e, index) => {
    if (e.kind === 'killed' && (e.quantity ?? 0) > 0 && e.victim && normalize(e.victim) === normalize(name)) death = index;
    if (e.moduleData?.module === module && Object.prototype.hasOwnProperty.call(e.moduleData.changes, key)) roster = index;
  });
  if (death < 0 || status === 'killed') return status;
  if (death > roster && ['on-board', 'in-play', 'active'].includes(status)) {
    return 'killed (explicit named death supersedes the earlier roster)';
  }
  return `conflicting observations: named death and ${status} roster; final fate unconfirmed`;
}
