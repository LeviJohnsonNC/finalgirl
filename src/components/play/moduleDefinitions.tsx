import { moduleBanners } from "./moduleBanners";
import { GrovesControls } from "./GrovesControls";
import { InkanyambaControls } from "./InkanyambaControls";
import { MapleControls } from "./MapleControls";
import { MAPLE_HOUSES, MAPLE_EXITS, MAPLE_PEOPLE } from "../../../supabase/functions/_shared/play/maple";
import { CarnivalControls } from "./CarnivalControls";
import { carnivalSummary } from "@/lib/play/modules";
import { GeppettoControls } from "./GeppettoControls";
import { geppettoPuppetCounts } from "@/lib/play/modules";
import { summarizePlay, type PlayEvent } from "@/lib/play/events";
import { moduleState } from "@/lib/play/modules";
import {
  BUDDIES,
  SPECIAL_VICTIMS,
} from "../../../supabase/functions/_shared/play/buddyland";
import {
  CAMP_VICTIMS,
  HANS_MINOR_POWERS,
} from "../../../supabase/functions/_shared/play/camp";
import { BuddylandControls } from "./BuddylandControls";
import { CampControls } from "./CampControls";
import type { ModuleArt } from "./ModuleArtwork";
import { FrightControls } from "./FrightControls";

export interface ControlsProps {
  blocked?: boolean;
  setupScenario?: string | null;
  startingEvent?: string | null;
  killer: string;
  location: string;
  finalGirl: string;
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
}
type State = ReturnType<typeof moduleState>;
export type SharedControlCapability =
  | "character"
  | "event"
  | "reveals"
  | "minor-power";
interface Definition {
  capabilities: readonly SharedControlCapability[];
  id: "groves" | "inkanyamba" | "billy" | "hans" | "buddyland" | "camp" | "geppetto" | "carnival" | "fright" | "maple";
  owner: "killer" | "location";
  match: string;
  title: string;
  art: ModuleArt;
  summary: (state: State) => string;
  Controls: (props: ControlsProps) => React.ReactNode;
}
const peopleSummary = (
  state: State,
  ids: readonly { id: string }[],
  prefix: string,
  active: string,
) => {
  const recorded = ids.filter(
    (person) => state[`${prefix}.${person.id}`] !== undefined,
  );
  if (!recorded.length) return "No people recorded";
  const count = recorded.filter(
    (person) => state[`${prefix}.${person.id}`] === active,
  ).length;
  return `${count} in play · ${recorded.length} recorded`;
};
// Adding a module registers its owner, artwork and controls here. Location
// never determines the killer's controls (and vice versa).
export const moduleDefinitions: Definition[] = [
  {id:"groves",owner:"location",match:"Sacred Groves",title:"Inside Sacred Groves",art: moduleBanners.groves,capabilities:["character","event"],summary:state=>`Divine Wrath ${typeof state.wrath === "number" ? `${state.wrath}/10` : "not recorded"}${state.finaleRevealed ? " · Finale active" : ""}`,Controls:props=><GrovesControls {...props}/>},
  {id:"inkanyamba",owner:"killer",match:"Inkanyamba",title:"Inkanyamba · The Avenger",art: moduleBanners.inkanyamba,capabilities:["reveals","minor-power"],summary:state=>`Killer Wrath ${typeof state.wrath === "number" ? `${state.wrath}/10` : "not recorded"}`,Controls:props=><InkanyambaControls {...props}/>},
  { id:"maple", owner:"location", match:"Maple Lane", title:"Inside Maple Lane", art: moduleBanners.maple, capabilities:["character","event"], summary:state=>{
    const known=MAPLE_HOUSES.filter(h=>typeof state[`house.${h.id}`]==="boolean");
    const searched=known.filter(h=>state[`house.${h.id}`]===true).length;
    const blocked=MAPLE_EXITS.filter(e=>state[`exit.${e}`]===true).length;
    const knownExits=MAPLE_EXITS.filter(e=>typeof state[`exit.${e}`]==="boolean").length;
    const present=MAPLE_PEOPLE.filter(p=>state[`person.${p.id}`]==="in-play").length;
    return `${known.length?`${searched}/${known.length} recorded Houses searched`:"House searches not recorded"} · ${knownExits?`${blocked} blocked Exits (${knownExits}/4 recorded)`:"Exit status not recorded"}${state.fire&&state.fire!=="none"?" · Fire active":""}${present?` · ${present} people in play`:""}`;
  },Controls:props=><MapleControls {...props}/> },
  {id:"fright",owner:"killer",match:"Dr. Fright",title:"Dr. Fright · The Dream Doctor",art: moduleBanners.fright,capabilities:["reveals","minor-power"],summary:state=>state.sleep?`${state.sleep === "unknown"?"Sleep state not recorded":state.sleep === "asleep"?"Asleep":"Awake"}${state.mode === "digital"?` · Boiler Room ${state.progress}/4`:" · Physical cards"}`:"Sleep state not recorded",Controls:props=><FrightControls {...props}/>},
  {
    id: "geppetto",
    capabilities: ["reveals", "minor-power"],
    owner: "killer",
    match: "Geppetto",
    title: "Geppetto & his Puppets",
    art: moduleBanners.geppetto,
    summary: (state) => {
      const c = geppettoPuppetCounts(state);
      return c.recorded
        ? `${c.onBoard} on board · ${c.ready} ready · ${c.exhausted} exhausted`
        : "Puppet tray not recorded";
    },
    Controls: (props) => <GeppettoControls {...props} />,
  },
  {
    id: "billy",
    capabilities: ["reveals", "minor-power"],
    owner: "killer",
    match: "Billy the Bear",
    title: "Billy & his Buddies",
    art: moduleBanners.billy,
    summary: (state) => {
      const active = BUDDIES.filter(
        (b) => state[`buddy.${b.id}.status`] === "active",
      ).length;
      const recorded = BUDDIES.filter(b => state[`buddy.${b.id}.status`] !== undefined).length;
      const sources = [1, 2, 3, 4, 5].filter((id) =>
        ["active", "inactive"].includes(String(state[`source.${id}.status`])),
      );
      const on = sources.filter(
        (id) => state[`source.${id}.status`] === "active",
      ).length;
      return `${recorded ? `${active} ${active === 1 ? "Buddy" : "Buddies"} in play (${recorded}/${BUDDIES.length} recorded)` : "Buddies not recorded"} · ${sources.length ? `${on}/${sources.length} sources on` : "Sources not recorded"}`;
    },
    Controls: (props) => (
      <BuddylandControls {...props} part="killer" embedded />
    ),
  },
  {
    id: "hans",
    capabilities: ["reveals", "minor-power"],
    owner: "killer",
    match: "Hans",
    title: "Hans the Butcher",
    art: moduleBanners.hans,
    summary: (state) =>
      HANS_MINOR_POWERS.map((power) => {
        const health = state[`minor.${power.id}.health`];
        return `${power.name}: ${health === undefined ? "not recorded" : `${health}/2`}`;
      }).join(" · "),
    Controls: (props) => <CampControls {...props} part="killer" />,
  },
  {
    id: "buddyland",
    capabilities: ["character"],
    owner: "location",
    match: "Buddyland",
    title: "Inside Buddyland",
    art: moduleBanners.buddyland,
    summary: (state) =>
      peopleSummary(state, SPECIAL_VICTIMS, "victim", "on-board"),
    Controls: (props) => (
      <BuddylandControls {...props} part="location" embedded />
    ),
  },
  {
    id: "camp",
    capabilities: ["character", "event"],
    owner: "location",
    match: "Camp Happy Trails",
    title: "Inside Camp Happy Trails",
    art: moduleBanners.camp,
    summary: (state) => {
      const active = Object.entries(state).filter(
        ([key, value]) => key.startsWith("event.") && value === "active",
      ).length;
      return `${peopleSummary(state, CAMP_VICTIMS, "victim", "in-play")} · ${active} active effects`;
    },
    Controls: (props) => <CampControls {...props} part="location" />,
  },
  {
    id: "carnival",
    capabilities: ["character", "event"],
    owner: "location",
    match: "Carnival of Blood",
    title: "Inside Carnival of Blood",
    art: moduleBanners.carnival,
    summary: carnivalSummary,
    Controls: (props) => <CarnivalControls {...props} />,
  },
];
