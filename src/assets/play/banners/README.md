# Photographic module banners

Generated 2026-10-26 for Levi's request to replace illustrated killer/location module headers with candid photographic imagery. All ten current headers were inspected and needed the treatment. These are separate banner derivatives; supplied identity photos, card/state photos, Collection imagery, Rules and narrative facts remain intact.

Capture direction: physically convincing practical costumes/props and ordinary real locations, available light, restrained 1980s consumer 35mm colour-negative reproduction, subtle exposure-dependent grain, no painting/CGI or decorative ageing. Location banners never borrow a killer's identity. Scenes are thematic, not new events or observed gameplay.

Sources are one-column, five-row panoramic contact sheets. Actual visible panel boundaries were checked before cropping; generated rows are not uniformly tall. Each derivative removes 3px around its verified source rectangle, keeps native proportions, strips metadata, and encodes WebP quality 89 without stretching/upscaling. Per-banner budget 160KiB. `moduleBanners.ts` records focal crops so phones show the subject/landmark instead of an arbitrary centre crop.

| File | Source | Source y boundaries | Focal point |
| --- | --- | --- | --- |
| inkanyamba.webp | exec-ef4accb6-5dd1-42a6-87c9-28d674d0f1ae.png | 0–178 | 70% centre |
| hans.webp | same killer source | 178–356 | 70% centre |
| billy.webp | same killer source | 356–519 | 70% centre |
| geppetto.webp | same killer source | 519–669 | 70% centre |
| fright.webp | same killer source | 669–837 | 70% centre |
| groves.webp | exec-14c967de-146a-4cef-9301-109342c6394e.png | 0–205 | 70% centre |
| maple.webp | same location source | 205–370 | 70% centre |
| buddyland.webp | same location source | 370–537 | 80% centre |
| camp.webp | same location source | 537–685 | 80% centre |
| carnival.webp | same location source | 685–837 | 70% centre |

Both sources are 1879×837. Native derivatives are 1873px wide. Subject references: the supplied approved `src/assets/characters/ai/inkanyamba.png`; existing candid `photos/hans/0.webp`, `photos/billy/1.webp`, `photos/geppetto/0.webp`, `photos/fright/0.webp`; and `photos/groves-holy/0.webp`. Canonical mask/costume/weapon direction and location landmarks were checked in shared owner catalogs. Hans's pig mask remains rigid metal, his tool a sledgehammer; Geppetto has his dark coat/hat, red waistcoat and wooden puppets; Billy is a tangible animatronic; Fright has mustard work clothes and a pitchfork. The reference environments do not constrain mixed-film gameplay.

All headings, status, focus, expanded state and controls remain live HTML. Existing dark text scrims are retained. Review collapsed/expanded laptop and phone crops before release. This is a frontend/artwork release with no SQL, Edge Function or new secret changes.
