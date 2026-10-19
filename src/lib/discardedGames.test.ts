import { beforeEach, describe, expect, it } from "vitest";
import { isGameDiscarded, purgeLocalGame } from "./discardedGames";
import {
  narrationKey,
  putNarrationClip,
  getNarrationClip,
  removeGameNarration,
} from "./play/narrationCache";
beforeEach(() => localStorage.clear());
describe("discarded game isolation", () => {
  it("purges one game and its queued writes while preserving other games and account data", () => {
    const owner = "discard-owner";
    const write = (key: string, value: unknown) =>
      localStorage.setItem(key, JSON.stringify(value));
    write(`final-girl-active-game-v1:${owner}`, { id: "target" });
    write(`final-girl-history-v3:${owner}`, [
      { id: "target" },
      { id: "other" },
    ]);
    write(`final-girl-history-outbox-v1:${owner}`, [
      { id: "one", value: { kind: "record", game: { id: "target" } } },
      { id: "two", value: { kind: "update", id: "target" } },
      { id: "three", value: { kind: "update", id: "other" } },
    ]);
    write(`final-girl-play-outbox-v1:${owner}`, [
      { value: { id: "target" } },
      { value: { id: "other" } },
    ]);
    write(`final-girl-play-revisions-v1:${owner}`, { target: 5, other: 9 });
    write(`final-girl-play-backup-v1:${owner}:target`, { secret: "old scene" });
    write("owned-films", ["s4-buddyland"]);
    purgeLocalGame(owner, "target");
    expect(isGameDiscarded(owner, "target")).toBe(true);
    expect(isGameDiscarded("someone-else", "target")).toBe(false);
    expect(
      localStorage.getItem(`final-girl-active-game-v1:${owner}`),
    ).toBeNull();
    expect(
      JSON.parse(localStorage.getItem(`final-girl-history-v3:${owner}`)!),
    ).toEqual([{ id: "other" }]);
    expect(
      JSON.parse(
        localStorage.getItem(`final-girl-history-outbox-v1:${owner}`)!,
      ),
    ).toEqual([{ id: "three", value: { kind: "update", id: "other" } }]);
    expect(
      JSON.parse(localStorage.getItem(`final-girl-play-outbox-v1:${owner}`)!),
    ).toEqual([{ value: { id: "other" } }]);
    expect(
      JSON.parse(
        localStorage.getItem(`final-girl-play-revisions-v1:${owner}`)!,
      ),
    ).toEqual({ other: 9 });
    expect(
      localStorage.getItem(`final-girl-play-backup-v1:${owner}:target`),
    ).toBeNull();
    expect(JSON.parse(localStorage.getItem("owned-films")!)).toEqual([
      "s4-buddyland",
    ]);
  });
  it("never clears a different active game or a shared audio clip still used by another game", async () => {
    const owner = "discard-audio-owner";
    localStorage.setItem(
      `final-girl-active-game-v1:${owner}`,
      JSON.stringify({ id: "other" }),
    );
    const key = await narrationKey("The same opening", { kind: "intro" });
    const clip = new Blob(["shared audio"]);
    await putNarrationClip(owner, key, clip, "target");
    await getNarrationClip(owner, key, "other");
    purgeLocalGame(owner, "target");
    await removeGameNarration(owner, "target", [key]);
    expect(
      JSON.parse(localStorage.getItem(`final-girl-active-game-v1:${owner}`)!),
    ).toEqual({ id: "other" });
    expect(await getNarrationClip(owner, key)).toBe(clip);
    await removeGameNarration(owner, "other");
    expect(await getNarrationClip(owner, key)).toBeNull();
    await putNarrationClip(owner, key, clip, "target");
    expect(await getNarrationClip(owner, key)).toBeNull();
  });
});
