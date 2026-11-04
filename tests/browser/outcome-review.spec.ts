import { test, expect, activeGame } from "./fixtures";
import { saveResultOnly } from "./play-helpers";

for (const outcome of ["won", "lost"] as const)
  test(`cinematic Buddyland ${outcome} review preserves totals, conditional details and the ending`, async ({
    page,
    archive,
  }, info) => {
    archive.films = ["s4-buddyland"];
    const result = {
      id: activeGame.id,
      timestamp: 1,
      outcome,
      killer: "Billy the Bear",
      location: "Buddyland",
      finalGirl: "Gwynn",
      victimsSaved: 7,
      victimsKilled: 8,
      roundsPlayed: 11,
      finalGirlHealth: outcome === "won" ? 3 : 0,
      killerHealth: 0,
      finalHorrorLevel: 0,
    };
    archive.history.push({
      id: result.id,
      timestamp: result.timestamp,
      outcome: result.outcome,
      killer: result.killer,
      location: result.location,
      final_girl: result.finalGirl,
    });
    await archive.install(page, {
      draft: {
        ...activeGame,
        phase: "outcome",
        result,
        selection: {
          ...activeGame.selection,
          killer: result.killer,
          location: result.location,
          finalGirl: result.finalGirl,
        },
      },
    });
    await page.goto("/");
    await page
      .getByRole("button", { name: "RESUME GAME", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: outcome === "won" ? "VICTORY" : "DEFEAT",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "Save record only",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator(".outcome-modules > .outcome-panel")).toHaveCount(
      1,
    );
    await page
      .getByRole("button", { name: "Decrease Victims Saved", exact: true })
      .click();
    await expect(page.getByLabel("Victims Saved", { exact: true })).toHaveValue(
      "6",
    );
    await expect(
      page.getByLabel("Final Horror Level", { exact: true }),
    ).toHaveValue("0");
    await page.getByLabel("Billy Finale (optional)", { exact: true }).click();
    await expect(page.locator(".outcome-select-menu")).toBeVisible();
    await page
      .getByRole("option", { name: "Power Surge", exact: true })
      .click();
    await page.getByLabel("Boris at Game End", { exact: true }).click();
    await page.getByRole("option", { name: "Defeated", exact: true }).click();
    await page.getByLabel("Buddies in Play at End (0–7)").fill("2");
    await page
      .getByLabel("Ending Location", { exact: true })
      .fill("Prize Counter");
    await page
      .getByLabel("Game Highlights", { exact: true })
      .fill("The last swing shattered the prize cabinet.");
    await page.getByLabel("Weapon Used", { exact: true }).fill("Fire Axe");
    await page.reload();
    await page
      .getByRole("button", { name: "RESUME GAME", exact: true })
      .click();
    await expect(page.getByLabel("Victims Saved", { exact: true })).toHaveValue(
      "6",
    );
    await expect(
      page.getByLabel("Boris at Game End", { exact: true }),
    ).toHaveText("Defeated");
    await page.evaluate(() => document.fonts.ready);
    await page
      .locator(".outcome-hero-art")
      .evaluate((image: HTMLImageElement) => image.decode());
    const original = page.viewportSize()!;
    for (const size of [
      original,
      { width: 320, height: 568 },
      { width: 768, height: 1024 },
      { width: 1440, height: 1000 },
    ]) {
      await page.setViewportSize(size);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const control of await page
        .locator(
          '.outcome-review input[type="text"], .outcome-review textarea, .outcome-review [role="combobox"]',
        )
        .all()) {
        const box = (await control.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(size.width);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
    await page.setViewportSize(original);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: info.outputPath(`outcome-${outcome}.png`),
      fullPage: true,
      style: ".app-footer, .news-broadcast { visibility: hidden !important; }",
      animations: "disabled",
    });
    const continueButton = page.getByRole("button", {
      name: "Generate ending",
      exact: true,
    });
    await page.evaluate(() =>
      scrollTo(0, document.documentElement.scrollHeight),
    );
    expect(
      await continueButton.evaluate(
        (el) =>
          el.getBoundingClientRect().bottom <
          document.querySelector(".news-broadcast")!.getBoundingClientRect()
            .top,
      ),
    ).toBe(true);
    await continueButton.click();
    await expect(
      page.getByText(archive.endingText, { exact: true }),
    ).toBeVisible();
    expect(
      archive.generationRequests.find(
        (request) => request.name === "generate-ending",
      )?.body,
    ).toMatchObject({
      victimsSaved: 6,
      victimsKilled: 8,
      roundsPlayed: 11,
      finalHorrorLevel: 0,
      finalGirlHealth: result.finalGirlHealth,
      killerHealth: 0,
      weaponUsed: "Fire Axe",
      endingSubLocation: "Prize Counter",
    });
    expect(
      archive.generationRequests.find(
        (request) => request.name === "generate-ending",
      )?.body.gameHighlights,
    ).toContain("Boris: defeated");
  });

test("a sacrificial rescue victory stays a victory and can be saved without generation", async ({
  page,
  archive,
}, info) => {
  const result = {
    id: activeGame.id,
    timestamp: 1,
    outcome: "won",
    killer: "Poltergeist",
    location: "Creech Manor",
    finalGirl: "Alice",
    finalGirlHealth: 0,
  };
  archive.history.push({
    id: result.id,
    timestamp: result.timestamp,
    outcome: result.outcome,
    killer: result.killer,
    location: result.location,
    final_girl: result.finalGirl,
  });
  await archive.install(page, {
    draft: {
      ...activeGame,
      phase: "outcome",
      result,
      selection: {
        ...activeGame.selection,
        killer: result.killer,
        location: result.location,
        finalGirl: result.finalGirl,
      },
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "VICTORY", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Final Girl Health", { exact: true }),
  ).toHaveValue("0");
  await expect(page.getByLabel("Killer Health", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByLabel("Victims Saved", { exact: true })).toHaveValue(
    "",
  );
  await page
    .getByRole("button", { name: "Increase Victims Saved", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Clear Victims Saved", exact: true })
    .click();
  await page.getByLabel("Rescued Carolyn", { exact: true }).check();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: info.outputPath("outcome-sacrificial-rescue.png"),
    fullPage: true,
    style: ".app-footer, .news-broadcast { visibility: hidden !important; }",
  });
  await saveResultOnly(page);
  await expect.poll(() => archive.history.length).toBe(1);
  await expect
    .poll(() => archive.history[0])
    .toMatchObject({
      outcome: "won",
      final_girl_health: 0,
      victims_saved: null,
    });
  expect(archive.calls).not.toContain("generate-ending");
});

test("the mission and dimension panels remain usable together", async ({
  page,
  archive,
}, info) => {
  const result = {
    id: activeGame.id,
    timestamp: 1,
    outcome: "lost",
    killer: "Slayer",
    location: "Falconwood",
    finalGirl: "Nancy",
    mission: "Save Your Father",
  };
  archive.history.push({
    id: result.id,
    timestamp: result.timestamp,
    outcome: result.outcome,
    killer: result.killer,
    location: result.location,
    final_girl: result.finalGirl,
  });
  await archive.install(page, {
    draft: {
      ...activeGame,
      phase: "outcome",
      result,
      selection: {
        ...activeGame.selection,
        killer: result.killer,
        location: result.location,
        finalGirl: result.finalGirl,
      },
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "The Mission", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Dimension at finish", exact: true }),
  ).toBeVisible();
  await page.getByText("Mirror Dimension", { exact: true }).click();
  await page.getByText("Incomplete", { exact: true }).click();
  await page
    .getByPlaceholder("One clue short, halfway through the code...")
    .fill("One clue short.");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: info.outputPath("outcome-mission-loss.png"),
    fullPage: true,
    style: ".app-footer, .news-broadcast { visibility: hidden !important; }",
  });
  await saveResultOnly(page);
  await expect.poll(() => archive.history.length).toBe(1);
  await expect
    .poll(() => archive.history[0].game_highlights)
    .toContain("Mirror Dimension");
  expect(archive.history[0].game_highlights).toContain("One clue short.");
});

test("review corrections invalidate the old ending and save the exact case", async ({ page, archive }, info) => {
  const result = { ...activeGame.selection, id: activeGame.id, timestamp: 1, outcome: "won" as const, finalGirlHealth: 3 };
  archive.history.push({
    id: result.id, timestamp: 1, outcome: result.outcome, killer: result.killer,
    location: result.location, final_girl: result.finalGirl, final_girl_health: 3,
  });
  await archive.install(page, { draft: { ...activeGame, phase: "outcome", result } });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME" }).click();
  const location = page.getByRole("combobox", { name: "Ending Location", exact: true });
  await page.getByRole("button", { name: "Browse board spaces" }).click();
  await expect(page.getByRole("listbox", { name: "Ending Location suggestions" })).toBeVisible();
  await page.screenshot({ path: info.outputPath("board-picker.png"), animations: "disabled" });
  await page.getByRole("option", { name: "Dock", exact: true }).click();
  await expect(location).toHaveValue("Dock");
  await page.getByRole("button", { name: "Generate ending", exact: true }).click();
  const original = archive.endingText;
  await expect(page.getByText(original, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit record", exact: true }).click();
  await expect(location).toHaveValue("Dock");
  await page.getByRole("button", { name: "Generate ending", exact: true }).click();
  await expect(page.getByText(original, { exact: true })).toBeVisible();
  const endings = () => archive.generationRequests.filter(request => request.name === "generate-ending");
  expect(endings()).toHaveLength(1);

  await page.getByRole("button", { name: "Edit record", exact: true }).click();
  await page.getByRole("button", { name: "Clear Final Girl Health", exact: true }).click();
  await location.fill("Cabin loft");
  await page.getByRole("button", { name: "Generate ending", exact: true }).click();
  await expect(page.getByText(original, { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save to scrapbook", exact: true })).toHaveCount(0);
  await expect.poll(() => archive.history[0].final_girl_health).toBeNull();
  expect(endings()).toHaveLength(1);
  await page.screenshot({ path: info.outputPath("ending-needs-update.png"), animations: "disabled" });
  archive.endingText = "The cabin loft door finally opened. Laurie stepped toward the narrow stairs.";
  await page.getByRole("button", { name: "Update ending", exact: true }).click();
  await expect(page.getByText(archive.endingText, { exact: true })).toBeVisible();
  expect(endings()).toHaveLength(2);
  expect(endings()[1].body).toMatchObject({ endingSubLocation: "Cabin loft" });
  expect(endings()[1].body).not.toHaveProperty("finalGirlHealth");
  await page.getByRole("button", { name: "Save to scrapbook", exact: true }).click();
  await expect.poll(() => archive.history[0].ending_narration).toBe(archive.endingText);
  await expect(page.getByRole("heading", { name: "STATS", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Saved record" })).toHaveCount(0);
  await page.getByRole("region", { name: "Recent sessions" }).getByRole("button", { name: /Laurie.*Hans/ }).click();
  await expect(page.locator(".story-page-content")).toContainText("Cabin loft");
  expect(archive.history).toHaveLength(1);
});

test("an unobserved Wolf mode stays unknown in a mixed ship review", async ({ page, archive }, info) => {
  const selection = { ...activeGame.selection, killer: "Big Bad Wolf", location: "USS Konrad" };
  const result = { ...selection, id: activeGame.id, timestamp: 1, outcome: "won" as const, victimsSaved: 0 };
  await archive.install(page, { draft: { ...activeGame, selection, phase: "outcome", result } });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME" }).click();
  await expect(page.getByRole("combobox", { name: "Game result", exact: true })).toHaveCount(1);
  await expect(page.getByRole("group", { name: "Wolf mode at finish" }).getByRole("radio", { name: "Not recorded" })).toBeChecked();
  await expect(page.getByRole("region", { name: "Location details" }).getByRole("combobox", { name: "Reviewed ship fate" })).toHaveText("Fate not recorded");
  await page.screenshot({ path: info.outputPath("mixed-review.png"), fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "Generate ending", exact: true }).click();
  await expect(page.getByText(archive.endingText, { exact: true })).toBeVisible();
  const request = archive.generationRequests.find(item => item.name === "generate-ending")!;
  expect(request.body).toMatchObject({ outcome: "won", victimsSaved: 0, konradReview: { fate: "unknown" } });
  expect(request.body.gameHighlights ?? "").not.toContain("Wolf mode at end");
});
