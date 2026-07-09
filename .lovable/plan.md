## Plan: Wire up The Intruders official rules

The Intruders (killer, film `s2-knock-at-door`, *A Knock at the Door*) currently has no entry in `moduleRules.ts` — so it never appears in the Rulebook or the in-session Special Rules modal even though owners of the film should see it. The official sheet you uploaded also unlocks better AI narration/visuals and a small stats-tracker win. Here's what I'd change.

### 1. `src/data/rules/moduleRules.ts` — add `theIntruders` module (primary win)
New `EntityRuleModule` entry (kind: `killer`, filmId: `s2-knock-at-door`, source: "A Knock at the Door — Killer Sheet", credits: design Mike Martins / art Heather Vaughan). Transcribed verbatim from the sheet:

- **Setup** (list): place all 3 Killer meeples (red/black/gray) on the Killer start space; give each Killer their starting health including a Final Health token; place the **Active Killer** token on Trish's (Red) circle.
- **Rules**:
  - Intro paragraph: 3 Killers, only ONE is active at a time (the one with the Active Killer token) for boot/attack/place-Killer effects.
  - Heading **Changing the Active Killer** + numbered list of the 3 triggers (attack/item damage → that Killer becomes active; UP/DOWN arrow symbols move the token, wrapping top↔bottom and skipping dead Killers; when Active Killer dies, move to top-most living Killer).
  - Heading **Resolving "All Killers" Effects** — ignore Active Killer token, resolve top-to-bottom; token doesn't change.
  - Heading **Panic** — Victims in a space with ANY Killer panic if a Victim was killed that turn.
  - Heading **Minor Dark Powers** — apply to ALL Killers; damage lands on the Minor Dark Power card first.
  - Heading **Intruder Death & Final Health Tokens** + critical callout: if a Killer loses final health while another is alive, don't end the phase — lay meeple on its side, change Active Killer, finish the phase, THEN reveal the black Final Health token; blank = dead, health = replenish + white token + stand up. `+1 ♥` bonus only triggers once regardless of how many Killers are at final health.
  - `example` block for the **Active Killer Example** (Ginny/Trish/Baghead/Zeke/"They're Everywhere!" walkthrough from the third photo), condensed into 3–4 bullets.
- Add `theIntruders` to the `ENTITY_RULE_MODULES` export array so `Rules.tsx` picks it up automatically for owners of *A Knock at the Door*.

### 2. `moduleRules.ts` — add `getModulePromptContext` entry for The Intruders
So `NowPlaying` and `TheEnd` AI generation know how this killer actually works (right now they don't):
- **narrativeGuidance**: three coordinated home invaders (Trish/Red, Baghead/Gray, Zeke/Black), one is "active" at any moment but the others are stalking in parallel; emphasize hand-offs, flanking, and the moment one is downed but another steps in. Do not describe them as a single figure.
- **visualGuidance**: trio of masked suburban home-invaders (bag mask, red hood, third masked figure) in a lit cottage interior; if the game ended with a specific Active Intruder, feature that one prominently — otherwise show all three.
- **rulesSummary**: horde-style killer with an Active Killer token that shifts between three; dying members can be revived via Final Health tokens; damage from Minor Dark Powers is soaked by the card.

### 3. `src/data/killerSpecialRules.ts` — enrich Intruders narrative note
Replace the current generic 2-line note with the correct mechanics (three named Killers, Active Killer token, Final Health revival, cottage setting) so the intro/ending prompts already using `killerSpecialRules` produce accurate stories.

### 4. `src/components/GameOutcomeForm.tsx` — small tracker tweak
`activeIntruder` currently only tracks Baghead / Redhood / Zeke. The sheet confirms the Red Killer is **Trish**, and canonically the three names are **Trish, Baghead, Zeke** (Redhood is the color of Trish's meeple, not a separate character). I'll rename the third option to **Trish** and re-label to match the sheet. Existing highlights strings keep working.

### 5. Nothing changed
- No new UI, no new routes, no schema changes.
- `Rules.tsx` and `SpecialRulesModal` already render new modules automatically once `ENTITY_RULE_MODULES` includes them.
- No changes to edge functions — they already read `getModulePromptContext`.

### Files touched
- `src/data/rules/moduleRules.ts` (add module + prompt context, export)
- `src/data/killerSpecialRules.ts` (rewrite Intruders `narrativeNote`)
- `src/components/GameOutcomeForm.tsx` (Redhood → Trish in the 3-option radio)

Want me to also add an **Active Intruder at start** field, or keep it end-of-game only like today?