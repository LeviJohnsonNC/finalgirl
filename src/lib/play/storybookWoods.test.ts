import { describe, expect, it } from "vitest";
import { isActiveGame } from "@/lib/activeGame";
import { deathFacts, deathSignature } from "./death";
import { newPlayEvent, playStoryBeats, summarizePlay, validPlayLog, type PlayEvent } from "./events";
import { moduleState } from "./modules";
import { findPlayCard, suggestedDeathCards, playItems } from "./catalog";
import {
  WOODS, WOODS_MODULE, WOODS_BRIDGES, WOODS_EVENTS, WOODS_ITEMS, WOODS_PEOPLE, WOODS_SETUPS,
  WOODS_SPACES, WOODS_TERRORS, initialWoods, resolveWoodsAction, woodsMoonSpace, woodsParent,
  woodsState, type WoodsCommand,
} from "../../../supabase/functions/_shared/play/storybookWoods";

const selection = {location:WOODS,killer:"Hans",finalGirl:"Laurie"};
function table(startingEvent?: string) {
  const log: PlayEvent[] = [newPlayEvent({kind:"start",saved:0,killed:0,round:1})];
  const initial = initialWoods(startingEvent);
  if (initial) log.push(newPlayEvent({kind:"module",moduleData:{module:WOODS_MODULE,changes:initial}}));
  function add(command: WoodsCommand) {
    const entries = summarizePlay(log).entries;
    const action = {...command,parent:woodsParent(entries)};
    const changes = resolveWoodsAction(action,moduleState(entries,WOODS_MODULE),entries);
    if (!changes) return;
    const event = newPlayEvent({kind:"module",moduleData:{module:WOODS_MODULE,changes},woodsAction:action});
    log.push(event);
    return event;
  }
  return {log,add,state:()=>woodsState(moduleState(summarizePlay(log).entries,WOODS_MODULE))};
}

describe("Storybook Woods", () => {
  it("reconciles each printed component, keeps setup placements and scopes suggestions", () => {
    expect(WOODS_EVENTS).toHaveLength(10);
    expect(WOODS_TERRORS).toHaveLength(8);
    expect(WOODS_ITEMS.reduce((count,item) => count + ("quantity" in item ? item.quantity : 1),0)).toBe(18);
    expect(WOODS_SETUPS).toHaveLength(5);
    for (const setup of WOODS_SETUPS) {
      expect(Object.values(setup.victims).reduce((sum,n) => sum + n,0)).toBe(12);
    }
    expect(WOODS_BRIDGES).toHaveLength(3);
    expect(WOODS_SPACES.filter(space => "landing" in space)).toHaveLength(11);
    expect(suggestedDeathCards(selection,"event").map(card => card.name)).toEqual(["Pied Piper"]);
    expect(suggestedDeathCards(selection,"terror").filter(card => card.location === WOODS)).toHaveLength(3);
    expect(findPlayCard(selection,"event","Troll Bridge")?.name).toBe("Toll Bridge");
    expect(findPlayCard({...selection,location:"Camp Happy Trails"},"event","Pied Piper")).toBeUndefined();
    expect(playItems(WOODS)).toHaveLength(17);
    expect(woodsMoonSpace("  meadow ")).toBe("meadow");
    expect(woodsMoonSpace("Grandmother's House")).toBeUndefined();
  });

  it("seeds the six ongoing Events and keeps blank/one-shot sessions quiet", () => {
    expect(table().state()).toEqual({});
    expect(table("Fairy Ring").state()).toMatchObject({raft:false,toll:false,breadcrumb:"absent",hansel:"absent"});
    expect(table("Toll Bridge").state().toll).toBe(true);
    expect(table("Breadcrumb Path").state().breadcrumb).toBe("unrecorded-pair");
    expect(table("Primrose Flowers").state().primrose).toBe(true);
    for (const person of WOODS_PEOPLE) expect(table(person.name).state()[person.id]).toBe("in-play");
    for (const event of WOODS_EVENTS) expect(validPlayLog(table(event.name).log)).toBe(true);
  });

  it("rejects stale, forged, no-op and wrong-role actions, and recovers owner-ordered Undo", () => {
    const t = table("Toll Bridge");
    const raft = t.add({field:"raft",value:true})!;
    const hansel = t.add({field:"hansel",value:"replaced"})!;
    expect(t.add({field:"hansel",value:"replaced"})).toBeUndefined();
    expect(t.add({field:"piper",value:"replaced"})).toBeUndefined();
    expect(validPlayLog([...t.log,newPlayEvent({kind:"undo",target:raft.id})])).toBe(false);
    expect(validPlayLog(t.log.map(e => e === hansel ? {...e,moduleData:raft.moduleData} : e))).toBe(false);
    expect(validPlayLog(t.log.map(e => e === hansel ? {...e,woodsAction:{...e.woodsAction!,parent:"root"}} : e))).toBe(false);
    t.log.push(newPlayEvent({kind:"undo",target:hansel.id}));
    expect(t.state().hansel).toBe("absent");
    t.log.push(newPlayEvent({kind:"restore",target:hansel.id}));
    expect(t.state().hansel).toBe("replaced");
    expect(validPlayLog(t.log)).toBe(true);
    expect(summarizePlay(t.log)).toMatchObject({saved:0,killed:0});
    expect(isActiveGame({version:1,selection:{...selection,location:"Camp Happy Trails"},playEvents:t.log})).toBe(false);
  });

  it("keeps saved death context stable after a later undo, while preserving death edits and legacy hashes", async () => {
    const t = table();
    const legacy = newPlayEvent({kind:"killed",quantity:1,cause:"event",eventCard:"Pied Piper"});
    t.log.push(legacy);
    const legacyFacts = deathFacts(selection,t.log,legacy.id)!;
    const piper = t.add({field:"piper",value:"in-play"})!;
    const death = newPlayEvent({kind:"killed",quantity:1,cause:"event",eventCard:"Pied Piper",woodsReference:true});
    t.log.push(death);
    const original = deathFacts(selection,t.log,death.id)!;
    t.log.push(newPlayEvent({kind:"undo",target:piper.id}));
    expect(validPlayLog(t.log)).toBe(true);
    expect(t.state().piper).toBeUndefined();
    expect(await deathSignature(deathFacts(selection,t.log,death.id)!)).toBe(await deathSignature(original));
    expect(deathFacts(selection,t.log,legacy.id)).toEqual(legacyFacts);
    t.log.push(newPlayEvent({kind:"details",target:death.id,room:"Village"}));
    expect(deathFacts(selection,t.log,death.id)).toMatchObject({room:"Village",moduleContext:original.moduleContext});
    expect(deathFacts({...selection,location:"Camp Happy Trails"},t.log,death.id)).toBeNull();
  });

  it("keeps both owners' narrative context within budget", () => {
    const t = table("Breadcrumb Path");
    t.add({field:"breadcrumb",value:"dell-meadow"});
    t.log.push(newPlayEvent({kind:"module",moduleData:{module:"big-bad-wolf",changes:{mode:"track"}}}));
    const story = playStoryBeats(t.log,{...selection,killer:"Big Bad Wolf"});
    expect(story).toMatch(/Breadcrumb Path/);
    expect(story).toMatch(/Track/i);
    expect(story.length).toBeLessThanOrEqual(900);
  });
});
