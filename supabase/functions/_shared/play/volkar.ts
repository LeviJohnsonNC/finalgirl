export const VOLKAR = "The Volk'ar";
export const VOLKAR_SOURCE =
  "The Green Terror, standard killer board, booklet and cards.";
export const isVolkar = (name: string) =>
  String(name).replace(/’/g, "'").toLowerCase() === VOLKAR.toLowerCase();
export function volkarAttack(bloodlust: number) {
  if (bloodlust >= 10) return 4;
  if (bloodlust >= 8) return 3;
  return bloodlust >= 4 ? 2 : 1;
}
export const VOLKAR_WIN =
  "Killed the Volk’ar and was on an Exit before the final Countdown token was removed";
export const VOLKAR_POWERS = [
  {
    id: "blades",
    name: "Blades in the Dark",
    effect:
      "When her Path resolves, kill one Victim in each space adjacent to her final space.",
  },
  {
    id: "chameleon",
    name: "Chameleon of Death",
    effect:
      "When attacked while Concealed, if she receives no damage, you take damage equal to her Attack Value. This includes an attack that produced zero damage.",
  },
  {
    id: "stress",
    name: "Stress of the Unknown",
    effect:
      "Lose two Time the first time a crossed-eye icon resolves each turn.",
  },
  {
    id: "merciless",
    name: "Merciless Ambush",
    epic: true,
    effect:
      "When her Path resolves, apply the Ambush Penalty on each Movement card.",
  },
];
export const VOLKAR_MINORS = [
  {
    id: "shield",
    name: "Energy Shield",
    health: 1,
    effect:
      "Start with one Health. The first crossed-eye icon resolved each turn adds one Health. Only this effect can add Health. Discard at zero.",
  },
  {
    id: "collector",
    name: "Collector",
    health: 3,
    effect:
      "Before resolving each Path, put the top Item of the closest search space under Collector. When discarded, make the collected Items a new deck and place its Collection token in her current space. That space can now be searched.",
  },
  {
    id: "evasion",
    name: "Evasion",
    health: 2,
    effect: "Resolve each crossed-eye icon a second time.",
  },
];
export const VOLKAR_FINALES = [
  {
    id: "rampage",
    name: "Rampage",
    effect:
      "On reveal, resolve her Path. Target the closest Victim or Final Girl, move three spaces and attack twice.",
  },
  {
    id: "guerilla",
    name: "Guerilla Warfare",
    effect:
      "Resolve her Path, target the Final Girl, move three spaces, attack once, then draw a facedown Movement card.",
  },
  {
    id: "self-destruct",
    name: "Self-Destruct",
    effect:
      "On reveal, resolve her Path and place three Countdown tokens. Her action removes one token, targets the nearest Victim or Final Girl, then attacks once. Kill her and be on an Exit before the last token is removed to win.",
  },
  {
    id: "regenerative",
    name: "Regenerative Cloaking",
    epic: true,
    effect:
      "Concealed: add a face-up Movement card and recover two Health. Visible: target the closest Final Girl or Victim, move three spaces, attack once and draw two facedown Movement cards.",
  },
];
export const VOLKAR_TERRORS = [
  {
    name: "Psy Ops",
    quantity: 1,
    effect:
      "If Visible, discard and redraw. Otherwise discard all Track cards in hand, add a face-up Movement card and raise Horror by one.",
  },
  {
    name: "Bait ’n Switch",
    quantity: 1,
    effect:
      "Turn the Origin facedown, shuffle all other Path cards and return them facedown. Raise Horror by two.",
  },
  {
    name: "Savage Upgrade",
    quantity: 1,
    effect:
      "Reveal set-aside Terror cards until finding a Minor Dark Power and put it in play. Add a facedown card. If no Minor was found, raise Bloodlust by two.",
  },
  {
    name: "Twisting Shadows",
    quantity: 1,
    effect: "Add a facedown Movement card, then panic yourself.",
  },
  {
    name: "Shifting Shadows",
    quantity: 1,
    effect: "Add a facedown Movement card, then panic all lone Victims.",
  },
  {
    name: "Stealth Blitz",
    quantity: 1,
    effect: "Add one facedown card followed by two face-up cards.",
  },
  {
    name: "Out of the Shadows",
    quantity: 4,
    effect: "If Visible, discard and redraw. Otherwise resolve her Path.",
  },
  {
    name: "Sneak",
    quantity: 3,
    effect: "Raise Horror by one, then add a facedown Movement card.",
  },
];
// Reading order of all 22 physical cards in IMG_9664. Numbered directions use the board’s panic numbers.
export const VOLKAR_MOVEMENT = [
  ["Panic 6", "0", "+1 Horror"],
  ["Panic 6", "1", "+1 Bloodlust"],
  ["Stay and recover 1 Health", "0", "Discard a random Action"],
  ["Stay and recover 1 Health", "0", "+2 Horror"],
  ["Panic 5", "1", "Discard a random Action"],
  ["1 toward Named · alphabetical", "1", "+1 Horror"],
  ["3 toward Exit · lowest panic number", "0", "+1 Bloodlust"],
  ["2 toward Named · reverse alphabetical", "0", "+1 Bloodlust"],
  ["1 toward Search · reverse alphabetical", "0", "Lose 2 Time"],
  ["2 toward Search · alphabetical", "1", "+2 Horror"],
  ["3 toward Search · reverse alphabetical", "1", "+2 Bloodlust"],
  ["1 toward Exit · lowest panic number", "1", "Lose 3 Time"],
  ["2 toward Exit · highest panic number", "2", "+1 Horror"],
  ["Panic 1", "0", "Lose 2 Time"],
  ["Panic 5", "0", "Lose 3 Time"],
  ["Panic 1", "1", "+2 Horror"],
  ["Panic 2", "0", "+2 Bloodlust"],
  ["Panic 2", "1", "Lose 3 Time"],
  ["Panic 3", "0", "+1 Horror"],
  ["Panic 3", "1", "+1 Bloodlust"],
  ["Panic 4", "0", "Discard a random Action"],
  ["Panic 4", "1", "+2 Horror"],
];
export function validVolkarField(key: string, value: unknown) {
  if (key === "hunt")
    return (
      value === null ||
      (typeof value === "string" &&
        ["concealed", "visible", "hit", "ambush"].includes(value))
    );
  const minor = VOLKAR_MINORS.find((card) => card.id === key);
  if (!minor && key !== "countdown") return false;
  return (
    value === null ||
    (typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value >= 0 &&
      (minor?.id === "shield" || value <= (minor?.health ?? 3)))
  );
}
export function huntLabel(hunt: unknown) {
  if (hunt === "concealed") return "Concealed";
  if (hunt === "hit") return "Visible · Hit the Volk’ar";
  if (hunt === "ambush") return "Visible · Ambushed";
  return hunt === "visible" ? "Visible" : "Visibility unrecorded";
}

export function volkarOwnsLog(
  killer: string,
  events: readonly {
    moduleData?: { module: string };
    volkarCard?: true;
    ultimateFace?: string;
  }[],
  finalGirl?: string,
) {
  return events.every(
    (event) =>
      Boolean(event) &&
      (!event.ultimateFace || event.ultimateFace === finalGirl) &&
      ((!event.volkarCard && event.moduleData?.module !== "volkar") ||
        isVolkar(killer)),
  );
}
