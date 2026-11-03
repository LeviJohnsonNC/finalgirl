import { test, expect, activeGame, userId } from "./fixtures";
import type { Locator, TestInfo } from "@playwright/test";
import { openModule, searchPick } from "./play-helpers";
import { summarizePlay, type PlayEvent } from "../../src/lib/play/events";

const key = `final-girl-active-game-v1:${userId}`;
const sizes = {desktop:[[1280,640],[1366,768],[1440,900]],mobile:[[390,844],[320,568]]};

async function inspectPhoto(tile: Locator, asset: string, info: TestInfo) {
  const img = tile.locator("img").first();
  await expect(img).toHaveAttribute("src",new RegExp(`/${asset}(?:-|\\.)`));
  await img.evaluate(async node => {await (node as HTMLImageElement).decode();});
  await tile.screenshot({path:info.outputPath(`${asset}.jpg`),type:"jpeg",quality:85,animations:"disabled",style:".app-footer{visibility:hidden}"});
}

test("Storybook Woods crossings and Special Victims in the actual Play panel", async ({page,archive}, info) => {
  test.setTimeout(90000);
  await archive.install(page,{draft:{...activeGame,playMode:true,woodsSetupVersion:1,wolfSetupVersion:1,coreTrackersVersion:1,playEvents:[],
    selection:{...activeGame.selection,killer:"Big Bad Wolf",location:"Storybook Woods",startingEvent:"Breadcrumb Path"}}});
  await page.goto("/");
  await page.getByRole("button",{name:"RESUME GAME",exact:true}).click();
  await openModule(page,"storybook-woods");
  const panel = page.locator('[data-module="storybook-woods"]');
  await expect(panel.locator(".play-tile-state").getByText("Placed · Pair not recorded")).toBeVisible();
  const breadcrumb = panel.getByRole("button",{name:"Breadcrumb Path",exact:true});
  const toll = panel.getByRole("button",{name:"Toll Bridge",exact:true});
  const raft = panel.getByRole("button",{name:"Raft landings",exact:true});
  await inspectPhoto(toll,"toll-off",info);
  await inspectPhoto(raft,"raft-off",info);
  await inspectPhoto(breadcrumb,"breadcrumb",info);
  await breadcrumb.click();
  await panel.getByRole("button",{name:"Mark not placed",exact:true}).click();
  await inspectPhoto(breadcrumb,"breadcrumb-off",info);
  await breadcrumb.click();
  for (const pair of ["Dell ↔ Meadow","Dell ↔ Clearing","Meadow ↔ Clearing"]) {
    await panel.getByRole("button",{name:pair,exact:true}).click();
    await expect(panel.locator(".play-tile-state").filter({hasText:pair})).toHaveCount(1);
    await panel.getByRole("button",{name:"Breadcrumb Path",exact:true}).click();
  }
  await panel.getByRole("button",{name:"Breadcrumb Path",exact:true}).click();
  await toll.click();
  await raft.click();
  const primrose = panel.getByRole("button",{name:"Primrose Flowers",exact:true});
  await primrose.click();
  await inspectPhoto(toll,"toll-on",info);
  await inspectPhoto(raft,"raft-on",info);
  await inspectPhoto(primrose,"primrose",info);
  for (const [name,id] of [["Hansel","hansel"],["The Woodsman","woodsman"],["Pied Piper","piper"]]) {
    await panel.getByRole("button",{name:`Add ${name}`,exact:true}).click();
    const portrait = panel.getByRole("button",{name,exact:true});
    await inspectPhoto(portrait,id,info);
    for (const status of ["killed","saved"]) {
      await panel.getByRole("button",{name:`Mark ${name} ${status}`,exact:true}).click();
      await inspectPhoto(portrait,`${id}-${status}`,info);
    }
  }
  await panel.getByRole("button",{name:"Mark Hansel replaced",exact:true}).click();
  await expect(panel.getByRole("button",{name:"Mark Hansel replaced",exact:true})).toHaveAttribute("aria-pressed","true");
  await panel.getByRole("button",{name:"Mark Hansel saved",exact:true}).click();
  const events: PlayEvent[] = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).playEvents,key);
  expect(summarizePlay(events)).toMatchObject({saved:0,killed:0,bloodlust:0});
  await page.reload();
  await page.getByRole("button",{name:"RESUME GAME",exact:true}).click();
  await openModule(page,"storybook-woods");
  await expect(panel.getByRole("button",{name:"Raft landings",exact:true})).toHaveAttribute("aria-pressed","true");
  for (const [width,height] of sizes[info.project.name === "mobile" ? "mobile":"desktop"]) {
    await page.setViewportSize({width,height});
    await panel.locator("img:visible").evaluateAll(async images => Promise.all(images.map(el => {
      const img=el as HTMLImageElement;
      img.loading="eager";
      return img.decode();
    })));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await toll.evaluate(tile => {
      const rect = tile.getBoundingClientRect();
      const caption = tile.querySelector(".play-tile-caption")!.getBoundingClientRect();
      return rect.height >= 44 && caption.top >= rect.top && caption.bottom <= rect.bottom;
    })).toBe(true);
    await panel.screenshot({path:info.outputPath(`woods-${width}.jpg`),type:"jpeg",quality:85,animations:"disabled",style:".app-footer{visibility:hidden}"});
  }
});

test("blank and legacy Woods games stay unknown, and a rejected choice remains retryable", async ({page,archive}) => {
  await archive.install(page,{draft:{...activeGame,playMode:true,playEvents:[],
    selection:{...activeGame.selection,killer:"Hans",location:"Storybook Woods",startingEvent:"Pied Piper"}}});
  await page.goto("/");
  await page.getByRole("button",{name:"RESUME GAME",exact:true}).click();
  await openModule(page,"storybook-woods");
  const panel = page.locator('[data-module="storybook-woods"]');
  await expect(panel.getByRole("button",{name:"Toll Bridge",exact:true})).toHaveAttribute("aria-pressed","mixed");
  await expect(panel.getByRole("button",{name:"Add Pied Piper",exact:true})).toBeVisible();
  await panel.getByRole("button",{name:"Breadcrumb Path",exact:true}).click();
  const stored = await page.evaluate(k => localStorage.getItem(k),key);
  await page.evaluate(k => {
    const set = Storage.prototype.setItem;
    (window as unknown as {restoreWoodsStorage:()=>void}).restoreWoodsStorage = () => {Storage.prototype.setItem=set;};
    Storage.prototype.setItem = function(name,value) {
      if (name === k) throw new Error("Synthetic full storage");
      return set.call(this,name,value);
    };
  },key);
  await panel.getByRole("button",{name:"Dell ↔ Clearing",exact:true}).click();
  await expect(panel.getByRole("status")).toContainText("could not be saved");
  await expect(panel.getByRole("button",{name:"Dell ↔ Clearing",exact:true})).toBeVisible();
  expect(await page.evaluate(k => localStorage.getItem(k),key)).toBe(stored);
  await page.evaluate(() => (window as unknown as {restoreWoodsStorage:()=>void}).restoreWoodsStorage());
  await panel.getByRole("button",{name:"Dell ↔ Clearing",exact:true}).click();
  await expect(panel.locator(".play-tile-state").getByText("Dell ↔ Clearing")).toBeVisible();
  await page.getByRole("button",{name:/^The night so far/}).click();
  const timeline = page.getByRole("region",{name:"Game timeline",exact:true});
  await timeline.getByRole("button",{name:/^Undo .*Breadcrumb Path/}).click();
  await expect(panel.getByRole("button",{name:"Breadcrumb Path",exact:true})).toContainText("Not recorded");
  await timeline.getByRole("button",{name:/^Restore .*Breadcrumb Path/}).click();
  await expect(panel.locator(".play-tile-state").getByText("Dell ↔ Clearing")).toBeVisible();

  const remember = page.getByRole("region",{name:"Remember this",exact:true});
  await remember.getByRole("button",{name:"Other moment",exact:true}).click();
  await remember.getByRole("button",{name:"Record Fairy Ring disappearance",exact:true}).click();
  const events: PlayEvent[] = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).playEvents,key);
  const summary = summarizePlay(events);
  expect(summary.killed).toBe(0);
  expect(summary.bloodlust).toBeUndefined();
  expect(summary.entries.some(e => e.kind === "moment" && e.detail?.includes("Fairy Ring"))).toBe(true);
});

test("all Woods death photos and the cached Piper take work in a mixed game", async ({page,archive},info) => {
  await archive.install(page,{draft:{...activeGame,playMode:true,woodsSetupVersion:1,playEvents:[],
    selection:{...activeGame.selection,killer:"Hans",location:"Storybook Woods",startingEvent:"Pied Piper"}}});
  await page.goto("/");
  await page.getByRole("button",{name:"RESUME GAME",exact:true}).click();
  await page.getByRole("button",{name:"Record one victim killed",exact:true}).click();
  const dialog = page.getByRole("dialog",{name:"Gruesome Death",exact:true});
  const terror = dialog.locator(".play-cause-tile--terror");
  const event = dialog.locator(".play-cause-tile--event");
  await terror.click();
  await searchPick(page,"Terror card","Getting Treats for Grandmother");
  await inspectPhoto(terror,"treats",info);
  await searchPick(page,"Terror card","Out of the Woods");
  await inspectPhoto(terror,"out",info);
  await searchPick(page,"Terror card","The Full Moon Is Out");
  await inspectPhoto(terror,"storybook-woods",info);
  for (const space of ["Clearing","Meadow","Glen"]) {
    await searchPick(page,"Death location",space);
    await inspectPhoto(terror,`moon-${space.toLowerCase()}`,info);
  }
  await event.click();
  await searchPick(page,"Death event card","Pied Piper");
  await inspectPhoto(event,"piper",info);
  await searchPick(page,"Death location","Village");
  await dialog.getByRole("button",{name:"Gruesome Death",exact:true}).click();
  await expect(dialog.getByRole("region",{name:"Generated death scene"})).toContainText(archive.deathText);
  await dialog.getByRole("button",{name:"Save and exit",exact:true}).click();
  await openModule(page,"storybook-woods");
  await page.locator('[data-module="storybook-woods"]').getByRole("button",{name:"Mark Pied Piper saved",exact:true}).click();
  await page.getByRole("button",{name:"Latest death scene",exact:true}).click();
  await expect(dialog.getByRole("region",{name:"Generated death scene"})).toContainText(archive.deathText);
  expect(archive.calls.filter(call => call === "generate-death-scene")).toHaveLength(1);
});
