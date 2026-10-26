# Original Collection print illustrations

Generated on 2026-10-25 for Levi's approved Collection reference, attachment `file_00000000c89481fdbdb6a7246cbcc11f`. Each named release has its own original carved-ink / screenprint scenery. These are decorative film-card compositions, not new character identities or verified board layouts. Title lettering, descriptions, metadata, ownership and state remain HTML. Source box art and all original identity images are unchanged.

Sources are original generation filenames; row order is top to bottom. Three-row sheets were cut at equal-height boundaries with a 2px inset to exclude seam artifacts. The two-row teaser sheet uses the same method. Scenes are exported as individual quality-84 WebPs, at most 960px wide, and lazy-loaded separately. No complete sheet is downloaded by the UI.

| Shipped scene(s) | Generated source |
| --- | --- |
| `happy-trails` | `exec-3f162d8e-d77b-4ca6-88d2-0819dd1c4c0a.png` |
| `buddyland` | `exec-c583ef0b-49d7-4fad-bb8c-cbda5d3c7d2c.png` |
| `void` | `exec-0241bc0a-5231-479b-a5b0-807056987fd1.png` |
| `sacred-groves` | `exec-7c7ef759-5d22-4ad6-b193-476b3e4b19d6.png` |
| `creech-manor` (row 1), `carnival` (row 3) | `exec-b6268088-2aeb-49f6-a4aa-0667aea6a900.png` |
| `maple-lane`, `birds`, `station` | `exec-55a59404-ddfa-4ff5-bcee-4e516c37a4f1.png` |
| `asylum`, `full-moon`, `cottage` | `exec-c0537664-8fe6-493f-8db0-8ccbfd79bd2c.png` |
| `grave`, `falconwood`, `mall` | `exec-700c546c-d2f6-4dec-8895-83d9fa8b3e31.png` |
| `hellscape`, `warehouse`, `utopia` | `exec-5eaa0f62-920e-427c-979c-52066de1e8e0.png` |
| `destiny`, `convention`, `harvest` | `exec-b4725f85-76b7-46f5-b83e-15cfe80e63ca.png` |
| `upcoming-shadows`, `upcoming-green` | `exec-b97cbcf9-5608-47f7-9b47-83f941f08a2e.png` |

`src/data/collectionArt.ts` maps stable film IDs to scenes, colors, and authored live-text title line breaks/scales. Every catalog entry must be covered; unit tests check names and uniqueness. The title fonts reuse the bundled Caveat, Barlow Condensed and IM Fell licenses. Never bake controls or text into an illustration.

`npm run images:collection` regenerates cover/portrait derivatives using ImageMagick. Uniform empty cover margins are trimmed only in the derivative; the entire actual box stays visible with `object-fit: contain`. Portraits remain small full-image derivatives with CSS display crops; opening the modal loads the original selected portrait. The existing official/AI preference selects the corresponding derivative by source URL, including the separately supplied Buddyland cover.

Budget: every scene ≤200KiB and portrait derivative ≤30KiB, enforced by `check:assets`. Missing scene images leave readable card content; missing covers show Cover unavailable; missing portrait crops show an initial while the named info button remains usable. Reload or a changed source preference can retry an image.
