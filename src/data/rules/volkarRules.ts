import {
  VOLKAR,
  VOLKAR_SOURCE,
  VOLKAR_FINALES,
  VOLKAR_MINORS,
  VOLKAR_MOVEMENT,
  VOLKAR_POWERS,
  VOLKAR_TERRORS,
} from "../../../supabase/functions/_shared/play/volkar";
import type { EntityRuleModule } from "./moduleRules";

export const volkarRules: EntityRuleModule = {
  entity: VOLKAR,
  filmId: "s4-green-terror",
  kind: "killer",
  source: VOLKAR_SOURCE,
  credits: { design: "Evan Derrick", art: "Agnieszka Dabrowiecka" },
  tags: [
    "Volkar",
    "Volk’ar",
    "Track",
    "Origin",
    "Path",
    "blind attack",
    "cloak",
    "Movement",
    "Dakota",
    "Alois",
    ...[
      ...VOLKAR_FINALES,
      ...VOLKAR_POWERS,
      ...VOLKAR_MINORS,
      ...VOLKAR_TERRORS,
    ].map((c) => c.name),
  ],
  setup: [
    {
      type: "list",
      items: [
        "Start Concealed with 10 Health, Horror 4 and Bloodlust 0. Put two Track cards in the Action Tableau and the Attack Resolution card and its tokens nearby.",
        "Shuffle all 22 Movement cards. Deal one facedown as the Origin and leave room for five more. Put one Origin marker on this card and one at the Killer start. Place the Killer meeple on the Finale.",
      ],
    },
  ],
  rules: [
    { type: "heading", level: 3, text: "Killer phase and Bloodlust" },
    {
      type: "paragraph",
      text: "Use the state at the start of the Killer phase. Before the Finale, Concealed uses the upper row: add a face-up Movement card, then roll one die. On 1–4 raise Bloodlust by one. Visible uses the lower row: target the closest Final Girl or Victim, attack once and add a facedown Movement card.",
    },
    {
      type: "table",
      headers: ["Bloodlust", "Attack", "On entry"],
      rows: [
        ["0–3", "1", "At 1, +1 Horror"],
        ["4–7", "2", "At 4 reveal Dark Power. At 5, +1 Horror."],
        ["8–9", "3", "At 8, +2 Horror"],
        [
          "10",
          "4",
          "Overflow: recover 1 Health, then discard the next Terror card.",
        ],
      ],
    },
    { type: "heading", level: 3, text: "Building and resolving the Path" },
    {
      type: "list",
      items: [
        "Open eye: add a face-up Movement card. Crossed eye: add a facedown card. If Visible, she cloaks immediately. Mark her current space and the new Origin, then return her meeple to the Finale. Reshuffle the Movement discards only when a draw needs a new deck.",
        "The purple cluster of eyes resolves the Path. A sixth card also triggers resolution after completing the current card or action, even if the row passes six. A concealed attack with positive potential damage triggers resolution. Turning cards face up with Track alone leaves her Concealed.",
        "Place the meeple at the Origin even if it has become inaccessible. Return both Origin markers to the deck. Starting there, reveal and resolve Movement cards in order. Follow movement restrictions at the selected location and the printed targeting and attack lines. Resolve Final Health after the entire Path. Discard the resolved row and leave her Visible at its endpoint. Do not inspect the Movement discard pile.",
        "While Concealed use the Origin for relative placement or distance. Ignore effects placing the Killer. Treat a Killer Action line on another card as a crossed eye. Victims skip Panic-phase panic. Resolve explicit panic instructions on cards.",
      ],
    },
    { type: "heading", level: 3, text: "Track and blind attacks" },
    {
      type: "paragraph",
      text: "Each Track costs two Time to buy. Three stars reveal the Origin or two other cards. Two stars reveal two non-Origin cards. One star reveals one non-Origin card. Failure raises Horror by one and adds a facedown card.",
    },
    {
      type: "paragraph",
      text: "Choose an in-range space, place the Attack token and resolve the attack. Mark potential damage on Attack Resolution. At zero, she stays Concealed and her Path stays in place. Otherwise resolve the Path. If she ends in the targeted space, apply the damage. If she ends elsewhere, discard the damage and apply the last card’s Ambush Penalty to the Final Girl regardless of who attacked. If you targeted your own space, she ended there and the last card attacks, both attacks happen simultaneously. Clear the tokens.",
    },
    { type: "heading", level: 3, text: "Movement deck" },
    {
      type: "paragraph",
      text: "Numbered movement follows the indicated panic direction for one space. For destination cards use the closest eligible space, exclude the current space and apply the printed tie-break. Attack lines target the closest Final Girl or Victim.",
    },
    {
      type: "table",
      headers: ["Movement and tie-break", "Attacks", "Ambush Penalty"],
      rows: VOLKAR_MOVEMENT,
    },
    ...[
      { heading: "Dark Powers", cards: VOLKAR_POWERS },
      { heading: "Minor Dark Powers", cards: VOLKAR_MINORS },
      { heading: "Finales", cards: VOLKAR_FINALES },
    ].map(({ heading, cards }) => ({
      type: "table" as const,
      headers: [heading, "Effect"],
      rows: cards.map((c) => [
        c.name + ("epic" in c && c.epic ? " (Epic)" : ""),
        c.effect,
      ]),
    })),
    {
      type: "table",
      headers: ["Terror", "Copies", "Effect"],
      rows: VOLKAR_TERRORS.map((c) => [c.name, String(c.quantity), c.effect]),
    },
  ],
};
