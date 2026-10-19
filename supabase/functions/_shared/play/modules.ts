import {
  BUDDIES,
  BILLY_FINALES,
  BILLY_POWERS,
  BUDDYLAND_EVENTS,
  BUDDYLAND_ITEMS,
  BUDDYLAND_TERRORS,
  SPECIAL_VICTIMS,
} from "./buddyland.ts";

export type ModuleValue = string | number | boolean | null;
export interface ModuleObservation {
  module: "billy" | "buddyland";
  changes: Record<string, ModuleValue>;
}
type ObservedEvent = {
  kind: string;
  moduleData?: ModuleObservation;
  momentType?: string;
  killerCard?: string;
};

/** Only owner-verified catalogs. Other killers can still record an unnamed reveal. */
export function killerMomentCards(killer: string, type: string) {
  const cards =
    killer !== "Billy the Bear"
      ? []
      : type === "dark-power"
        ? [...BILLY_POWERS]
        : type === "finale"
          ? [...BILLY_FINALES]
          : [];
  return cards.sort((a, b) => a.name.localeCompare(b.name));
}
export interface ModuleSelection {
  killer: string;
  location: string;
}
export type ModuleState = Record<string, ModuleValue>;
const oneOf = (value: unknown, options: readonly unknown[]) =>
  value === null || options.includes(value);
const count = (value: unknown, max: number) =>
  value === null ||
  (typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= max);
const text = (value: unknown) =>
  value === null || (typeof value === "string" && value.length <= 240);
const member = (list: readonly { id: string }[], id: string) =>
  list.some((item) => item.id === id);
function validField(
  module: ModuleObservation["module"],
  key: string,
  value: unknown,
) {
  const [group, id, field] = key.split(".");
  if (key === "lastTerror")
    return (
      value === null ||
      BUDDYLAND_TERRORS.some(
        (c) =>
          c.name === value &&
          (module === "billy" ? "killer" in c : "location" in c),
      )
    );
  if (module === "billy") {
    if (key === "rosterComplete") return oneOf(value, [true, false]);
    if (key === "finale")
      return oneOf(
        value,
        BILLY_FINALES.map((c) => c.id),
      );
    if (key === "billyStatus") return oneOf(value, ["active", "defeated"]);
    if (/^bloodlust\.[1-6]$/.test(key)) return text(value);
    if (/^source\.[1-5]\.(status|room)$/.test(key))
      return field === "room"
        ? text(value)
        : oneOf(value, ["active", "inactive", "set-aside"]);
    if (
      group === "buddy" &&
      member(BUDDIES, id) &&
      key.split(".").length === 3
    ) {
      if (field === "health") return count(value, 99);
      if (field === "status")
        return oneOf(value, ["active", "defeated", "removed"]);
      if (field === "withBilly" || field === "waiting")
        return oneOf(value, [true, false]);
      if (field === "room") return text(value);
    }
    if (
      group === "power" &&
      member(BILLY_POWERS, id) &&
      key.split(".").length === 3
    ) {
      if (field === "active" || field === "revealed")
        return oneOf(value, [true, false]);
      const power = BILLY_POWERS.find((p) => p.id === id);
      if (field === "health" && power && "health" in power)
        return count(value, power.health);
    }
  } else {
    if (key === "collapseRoom") return text(value);
    if (
      group === "event" &&
      key.split(".").length === 2 &&
      member(BUDDYLAND_EVENTS, id)
    )
      return oneOf(value, ["active", "resolved"]);
    if (
      group === "victim" &&
      key.split(".").length === 2 &&
      member(SPECIAL_VICTIMS, id)
    )
      return oneOf(value, ["on-board", "saved", "killed", "away"]);
    if (
      group === "item" &&
      member(BUDDYLAND_ITEMS, id) &&
      key.split(".").length === 3
    ) {
      if (field === "status") return oneOf(value, ["carried", "discarded"]);
      if (field === "room") return text(value);
      const item = BUDDYLAND_ITEMS.find((i) => i.id === id);
      if (field === "uses" && item && "uses" in item)
        return count(value, item.uses);
    }
  }
  return false;
}
export function validModuleObservation(
  input: unknown,
): input is ModuleObservation {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const m = input as ModuleObservation;
  if (
    !["billy", "buddyland"].includes(m.module) ||
    !m.changes ||
    typeof m.changes !== "object" ||
    Array.isArray(m.changes)
  )
    return false;
  const entries = Object.entries(m.changes);
  return (
    entries.length > 0 &&
    entries.length <= 20 &&
    entries.every(([key, value]) => validField(m.module, key, value))
  );
}
/** Pass already reduced entries so undo/restore uses the same semantics everywhere. */
export function moduleState(
  entries: readonly ObservedEvent[],
  module: ModuleObservation["module"],
): ModuleState {
  const state: ModuleState = {};
  for (const e of entries) {
    // Moment details have already been reduced with undo/restore and corrections.
    // A remembered reveal is evidence of a reveal, not proof the power is still active.
    if (module === "billy" && e.kind === "moment" && e.killerCard) {
      if (e.momentType === "finale") {
        const finale = BILLY_FINALES.find((c) => c.name === e.killerCard);
        if (finale) state.finale = finale.id;
      } else if (e.momentType === "dark-power") {
        const power = BILLY_POWERS.find((c) => c.name === e.killerCard);
        if (power) state[`power.${power.id}.revealed`] = true;
      }
    }
    if (
      e.kind !== "module" ||
      e.moduleData?.module !== module ||
      !validModuleObservation(e.moduleData)
    )
      continue;
    for (const [key, value] of Object.entries(e.moduleData.changes)) {
      if (value === null) delete state[key];
      else state[key] = value;
    }
  }
  return state;
}
function fieldLabel(module: ModuleObservation["module"], key: string) {
  const [group, id, field] = key.split(".");
  if (group === "source")
    return `Power Source ${id}${field === "room" ? " location" : ""}`;
  if (group === "bloodlust") return `Revealed Bloodlust token ${id}`;
  if (group === "buddy")
    return `${BUDDIES.find((b) => b.id === id)?.name ?? id} ${field === "withBilly" ? "shares Billy’s space" : field === "waiting" ? "awaits activation" : field}`;
  if (group === "power")
    return `${BILLY_POWERS.find((c) => c.id === id)?.name ?? id} ${field === "health" ? "Health" : ""}`.trim();
  if (group === "event")
    return BUDDYLAND_EVENTS.find((c) => c.id === id)?.name ?? id;
  if (group === "item")
    return `${BUDDYLAND_ITEMS.find((c) => c.id === id)?.name ?? id} ${field === "uses" ? "uses remaining" : field}`;
  if (group === "victim")
    return SPECIAL_VICTIMS.find((v) => v.id === id)?.name ?? id;
  return key === "rosterComplete"
    ? "Buddy roster complete"
    : key === "lastTerror"
      ? "Terror drawn"
      : key === "finale"
        ? "Revealed Finale"
        : key === "billyStatus"
          ? "Billy"
          : "Broken token location";
}
function valueLabel(key: string, value: ModuleValue) {
  if (value === null) return "unrecorded";
  if (key === "finale")
    return BILLY_FINALES.find((c) => c.id === value)?.name ?? String(value);
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value);
}
export function describeModule(observation: ModuleObservation) {
  return Object.entries(observation.changes)
    .map(
      ([key, value]) =>
        `${fieldLabel(observation.module, key)}: ${valueLabel(key, value)}`,
    )
    .join("; ");
}
export function moduleContext(
  selection: ModuleSelection,
  entries: readonly ObservedEvent[],
) {
  const context: Record<string, ModuleState> = {};
  for (const module of ["billy", "buddyland"] as const) {
    if (
      module === "billy"
        ? selection.killer !== "Billy the Bear"
        : selection.location !== "Buddyland"
    )
      continue;
    const state = moduleState(entries, module);
    if (Object.keys(state).length) context[module] = state;
  }
  return Object.keys(context).length ? context : undefined;
}
export function moduleStoryBeats(
  selection: ModuleSelection,
  entries: readonly ObservedEvent[],
) {
  const context = moduleContext(selection, entries);
  if (!context) return "";
  const lines: string[] = [];
  const billy = context.billy;
  if (billy) {
    if (billy.finale)
      lines.push(
        `Revealed Finale: ${BILLY_FINALES.find((f) => f.id === billy.finale)?.name}`,
      );
    if (billy.billyStatus) lines.push(`Billy: ${billy.billyStatus}`);
    if (billy.rosterComplete === true)
      lines.push("Buddy roster confirmed complete.");
    if (billy.lastTerror)
      lines.push(`Last recorded Billy Terror: ${billy.lastTerror}`);
    for (const b of BUDDIES) {
      const prefix = `buddy.${b.id}`;
      if (billy[`${prefix}.status`] !== undefined)
        lines.push(
          `${b.name}: ${billy[`${prefix}.status`]}${billy[`${prefix}.health`] !== undefined ? `, Health ${billy[`${prefix}.health`]}` : ""}`,
        );
    }
    const sources = [1, 2, 3, 4, 5].filter(
      (i) => billy[`source.${i}.status`] !== undefined,
    );
    if (sources.length)
      lines.push(
        `Power Sources (${sources.length}/5 recorded): ${sources.map((i) => `${i} ${billy[`source.${i}.status`]}`).join(", ")}`,
      );
    for (const p of BILLY_POWERS)
      if (billy[`power.${p.id}.active`] !== undefined)
        lines.push(
          `${p.name}: ${billy[`power.${p.id}.active`] ? "active" : "removed"}`,
        );
      else if (billy[`power.${p.id}.revealed`] === true)
        lines.push(
          `${p.name}: revealed earlier; current active status untracked`,
        );
    for (const i of [1, 2, 3, 4, 5, 6])
      if (billy[`bloodlust.${i}`])
        lines.push(
          `Revealed token ${i}: ${String(billy[`bloodlust.${i}`]).slice(0, 100)}`,
        );
  }
  const venue = context.buddyland;
  if (venue) {
    if (venue.lastTerror)
      lines.push(`Last recorded Location Terror: ${venue.lastTerror}`);
    for (const v of SPECIAL_VICTIMS)
      if (venue[`victim.${v.id}`])
        lines.push(`${v.name}: ${venue[`victim.${v.id}`]}`);
    if (venue.collapseRoom) lines.push(`Broken token: ${venue.collapseRoom}`);
    for (const e of BUDDYLAND_EVENTS)
      if (venue[`event.${e.id}`])
        lines.push(`${e.name}: ${venue[`event.${e.id}`]}`);
    for (const i of BUDDYLAND_ITEMS)
      if (venue[`item.${i.id}.status`])
        lines.push(
          `${i.name}: ${venue[`item.${i.id}.status`]}${venue[`item.${i.id}.uses`] !== undefined ? `, ${venue[`item.${i.id}.uses`]} uses` : ""}`,
        );
  }
  return lines.join("\n");
}
export function buddylandReferences(
  selection: ModuleSelection,
  context?: Record<string, ModuleState>,
  attacker?: string,
) {
  const refs: { name: string; effect: string }[] = [];
  if (selection.killer === "Billy the Bear") {
    const state = context?.billy ?? {};
    for (const p of BILLY_POWERS)
      if (state[`power.${p.id}.active`] === true)
        refs.push({ name: p.name, effect: p.effect });
      else if (state[`power.${p.id}.revealed`] === true)
        refs.push({
          name: p.name,
          effect: `${p.effect} The player recorded its reveal, not whether it remains active. Do not assume it caused this death.`,
        });
    const finale = BILLY_FINALES.find((f) => f.id === state.finale);
    if (finale) refs.push({ name: finale.name, effect: finale.effect });
    const buddy = BUDDIES.find(
      (b) => b.name.toLowerCase() === attacker?.toLowerCase(),
    );
    if (buddy)
      refs.push({
        name: buddy.name,
        effect: `Animatronic Buddy, Attack ${buddy.attack}, Movement ${buddy.movement}, Initiative ${buddy.initiative}. ${buddy.ability}`,
      });
  }
  if (selection.location === "Buddyland") {
    for (const event of BUDDYLAND_EVENTS)
      if (context?.buddyland?.[`event.${event.id}`] === "active")
        refs.push({ name: event.name, effect: event.effect });
  }
  return refs;
}
