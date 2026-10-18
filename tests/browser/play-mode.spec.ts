import { openHistory } from "./play-helpers";
import { test, expect, activeGame } from "./fixtures";
import { resolve } from "node:path";

const tracked = {
  ...activeGame,
  playMode: true,
  playEvents: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      at: 1,
      kind: "start",
      saved: 0,
      killed: 0,
      round: 1,
    },
  ],
};
test("Play starts immediately, corrects matching counters, saves moments and resumes", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, {
    draft: {
      ...activeGame,
      selection: { ...activeGame.selection, location: "Buddyland" },
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page
    .getByRole("button", { name: "Enter Play mode", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Track this game" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("checkbox", { name: "Death details", exact: true }),
  ).toBeChecked();
  await page
    .getByRole("checkbox", { name: "Death details", exact: true })
    .uncheck();
  for (let i = 0; i < 5; i++)
    await page
      .getByRole("button", { name: "Save one victim", exact: true })
      .click();
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Narrow escape", exact: true })
    .click();
  await page
    .getByLabel("Moment detail", { exact: true })
    .fill("Barricaded the arcade with a broken cabinet.");
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await page
    .getByRole("button", { name: "Decrease killed", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("0");
  await expect(
    page.getByRole("button", { name: "Decrease killed", exact: true }),
  ).toBeDisabled();
  await openHistory(page);
  await expect(
    page.getByRole("region", { name: "Game timeline" }),
  ).toContainText("Barricaded the arcade");
  await page.getByRole("button", { name: "Next round", exact: true }).click();
  await page
    .getByRole("button", { name: "Previous round", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Next round", exact: true }),
  ).toContainText("1");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save one victim", exact: true }),
  ).toContainText("5");
  await expect(
    page.getByRole("checkbox", { name: "Death details", exact: true }),
  ).not.toBeChecked();
  await expect
    .poll(() => {
      const log = archive.sessions[0]?.state.playEvents;
      return Array.isArray(log)
        ? log.filter((e: { kind: string }) => e.kind === "start").length
        : 0;
    })
    .toBe(1);
  await page.screenshot({
    path: info.outputPath("play-overview.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Read story", exact: true }).click();
  await expect(
    page.getByText(archive.storyText, { exact: true }),
  ).toBeVisible();
  expect(archive.calls.filter((c) => c === "generate-story")).toHaveLength(0);
});

test("legacy midgame totals retain unknown round and sync offline taps on reconnect", async ({
  page,
  archive,
}) => {
  archive.failWrites = true;
  await archive.install(page, {
    draft: {
      ...tracked,
      playEvents: [
        { ...tracked.playEvents[0], saved: 4, killed: 2, round: null },
      ],
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Next round", exact: true }),
  ).toContainText("?");
  await page
    .getByRole("button", { name: "Save one victim", exact: true })
    .click();
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save one victim", exact: true }),
  ).toContainText("5");
  archive.failWrites = false;
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect
    .poll(() => archive.sessions[0]?.state.playEvents)
    .toHaveLength(2);
  await page.getByRole("button", { name: "Next round", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Next round", exact: true }),
  ).toContainText("1");
});

test("cloud handoff resumes a session on a fresh device without creating another game", async ({
  page,
  archive,
}) => {
  archive.sessions = [
    { id: tracked.id, revision: 4, state: tracked, closed: false },
  ];
  await archive.install(page);
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME CLOUD GAME" }).click();
  await expect(
    page.getByRole("button", { name: "Save one victim", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  await expect.poll(() => archive.sessions[0].revision).toBeGreaterThan(4);
  expect(archive.sessions).toHaveLength(1);
  expect(archive.history).toHaveLength(0);
});

test("reviewed tracked totals drive the ending, statistics and saved case notes", async ({
  page,
  archive,
}, info) => {
  test.setTimeout(90000);
  const e = (id: string, fields: Record<string, unknown>) => ({
    id: id.padStart(8, "0") + "-3333-4333-8333-333333333333",
    at: Number(id),
    ...fields,
  });
  const death = e("3", { kind: "killed", quantity: 2, cause: "event" });
  await archive.install(page, {
    draft: {
      ...activeGame,
      playMode: true,
      playEvents: [
        e("1", { kind: "start", saved: 3, killed: 1, round: 5 }),
        e("2", { kind: "state", field: "finalGirlHealth", value: 1 }),
        death,
        e("4", { kind: "undo", target: death.id }),
        e("5", { kind: "moment", text: "Barricaded the cabins." }),
      ],
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Won", exact: true })
    .click();
  await expect(page.getByLabel("Victims Saved", { exact: true })).toHaveValue(
    "3",
  );
  await expect(page.getByLabel("Victims Killed", { exact: true })).toHaveValue(
    "1",
  );
  await expect(page.getByLabel("Final round", { exact: true })).toHaveValue(
    "5",
  );
  await expect(
    page.getByLabel("Final Girl Health", { exact: true }),
  ).toHaveValue("1");
  await page.getByLabel("Victims Saved", { exact: true }).fill("4");
  await page.screenshot({
    path: info.outputPath("tracked-outcome.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByText(archive.endingText, { exact: true }),
  ).toBeVisible();
  const request = archive.generationRequests.find(
    (r) => r.name === "generate-ending",
  )!;
  expect(request.body).toMatchObject({
    victimsSaved: 4,
    victimsKilled: 1,
    roundsPlayed: 5,
    finalGirlHealth: 1,
  });
  expect(request.body.playSummary).toContain("Barricaded the cabins.");
  expect(request.body.playSummary).not.toContain("2 victims killed");
  await page.getByRole("button", { name: "SAVE", exact: true }).first().click();
  await expect
    .poll(() => archive.history[0])
    .toMatchObject({ victims_saved: 4, victims_killed: 1, rounds_played: 5 });
  expect(archive.history[0].play_events).toHaveLength(5);
  await expect(
    page.getByRole("region", { name: "Recorded play statistics" }),
  ).toContainText("5.0");
  await page
    .getByRole("region", { name: "Recorded play statistics" })
    .screenshot({ path: info.outputPath("tracked-statistics.png") });
  await page.locator(".session-row-link").first().click();
  await page.getByText("OPEN THE CASE NOTES", { exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Game timeline" })
      .getByRole("paragraph")
      .filter({ hasText: "Barricaded the cabins." }),
  ).toBeVisible();
});

test("unrecorded totals remain blank after reload while an explicit zero is saved", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: activeGame });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page.getByRole("button", { name: "WON", exact: true }).first().click();
  await expect(page.getByLabel("Victims Killed", { exact: true })).toHaveValue(
    "",
  );
  await page.getByLabel("Victims Saved", { exact: true }).fill("0");
  await page.getByLabel("Final round", { exact: true }).fill("3");
  await page.getByLabel("Final round", { exact: true }).fill("");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(page.getByLabel("Victims Saved", { exact: true })).toHaveValue(
    "0",
  );
  await expect(page.getByLabel("Final round", { exact: true })).toHaveValue("");
  await page
    .getByRole("button", { name: "SAVE RESULT WITHOUT NARRATION", exact: true })
    .click();
  await expect.poll(() => archive.history[0]?.victims_saved).toBe(0);
  await expect.poll(() => archive.history[0]?.victims_killed).toBeNull();
  await expect.poll(() => archive.history[0]?.rounds_played).toBeNull();
});

test("Play controls remain reachable on small phones, landscape, tablets and wide screens", async ({
  page,
  archive,
}, info) => {
  test.setTimeout(90000);
  await archive.install(page, { draft: tracked });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  let saved = 0;
  for (const viewport of [
    { width: 320, height: 640 },
    { width: 844, height: 390 },
    { width: 1024, height: 768 },
    { width: 1536, height: 864 },
  ]) {
    await page.setViewportSize(viewport);
    const save = page.getByRole("button", {
      name: "Save one victim",
      exact: true,
    });
    await save.click();
    saved++;
    await expect(save).toContainText(String(saved));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      await save.evaluate((button) => {
        const r = button.getBoundingClientRect();
        const e = document.elementFromPoint(
          r.x + r.width / 2,
          r.y + r.height / 2,
        );
        return e === button || button.contains(e);
      }),
    ).toBe(true);
    if (viewport.width === 844)
      await page.screenshot({
        path: info.outputPath("play-landscape.png"),
        fullPage: true,
      });
  }
});
