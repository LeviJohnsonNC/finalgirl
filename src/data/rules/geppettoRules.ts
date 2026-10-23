import {
  GEPPETTO_SOURCE,
  GEPPETTO_VISUAL,
  GEPPETTO_POWERS,
  GEPPETTO_MINOR_POWERS,
  GEPPETTO_FINALES,
  GEPPETTO_TERRORS,
} from "../../../supabase/functions/_shared/play/geppetto";
import type { EntityRuleModule, ModulePromptContext } from "./moduleRules";
const cards = (catalog: readonly { name: string; effect: string }[]) =>
  [...catalog]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => `${c.name}: ${c.effect}`);
export const geppettoRules: EntityRuleModule = {
  entity: "Geppetto",
  kind: "killer",
  filmId: "s1-carnival-of-blood",
  source: GEPPETTO_SOURCE,
  credits: {
    design: "A.J. Porfirio and Evan Derrick",
    art: "Vladyslava Ladkova",
  },
  seeAlso: ["minions", "final-health-token", "bloodlust"],
  tags: [
    "geppetto",
    "gepetto",
    "puppets",
    "minions",
    "ready",
    "exhausted",
    "strings",
    "dark power",
    "finale",
  ],
  setup: [
    {
      type: "list",
      ordered: true,
      items: [
        "Standard mode: Geppetto starts with 8 Health and Horror 4. Place Bloodlust at the bottom of the printed track. Follow normal Dark Power and Finale setup, including the Epic Dark Power only when chosen.",
        "Place the Puppets card beside the Killer board and all three Puppet tokens in its Ready space. The physical token pool is always three; the app’s token numbers are tracking labels, not official character names.",
        "Before the Finale is revealed: the Minion Action spawns one Puppet, targets a Victim, then moves. Geppetto’s Killer Action targets the closest Final Girl or Victim, then attacks. Resolve the separate lines in their printed order.",
        "Select the Location and its Setup/Event independently. Carnival of Blood rules do not follow Geppetto to another Location.",
      ],
    },
  ],
  rules: [
    { type: "heading", level: 3, text: "Puppet tray and spawning" },
    {
      type: "list",
      items: [
        "Puppets are Minions. There are only three physical tokens, distributed between Ready, the board and Exhausted. A killed Puppet goes to Exhausted; it is not permanently removed and is not a killed Victim.",
        "For the initial Minion Action, take one Ready Puppet and place it in Geppetto’s space. If none is Ready, do not spawn one. Then return all Exhausted tokens to Ready, whether a Puppet spawned or not. Never refresh the tray first.",
        "Normal Puppets have one Health, deal one damage and use Geppetto’s current printed Movement value. Use the active Power or Finale for exceptions. Tracking in the app never resolves attacks, kills, damage, Bloodlust or movement on the board.",
        "Terror cards can create other spawning instructions. They’re Coming from Everywhere! explicitly includes remaining tokens regardless of Ready/Exhausted status, if its condition is met. Remember Them? spawns all remaining Puppets when revealed. Record the physical placements deliberately; changing the selected card name does not apply these effects again.",
      ],
    },
    { type: "heading", level: 3, text: "Strings and distance" },
    {
      type: "paragraph",
      text: "A Puppet must end normal movement within two spaces of Geppetto. Its path may temporarily go farther away if it finishes within two spaces. If an effect leaves a Puppet farther away, its next target is Geppetto: stop once exactly two spaces away. If movement runs out sooner, repeat this process when it next chooses a target. Any movement left after it must stop is lost. No Strings Attached changes this restriction.",
    },
    { type: "heading", level: 3, text: "Resolving Minions" },
    {
      type: "paragraph",
      text: "Unless a Terror card specifically limits its action, each Puppet on the board resolves the full action one at a time, in your chosen order, then Geppetto resolves that action. This also applies to Location Terror cards. For printed Minion/Killer action lines, resolve the separate lines top-to-bottom. See core Minion rules for targeting, attacks and panic.",
    },
    { type: "heading", level: 3, text: "Dark Powers" },
    { type: "list", items: cards(GEPPETTO_POWERS) },
    {
      type: "callout",
      variant: "note",
      title: "Protection is conditional",
      text: "Immortal Master protects Geppetto’s Final Health token while all three physical Puppets are on the board; it is not general damage immunity. Join the Family requires all three Puppets in the Final Girl’s space during the Killer phase, which a simple on-board count cannot establish. Resolve Final Health tokens physically.",
    },
    { type: "heading", level: 3, text: "Minor Dark Powers" },
    { type: "list", items: cards(GEPPETTO_MINOR_POWERS) },
    {
      type: "paragraph",
      text: "Each Minor Dark Power has two separate Health markers. Remove Minor Dark Power Health before damaging Geppetto’s ordinary Health; discard a depleted Minor Dark Power. These markers are not part of his starting eight Health.",
    },
    { type: "heading", level: 3, text: "Finales" },
    { type: "list", items: cards(GEPPETTO_FINALES) },
    {
      type: "paragraph",
      text: "Once the Finale is revealed, stop using the pre-Finale spawning line. Follow that Finale’s action lines and special effects. I Made Your Friends lets Victims act as Puppets during the Killer phase only; it does not create additional physical Puppet tokens or automatically record casualties.",
    },
    { type: "heading", level: 3, text: "Terror cards" },
    { type: "list", items: cards(GEPPETTO_TERRORS) },
    {
      type: "callout",
      variant: "note",
      title: "Recorded observations",
      text: "The companion tracks what you record. Revealing a card is not proof that it injured anyone or resolved its effect. Use explicit token controls, recorded victim deaths and reviewed game totals. First-hit protection markers for Massive Abominations reset only when you explicitly start a new turn for them.",
    },
  ],
};
export const GEPPETTO_PROMPT_CONTEXT: ModulePromptContext = {
  narrativeGuidance:
    "Geppetto and his humanlike marionettes belong to the selected Location. Only recorded reveals and outcomes happened. Exhausted puppets are reusable, not permanently destroyed. Victims acting as Puppets retain their human identity. Do not invent teleportation or a Carnival setting.",
  visualGuidance: GEPPETTO_VISUAL,
  rulesSummary:
    "Geppetto starts at 8 Health and Horror 4. Three physical Puppets cycle Ready/on-board/Exhausted; a defeated Puppet is not a dead Victim. Normal Puppets have 1 Health, 1 damage and Geppetto’s Movement. Their movement must end within 2 spaces of him unless No Strings Attached was revealed. Immortal Master protects only his Final Health token while all 3 Puppets are on board; this is not general damage immunity. Join the Family requires all 3 Puppets in the Final Girl’s space during the Killer phase, not merely on board. I Made Your Friends makes Victims act as Puppets only in that phase. A reference card is not evidence of an active power or extra casualties.",
};
