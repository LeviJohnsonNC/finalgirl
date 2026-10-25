import { test, expect, activeGame, userId, installTestAudio } from "./fixtures";
import { openModule, searchPick, openHistory } from "./play-helpers";
import { newPlayEvent, type PlayEvent } from "../../src/lib/play/events";
import { deathFacts } from "../../src/lib/play/death";
const selection = {
  ...activeGame.selection,
  killer: "Inkanyamba",
  startingEvent: null,
};
const draft = {
  ...activeGame,
  selection,
  inkanyambaSetupVersion: 1,
  playMode: true,
};
const panel = (page: import("@playwright/test").Page) =>
  page.locator('[data-module="inkanyamba"]');
async function resume(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "inkanyamba");
}
const log = (page: import("@playwright/test").Page): Promise<PlayEvent[]> =>
  page.evaluate(
    (owner) =>
      JSON.parse(localStorage.getItem("final-girl-active-game-v1:" + owner)!)
        .playEvents,
    userId,
  );
for (const [location, id] of [
  ["Camp Happy Trails", "camp"],
  ["Buddyland", "buddyland"],
  ["Carnival of Blood", "carnival"],
  ["Maple Lane", "maple"],
]) {
  test(`Wrath, Atonement, Minor Powers and shared reveals work at ${location}`, async ({
    page,
    archive,
  }) => {
    await archive.install(page, {
      draft: { ...draft, selection: { ...selection, location } },
    });
    await resume(page);
    await expect(page.locator(".play-module-panel")).toHaveCount(2);
    expect(
      await page
        .locator(".play-module-panel")
        .first()
        .getAttribute("data-module"),
    ).toBe("inkanyamba");
    await openModule(page, id);
    const p = panel(page);
    await expect(p.getByLabel("Current Killer Wrath")).toHaveText("2/10");
    await p
      .getByRole("button", { name: "Set Killer Wrath to 5", exact: true })
      .click();
    await p.getByText("Atonement & corrections", { exact: true }).click();
    await p
      .getByRole("button", { name: "2 successes 5 → 2", exact: true })
      .click();
    await expect(p.getByLabel("Current Killer Wrath")).toHaveText("2/10");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(p.getByLabel("Current Killer Wrath")).toHaveText("5/10");
    await p
      .getByRole("button", { name: "Reveal Outrageholic", exact: true })
      .click();
    const minor = p
      .locator(".module-minor")
      .filter({ hasText: "Outrageholic" });
    await expect(minor).toContainText("3/3 health");
    const full = await minor
      .locator(".module-minor-art svg")
      .getAttribute("viewBox");
    await minor
      .getByRole("button", {
        name: "Remove one Outrageholic health, heart 3",
        exact: true,
      })
      .click();
    await expect(minor).toContainText("2/3 health");
    expect(
      await minor.locator(".module-minor-art svg").getAttribute("viewBox"),
    ).not.toBe(full);
    await p.locator(".module-card-section > summary").click();
    await p
      .getByRole("button", { name: "Choose Dark Lightning", exact: true })
      .click();
    await expect(
      p.getByRole("button", { name: "Choose Dark Lightning", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Dark Power", exact: true }).click();
    await expect(
      page.getByRole("combobox", { name: "Dark Power card", exact: true }),
    ).toHaveText("Dark Lightning");
    await page.getByRole("button", { name: "Record", exact: true }).click();
    expect(
      (await log(page)).filter((e) => e.momentType === "dark-power"),
    ).toHaveLength(1);
    expect(
      (await log(page)).filter(
        (e) => e.kind === "killed" || e.kind === "state",
      ),
    ).toHaveLength(0);
    await page.reload();
    await resume(page);
    await expect(p.getByLabel("Current Killer Wrath")).toHaveText("5/10");
    await expect(minor).toContainText("2/3 health");
  });
}
test("old games retain unknown Wrath; failed durable writes retry; offline reload recovers", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: { ...draft, inkanyambaSetupVersion: undefined },
  });
  await resume(page);
  const p = panel(page);
  await expect(p.getByLabel("Current Killer Wrath")).toHaveText("?/10");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("final-girl-active-game-v1:"))
        throw new DOMException("quota", "QuotaExceededError");
      return original.call(this, key, value);
    };
    (window as unknown as { restoreStorage: () => void }).restoreStorage =
      () => {
        Storage.prototype.setItem = original;
      };
  });
  await p
    .getByRole("button", { name: "Set Killer Wrath to 7", exact: true })
    .click();
  await expect(p.getByRole("alert")).toContainText("could not be saved");
  await expect(p.getByLabel("Current Killer Wrath")).toHaveText("?/10");
  await page.evaluate(() =>
    (window as unknown as { restoreStorage: () => void }).restoreStorage(),
  );
  archive.failWrites = true;
  await p
    .getByRole("button", { name: "Set Killer Wrath to 7", exact: true })
    .click();
  await expect(p.getByLabel("Current Killer Wrath")).toHaveText("7/10");
  await page.reload();
  await resume(page);
  await expect(p.getByLabel("Current Killer Wrath")).toHaveText("7/10");
  archive.failWrites = false;
});
test("Finale reveal and its one-time recorded Wrath change stay separate", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft });
  await resume(page);
  const p = panel(page);
  await p.locator(".module-card-section > summary").click();
  await p
    .getByRole("button", { name: "Choose We Need a Miracle", exact: true })
    .click();
  await expect(p.getByLabel("Current Killer Wrath")).toHaveText("2/10");
  await p
    .getByRole("button", { name: "Record Finale Wrath → 10", exact: true })
    .click();
  await expect(p.getByLabel("Current Killer Wrath")).toHaveText("10/10");
  await expect(
    p.getByRole("button", {
      name: "Finale Wrath change recorded",
      exact: true,
    }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(p.getByLabel("Current Killer Wrath")).toHaveText("2/10");
  await p
    .getByRole("button", { name: "Record Finale Wrath → 10", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Set Killer Wrath to 4", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Choose Violent Tantrum", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Choose We Need a Miracle", exact: true })
    .click();
  await expect(p.getByLabel("Current Killer Wrath")).toHaveText("4/10");
  await expect(
    p.getByRole("button", {
      name: "Finale Wrath change recorded",
      exact: true,
    }),
  ).toBeDisabled();
  expect(
    (await log(page)).filter((e) => e.momentType === "finale"),
  ).toHaveLength(1);
});
test("review loaded artwork, selected Epic, health states and reachable controls at agreed sizes", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft });
  await resume(page);
  const p = panel(page);
  const sizes =
    info.project.name === "desktop"
      ? [
          [1280, 640],
          [1366, 768],
          [1440, 900],
        ]
      : [
          [320, 568],
          [390, 844],
        ];
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => document.fonts.ready);
    await p.screenshot({
      path: info.outputPath(`inkanyamba-unknown-${width}.png`),
      animations: "disabled",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await p.locator(".module-card-section > summary").click();
    await p
      .getByRole("button", { name: "Choose Dark Lightning", exact: true })
      .click();
    await p.locator(".module-card-section").screenshot({
      path: info.outputPath(`inkanyamba-epic-${width}.png`),
      animations: "disabled",
    });
    const art = await p.locator("svg image").evaluateAll(async (nodes) =>
      Promise.all(
        [...new Set(nodes.map((n) => n.getAttribute("href")))].map(
          (src) =>
            new Promise<boolean>((done) => {
              const im = new Image();
              im.onload = () => done(im.naturalWidth > 0);
              im.onerror = () => done(false);
              im.src = src!;
            }),
        ),
      ),
    );
    expect(art.every(Boolean)).toBe(true);
    for (const button of await p.locator("button:visible").all())
      expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    for (const button of await p.locator(".ink-track button").all())
      expect((await button.boundingBox())!.width).toBeGreaterThanOrEqual(44);
    await p.locator(".module-card-section > summary").click();
  }
  await p
    .getByRole("button", { name: "Reveal Boiling Anger", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Reveal Outrageholic", exact: true })
    .click();
  for (let remaining = 3; remaining >= 0; remaining--) {
    await p.locator(".ink-minors").screenshot({
      path: info.outputPath(`inkanyamba-minors-${remaining}.png`),
      animations: "disabled",
    });
    if (remaining)
      for (const name of ["Boiling Anger", "Outrageholic"])
        await p
          .getByRole("button", {
            name: `Remove one ${name} health, heart 1`,
            exact: true,
          })
          .click();
  }
  await expect(
    p
      .locator(".module-health-status")
      .filter({ hasText: "Removed · 0/3 health" }),
  ).toHaveCount(2);
});
test("contextual death caches, reopens and narrates without later Wrath rewriting its facts", async ({
  page,
  archive,
}) => {
  await installTestAudio(page);
  const death = newPlayEvent({
    kind: "killed",
    quantity: 1,
    cause: "killer",
    room: "Cabins",
  });
  const atDeath = newPlayEvent({
    kind: "module",
    moduleData: { module: "inkanyamba", changes: { wrath: 7 } },
  });
  const later = newPlayEvent({
    kind: "module",
    moduleData: { module: "inkanyamba", changes: { wrath: 2 } },
  });
  await archive.install(page, {
    draft: {
      ...draft,
      playEvents: [
        newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
        atDeath,
        death,
        later,
      ],
    },
  });
  await resume(page);
  await openHistory(page);
  await page
    .getByRole("button", { name: "Death details", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Gruesome Death",
    exact: true,
  });
  await dialog
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect(
    dialog.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toContainText("ceiling");
  const saved = archive.sessions.find((s) => s.id === draft.id)!;
  expect(
    deathFacts(selection, saved.state.playEvents as PlayEvent[], death.id)
      ?.moduleContext?.inkanyamba.wrath,
  ).toBe(7);
  await dialog
    .getByRole("button", { name: "Narrate death scene", exact: true })
    .click();
  await expect
    .poll(() => archive.calls.filter((c) => c === "narrate-story").length)
    .toBe(1);
  await dialog
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  const count = archive.calls.filter(
    (c) => c === "generate-death-scene",
  ).length;
  await page
    .getByRole("button", { name: "Death details", exact: true })
    .click();
  await expect(
    dialog.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toContainText("ceiling");
  expect(
    archive.calls.filter((c) => c === "generate-death-scene"),
  ).toHaveLength(count);
});

test("fresh casting seeds verified setup and nine health through ending, archive and Rules search", async ({
  page,
  archive,
}, info) => {
  archive.films = ["s1-sacred-groves", "s1-camp-happy-trails"];
  await archive.install(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "START THE TAPE", exact: true })
    .click();
  for (const [slot, name] of [
    "Inkanyamba",
    "Camp Happy Trails",
    "Laurie",
  ].entries()) {
    await page
      .getByRole("button", { name: "Choose", exact: true })
      .nth(slot)
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: new RegExp(name) })
      .click();
  }
  await page.getByRole("button", { name: "Press Play", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Enter Play mode", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Opening narration", exact: true }),
  ).toContainText(archive.storyText);
  const opening = archive.generationRequests.find(
    (r) => r.name === "generate-story",
  )!.body;
  expect((opening.killer as { specialRules: string }).specialRules).toContain(
    "masked human-shaped avenger",
  );
  await page
    .getByRole("button", { name: "Enter Play mode", exact: true })
    .click();
  await openModule(page, "inkanyamba");
  await expect(panel(page).getByLabel("Current Killer Wrath")).toHaveText(
    "2/10",
  );
  await panel(page)
    .getByRole("button", { name: "Set Killer Wrath to 6", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Track Killer health", exact: true })
    .click();
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Won", exact: true })
    .click();
  await expect(page.getByLabel("Killer Health", { exact: true })).toHaveValue(
    "9",
  );
  await expect(
    page.getByText("Killer health (0–9)", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Ending narration", exact: true }),
  ).toContainText(archive.endingText);
  const ending = archive.generationRequests.find(
    (r) => r.name === "generate-ending",
  )!.body;
  expect(ending.playSummary).toContain("Killer Wrath 6/10");
  expect((ending.location as { name: string }).name).toBe("Camp Happy Trails");
  await expect.poll(() => archive.history.length).toBe(1);
  expect(archive.history[0].killer).toBe("Inkanyamba");
  await page
    .locator("footer")
    .getByRole("button", { name: "RULES", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search rules", exact: true })
    .fill("Killer Wrath");
  await page.getByRole("tab", { name: "Special Rules", exact: true }).click();
  await expect(page.locator("#killer-inkanyamba-rules")).toContainText(
    "Killer Wrath",
  );
  await expect(page.locator("#killer-inkanyamba-rules")).toContainText(
    "rounding the reduction up",
  );
  await page.screenshot({
    path: info.outputPath("inkanyamba-rules.png"),
    fullPage: true,
  });
});

test("legacy health above the corrected reference remains editable", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: {
      ...activeGame,
      selection,
      phase: "outcome",
      result: {
        id: activeGame.id,
        timestamp: 1,
        outcome: "lost",
        ...selection,
        killerHealth: 10,
      },
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(page.getByLabel("Killer Health", { exact: true })).toHaveValue(
    "10",
  );
  await page.getByLabel("Killer Health", { exact: true }).fill("10");
  await page.getByLabel("Killer Health", { exact: true }).blur();
  await expect(page.getByLabel("Killer Health", { exact: true })).toHaveValue(
    "10",
  );
});
