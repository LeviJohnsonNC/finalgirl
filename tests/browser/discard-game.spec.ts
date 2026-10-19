import { test, expect, activeGame, gameId, userId } from "./fixtures";
import type { Page } from "@playwright/test";
const selection = {
  ...activeGame.selection,
  killer: "Billy the Bear",
  location: "Buddyland",
  finalGirl: "Rena",
  filmId: "s4-buddyland",
  setupScenario: "Birthday Bash",
  startingEvent: "Birthday Girl",
};
const draft = { ...activeGame, selection, playMode: true };
const otherId = "99999999-9999-4999-8999-999999999999";
const other = {
  id: otherId,
  timestamp: 1,
  outcome: "lost",
  killer: "Hans",
  location: "Camp Happy Trails",
  final_girl: "Laurie",
  victims_saved: 2,
};
const result = {
  id: gameId,
  timestamp: 2,
  outcome: "won",
  killer: selection.killer,
  location: selection.location,
  finalGirl: selection.finalGirl,
};
const formData = {
  weaponUsed: "",
  victimsSaved: 0,
  victimsKilled: 0,
  endingSubLocation: "",
  gameHighlights: "",
};
async function open(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
}
async function options(page: Page) {
  await page
    .getByRole("button", { name: "Session options", exact: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Discard game…", exact: true })
    .click();
  await expect(dialog(page)).toBeVisible();
  await expect(
    dialog(page).getByRole("button", { name: "Keep playing", exact: true }),
  ).toBeFocused();
}
const dialog = (page: Page) =>
  page.getByRole("dialog", { name: "Discard this game?", exact: true });
const confirm = (page: Page) =>
  dialog(page)
    .getByRole("button", { name: "Discard game", exact: true })
    .click();

test("discard is hidden, confirms the exact game, cancels safely, and returns to the same setup", async ({
  page,
  archive,
}, info) => {
  archive.films = ["s4-buddyland", "s1-camp-happy-trails"];
  archive.history = [other];
  await archive.install(page, { draft });
  await open(page);
  await expect(
    page.getByRole("button", { name: "Discard game", exact: true }),
  ).toHaveCount(0);
  await options(page);
  await expect(dialog(page)).toContainText("Rena vs Billy the Bear");
  await expect(dialog(page)).toContainText("Buddyland");
  await expect(
    dialog(page).getByRole("button", { name: "Keep playing", exact: true }),
  ).toBeFocused();
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 568 });
  expect(
    await dialog(page).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return (
        r.left >= 0 &&
        r.right <= innerWidth &&
        r.top >= 0 &&
        r.bottom <= innerHeight
      );
    }),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("discard-confirmation.png"),
    animations: "disabled",
  });
  await dialog(page)
    .getByRole("button", { name: "Keep playing", exact: true })
    .click();
  await expect(dialog(page)).toBeHidden();
  expect(archive.discarded.size).toBe(0);
  await options(page);
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeHidden();
  await options(page);
  await page.mouse.click(2, 2);
  await expect(dialog(page)).toBeHidden();
  await options(page);
  await confirm(page);
  await expect(page.locator(".casting-page")).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Setup Scenario", exact: true }),
  ).toHaveText("Birthday Bash");
  await expect(
    page.getByRole("combobox", { name: "Starting Event", exact: true }),
  ).toHaveText("Birthday Girl");
  expect(archive.discarded.has(gameId)).toBe(true);
  expect(archive.history.map((g) => g.id)).toEqual([otherId]);
  await page.getByRole("button", { name: "Press Play", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).id,
        "final-girl-active-game-v1:" + userId,
      ),
    )
    .not.toBe(gameId);
  const next = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    "final-girl-active-game-v1:" + userId,
  );
  expect(next.selection).toMatchObject(selection);
  expect(next.playEvents).toBeUndefined();
});

for (const phase of ["outcome", "ending"] as const)
  test(
    "discard from " +
      phase +
      " removes the already-recorded result from stats and scrapbooks",
    async ({ page, archive }) => {
      archive.films = ["s4-buddyland"];
      archive.history = [
        other,
        { ...result, final_girl: result.finalGirl, victims_saved: 7 },
      ];
      await archive.install(page, {
        draft: {
          ...draft,
          phase,
          result,
          ...(phase === "ending"
            ? { formData, endingStory: archive.endingText }
            : {}),
        },
      });
      await open(page);
      if (phase === "outcome") {
        await page
          .getByRole("button", { name: "More options", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Discard game…", exact: true })
          .click();
      } else await options(page);
      await confirm(page);
      await expect(page.locator(".casting-page")).toBeVisible();
      expect(archive.history.map((g) => g.id)).toEqual([otherId]);
      expect(archive.sessions.some((g) => g.id === gameId)).toBe(false);
      await page.getByRole("button", { name: "STATS", exact: true }).click();
      await expect(page.getByRole("meter")).toHaveAttribute(
        "aria-valuetext",
        "0 percent win rate, 0 wins and 1 loss",
      );
      await expect(
        page.getByRole("region", { name: "All-time session totals" }),
      ).toContainText("2");
      await page.reload();
      await expect(
        page.getByRole("button", { name: "RESUME GAME", exact: true }),
      ).toHaveCount(0);
    },
  );

test("failed discard preserves the game and offers a safe retry", async ({
  page,
  archive,
}) => {
  archive.failDiscard = true;
  await archive.install(page, { draft });
  await open(page);
  await options(page);
  await confirm(page);
  await expect(dialog(page).getByRole("alert")).toContainText(
    "could not be confirmed",
  );
  expect(archive.discarded.has(gameId)).toBe(false);
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).id,
      "final-girl-active-game-v1:" + userId,
    ),
  ).toBe(gameId);
  archive.failDiscard = false;
  await dialog(page)
    .getByRole("button", { name: "Retry discard", exact: true })
    .click();
  await expect(page.locator(".casting-page")).toBeVisible();
  expect(archive.discarded.has(gameId)).toBe(true);
});

test("a late opening image cannot recreate a discarded game or attach to the next one", async ({
  page,
  archive,
}) => {
  archive.autoImages = true;
  archive.films = ["s4-buddyland"];
  await archive.install(page, { draft: { ...draft, playMode: false } });
  await open(page);
  await expect.poll(() => Boolean(archive.releaseImage)).toBe(true);
  await options(page);
  await confirm(page);
  await expect(page.locator(".casting-page")).toBeVisible();
  archive.autoImages = false;
  await page.getByRole("button", { name: "Press Play", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).id,
        "final-girl-active-game-v1:" + userId,
      ),
    )
    .not.toBe(gameId);
  archive.releaseImage!();
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect
    .poll(() => archive.history.some((g) => g.id === gameId))
    .toBe(false);
  const next = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    "final-girl-active-game-v1:" + userId,
  );
  expect(next.id).not.toBe(gameId);
  expect(next.sceneImageUrl).toBeUndefined();
});

test("a stale device drops its local draft and queued result after learning the game was discarded", async ({
  page,
  archive,
}) => {
  archive.discarded.add(gameId);
  archive.history = [other];
  await archive.install(page, { draft });
  await page.addInitScript(
    ({ userId, gameId }) => {
      if (sessionStorage.getItem("discard-stale-seeded")) return;
      localStorage.setItem(
        "final-girl-history-outbox-v1:" + userId,
        JSON.stringify([
          {
            id: "pending",
            value: {
              kind: "record",
              game: {
                id: gameId,
                timestamp: 1,
                outcome: "won",
                killer: "Hans",
                location: "Camp Happy Trails",
                finalGirl: "Laurie",
              },
            },
          },
        ]),
      );
      sessionStorage.setItem("discard-stale-seeded", "yes");
    },
    { userId, gameId },
  );
  await page.goto("/");
  await expect
    .poll(() =>
      page.evaluate(
        (key) => localStorage.getItem(key),
        "final-girl-active-game-v1:" + userId,
      ),
    )
    .toBeNull();
  expect(archive.history.map((g) => g.id)).toEqual([otherId]);
  await expect(
    page.getByRole("button", { name: "RESUME GAME", exact: true }),
  ).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect
    .poll(() => archive.sessions.some((s) => s.id === gameId))
    .toBe(false);
});

test("guest games can be discarded locally without calling the cloud", async ({
  page,
  archive,
}) => {
  await archive.install(page, { signedIn: false, draft });
  await open(page);
  await options(page);
  await confirm(page);
  await expect(dialog(page)).toBeHidden();
  expect(archive.calls).not.toContain("discard-game");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("final-girl-active-game-v1:guest"),
    ),
  ).toBeNull();
});
