import { useState } from "react";
import { newPlayEvent, summarizePlay } from "@/lib/play/events";
import { moduleState } from "@/lib/play/modules";
import {
  WOODS_MODULE, WOODS_PAIRS, WOODS_PEOPLE, resolveWoodsAction, woodsBreadcrumbLabel, woodsParent,
  woodsState, type WoodsCommand, type WoodsPersonStatus,
} from "../../../supabase/functions/_shared/play/storybookWoods";
import type { ControlsProps } from "./moduleDefinitions";
import { CharacterControl } from "./CharacterControl";
import { IllustratedTile } from "./IllustratedTile";
import { useModuleRecord } from "./useModuleRecord";
import { woodsArt } from "./woodsArt";
import "@/styles/play-storybook-woods.css";

const peopleStates = [
  {value:"absent",label:"Not in play"}, {value:"in-play",label:"In play"},
  {value:"saved",label:"Saved"}, {value:"killed",label:"Killed"}, {value:"left",label:"Left play"},
];
const hanselStates = [...peopleStates, {value:"replaced",label:"Replaced at Gingerbread House"}];
const crossings = [
  {field:"toll",title:"Toll Bridge",on:"Placed",off:"Not placed"},
  {field:"raft",title:"Raft landings",on:"Placed",off:"Not placed"},
] as const;

export function StorybookWoodsControls({events, onEvent, blocked}: ControlsProps) {
  const [choosing, setChoosing] = useState(false);
  const {record, message} = useModuleRecord(events, onEvent);
  const {entries} = summarizePlay(events);
  const module = moduleState(entries, WOODS_MODULE);
  const state = woodsState(module);
  const pathPresent = state.breadcrumb !== undefined && state.breadcrumb !== "absent";
  function commit(command: WoodsCommand) {
    if (blocked) return false;
    const action = {...command, parent: woodsParent(entries)};
    const changes = resolveWoodsAction(action, module, entries);
    return !!changes && record(newPlayEvent({kind:"module",moduleData:{module:WOODS_MODULE,changes},woodsAction:action}));
  }

  function toggle(field: "toll" | "raft" | "primrose", title: string, on: string, off: string) {
    const value = state[field];
    return (
      <article key={field} data-state={value === undefined ? "unknown" : value ? "active" : "inactive"}>
        <IllustratedTile className="module-control-tile" art={woodsArt(field === "primrose" ? field : `${field}-${value ? "on" : "off"}`)}
          title={title} status={value === undefined ? "Not recorded" : value ? on : off}
          aria-label={title} aria-pressed={value ?? "mixed"}
          onClick={() => commit({field,value:!value})} />
      </article>
    );
  }

  return (
    <fieldset className="woods-controls" disabled={blocked} aria-label="Storybook Woods observations">
      <section aria-label="Crossings">
        <h3>Crossings</h3>
        <div className="woods-grid">
          {crossings.map(({field,title,on,off}) => toggle(field,title,on,off))}
          <article data-state={pathPresent ? "active" : state.breadcrumb === "absent" ? "inactive" : "unknown"}>
            <IllustratedTile className="module-control-tile" art={woodsArt(pathPresent ? "breadcrumb" : "breadcrumb-off")}
              title="Breadcrumb Path" status={woodsBreadcrumbLabel(state.breadcrumb)}
              aria-label="Breadcrumb Path" aria-expanded={choosing} aria-controls="woods-breadcrumb-choices"
              onClick={() => setChoosing(!choosing)} />
            {choosing && (
              <div className="woods-choices" id="woods-breadcrumb-choices" role="group" aria-label="Breadcrumb pair">
                {([ ...WOODS_PAIRS, {id:"unrecorded-pair",label:"Pair not recorded"} ] as const).map(({id,label}) => (
                  <button key={id} aria-pressed={state.breadcrumb === id}
                    onClick={() => {if (commit({field:"breadcrumb",value:id})) setChoosing(false);}}>
                    {label}
                  </button>
                ))}
                {state.breadcrumb !== "absent" && <button className="play-text-action"
                  onClick={() => {if (commit({field:"breadcrumb",value:"absent"})) setChoosing(false);}}>Mark not placed</button>}
              </div>
            )}
          </article>
        </div>
      </section>
      <section data-module-control="event" aria-label="Ongoing effects">
        <h3>Ongoing effects</h3>
        <div className="woods-grid">{toggle("primrose","Primrose Flowers","Active","Inactive")}</div>
      </section>
      <section aria-label="Special Victims">
        <h3>Special Victims</h3>
        <div className="woods-grid">
          {WOODS_PEOPLE.map(({id,name}) => {
            const value = state[id];
            return (
              <CharacterControl key={id} name={name} value={value} present="in-play"
                art={woodsArt(value === "saved" || value === "killed" ? `${id}-${value}` : id)}
                states={id === "hansel" ? hanselStates : peopleStates} showRules={false} showStatusEditor={false}
                reactivateFrom={["absent"]} allowOutcomeCorrections
                outcomes={id === "hansel" ? ["saved","killed","left","replaced"] : ["saved","killed","left"]}
                onChange={status => status && commit({field:id,value:status as WoodsPersonStatus})} />
            );
          })}
        </div>
      </section>
      {message && <p role="status">{message}</p>}
    </fieldset>
  );
}
