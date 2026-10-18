import { test, expect, activeGame } from "./fixtures";
import { openHistory, searchPick } from "./play-helpers";
const draft = {
  ...activeGame,
  playMode: true,
  selection: {
    ...activeGame.selection,
    killer: "Billy the Bear",
    location: "Buddyland",
    finalGirl: "Rena",
  },
  playEvents: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      at: 1,
      kind: "start",
      saved: 0,
      killed: 0,
      round: 4,
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      at: 2,
      kind: "module",
      moduleData: {
        module: "billy",
        changes: {
          "buddy.toby.status": "active",
          "buddy.toby.health": 3,
          "source.1.status": "active",
        },
      },
    },
  ],
};
async function resume(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
}
for (const cause of ["Killer attack", "Terror card"]) {
  test(`${cause} displays its story after a JSONB round trip and keeps it after a late empty lookup`, async ({
    page,
    archive,
  }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    archive.holdDeathRead = true;
    await archive.install(page, { draft });
    await resume(page);
    await page
      .getByRole("button", { name: "Record one victim killed", exact: true })
      .click();
    await expect.poll(() => Boolean(archive.releaseDeathRead)).toBe(true);
    const dialog = page.getByRole("dialog", {
      name: "Gruesome Death",
      exact: true,
    });
    await expect(dialog.locator(".play-cause-tile svg")).toHaveCount(0);
    await dialog.getByRole("button", { name: cause, exact: true }).click();
    if (cause === "Terror card")
      await searchPick(page, "Terror card", "Earthquake!");
    await dialog
      .getByRole("button", { name: "Gruesome Death", exact: true })
      .click();
    const story = dialog.getByRole("region", {
      name: "Generated death scene",
      exact: true,
    });
    await expect(story).toContainText(archive.deathText);
    archive.holdDeathRead = false;
    const lateLookup = page.waitForResponse((r) =>
      r.url().includes("/play_death_scenes"),
    );
    archive.releaseDeathRead!();
    await lateLookup;
    // A roundtrip gives React time to process the late lookup, with no test sleeps.
    await dialog.getByLabel("Death context", { exact: true }).focus();
    await expect(story).toContainText(archive.deathText);
    await expect(dialog).not.toContainText("Your death is saved.");
    await dialog.evaluate((el) => {
      (document.activeElement as HTMLElement | null)?.blur();
      el.scrollTop = el.scrollHeight;
    });
    await page.screenshot({
      path: info.outputPath("visible-story.png"),
      animations: "disabled",
    });
    await dialog
      .getByRole("button", { name: "Save and exit", exact: true })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "RESUME GAME", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Latest death scene", exact: true })
      .click();
    await expect(story).toContainText(archive.deathText);
    expect(
      archive.calls.filter((c) => c === "generate-death-scene"),
    ).toHaveLength(1);
  });
}
test("a mismatched successful scene response gives a visible recovery message", async ({
  page,
  archive,
}) => {
  archive.deathSignatureOverride = "0".repeat(64);
  await archive.install(page, { draft });
  await resume(page);
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Killer attack", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Death scene result", exact: true }),
  ).toContainText("A story was returned for different saved details");
  await expect(
    page.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toHaveCount(0);
});
test("aligned corrections, individual moment art and a compact scrollable timeline", async ({
  page,
  archive,
}, info) => {
  const history = Array.from({ length: 28 }, (_, i) => ({
    id: `${(i + 100).toString().padStart(8, "0")}-4444-4444-8444-444444444444`,
    at: i + 3,
    kind: "saved",
    quantity: 1,
  }));
  await archive.install(page, {
    draft: { ...draft, playEvents: [...draft.playEvents, ...history] },
  });
  await resume(page);
  await expect(page.locator(".play-heading")).not.toContainText(
    "Rena vs Billy",
  );
  for (const heading of await page
    .locator(".play-track-more h2, .play-modules h2")
    .allTextContents()) {
    expect(heading).not.toMatch(/optional/i);
  }
  for (const counter of ["saved", "killed", "round"]) {
    const centers = await page
      .locator(`.play-count--${counter}`)
      .evaluate((el) => {
        const plus = el
          .querySelector(".play-count-add > svg")!
          .getBoundingClientRect();
        const minus = el
          .querySelector(".play-count-minus")!
          .getBoundingClientRect();
        return [plus.x + plus.width / 2, minus.x + minus.width / 2];
      });
    expect(Math.abs(centers[0] - centers[1])).toBeLessThan(1);
  }
  const moments = page.getByRole("region", {
    name: "Remember this",
    exact: true,
  });
  await expect(moments.locator("h2 svg")).toHaveCount(0);
  const images = moments.locator(".play-moment-choices img");
  await expect(images).toHaveCount(8);
  expect(
    new Set(
      await images.evaluateAll((nodes) =>
        nodes.map((n) => (n as HTMLImageElement).src),
      ),
    ).size,
  ).toBe(8);
  expect(
    await moments.evaluate((el) => getComputedStyle(el).backgroundImage),
  ).toBe("none");
  await moments.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      images.evaluateAll((nodes) =>
        nodes.every(
          (n) =>
            (n as HTMLImageElement).complete &&
            (n as HTMLImageElement).naturalWidth > 0,
        ),
      ),
    )
    .toBe(true);
  await openHistory(page);
  const timeline = page.getByRole("list", {
    name: "Timeline entries",
    exact: true,
  });
  await expect(timeline).toHaveAttribute("tabindex", "0");
  const layout = await timeline.evaluate((el) => ({
    height: el.clientHeight,
    full: el.scrollHeight,
    row: el.querySelector("li:last-child")!.getBoundingClientRect().height,
    gap: parseFloat(
      getComputedStyle(el.querySelector("li:nth-child(2)")!).marginTop,
    ),
  }));
  expect(layout.full).toBeGreaterThan(layout.height);
  expect(layout.height).toBeLessThanOrEqual(320);
  expect(layout.row).toBeLessThan(62);
  expect(layout.gap).toBe(0);
  const first = timeline.locator("li").first();
  await first.getByRole("button", { name: /^Undo/ }).click();
  await expect(first).toContainText("UNDONE");
  expect(
    await first.evaluate((el) => el.getBoundingClientRect().height),
  ).toBeLessThan(62);
  await first.getByRole("button", { name: /^Restore/ }).click();
  await expect(first).toContainText("ROUND 04");
  await timeline.focus();
  await page.keyboard.press("End");
  await expect
    .poll(() => timeline.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  await page.screenshot({
    path: info.outputPath("compact-timeline-and-moments.png"),
    fullPage: true,
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
