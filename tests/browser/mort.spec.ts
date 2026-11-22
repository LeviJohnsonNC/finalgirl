import { activeGame, expect, test, userId } from "./fixtures";
import { openModule } from "./play-helpers";
import { deathFacts, deathSignature } from "../../src/lib/play/death";
import {
  summarizePlay,
  validPlayLog,
  type PlayEvent,
} from "../../src/lib/play/events";
import {
  MORT,
  MORT_SUSPECTS,
  MORT_TRAITS,
  mortState,
} from "../../supabase/functions/_shared/play/mort";

const key = `final-girl-active-game-v1:${userId}`;
const newGame = {
  ...activeGame,
  introStory: "Adrianne heard footsteps beyond the registration desk.",
  selection: {
    ...activeGame.selection,
    killer: MORT,
    location: "MegaBGCon",
    finalGirl: "Adrianne",
    filmId: "s4-shriek",
  },
  playMode: true,
  coreTrackersVersion: 1,
  mortSetupVersion: 1,
  playEvents: [],
};

async function choose(
  page: import("@playwright/test").Page,
  label: string,
  option: string,
) {
  const field = page.getByRole("combobox", { name: label, exact: true });
  await field.click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("Mort investigation plays through the complete clue route and recovers from failed saves", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft: newGame });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "mort");
  const mort = page.getByRole("group", { name: "Mort investigation" });
  const lineup = mort.locator(".mort-lineup").first();
  await expect(lineup.getByRole("button")).toHaveCount(10);
  await expect(lineup.locator("img").first()).toHaveCSS("filter", "none");
  await expect(page.getByText("Disguised · Health unrevealed")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Set Horror", exact: true }),
  ).toHaveText("3");
  const sizes =
    info.project.name === "mobile"
      ? [
          [390, 844],
          [320, 568],
        ]
      : [
          [1280, 640],
          [1366, 768],
          [1440, 900],
        ];
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    const urls = await lineup.locator("img").evaluateAll(async (images) => {
      await Promise.all(images.map((i) => (i as HTMLImageElement).decode()));
      return images.map((i) => (i as HTMLImageElement).currentSrc);
    });
    expect(new Set(urls).size).toBe(10);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await lineup.screenshot({ path: info.outputPath(`lineup-${width}.jpg`) });
  }
  const form = mort.getByRole("form", { name: "Record a clue" });
  const token = (number: number) =>
    form.getByRole("button", { name: `Reminder token ${number}`, exact: true });
  const apply = form.getByRole("button", { name: "Apply clue", exact: true });
  const traitField = form.getByRole("combobox", {
    name: "Trait from the Viewer",
  });
  await mort.getByRole("button", { name: "Record clue", exact: true }).click();
  await expect(form.getByRole("button", { name: "Pick suspects" })).toHaveCount(0);
  const tokenTops = await form.getByRole("button", { name: /^Reminder token/ })
    .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().top));
  expect(tokenTops).toHaveLength(5);
  expect(new Set(tokenTops).size).toBe(1);
  await expect(traitField).toHaveText("Choose a trait");
  await form.getByRole("combobox", { name: "How you found it" }).click();
  await expect(
    page.getByRole("option", { name: "Coerce", exact: true }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await choose(page, "Trait from the Viewer", "Mask or facepaint");
  await expect(traitField).toHaveText("Mask or facepaint");
  await expect(
    form.getByRole("combobox", { name: "Mort does not have" }),
  ).toBeEnabled();
  await choose(page, "Trait from the Viewer", "Favorite horror movie genre");
  await choose(page, "Mort does not have", "Comedy Horror");
  await expect(apply).toBeDisabled();
  await token(2).focus();
  await page.keyboard.press("Space");
  await expect(token(2)).toHaveAttribute("aria-pressed", "true");
  await expect(apply).toBeEnabled();
  await page.keyboard.press("Space");
  await expect(token(2)).toHaveAttribute("aria-pressed", "false");
  await expect(apply).toBeDisabled();
  await token(2).click();
  await form.screenshot({
    path: info.outputPath("reminder-tokens.jpg"),
    style: ".app-footer{visibility:hidden}",
  });
  await expect(
    mort.getByText("H.U.N.T.E.R., Baghead become Informants."),
  ).toBeVisible();
  await page.evaluate(() => {
    const write = Storage.prototype.setItem;
    Object.assign(window, {
      restoreMortStorage: () => {
        Storage.prototype.setItem = write;
      },
    });
    Storage.prototype.setItem = function (name, data) {
      if (name.startsWith("final-girl-active-game-v1:"))
        throw Error("Interrupted save");
      write.call(this, name, data);
    };
  });
  await mort.getByRole("button", { name: "Apply clue", exact: true }).click();
  await expect(mort.getByRole("alert")).toContainText("could not be saved");
  await expect(lineup.getByRole("button")).toHaveCount(10);
  await page.evaluate(() =>
    (
      window as unknown as { restoreMortStorage: () => void }
    ).restoreMortStorage(),
  );
  await mort.getByRole("button", { name: "Apply clue", exact: true }).click();
  await expect(lineup.getByRole("button")).toHaveCount(8);
  await mort.getByRole("button", { name: "Undo last Mort change" }).click();
  await expect(lineup.getByRole("button")).toHaveCount(10);
  await mort.getByRole("button", { name: "Record clue", exact: true }).click();
  await token(2).click();
  await choose(page, "Trait from the Viewer", "Favorite horror movie genre");
  await choose(page, "Mort does not have", "Comedy Horror");
  await lineup.getByRole("button", { name: "H.U.N.T.E.R.", exact: true }).click();
  const profile = mort.getByRole("region", { name: "Profile for H.U.N.T.E.R." });
  await profile.getByRole("button", { name: "Rule out suspect" }).click();
  await expect(lineup.getByRole("button")).toHaveCount(9);
  await expect(
    form.getByText(/1 previously ruled out will be linked/),
  ).toBeVisible();
  await apply.click();
  await expect(lineup.getByRole("button")).toHaveCount(8);
  await mort.getByText("Ruled out · 2", { exact: true }).click();
  const ruledOutPhoto = mort.locator(".mort-ruled .mort-lineup img").first();
  await expect(ruledOutPhoto).toHaveCSS("filter", "grayscale(0.86) brightness(0.61)");
  await mort.getByText("Ruled out · 2", { exact: true }).click();
  const afterClue: PlayEvent[] = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).playEvents,
    key,
  );
  expect(mortState(summarizePlay(afterClue).entries)).toMatchObject({
    clues: [2],
    informants: 2,
    unfiled: [],
  });
  await choose(page, "Physically drawn suspect token", "Baghead");
  await mort.getByRole("button", { name: "Record draw" }).click();
  await expect(
    mort.getByText("Discard Baghead’s token and skip the Killer effect."),
  ).toBeVisible();
  await expect(lineup.getByText("Active Killer")).toHaveCount(0);
  await choose(page, "Physically drawn suspect token", "Hans");
  await mort.getByRole("button", { name: "Record draw" }).click();
  await expect(lineup.getByText("Active Killer")).toBeVisible();
  await expect(lineup.getByRole("button", { name: "Hans Active Killer" }).locator("img")).toHaveCSS("filter", "none");
  await mort.getByRole("button", { name: "Return token" }).click();
  for (const [number, trait, value] of [
    [1, "Mask or facepaint", "Facepaint"],
    [3, "Series of origin", "Special"],
    [4, "Favorite horror movie villain", "Ghosts"],
    [5, "Favorite horror movie genre", "Gothic"],
  ] as const) {
    await mort
      .getByRole("button", {
        name: number === 1 ? "Coerce" : "Record clue",
        exact: true,
      })
      .click();
    await expect(
      form.getByRole("button", {
        name: "Reminder token 2, recorded",
        exact: true,
      }),
    ).toBeDisabled();
    await token(number).click();
    await choose(page, "Trait from the Viewer", trait);
    await choose(page, "Mort does not have", value);
    await apply.click();
  }
  await expect(lineup.getByRole("button")).toHaveCount(1);
  await expect(
    mort.getByRole("article", { name: "Mort Revealed" }),
  ).toHaveCount(0);
  await mort
    .getByRole("button", { name: "Confirm disguise", exact: true })
    .click();
  await choose(page, "Confirmed disguise", "Hans");
  await choose(page, "Dark Power", "Anonymous Terror");
  await mort
    .getByRole("checkbox", { name: "I confirmed the disguise with the Viewer" })
    .check();
  await mort.getByRole("button", { name: "Reveal Mort", exact: true }).click();
  await expect(
    mort.getByRole("heading", { name: "Mort as Hans" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Set Killer health" }),
  ).toHaveText("10");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(
    mort.getByRole("heading", { name: "Mort as Hans" }),
  ).toBeVisible();
  const log: PlayEvent[] = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).playEvents,
    key,
  );
  expect(validPlayLog(log)).toBe(true);
  expect(mortState(summarizePlay(log).entries)).toMatchObject({
    reveal: { suspect: "hans", route: "clues", missing: 0 },
    informants: 0,
    discarded: ["baghead"],
  });
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    const hero = mort.getByRole("article", { name: "Mort Revealed" });
    await hero
      .locator("img")
      .evaluate((img) => (img as HTMLImageElement).decode());
    await hero.screenshot({
      path: info.outputPath(`hans-reveal-${width}.jpg`),
      animations: "disabled",
      style: ".app-footer{visibility:hidden}",
    });
  }
});

test("Mort’s disguise is optional and saved with the individual death scene", async ({ page, archive }, info) => {
  await archive.install(page, { draft: newGame });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page.getByRole("button", { name: "Record one victim killed", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Gruesome Death" });
  const field = dialog.getByRole("combobox", { name: "Mort’s disguise" });
  const cause = (name: string) => dialog.getByRole("button", { name, exact: true });
  await cause("Killer attack").click();
  await expect(field).toHaveText("Choose a disguise");
  await field.click();
  const options = page.getByRole("option");
  await expect(options).toHaveCount(MORT_SUSPECTS.length + 1);
  expect((await options.allTextContents()).sort()).toEqual([
    "Choose a disguise",
    ...MORT_SUSPECTS.map(suspect => suspect.name),
  ].sort());
  await page.screenshot({ path: info.outputPath("mort-disguise-dropdown.png") });
  await page.getByRole("option", { name: "Hans", exact: true }).click();
  await cause("Terror card").click();
  await expect(field).toHaveText("Hans");
  await cause("Buddy / minion").click();
  await expect(field).toHaveCount(0);
  await expect(dialog.getByRole("combobox", { name: "Death attacker" })).toHaveText("Choose a Buddy or enter a minion");
  await cause("Killer attack").click();
  await expect(field).toHaveText("Choose a disguise");
  await choose(page, "Mort’s disguise", "Ratchet Lady");
  await cause("Gruesome Death").click();
  await expect(dialog.getByRole("region", { name: "Generated death scene" })).toBeVisible();
  await expect(dialog.locator(".play-death-context")).toContainText("Mort as Ratchet Lady");

  const scene = archive.deathScenes[0];
  const events = archive.sessions[0].state.playEvents as PlayEvent[];
  const facts = deathFacts(newGame.selection, events, scene.event_id)!;
  expect(facts).toMatchObject({ cause: "killer", attacker: "Mort as Ratchet Lady" });
  expect(scene.signature).toBe(await deathSignature(facts));
  expect(mortState(summarizePlay(events).entries).reveal).toBeUndefined();

  await cause("Save and exit").click();
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page.getByRole("button", { name: "Latest death scene", exact: true }).click();
  await cause("Edit death details").click();
  await expect(field).toHaveText("Ratchet Lady");
  expect(archive.calls.filter(name => name === "generate-death-scene")).toHaveLength(1);
});

test("every suspect has a dossier and its own temporary Active Killer portrait", async ({
  page,
  archive,
}, info) => {
  test.slow();
  const mobile = info.project.name === "mobile";
  await page.setViewportSize(
    mobile ? { width: 320, height: 568 } : { width: 1280, height: 640 },
  );
  await archive.install(page, { draft: newGame });
  const resume = async () => {
    await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
    await openModule(page, "mort");
  };
  await page.goto("/");
  await resume();

  const mort = page.getByRole("group", { name: "Mort investigation" });
  const lineup = mort.locator(".mort-lineup").first();
  const activeUrls = new Set<string>();
  const profileUrls = new Set<string>();

  for (const [index, suspect] of MORT_SUSPECTS.entries()) {
    const tile = lineup.locator(`[data-suspect="${suspect.id}"]`);
    const photo = tile.locator("img");
    const neutralUrl = await photo.getAttribute("src");

    await tile.click();
    const dossier = mort.getByRole("region", {
      name: `Profile for ${suspect.name}`,
      exact: true,
    });
    await expect(dossier.getByRole("heading")).toHaveText(suspect.name);
    await expect(dossier.locator("dt")).toHaveText([...MORT_TRAITS]);
    await expect(dossier.locator("dd")).toHaveText([...suspect.traits]);
    const dossierPhoto = dossier.locator(".mort-profile-photo img");
    const dossierUrl = await dossierPhoto.evaluate(
      async (img: HTMLImageElement) => {
        await img.decode();
        return img.getAttribute("src")!;
      },
    );
    expect(dossierUrl).toMatch(new RegExp(`/${suspect.id}-profile[.-]`));
    profileUrls.add(dossierUrl);

    if (suspect.id === "fright") {
      const icons = await dossier.locator(".mort-trait-icon img").evaluateAll(
        async (imgs) => {
          const assets = imgs as HTMLImageElement[];
          await Promise.all(assets.map((img) => img.decode()));
          return assets.map((img) => img.currentSrc);
        },
      );
      expect(new Set(icons).size).toBe(7);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(mobile ? 320 : 1280);
    await dossier.screenshot({
      path: info.outputPath(`${suspect.id}-dossier.jpg`),
      style: ".app-footer{visibility:hidden}",
    });

    await choose(page, "Physically drawn suspect token", suspect.name);
    await mort.getByRole("button", { name: "Record draw", exact: true }).click();
    await expect(lineup.locator('[data-active="true"]')).toHaveCount(1);
    await expect(tile.getByText("Active Killer", { exact: true })).toBeVisible();
    const activeUrl = await photo.evaluate(async (img: HTMLImageElement) => {
      await img.decode();
      return img.getAttribute("src")!;
    });
    expect(activeUrl).toMatch(new RegExp(`/${suspect.id}-active[.-]`));
    expect(activeUrl).not.toBe(neutralUrl);
    activeUrls.add(activeUrl);
    await expect(dossierPhoto).toHaveAttribute("src", activeUrl);
    await expect(
      dossier.getByRole("button", { name: "Rule out suspect" }),
    ).toBeDisabled();

    if (index === 0) {
      await page.reload();
      await resume();
      await expect(tile.getByText("Active Killer", { exact: true })).toBeVisible();
      await expect(photo).toHaveAttribute("src", activeUrl);
      await tile.click();
      await expect(dossierPhoto).toHaveAttribute("src", activeUrl);
    }

    await tile.screenshot({ path: info.outputPath(`${suspect.id}-active.jpg`) });
    await mort.getByRole("button", { name: "Return token", exact: true }).click();
    await expect(photo).toHaveAttribute("src", neutralUrl!);
    await expect(dossierPhoto).toHaveAttribute("src", dossierUrl);
    await expect(lineup.locator('[data-active="true"]')).toHaveCount(0);

    if (index === 0) {
      const undo = mort.getByRole("button", { name: "Undo last Mort change" });
      await undo.click();
      await expect(photo).toHaveAttribute("src", activeUrl);
      await mort.getByRole("button", { name: "Return token", exact: true }).click();
      await expect(photo).toHaveAttribute("src", neutralUrl!);
    }
  }

  expect(activeUrls.size).toBe(10);
  expect(profileUrls.size).toBe(10);
});

test("Mort early Finale handles 26 Health and a mixed-location Minor Power", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, {
    draft: {
      ...newGame,
      selection: { ...newGame.selection, location: "USS Konrad" },
      konradSetupVersion: 1,
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "mort");
  await openModule(page, "konrad");
  const minor = page.getByRole("region", { name: "Slippery Minor Dark Power" });
  await minor.getByRole("button", { name: "Reveal Slippery" }).click();
  await expect(
    minor.getByText("In play · no Health markers while Mort is disguised"),
  ).toBeVisible();
  await page
    .getByRole("region", { name: "Remember this" })
    .getByRole("button", { name: "Finale", exact: true })
    .click();
  await choose(page, "Confirmed disguise", "Ratchet Lady");
  await choose(page, "Dark Power", "Anonymous Terror");
  await page
    .getByRole("checkbox", {
      name: "The Terror deck is exhausted and I confirmed the disguise",
    })
    .check();
  await page.getByRole("button", { name: "Reveal Mort", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Set Killer health" }),
  ).toHaveText("26");
  await expect(minor.getByText("Not recorded", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Decrease Killer health" }).click();
  await expect(
    page.getByRole("button", { name: "Set Killer health" }),
  ).toHaveText("25");
  await page.getByRole("button", { name: "Increase Killer health" }).click();
  await expect(
    page.getByRole("button", { name: "Set Killer health" }),
  ).toHaveText("26");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const hero = page.getByRole("article", { name: "Mort Revealed" });
  await expect(hero).toHaveCSS("animation-name", "none");
  await hero.screenshot({ path: info.outputPath("early-reveal.jpg") });
  archive.autoImages = true;
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page.getByRole("button", { name: "Lost", exact: true }).click();
  await expect(
    page.getByText("Confirmed · Mort as Ratchet Lady", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Killer Health", exact: true }),
  ).toHaveValue("26");
  await page
    .getByRole("button", { name: "Generate ending", exact: true })
    .click();
  await expect
    .poll(
      () =>
        archive.generationRequests.find((r) => r.name === "generate-ending")
          ?.body.playSummary,
    )
    .toContain("Confirmed disguise: Mort as Ratchet Lady");
  await expect.poll(() => archive.history[0]?.killer_health).toBe(26);
});

test("every Mort Finale displays a distinct photograph with a readable caption", async ({
  page,
  archive,
}, info) => {
  test.setTimeout(120_000);
  await archive.install(page, { draft: newGame });
  await page.setViewportSize(
    info.project.name === "mobile"
      ? { width: 320, height: 568 }
      : { width: 1366, height: 768 },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "mort");
  const panel = page.getByRole("group", { name: "Mort investigation" });
  const srcs = new Set<string>();
  for (const { id, name } of MORT_SUSPECTS) {
    await panel
      .getByRole("button", { name: "Terror deck exhausted", exact: true })
      .click();
    await choose(page, "Confirmed disguise", name);
    await choose(page, "Dark Power", "Toxic Whispers");
    await panel
      .getByRole("checkbox", {
        name: "The Terror deck is exhausted and I confirmed the disguise",
      })
      .check();
    await panel
      .getByRole("button", { name: "Reveal Mort", exact: true })
      .click();
    const hero = panel.getByRole("article", { name: "Mort Revealed" });
    await expect(hero.getByRole("heading")).toHaveText(`Mort as ${name}`);
    const src = await hero.locator("img").evaluate(async (el) => {
      const image = el as HTMLImageElement;
      await image.decode();
      return image.currentSrc;
    });
    srcs.add(src);
    await hero.screenshot({
      path: info.outputPath(`${id}.jpg`),
      animations: "disabled",
      style: ".app-footer{visibility:hidden}",
    });
    await panel.getByRole("button", { name: "Undo last Mort change" }).click();
    await expect(hero).toHaveCount(0);
  }
  expect(srcs.size).toBe(10);
});
