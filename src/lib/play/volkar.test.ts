import { describe, expect, it } from "vitest";
import {
  FEATURE_FILMS,
  CHARACTER_IMAGES,
  CHARACTER_IMAGES_AI,
  LOCATION_IMAGES,
} from "@/types/gameData";
import {
  VOLKAR,
  VOLKAR_POWERS,
  VOLKAR_FINALES,
  VOLKAR_MINORS,
  VOLKAR_MOVEMENT,
  VOLKAR_TERRORS,
  validVolkarField,
  volkarOwnsLog,
} from "../../../supabase/functions/_shared/play/volkar";
import { deathFacts } from "../../../supabase/functions/_shared/play/death";
import {
  moduleContext,
  moduleState,
  moduleStoryBeats,
  killerMomentCards,
} from "./modules";
import {
  newPlayEvent,
  summarizePlay,
  validPlayLog,
  type PlayEvent,
} from "./events";
import { playStartingValues } from "./defaults";

const start = newPlayEvent({ kind: "start", round: 1, saved: 0, killed: 0 });
const hunt = (value: string) =>
  newPlayEvent({
    kind: "module",
    moduleData: { module: "volkar", changes: { hunt: value } },
  });
const reveal = (name?: string) =>
  newPlayEvent({
    kind: "moment",
    volkarCard: true,
    momentType: "finale",
    permanent: true,
    text: "Finale revealed",
    killerCard: name,
  });
const name = (e: PlayEvent, card: string) =>
  newPlayEvent({
    kind: "details",
    volkarCard: true,
    target: e.id,
    killerCard: card,
  });
const fields = (log: PlayEvent[]) =>
  moduleState(summarizePlay(log).entries, "volkar");
const cast = {
  killer: VOLKAR,
  location: "Camp Happy Trails",
  finalGirl: "Dakota",
};

describe("The Green Terror", () => {
  it("owns both final girls, a basic location and the photographed card counts", () => {
    const film = FEATURE_FILMS.find((f) => f.id === "s4-green-terror")!;
    expect(film).toMatchObject({
      killer: VOLKAR,
      location: "Pesadilla Verde",
      finalGirls: ["Dakota", "Alois"],
    });
    for (const who of [VOLKAR, ...film.finalGirls])
      expect(
        [CHARACTER_IMAGES[who], CHARACTER_IMAGES_AI[who]].every(Boolean),
      ).toBe(true);
    expect(LOCATION_IMAGES[film.location]).toBeTruthy();
    expect(VOLKAR_MOVEMENT).toHaveLength(22);
    expect(VOLKAR_MINORS).toHaveLength(3);
    expect(VOLKAR_TERRORS.reduce((n, c) => n + c.quantity, 0)).toBe(13);
    expect(killerMomentCards("The Volk’ar", "finale")).toEqual(VOLKAR_FINALES);
    expect(VOLKAR_POWERS).toHaveLength(4);
    expect(playStartingValues(VOLKAR, "Alois")).toEqual({
      finalGirlHealth: 5,
      killerHealth: 10,
      finalHorrorLevel: 4,
      bloodlust: 0,
    });
    expect(playStartingValues("Hans", "Dakota").finalGirlHealth).toBe(6);
  });
  it("links visibility and countdown to the original named reveal through edits and Undo", () => {
    const r = reveal("Self-Destruct"),
      seed = [start, hunt("concealed"), r];
    expect(fields(seed)).toMatchObject({ countdown: 3, hunt: "visible" });
    const clear = name(r, ""),
      progress = newPlayEvent({
        kind: "module",
        target: r.id,
        moduleData: { module: "volkar", changes: { countdown: 0 } },
      });
    expect(fields([...seed, clear])).toEqual({ hunt: "concealed" });
    expect(
      fields([
        ...seed,
        clear,
        newPlayEvent({ kind: "undo", target: clear.id }),
      ]),
    ).toMatchObject({ countdown: 3, hunt: "visible" });
    const log = [...seed, progress, hunt("concealed"), name(r, "Rampage")];
    expect(fields(log)).toEqual({ hunt: "concealed" });
    expect(fields([...log, name(r, "Self-Destruct")])).toEqual({
      hunt: "concealed",
      countdown: 0,
    });
    const late = reveal();
    expect(fields([start, late, name(late, "Self-Destruct")])).toEqual({});
    expect(fields([start, reveal("Rampage")])).toEqual({ hunt: "visible" });
    expect(fields([start, reveal("Guerilla Warfare")])).toEqual({});
  });
  it("preserves sparse data, limits fixed pools and separates observations from damage", () => {
    expect(fields([start])).toEqual({});
    expect(validVolkarField("shield", 100)).toBe(true);
    expect(validVolkarField("hunt", ["visible"])).toBe(false);
    expect(validVolkarField("collector", 4)).toBe(false);
    expect(validVolkarField("countdown", -1)).toBe(false);
    const hit = hunt("hit"),
      log = [start, hunt("concealed"), hit];
    expect(volkarOwnsLog("Hans", log)).toBe(false);
    expect(validPlayLog(log)).toBe(true);
    expect(summarizePlay(log)).toMatchObject({ killed: 0, saved: 0 });
    expect(summarizePlay(log).killerHealth).toBeUndefined();
    expect(
      fields([...log, newPlayEvent({ kind: "undo", target: hit.id })]).hunt,
    ).toBe("concealed");
  });
  it("freezes a death before later visibility changes or a late card name", () => {
    const finale = reveal(),
      death = newPlayEvent({ kind: "killed", quantity: 1, cause: "killer" });
    const earlier = [start, hunt("concealed"), finale, death];
    const later = [...earlier, hunt("ambush"), name(finale, "Rampage")];
    expect(deathFacts(cast, earlier, death.id)?.moduleContext).toMatchObject({
      volkar: { hunt: "concealed" },
    });
    expect(deathFacts(cast, later, death.id)).toEqual(
      deathFacts(cast, earlier, death.id),
    );
    expect(
      moduleContext(cast, summarizePlay(later).entries)?.volkar,
    ).toMatchObject({ hunt: "ambush", finale: "Rampage" });
    expect(moduleStoryBeats(cast, summarizePlay(later).entries)).toContain(
      "Ambushed",
    );
  });
});
