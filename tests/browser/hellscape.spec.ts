import type { Page } from "@playwright/test";
import { newPlayEvent, summarizePlay, type PlayEvent } from "../../src/lib/play/events";
import { activeGame, expect, test, userId } from "./fixtures";
import { openHistory, openModule, searchPick, statusPick } from "./play-helpers";

const key = `final-girl-active-game-v1:${userId}`;
const selection = {...activeGame.selection, killer: "Razorface", location: "Hellscape",
  finalGirl: "Kenzie", filmId: "s3-hell-to-pay", setupScenario: "Depravity"};
const draft = {...activeGame, selection, playMode: true};
const start = newPlayEvent({kind: "start", saved: 1, killed: 0, round: 3});
const log = (page: Page) => page.evaluate(storageKey =>
  (JSON.parse(localStorage.getItem(storageKey)!).playEvents ?? []) as PlayEvent[], key);

async function resume(page: Page) {
  await page.getByRole("button", {name: "RESUME GAME", exact: true}).click();
  await openModule(page, "hellscape");
  return page.locator('[data-module="hellscape"]');
}

test("Casting offers the photographed setups and events for mixed casting", async ({page, archive}) => {
  archive.films = ["s1-camp-happy-trails", "s3-hell-to-pay"];
  await archive.install(page);
  await page.goto("/");
  await page.getByRole("button", {name: "START THE TAPE", exact: true}).click();
  for (const [index, name] of ["Hans", "Hellscape", "Kenzie"].entries()) {
    await page.getByRole("button", {name: "Choose", exact: true}).nth(index).click();
    await page.getByRole("dialog").getByRole("button", {name: new RegExp(name)}).click();
  }
  const setup = page.getByRole("combobox", {name: "Setup Scenario", exact: true});
  await setup.click();
  await expect(page.getByRole("option")).toHaveCount(5);
  await page.getByRole("option", {name: "Revelation", exact: true}).click();
  const event = page.getByRole("combobox", {name: "Starting Event", exact: true});
  await event.click();
  await expect(page.getByRole("option")).toHaveCount(10);
  await page.getByRole("option", {name: "Masochistic Peon", exact: true}).click();
  await expect(setup).toHaveText("Revelation");
  await expect(event).toHaveText("Masochistic Peon");
  await page.getByRole("button", {name: "Press Play", exact: true}).click();
  await expect.poll(() => archive.generationRequests.find(request => request.name === "generate-story")?.body).toMatchObject({
    location: {name: "Hellscape", description: expect.stringContaining("The Nexus")},
    startingSetup: {name: "Revelation", description: expect.stringContaining("eight tile Victims")},
    startingEvent: {name: "Masochistic Peon"},
  });
});

test("records a starting Victim and a later Event, retries and corrects after resuming", async ({page, archive}, info) => {
  await archive.install(page, {draft: {...draft, coreTrackersVersion: 1, razorfaceSetupVersion: 1,
    selection: {...selection, startingEvent: "Masochistic Peon"}, playEvents: []}});
  await page.goto("/");
  const module = await resume(page);
  const empty = await log(page);
  await expect(module.getByRole("button", {name: "Record Masochistic Peon", exact: true})).toBeVisible();
  await expect(module.locator(".hellscape-person")).toHaveCount(0);
  await module.screenshot({path: info.outputPath("hellscape-empty.png"), animations: "disabled"});
  await module.getByRole("button", {name: "Hellscape rules", exact: true}).click();
  const dialog = page.getByRole("dialog", {name: "Special Rules"});
  await expect(dialog.getByRole("tab", {name: "Rules", exact: true})).toHaveAttribute("aria-selected", "true");
  await expect(dialog.getByText(/Matching symbols: flip/)).toBeVisible();
  await dialog.screenshot({path: info.outputPath("hellscape-rules.png"), animations: "disabled"});
  await dialog.getByRole("tab", {name: "Setup", exact: true}).click();
  await expect(dialog.getByText("Top-right Exit", {exact: true})).toBeVisible();
  await dialog.getByRole("button", {name: "Close", exact: true}).click();
  expect(await log(page)).toEqual(empty);

  await module.getByRole("button", {name: "Record Masochistic Peon", exact: true}).click();
  await module.getByRole("button", {name: /Masochistic Peon Starting Event/}).click();
  await expect(module.getByText(/End of Action together/)).toBeVisible();
  await module.getByRole("button", {name: "Record Special Victim", exact: true}).click();
  await module.getByRole("button", {name: "Curious Wretch", exact: true}).click();
  await page.getByRole("button", {name: "Decrease Horror", exact: true}).click();
  const before = summarizePlay(await log(page));

  await page.evaluate(storageKey => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(name, value) {
      const event: PlayEvent | undefined = name === storageKey ? JSON.parse(value).playEvents?.at(-1) : undefined;
      if (event?.moduleData?.changes["person.wretch"] === "saved") {
        Storage.prototype.setItem = original;
        throw new Error("Test write failure");
      }
      return original.call(this, name, value);
    };
  }, key);
  const save = module.getByRole("button", {name: "Mark Curious Wretch saved", exact: true});
  await save.click();
  await expect(module.getByRole("alert")).toContainText("could not be saved");
  await expect(save).toBeVisible();
  await save.click();
  await expect(module.getByRole("status")).toHaveText(/Wretch saved/);
  const after = summarizePlay(await log(page));
  expect([after.saved, after.killed, after.finalHorrorLevel]).toEqual([before.saved, before.killed, before.finalHorrorLevel]);
  await page.reload();
  await resume(page);
  await module.getByText("Recorded outcomes", {exact: true}).click();
  const wretch = module.locator(".hellscape-person").filter({hasText: "Curious Wretch"});
  await expect(wretch).toHaveAttribute("data-state", "saved");
  await wretch.getByText("Change status", {exact: false}).click();
  await statusPick(page, wretch.getByRole("combobox", {name: "Curious Wretch status"}), "Killed");
  await expect(wretch).toHaveAttribute("data-state", "killed");
  await openHistory(page);
  await page.getByRole("button", {name: /^Undo Curious Wretch: killed/}).click();
  await expect(wretch).toHaveAttribute("data-state", "saved");
  expect(summarizePlay(await log(page)).finalHorrorLevel).toBe(before.finalHorrorLevel);
  expect((await log(page)).filter(event => event.moduleData?.changes["person.wretch"] === "saved")).toHaveLength(1);
  await page.getByRole("button", {name: "Finish game", exact: true}).click();
  await page.getByRole("dialog").getByRole("button", {name: "Lost", exact: true}).click();
  await page.getByRole("button", {name: "Generate ending", exact: true}).click();
  await expect(page.getByRole("region", {name: "Ending narration", exact: true})).toContainText(archive.endingText);
  expect(archive.generationRequests.find(request => request.name === "generate-ending")?.body.playSummary)
    .toEqual(expect.stringContaining("Curious Wretch: saved."));
  await page.screenshot({path: info.outputPath("hellscape-ending.png"), animations: "disabled"});
});

test("loaded artwork, actions and quiet disclosure fit the five viewport sizes", async ({page, archive}, info) => {
  await archive.install(page, {draft: {...draft, selection: {...selection, killer: "Hans"}, playEvents: [start,
    ...["peon", "wretch", "seeker"].map(id => newPlayEvent({kind: "module", moduleData: {module: "hellscape", changes: {['person.'+id]: "in-play"}}})),
  ]}});
  await page.goto("/");
  const module = await resume(page);
  await expect(page.locator('[data-module="razorface"]')).toHaveCount(0);
  const sizes = info.project.name === "mobile" ? [[320, 568], [390, 844]] : [[1280, 640], [1366, 768], [1440, 900]];
  for (const [width, height] of sizes) {
    await page.setViewportSize({width, height});
    const images = module.locator("img");
    await expect(images).toHaveCount(4);
    expect(new Set(await images.evaluateAll(async images => Promise.all(images.map(async element => {
      const image = element as HTMLImageElement;
      await image.decode();
      return image.currentSrc;
    })))).size).toBe(4);
    await expect(module.getByRole("button", {name: "Mark Sadistic Seeker killed"})).toBeVisible();
    expect(await module.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await module.screenshot({path: info.outputPath(`hellscape-${width}.png`), animations: "disabled",
      style: ".app-footer, [data-sonner-toaster] { visibility: hidden; }"});
    await module.getByRole("button", {name: "Hellscape rules", exact: true}).click();
    const dialog = page.getByRole("dialog", {name: "Special Rules"});
    const guide = dialog.locator(".hellscape-upkeep-guide");
    await expect(guide).toBeVisible();
    expect(await guide.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    await dialog.screenshot({path: info.outputPath(`hellscape-rules-${width}.png`), animations: "disabled"});
    await dialog.getByRole("button", {name: "Close", exact: true}).click();
  }
  await page.getByRole("button", {name: "Record one victim killed", exact: true}).click();
  await page.getByRole("button", {name: "Terror card", exact: true}).click();
  const death = page.getByRole("dialog");
  await death.getByRole("combobox", {name: "Terror card", exact: true}).click();
  await death.getByRole("option", {name: "Death Labyrinth", exact: true}).click();
  await searchPick(page, "Death location", "Sepulchre of Blood");
  await searchPick(page, "Victim name or role", "Sadistic Seeker");
  await death.screenshot({path: info.outputPath("hellscape-death.png"), animations: "disabled"});
  await death.getByRole("button", {name: "Gruesome Death", exact: true}).click();
  await expect(death.getByRole("region", {name: "Death scene text", exact: true})).toBeVisible();
  expect(archive.calls.filter(call => call === "generate-death-scene")).toHaveLength(1);
});
