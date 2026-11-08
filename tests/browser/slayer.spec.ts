import { test, expect, activeGame, userId } from "./fixtures";
import { chooseKillerCard, openModule, searchPick } from "./play-helpers";
import { summarizePlay, type PlayEvent } from "../../src/lib/play/events";
import { moduleState } from "../../src/lib/play/modules";
import { SLAYER_POWERS, SLAYER_FINALES, SLAYER_MINORS, SLAYER_TERRORS, slayerState } from "../../src/lib/play/slayer";

const key = `final-girl-active-game-v1:${userId}`;
const sizeMatrix = { desktop:[[1280,640],[1366,768],[1440,900]], mobile:[[390,844],[320,568]] };

test("Slayer records crossings, a Special Victim pull and one atomic Rift Collapse", async ({page,archive}, info) => {
  test.setTimeout(90000);
  await archive.install(page,{draft:{...activeGame, selection:{...activeGame.selection,killer:"Slayer",location:"Creech Manor"},
    coreTrackersVersion:1,slayerSetupVersion:1,playMode:true,playEvents:[]}});
  await page.goto("/");
  await page.getByRole("button",{name:"RESUME GAME",exact:true}).click();
  await openModule(page,"slayer");
  const panel = page.locator('[data-module="slayer"]');
  const tracker = panel.getByRole("article",{name:"Dimension Tracker"});
  const log = () => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).playEvents as PlayEvent[], key);
  await expect(tracker).toHaveAttribute("data-dimension","our");
  expect(summarizePlay(await log())).toMatchObject({killerHealth:11,finalHorrorLevel:4,bloodlust:0});
  const capture = async (name: string, width: number) => {
    await tracker.locator("img").evaluate(async (image: HTMLImageElement) => {image.loading="eager";await image.decode();});
    await tracker.screenshot({path:info.outputPath(`${name}-${width}.jpg`),type:"jpeg",style:".app-footer,[data-sonner-toaster]{visibility:hidden}"});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  };
  const sizes = sizeMatrix[info.project.name === "mobile" ? "mobile" : "desktop"];
  for (const [width,height] of sizes) {await page.setViewportSize({width,height});await capture("our",width);}
  await panel.getByRole("button",{name:"Add Special Victim",exact:true}).click();
  await panel.getByLabel("Role name (optional)").fill("Ghost Hunter");
  await panel.getByLabel("Observed dimension").selectOption("our");
  await panel.getByRole("button",{name:"Record marker",exact:true}).click();
  await panel.getByRole("button",{name:"Ghost Hunter · Our Dimension",exact:true}).click();
  await panel.getByRole("button",{name:"Pulled into Mirror",exact:true}).click();
  await expect(tracker).toHaveAttribute("data-dimension","our");
  await expect(panel.getByRole("button",{name:"Ghost Hunter · Mirror Dimension",exact:true})).toBeVisible();
  await tracker.getByRole("button",{name:"Enter Mirror Dimension",exact:true}).click();
  await expect(tracker).toHaveAttribute("data-dimension","mirror");
  for (const [width,height] of sizes) {await page.setViewportSize({width,height});await capture("mirror",width);}

  const remember = page.getByRole("region",{name:"Remember this",exact:true});
  await remember.getByRole("button",{name:"Finale",exact:true}).click();
  await expect(remember.getByRole("combobox",{name:"Finale card"})).toHaveCount(0);
  await chooseKillerCard(remember,"Finale","Interdimensional Rift Collapse");
  await expect(tracker).toHaveAttribute("data-dimension","mirror");
  await remember.getByRole("button",{name:"Record Rift Collapse",exact:true}).click();
  await expect(remember.getByRole("region",{name:"Rift Collapse preview"})).toContainText("Ghost Hunter");
  const beforeFailure = await log();
  await page.evaluate(k => {
    const set = Storage.prototype.setItem;
    Object.assign(window,{restoreSlayerWrites:()=>{Storage.prototype.setItem=set;}});
    Storage.prototype.setItem = function (name,value) {
      if (name === k) throw new Error("Synthetic full storage");
      return set.call(this,name,value);
    };
  },key);
  await remember.getByRole("button",{name:"Confirm Rift Collapse",exact:true}).click();
  await expect(remember.getByRole("alert")).toContainText("could not be saved");
  expect(await log()).toEqual(beforeFailure);
  await page.evaluate(() => (window as unknown as {restoreSlayerWrites:()=>void}).restoreSlayerWrites());
  await remember.getByRole("button",{name:"Confirm Rift Collapse",exact:true}).click();
  await expect(tracker).toHaveAttribute("data-dimension","our");
  await expect(panel.getByRole("button",{name:"Ghost Hunter · Our Dimension",exact:true})).toBeVisible();
  const entries = await log();
  expect(entries.filter(event => event.slayerAction?.command === "collapse")).toHaveLength(1);
  expect(summarizePlay(entries)).toMatchObject({killerHealth:11,finalHorrorLevel:4,bloodlust:0,killed:0,saved:0});
  for (const [width,height] of sizes) {await page.setViewportSize({width,height});await capture("collapsed",width);}
  await page.getByRole("button",{name:/The night so far/i}).click();
  const timeline = page.getByRole("region",{name:"Game timeline",exact:true});
  await timeline.getByRole("button",{name:/^Undo Rift Collapse recorded/}).click();
  await expect(tracker).toHaveAttribute("data-dimension","mirror");
  await timeline.getByRole("button",{name:/^Restore Rift Collapse recorded/}).click();
  await expect(tracker).toHaveAttribute("data-dimension","our");
  await remember.getByRole("button",{name:"Clear Finale card name",exact:true}).click();
  await page.reload();
  await page.getByRole("button",{name:"RESUME GAME",exact:true}).click();
  await openModule(page,"slayer");
  await expect(tracker).toContainText("Rift Collapse recorded");
  expect(slayerState(moduleState(summarizePlay(await log()).entries,"slayer"))).toMatchObject({collapsed:true,girl:"our",slayer:"our"});
});

test("Slayer card photography, Terror suggestions and cached death", async ({page,archive},info) => {
  test.setTimeout(120000);
  await archive.install(page,{draft:{...activeGame,selection:{...activeGame.selection,killer:"Slayer",location:"Sunnydaze Mall"},
    playMode:true,slayerSetupVersion:1,coreTrackersVersion:1,mallSetupVersion:1,playEvents:[]}});
  await page.goto("/");
  await page.getByRole("button",{name:"RESUME GAME",exact:true}).click();
  await openModule(page,"slayer");
  const panel = page.locator('[data-module="slayer"]');
  await expect(page.locator('[data-module="sunnydaze-mall"],[data-module="sunnydaze"]')).toHaveCount(1);
  await expect(panel.getByRole("button",{name:/Savior/})).toHaveCount(0);
  await panel.locator("details.module-card-section > summary").click();

  const seen = new Set<string>();
  const inspect = async (element: import("@playwright/test").Locator, id: string) => {
    const img = element.locator("img").first();
    const art = await img.evaluate(async node => {
      const image = node as HTMLImageElement;
      image.loading = "eager";
      await image.decode();
      return {src:image.getAttribute("src")!,width:image.naturalWidth};
    });
    if (art.src.startsWith("data:")) expect(art.width).toBe(288);
    else expect(art.src).toMatch(new RegExp("/" + id + "(?:-|[.])"));
    expect(seen.has(art.src)).toBe(false);
    seen.add(art.src);
    await element.screenshot({path:info.outputPath(id+".jpg"),type:"jpeg",quality:84,style:".app-footer,[data-sonner-toaster]{visibility:hidden}"});
  };
  await inspect(panel.locator(":scope > summary"),"slayer");
  for (const card of SLAYER_MINORS) {
    await inspect(panel.getByRole("button",{name:"Reveal " + card.name,exact:true}),card.id+"-thumb");
  }
  for (const [kind,cards] of [["Dark Power",SLAYER_POWERS],["Finale",SLAYER_FINALES]] as const) {
    const chooser = panel.getByRole("region",{name:kind + " selection"});
    for (const card of cards) {
      await inspect(chooser.getByRole("button",{name:"Choose " + card.name,exact:true}),card.id+"-thumb");
    }
    for (const card of cards) {
      await chooseKillerCard(panel,kind,card.name);
      await inspect(chooser.locator(".module-revealed-hero"),card.id);
    }
  }
  for (const card of SLAYER_MINORS) {
    const more = panel.getByRole("button",{name:"Add another Minor Power",exact:true});
    if (await more.isVisible()) await more.click();
    await panel.getByRole("button",{name:"Reveal " + card.name,exact:true}).click();
    await inspect(panel.getByRole("article",{name:card.name,exact:true}),card.id);
  }
  await chooseKillerCard(panel,"Finale","Interdimensional Rift Collapse");
  await panel.getByRole("button",{name:"Record Rift Collapse",exact:true}).click();
  await panel.getByRole("button",{name:"Confirm Rift Collapse",exact:true}).click();
  await expect(panel.getByRole("article",{name:"Dimension Tracker"})).toContainText("Rift Collapse recorded");
  const minor = SLAYER_MINORS[0].name;
  const remove = panel.getByRole("button",{name:`Remove one ${minor} health, heart 1`,exact:true});
  await remove.click();
  await remove.click();
  await expect(panel.getByRole("article",{name:minor,exact:true})).toContainText("Removed");
  await panel.getByRole("button",{name:`Restore one ${minor} health, heart 1`,exact:true}).click();

  await page.getByRole("button",{name:"Record one victim killed",exact:true}).click();
  const dialog = page.getByRole("dialog",{name:"Gruesome Death",exact:true});
  await dialog.locator(".play-cause-tile--terror").click();
  for (const card of SLAYER_TERRORS) {
    await searchPick(page,"Terror card",card.name);
    await inspect(dialog.locator(".play-cause-tile--terror"),card.id);
  }
  await dialog.getByRole("button",{name:"Gruesome Death",exact:true}).click();
  await expect(dialog.getByRole("region",{name:"Generated death scene"})).toContainText(archive.deathText);
  await dialog.getByRole("button",{name:"Save and exit",exact:true}).click();
  await page.getByRole("button",{name:"Latest death scene",exact:true}).click();
  await expect(dialog.getByRole("region",{name:"Generated death scene"})).toContainText(archive.deathText);
  expect(archive.calls.filter(name => name === "generate-death-scene")).toHaveLength(1);
});

test("Slayer finish review preselects Play and uses the saved override for the story and poster", async ({page,archive}) => {
  archive.autoImages = true;
  await archive.install(page,{draft:{...activeGame,selection:{...activeGame.selection,killer:"Slayer",location:"Falconwood"},
    playMode:true,slayerSetupVersion:1,coreTrackersVersion:1,playEvents:[]}});
  await page.goto("/");
  await page.getByRole("button",{name:"RESUME GAME",exact:true}).click();
  await openModule(page,"slayer");
  await page.getByRole("button",{name:"Enter Mirror Dimension",exact:true}).click();
  await page.getByRole("button",{name:"Finish game",exact:true}).click();
  await page.getByRole("button",{name:"Won",exact:true}).click();
  await page.getByRole("button",{name:"Confirm mission completed",exact:true}).click();
  const dimension = page.getByRole("group",{name:"Dimension at finish",exact:true});
  await expect(dimension.getByRole("radio",{name:"Mirror Dimension",exact:true})).toBeChecked();
  await dimension.getByRole("radio",{name:"Our Dimension",exact:true}).check();
  await page.reload();
  await page.getByRole("button",{name:"RESUME GAME",exact:true}).click();
  await expect(dimension.getByRole("radio",{name:"Our Dimension",exact:true})).toBeChecked();
  await page.getByRole("button",{name:"Generate ending",exact:true}).click();
  await expect.poll(()=>archive.generationRequests.find(request=>request.name==="generate-ending")?.body.slayerReview).toEqual({finalDimension:"our"});
  await expect.poll(()=>archive.generationRequests.find(request=>request.name==="generate-scene-image"&&request.body.sceneType==="ending")?.body.slayerReview).toEqual({finalDimension:"our"});
  await expect.poll(()=>archive.history[0]?.game_highlights).toContain("Ended in: Our Dimension");
});

test("Slayer rules fit a narrow screen and an old game keeps its unknown trackers", async ({page,archive},info) => {
  archive.films = ["s3-falconwood-files","s1-camp-happy-trails"];
  await archive.install(page,{draft:{...activeGame,selection:{...activeGame.selection,killer:"Slayer",location:"Falconwood",
    filmId:"s3-falconwood-files"},playMode:true,coreTrackersVersion:1,playEvents:[]}});
  await page.setViewportSize(info.project.name === "mobile" ? {width:320,height:568} : {width:1280,height:640});
  await page.goto("/");
  await page.getByRole("button",{name:"RESUME GAME",exact:true}).click();
  await openModule(page,"slayer");
  const tracker = page.getByRole("article",{name:"Dimension Tracker"});
  await expect(tracker).toHaveAttribute("data-dimension","unknown");
  await expect(tracker.getByRole("button",{name:"Enter Mirror Dimension",exact:true})).toHaveCount(0);
  const log = () => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).playEvents as PlayEvent[],key);
  expect(summarizePlay(await log()).killerHealth).toBeUndefined();

  await page.getByRole("button",{name:"Read story",exact:true}).click();
  await page.getByRole("button",{name:"Special Rules",exact:true}).click();
  const dialog = page.getByRole("dialog",{name:"Special Rules",exact:true});
  const reader = dialog.getByRole("tabpanel");
  await expect(reader).toContainText("11 Health");
  await dialog.getByRole("tab",{name:"Rules",exact:true}).click();
  await dialog.getByRole("combobox",{name:"Jump to topic"}).selectOption({label:"Bloodlust"});
  await expect(reader.getByRole("table").first()).toBeVisible();
  const overflow = await reader.evaluate(element =>
    [element,...Array.from(element.querySelectorAll(".rule-table-wrap,.rule-record-fields,dd"))].some(
      item => item.clientWidth > 0 && item.scrollWidth > item.clientWidth+1));
  expect(overflow).toBe(false);
  await dialog.screenshot({path:info.outputPath("slayer-rules.jpg"),type:"jpeg"});
});
