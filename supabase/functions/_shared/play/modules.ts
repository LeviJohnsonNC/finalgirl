import {
  CARNIVAL_EVENTS,
  CARNIVAL_TRAPS,
  CARNIVAL_ITEMS,
  CARNIVAL_ITEM_TRAPS,
  CARNIVAL_PEOPLE,
  validCarnivalField,
  carnivalStartingObservations,
  carnivalStoryFacts,
} from "./carnival.ts";
import {
  GEPPETTO_POWERS,
  GEPPETTO_FINALES,
  GEPPETTO_MINOR_POWERS,
  GEPPETTO_PUPPETS,
  validGeppettoField,
  initialGeppettoPuppets,
  geppettoPuppetCounts,
} from "./geppetto.ts";
import {
  BUDDIES,
  BILLY_FINALES,
  BILLY_POWERS,
  BUDDYLAND_EVENTS,
  BUDDYLAND_ITEMS,
  BUDDYLAND_TERRORS,
  SPECIAL_VICTIMS,
} from "./buddyland.ts";
import {
  CAMP_EVENTS,
  CAMP_ONGOING_EVENTS,
  CAMP_ITEMS,
  CAMP_TERRORS,
  CAMP_TUNNEL_ROOMS,
  CAMP_VICTIMS,
  HANS_FINALES,
  HANS_MINOR_POWERS,
  HANS_POWERS,
} from "./camp.ts";

export type ModuleValue = string | number | boolean | null;
export interface ModuleObservation {
  module: "billy" | "buddyland" | "hans" | "camp" | "geppetto" | "carnival";
  changes: Record<string, ModuleValue>;
}
type ObservedEvent = {
  kind: string;
  moduleData?: ModuleObservation;
  momentType?: string;
  killerCard?: string;
  detail?: string;
};

/** Only owner-verified catalogs. Other killers can still record an unnamed reveal. */
export function killerMomentCards(killer: string, type: string) {
  if (killer === "Geppetto")
    return [
      ...(type === "dark-power"
        ? GEPPETTO_POWERS
        : type === "finale"
          ? GEPPETTO_FINALES
          : []),
    ].sort((a, b) => a.name.localeCompare(b.name));
  if (killer === "Hans")
    return (
      type === "dark-power"
        ? [...HANS_POWERS]
        : type === "finale"
          ? [...HANS_FINALES]
          : []
    ).sort((a, b) => a.name.localeCompare(b.name));
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
/** Verified starting observations only. Board choices and immediate effects stay manual. */
export function startingEventObservations(selection: {
  location: string;
  startingEvent?: string | null;
}): ModuleObservation[] {
  const { location, startingEvent } = selection;
  if (!startingEvent) return [];
  if (location === "Camp Happy Trails") {
    const victim = CAMP_VICTIMS.find(
      (victim) => victim.event === startingEvent,
    );
    if (victim)
      return [
        { module: "camp", changes: { [`victim.${victim.id}`]: "in-play" } },
      ];
    const event = CAMP_ONGOING_EVENTS.find(
      (event) => event.name === startingEvent,
    );
    if (event)
      return [{ module: "camp", changes: { [`event.${event.id}`]: "active" } }];
  }
  if (location === "Buddyland") {
    const victim = SPECIAL_VICTIMS.find(
      (victim) => victim.event === startingEvent,
    );
    if (victim)
      return [
        {
          module: "buddyland",
          changes: { [`victim.${victim.id}`]: "on-board" },
        },
      ];
  }
  return [];
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
  if (module === "carnival") return validCarnivalField(key, value);
  if (module === "geppetto") return validGeppettoField(key, value);
  const [group, id, field] = key.split(".");
  if (module === "hans") {
    if (key === "secondPower")
      return oneOf(
        value,
        HANS_POWERS.map((c) => c.name),
      );
    return (
      /^minor\.[a-z-]+\.health$/.test(key) &&
      member(HANS_MINOR_POWERS, id) &&
      count(value, 2)
    );
  }
  if (module === "camp") {
    if (/^tunnel\.(a|b)$/.test(key)) return oneOf(value, CAMP_TUNNEL_ROOMS);
    if (
      group === "victim" &&
      key.split(".").length === 2 &&
      member(CAMP_VICTIMS, id)
    )
      return oneOf(value, ["in-play", "saved", "killed", "untracked"]);
    if (
      group === "event" &&
      key.split(".").length === 2 &&
      member(CAMP_EVENTS, id)
    )
      return oneOf(value, ["active", "resolved"]);
    return false;
  }
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
    if (key === "powerSourcesReady") return value === true;
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
    !["billy", "buddyland", "hans", "camp", "geppetto", "carnival"].includes(
      m.module,
    ) ||
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
    if (module === "geppetto" && e.kind === "moment") {
      if (e.momentType === "finale") {
        state.finaleRevealed = true;
        const card = GEPPETTO_FINALES.find((c) => c.name === e.killerCard);
        if (card) state.finale = card.id;
      }
      if (e.momentType === "dark-power") {
        state.powerRevealed = true;
        const card = GEPPETTO_POWERS.find((c) => c.name === e.killerCard);
        if (card) state.power = card.id;
      }
    }
    if (module === "hans" && e.kind === "moment" && e.killerCard) {
      if (
        e.momentType === "dark-power" &&
        HANS_POWERS.some((c) => c.name === e.killerCard)
      )
        state.power = e.killerCard;
      if (
        e.momentType === "finale" &&
        HANS_FINALES.some((c) => c.name === e.killerCard)
      )
        state.finale = e.killerCard;
    }
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
  if (module === "carnival") {
    const [group, id, field] = key.split(".");
    if (group === "trap")
      return `${CARNIVAL_TRAPS.find((t) => t.id === id)?.name ?? id}${field === "space" ? " space" : ""}`;
    if (group === "event")
      return CARNIVAL_EVENTS.find((e) => e.id === id)?.name ?? key;
    if (group === "person")
      return CARNIVAL_PEOPLE.find((p) => p.id === id)?.name ?? key;
    if (group === "condition")
      return `${CARNIVAL_ITEM_TRAPS.find((t) => t.id === id)?.name ?? id} attached`;
    return (
      (
        {
          werewolf: "Werewolf",
          zappo: "Zappo",
          cart: "Golf Cart",
          searchPenalty: "Lasting Search penalty",
          lastTerrorTrap: "Terror Trap card",
          terrorTrapOutcome: "Terror Trap outcome",
          lastEncounter: "Item Trap encountered",
          encounterOutcome: "Encounter outcome",
        } as Record<string, string>
      )[key] ?? key
    );
  }
  if (module === "geppetto") {
    const [, id, field] = key.split(".");
    if (key.startsWith("minor."))
      return `${GEPPETTO_MINOR_POWERS.find((p) => p.id === id)?.name ?? id} Health`;
    return `Puppet ${id}${field === "protectionUsed" ? " first-hit protection used" : ""}`;
  }
  if (module === "hans")
    return key === "secondPower"
      ? "Second Dark Power revealed"
      : `${HANS_MINOR_POWERS.find((c) => key === `minor.${c.id}.health`)?.name ?? key} Health`;
  if (module === "camp") {
    const [group, id] = key.split(".");
    return group === "victim"
      ? (CAMP_VICTIMS.find((c) => c.id === id)?.name ?? key)
      : group === "event"
        ? (CAMP_EVENTS.find((c) => c.id === id)?.name ?? key)
        : `Secret Tunnel endpoint ${id.toUpperCase()}`;
  }
  if (key === "powerSourcesReady") return "Power sources initialized";
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
  if (key === "lastTerrorTrap")
    return CARNIVAL_TRAPS.find((t) => t.id === value)?.name ?? String(value);
  if (key === "terrorTrapOutcome" || key === "encounterOutcome")
    return (
      (
        {
          "canceled-footage": "canceled with Found Footage",
          "avoided-zappo": "avoided using Zappo",
          resolved: "effects resolved",
          placed: "token placed",
        } as Record<string, string>
      )[String(value)] ?? String(value)
    );
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
  for (const module of [
    "billy",
    "buddyland",
    "hans",
    "camp",
    "geppetto",
    "carnival",
  ] as const) {
    const applies =
      module === "carnival"
        ? selection.location === "Carnival of Blood"
        : module === "geppetto"
          ? selection.killer === "Geppetto"
          : module === "billy"
            ? selection.killer === "Billy the Bear"
            : module === "hans"
              ? selection.killer === "Hans"
              : module === "camp"
                ? selection.location === "Camp Happy Trails"
                : selection.location === "Buddyland";
    if (!applies) continue;
    const state = moduleState(entries, module);
    // A UI initialization marker is not a game fact or part of a death fingerprint.
    delete state.powerSourcesReady;
    if (
      module === "hans" &&
      (state.finale !== "Dark, Darker, Darkest" ||
        state.secondPower === state.power)
    )
      delete state.secondPower;
    if (module === "camp" && state["event.secret-tunnel"] !== "active") {
      delete state["tunnel.a"];
      delete state["tunnel.b"];
    }
    if (module === "camp" && state["tunnel.a"] === state["tunnel.b"])
      delete state["tunnel.b"];
    if (module === "carnival")
      for (const trap of CARNIVAL_TRAPS)
        if (state[`trap.${trap.id}.status`] !== "placed")
          delete state[`trap.${trap.id}.space`];
    if (Object.keys(state).length) context[module] = state;
  }
  return Object.keys(context).length ? context : undefined;
}
export function moduleStoryBeats(
  selection: ModuleSelection,
  entries: readonly ObservedEvent[],
): string {
  const context = moduleContext(selection, entries);
  if (!context) return "";
  // Preserve the established output for every other location. Each owner gets
  // room inside the existing 900-character module budget for Carnival mixes.
  if (context.carnival) {
    const killer = moduleStoryBeats({ ...selection, location: "" }, entries);
    const carnival = carnivalStoryFacts(context.carnival).join(" ");
    return [
      carnival && `Carnival: ${carnival.slice(0, killer ? 535 : 880)}`,
      killer && `Killer: ${killer.slice(0, 340)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }
  const lines: string[] = [];
  const geppetto = context.geppetto;
  if (geppetto) {
    const count = geppettoPuppetCounts(geppetto);
    if (geppetto.finaleRevealed)
      lines.push(
        `Geppetto Finale revealed: ${GEPPETTO_FINALES.find((c) => c.id === geppetto.finale)?.name ?? "card not specified"}.`,
      );
    if (geppetto.powerRevealed)
      lines.push(
        `Geppetto Dark Power revealed: ${GEPPETTO_POWERS.find((c) => c.id === geppetto.power)?.name ?? "card not specified"}.`,
      );
    lines.push(
      count.recorded
        ? `Puppets: ${count.onBoard} on board, ${count.ready} Ready, ${count.exhausted} Exhausted. Exhausted is reusable, not permanent death; no victim deaths inferred.`
        : "Puppet tray incompletely recorded.",
    );
    for (const p of GEPPETTO_MINOR_POWERS)
      if (typeof geppetto[`minor.${p.id}.health`] === "number")
        lines.push(
          `${p.name}: ${geppetto[`minor.${p.id}.health`]}/2 Health${geppetto[`minor.${p.id}.health`] === 0 ? ", removed" : ""}.`,
        );
  }
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
  const hans = context.hans;
  if (hans) {
    if (hans.power) lines.push(`Hans Dark Power revealed: ${hans.power}.`);
    if (hans.finale) lines.push(`Hans Finale revealed: ${hans.finale}.`);
    if (hans.secondPower)
      lines.push(`Second Dark Power revealed: ${hans.secondPower}.`);
    for (const p of HANS_MINOR_POWERS)
      if (hans[`minor.${p.id}.health`] !== undefined)
        lines.push(
          `${p.name}: ${hans[`minor.${p.id}.health`]} Health remaining${hans[`minor.${p.id}.health`] === 0 ? ", removed" : ""}.`,
        );
  }
  const camp = context.camp;
  if (camp) {
    for (const v of CAMP_VICTIMS)
      if (camp[`victim.${v.id}`])
        lines.push(`${v.name}: ${camp[`victim.${v.id}`]}.`);
    for (const e of CAMP_EVENTS)
      if (camp[`event.${e.id}`])
        lines.push(`Camp Event ${e.name}: ${camp[`event.${e.id}`]}.`);
    if (camp["tunnel.a"] || camp["tunnel.b"])
      lines.push(
        `Secret Tunnel endpoints recorded: ${[camp["tunnel.a"], camp["tunnel.b"]].filter(Boolean).join(" / ")}.`,
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

/** Read only the applicable module's recorded observations. Never trigger effects. */
export function moduleReferences(
  selection: ModuleSelection,
  context?: Record<string, ModuleState>,
  attacker?: string,
  victim?: string,
  mechanism?: string,
) {
  const refs = buddylandReferences(selection, context, attacker);
  if (selection.location === "Carnival of Blood") {
    const state = context?.carnival ?? {};
    for (const e of CARNIVAL_EVENTS)
      if (state[`event.${e.id}`] === "active")
        refs.push({
          name: e.name,
          effect: `${e.effect} Reference only; infer no extra casualties or stat changes.`,
        });
    for (const t of CARNIVAL_TRAPS)
      if (state[`trap.${t.id}.status`] === "placed" || mechanism === t.name)
        refs.push({
          name: t.name,
          effect: `${t.effect} Persistent board token: kills Victims there or entering; all Enemies ignore it. A token's presence alone does not establish the cause of this death.`,
        });
    for (const t of CARNIVAL_ITEM_TRAPS)
      if (state[`condition.${t.id}`] === "active" || mechanism === t.name)
        refs.push({ name: t.name, effect: t.effect });
    if (state.searchPenalty === true)
      refs.push({
        name: "So Much Junk lasting penalty",
        effect:
          "Search rolls use one fewer die, minimum one, for the rest of the game. Zappo may have been regained; this penalty remains recorded.",
      });
    for (const p of CARNIVAL_PEOPLE)
      if (state[`person.${p.id}`] || victim === p.name)
        refs.push({
          name: p.name,
          effect: `Recorded status: ${state[`person.${p.id}`] ?? "unrecorded"}. Only a matching death-specific victim field identifies this scene’s victim.`,
        });
    if (state.werewolf === "in-play")
      refs.push({
        name: "Werewolf",
        effect:
          "Full Moon’s transformed performer cannot be targeted, saved or killed; its presence does not establish that it caused this death.",
      });
    if (state.zappo)
      refs.push({
        name: "Zappo",
        effect: `Small carnival monkey, current state ${state.zappo}; fleeing or being discarded is not a Victim death.`,
      });
  }
  if (selection.killer === "Geppetto") {
    const state = context?.geppetto ?? {};
    if (
      attacker === "Puppet" ||
      GEPPETTO_PUPPETS.some((p) => p.name === attacker)
    )
      refs.push({
        name: attacker!,
        effect:
          "Geppetto’s humanlike marionette Minion, normally one Health and one damage, with movement matching Geppetto. Two-space tether applies unless the recorded Finale changes it. A selected attacker establishes this scene’s attacker only. Never substitute Buddyland animatronics.",
      });
    for (const c of [...GEPPETTO_POWERS, ...GEPPETTO_FINALES])
      if (state.power === c.id || state.finale === c.id)
        refs.push({
          name: c.name,
          effect: `${c.effect} Reference only: a reveal does not establish that this effect caused the recorded death.`,
        });
    for (const p of GEPPETTO_MINOR_POWERS) {
      const health = state[`minor.${p.id}.health`];
      if (typeof health === "number")
        refs.push({
          name: p.name,
          effect:
            health === 0
              ? "Recorded as removed, no longer active."
              : `${p.effect} ${health}/2 separate Health remaining. Do not infer extra damage or deaths.`,
        });
    }
  }
  if (selection.killer === "Hans" && context?.hans) {
    const state = context.hans;
    for (const p of HANS_POWERS)
      if (state.power === p.name || state.secondPower === p.name)
        refs.push({
          name: p.name,
          effect: `${p.effect} Its reveal was recorded; do not assume it caused this death.`,
        });
    const finale = HANS_FINALES.find((c) => c.name === state.finale);
    if (finale) refs.push({ name: finale.name, effect: finale.effect });
    for (const p of HANS_MINOR_POWERS) {
      const health = state[`minor.${p.id}.health`];
      if (typeof health === "number")
        refs.push({
          name: p.name,
          effect:
            health === 0
              ? "Recorded as removed, no longer active."
              : `${p.effect} ${health} Health remaining. Do not add this Health to Hans’s general Health.`,
        });
    }
  }
  if (selection.location === "Camp Happy Trails") {
    const state = context?.camp ?? {};
    for (const e of CAMP_EVENTS)
      if (state[`event.${e.id}`] === "active")
        refs.push({
          name: e.name,
          effect: `${e.effect} This recorded ongoing effect does not establish an additional death or rescue.`,
        });
    for (const v of CAMP_VICTIMS)
      if (state[`victim.${v.id}`] || v.name === victim) {
        const event = CAMP_EVENTS.find((e) => e.name === v.event)!;
        refs.push({
          name: v.name,
          effect: `${v.name === victim ? "Explicitly selected as this scene’s victim." : `Recorded status: ${state[`victim.${v.id}`]}.`} ${event.effect} Do not infer this person is the victim of this scene without a matching death-specific victim field. No additional Health, Horror, Time or Bloodlust change is established.`,
        });
      }
    const hazard =
      CAMP_EVENTS.find((c) => c.name === mechanism) ??
      CAMP_TERRORS.find((c) => c.name === "Fire!" && mechanism === "Fire");
    if (hazard && !refs.some((r) => r.name === hazard.name))
      refs.push({
        name: hazard.name,
        effect: `${hazard.effect} The explicitly recorded mechanism applies to this death only, not proof of an ongoing hazard or extra casualties.`,
      });
  }
  return refs;
}

/** A remembered find establishes possession at that moment, never later use. */
export function moduleItemBeats(
  selection: ModuleSelection,
  entries: readonly ObservedEvent[],
) {
  const catalog =
    selection.location === "Camp Happy Trails"
      ? CAMP_ITEMS
      : selection.location === "Carnival of Blood"
        ? CARNIVAL_ITEMS
        : [];
  return entries
    .filter((e) => e.kind === "moment" && e.momentType === "item" && e.detail)
    .slice(-2)
    .flatMap((e) => {
      const item = catalog.find(
        (c) =>
          c.name.toLowerCase().replace(/’/g, "'") ===
          e.detail!.trim().toLowerCase().replace(/’/g, "'"),
      );
      return item
        ? [
            `Found ${item.name}: ${item.effect} Finding does not establish use, charges remaining or current inventory.`,
          ]
        : [];
    })
    .join("\n");
}

/** Called only for a brand-new log, persisted with its first observation. */
export function initialModuleObservations(
  selection: {
    killer: string;
    location: string;
    startingEvent?: string | null;
  },
  initializeKiller: boolean,
  initializeCarnival = false,
  initializeBilly = false,
): ModuleObservation[] {
  return [
    ...(initializeBilly && selection.killer === "Billy the Bear" ? [{ module:"billy" as const, changes:{
      powerSourcesReady:true, ...Object.fromEntries([1,2,3,4,5].map(id => [`source.${id}.status`,id === 5 ? "set-aside" : "active"])),
    } }] : []),
    ...(initializeKiller && selection.killer === "Geppetto"
      ? [{ module: "geppetto" as const, changes: initialGeppettoPuppets() }]
      : []),
    ...(initializeCarnival && selection.location === "Carnival of Blood"
      ? [
          {
            module: "carnival" as const,
            changes: carnivalStartingObservations(selection.startingEvent),
          },
        ]
      : []),
    ...startingEventObservations(selection),
  ];
}
