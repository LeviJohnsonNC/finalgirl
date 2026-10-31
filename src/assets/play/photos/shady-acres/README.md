# Shady Acres photographs

58 standalone candid 1980s-style photographs, generated October 31, 2026 for the location-only import. The approved existing location identity remains unchanged. These are environmental and character interpretations; decorative images never establish gameplay facts.

All runtime scenes are 1280×720 WebP, at most 160 KiB. The eight Curse chooser derivatives are 320×180, at most 35 KiB, and are used only while choosing. Every source is at least 1280×720; originals are never enlarged. No atlas, text baked into imagery, raw card-photo UI, shared portrait substitution or missing-image fallback.

`manifest.json` records all stable IDs, complete prompts, independent PNG names and SHA-256 digests, native dimensions, reference IDs, derivative paths, dimensions, byte counts and digests. Rebuild with `node scripts/shady-acres-photos.mjs /absolute/path/to/shady-art-generated.json` when the original generation index and PNGs are available. `npm run check:assets` verifies complete IDs, unique sources, every loaded derivative's actual dimensions and hashes, budgets and absence of orphan assets.

| IDs | Count | Mapping / visible meaning |
| --- | ---: | --- |
| header | 1 | Dedicated owner banner in `play/banners/shady-acres.webp` |
| child-1…child-3 | 3 | Stable individual identity; on-board / dimmed reusable on-card / unknown, always named in HTML |
| sacrifice-0…sacrifice-3 | 4 | Same altar with four progressively ominous photographic atmospheres; exact 0–3 markers stay in HTML and never imply casualties |
| omen-of-plague, decaying-earth, dark-fields, omen-of-death, malevolent-aura, chthonic-possession, omen-of-blood, gnarled-stalks | 8 | Ancient Curse chooser + wide recorded active/removed card; unknown name explicitly uses neutral header |
| sally, ralph, cultist and each -saved / -killed variant | 9 | Consistent adult identities and clothing; quiet aftermath for killed state. Left/not-in-play uses dimmed base |
| hungers, festering, shadow, ravens, fields, hatred, lurks | 7 | Other named Event causes. The three character Events reuse the correct person's base portrait |
| terror-kids, terror-chow, terror-knows, terror-rows, terror-gas, terror-belong, terror-nobody | 7 | Seven unique source faces; the duplicate Kids physical card shares its face scene |
| combine | 1 | Physical Combine presence and optional observed placement |
| field-west, field-southwest, field-south, field-north, field-inner-east, field-outer-east: each -base / -harvested | 12 | Six source-board natural Fields; before/after scenes preserve identifying landmarks. Effective Field uses base. Names are descriptive coordinate labels |
| hayfield, pasture: each -base / -field / -harvested | 6 | Natural open land, added Field state, harvested state; neither an Event reveal nor Item find automatically changes terrain |

Wide tiles use centered 16:9 derivatives and CSS `object-fit: cover; object-position: 50% 35%`. Children are 4:5 crops at desktop and wider 16:10 phone tiles to keep faces and labels readable; full source portraits retain head/shoulders in this crop. State labels, including unknowns and conflicting added/harvested tokens, remain separate HTML. Unknown observations are muted. Saved/killed adult states use their own scene; removed Curses are muted and explicitly labelled. No special dead-state artwork is assigned to reusable Children.

All eight Curse names remain legible in the muted four-column desktop / two-column phone chooser. A recorded Curse uses its full vivid scene; unused choices close after selection. Laptop/phone review covers 1280×640, 1366×768, 1440×900, 390×844 and 320×568, including depleted/unknown/removed/combined terrain states and all Death Event/Terror mappings. Evidence and release status: [import record](../../../../../docs/imports/shady-acres.md).
