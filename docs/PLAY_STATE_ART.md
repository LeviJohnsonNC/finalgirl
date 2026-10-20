# Play controls and visible game state

## Behavior

- Trackers read Final Girl health, Killer health, Bloodlust, Horror. Moments read Found a weapon/item, Dark Power, Finale, Ultimate unlocked, Ultimate used, Second wind, Back from the dead, Other moment. Verified card dropdowns remain alphabetical.
- Billy's Power sources initialize in one observation after tracking starts. Missing sources 1-4 become active; source 5 is set aside. Existing recorded values are preserved. This follows Billy across locations and never attaches to another killer merely visiting Buddyland. The fifth source is explicitly included, starts active, can be switched off without disappearing, and can be removed separately.
- New Dark Power, Finale and both return moments have an explicit `permanent: true` flag. Their first record persists; repeat clicks reopen optional details. Generic Undo skips them, timeline Undo is absent, and canonical reduction ignores attempts to undo locked records. Merged duplicate new records reduce to one milestone. Legacy undone moments remain undone. Ordinary moments and power-source changes remain correctable.
- The one-time source initialization cannot be undone and then accidentally recreated. Its administrative marker is excluded from narrative/death context. Source changes do not resolve health, healing or victory rules.
- Horror uses three images for 0-1, 2-6 and 7. Tracked health at 1-2 uses an alternate portrait treatment and critical overlay. Zero shows depleted health, not an inferred death or resurrection. Untracked fields remain optional and retain existing starting suggestions.
- Remember this has no icons; return moments explicitly identify Final Girl versus killer. Removed cycling instructions, counter reminders and character reference sections.

## Artwork and layout

Seventeen new optimized WebP assets total about 668 KiB. They are pre-generated assets: no AI call occurs when a counter, source or milestone changes. The original contact sheets are retained by the generation session. Game assets contain individual cropped cells only.

- Six moment stills: paired fallen/returning Final Girl, paired fallen/returning killer, activated Dark Power and Finale. Live-action generic adult characters and practical horror materials, not Buddyland-specific characters.
- Nine tracker/source cells: five distinct numbered-in-UI electrical source faces, one critical emulsion/crack overlay and three matching eye photographs. Power-off uses an unmistakable dim/desaturated treatment plus live Off text. Numbers and state labels are never baked into artwork.
- Two empty button surfaces: worn black/brass/teal and oxblood/brass. Nine-sliced frames preserve their corners as live text and icons resize. The existing IM Fell English font provides Play labels.

Desktop retains the current page structure. Phones use two columns for trackers/moments and three for sources. The header actions get their own row; below 360 pixels they become two rows, preserving readable text and touch targets. Main counter minus-button placement is preserved. Image shading is concentrated behind labels rather than covering entire images. Intentionally inactive silhouettes stay dark.

## Release

No SQL migration or new secret. Merge, then deploy these functions before publishing the frontend:

```sh
supabase functions deploy generate-death-scene
supabase functions deploy narrate-story
```

Both bundle the shared Play-log validator/reducer and must recognize the new source initialization field and permanent moment flag. Image-generation functions and the opening/poster model pipeline are unchanged.

## Verification

Unit coverage includes source initialization/recovery/fifth inclusion, independent killer/location ownership, failed writes, permanent milestone validation and detail edits, merged duplicates, preserved legacy Undo and exclusion of administrative metadata from death context.

Browser coverage checks default sources, repeated milestone clicks, protected Undo, reload persistence, all horror thresholds, both critical-health treatments, zero without invented resurrection, no Remember this icons and 320-pixel layout. Existing tests retain death cache/recovery, outcome review and discarded-session behavior. Guest history tests now await their existing async deletion operations so imports cannot continue after test teardown.

Verified locally: 262 unit tests, 64 edge checks, all 243 artwork files and the production build. All 228 browser cases were exercised across desktop/mobile; the final eight-case legacy timeline spec passed after updating its selection to an ordinary correctable observation. Lint has zero errors and nine existing React Refresh warnings.
