/** Facts constrain the fiction; they are not a statistical recap to read aloud. */
export const NARRATIVE_QUANTITIES = `Treat victim totals, rounds, health and other game counters as factual constraints, not a checklist to recite. Usually convey their human consequences without stating exact totals. Use an exact number only when a character could plausibly know it and it matters to the immediate action, decision or emotional beat. Avoid repeated headcounts, health-point readings and statistical summaries, including totals spelled out as words. Never invent, round or contradict a recorded quantity; leaving a number unstated does not change what happened.`;

/** Each direction changes what reveals the trouble, without adding a game event. */
export const OPENING_DIRECTIONS = [
  "Begin mid-exchange. Something said or left unanswered makes her reassess the immediate situation. Let the exchange lead to the choice.",
  "Let her hear the trouble before she can see its source. Use what she can distinguish from that position to bring the danger close.",
  "Give her an ordinary task already in progress. Something she knows how to do suddenly feels wrong; follow what her hands discover.",
  "Start with a small choice she makes for a personal reason. Let the cost of that choice bring the threat into focus while the board stays at setup.",
  "Let an expected response fail to come. Build the scene around what she does with that silence or stillness before its meaning is certain.",
] as const;

export function randomOpeningTake() {
  return Math.floor(Math.random() * OPENING_DIRECTIONS.length);
}
