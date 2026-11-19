import { activeGame, expect, test, userId } from "./fixtures";
import { openModule } from "./play-helpers";
import {
  summarizePlay,
  validPlayLog,
  type PlayEvent,
} from "../../src/lib/play/events";
import {
  MORT,
  MORT_SUSPECTS,
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
  await mort.getByRole("button", { name: "Record clue", exact: true }).click();
  await choose(page, "Clue number", "2");
  await choose(page, "Trait from the Viewer", "Favorite horror movie genre");
  await choose(page, "Mort does not have", "Comedy Horror");
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
  await choose(page, "Clue number", "2");
  await choose(page, "Trait from the Viewer", "Favorite horror movie genre");
  await choose(page, "Mort does not have", "Comedy Horror");
  await mort.getByRole("button", { name: "Apply clue", exact: true }).click();
  await choose(page, "Physically drawn suspect token", "Baghead");
  await mort.getByRole("button", { name: "Record draw" }).click();
  await expect(
    mort.getByText("Discard Baghead’s token and skip the Killer effect."),
  ).toBeVisible();
  await expect(lineup.getByText("Active Killer")).toHaveCount(0);
  await choose(page, "Physically drawn suspect token", "Hans");
  await mort.getByRole("button", { name: "Record draw" }).click();
  await expect(lineup.getByText("Active Killer")).toBeVisible();
  await mort.getByRole("button", { name: "Return token" }).click();
  for (const [number, names] of [
    [1, ["Krampus", "Dr. Fright"]],
    [3, ["Tormentor", "Geppetto"]],
    [4, ["Big Bad Wolf"]],
    [5, ["Razorface", "Ratchet Lady"]],
  ] as const) {
    await mort
      .getByRole("button", {
        name: number === 1 ? "Coerce" : "Record clue",
        exact: true,
      })
      .click();
    await choose(page, "Clue number", String(number));
    await mort.getByRole("button", { name: "Pick suspects" }).click();
    const choices = mort.getByRole("group", {
      name: "Pick suspects to rule out",
    });
    for (const name of names)
      await choices.getByRole("button", { name, exact: true }).click();
    await mort.getByRole("button", { name: "Apply clue", exact: true }).click();
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

test("every temporary Active Killer gets its own portrait and returns to the lineup photo", async ({
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

  for (const [index, suspect] of MORT_SUSPECTS.entries()) {
    const tile = lineup.locator(`[data-suspect="${suspect.id}"]`);
    const photo = tile.locator("img");
    const neutralUrl = await photo.getAttribute("src");

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

    if (index === 0) {
      await page.reload();
      await resume();
      await expect(tile.getByText("Active Killer", { exact: true })).toBeVisible();
      await expect(photo).toHaveAttribute("src", activeUrl);
    }

    await tile.screenshot({ path: info.outputPath(`${suspect.id}-active.jpg`) });
    await mort.getByRole("button", { name: "Return token", exact: true }).click();
    await expect(photo).toHaveAttribute("src", neutralUrl!);
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
