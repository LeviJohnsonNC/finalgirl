import {
  MORT_MODULE,
  mortEventKind,
  mortParent,
  type MortAction,
  type MortCommand,
} from "../../../supabase/functions/_shared/play/mort";
import { newPlayEvent, type PlayEvent } from "./events";

export function mortEvent(command: MortCommand, entries: readonly PlayEvent[]) {
  const mortAction: MortAction = { ...command, parent: mortParent(entries) };
  const kind = mortEventKind(mortAction);
  return newPlayEvent({
    kind,
    mortAction,
    moduleData: { module: MORT_MODULE, changes: { recorded: true } },
    ...(kind === "module" ? {} : { quantity: 1, victim: "Informant" }),
    ...(kind === "killed" ? { mortReference: true, cause: "unspecified" } : {}),
  });
}
