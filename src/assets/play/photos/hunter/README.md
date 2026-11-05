# Hunter photography

Seventeen independent original photographs generated with the built-in image generator on 2026-11-05. The existing `characters/ai/the-hunter.png` supplies Mark V’s burgundy hood, dark visor and blue leather costume. The female Mark X in the owner's Relentless Pursuit card (H5) supplies her pale face, dark bob/bangs, fitted dark shirt and trousers. The approved Inkanyamba photograph supplies photographic material/exposure quality, not Hunter identity or setting. Existing casting/Collection portraits are retained.

Every runtime image comes from an independent full native source, never an enlarged contact-sheet crop. `manifest.json` records original filenames/digests, native resolution, derivative dimensions, runtime digest/size and chooser thumbnails. Generated originals were inspected before deriving the UI assets. Labels, rules, counters and interaction remain HTML. These decorative corridors establish no location, injury, repair, equipment or casualties in a game.

## Prompt set and mapping

Common prompt: one physically believable, unposed 1980s consumer 35mm photograph of real practical costumes, objects and locations; coherent available fluorescent light, ordinary materials and wear, natural exposure, restrained grain, no drawing, CGI, polished fashion poses, teal/orange grading, decorative scratches, typography, logos, panels or borders. Keep identifying features and props within safe crop space. Mark V and Mark X must remain different figures. Each row below is a separately generated scene, not a visual alias.

| ID | Scene / visible physical state | Runtime / crop |
| --- | --- | --- |
| header | Distant full-body Mark V on the right; dark empty corridor on the left. Regenerated after the first real header crop clipped the visor. Full hood in the top quarter. | `../../banners/hunter.webp`, 1680×560, 79% 0%; shallow laptop header and phone crop. |
| mark-v | Active original pursuer, dark visor, burgundy hood, leather jacket, gun lowered. | 1120×746; stable model card and initial core tracker. |
| mark-v-shutdown | Inert seated model, head slumped and visor dark, disconnected component nearby. | 1120×746; visibly different physical state, additionally dimmed when inactive. |
| mark-v-ally | Repaired model stands protectively; service connector visible on wrist. | 1120×746; vivid while Ally alive. |
| mark-v-destroyed | Inert broken practical mechanical prop, detached mechanical forearm, damaged visor, no human gore. | 1120×746; retained model card, honest permanent-destruction label. |
| mark-x | Separate female android with straight dark bob/bangs, dark fitted clothes and boots, advancing through corridor. | 1120×746; stable model card, Mark X core tracker and historical killer-death tile. |
| titanium-tissue | Physical mesh and service seam inside Mark V’s wrist; face-free female hands with a screwdriver. | 1120×630 hero, 288×162 choice. |
| cybernetic-agility | Mark V stepping over a low metal rail in a real stairwell. | 1120×630 hero, 288×162 choice. |
| reinforced-endoskeleton | Practical machined shoulder and reinforced frame under damaged jacket, no gore. | 1120×630 hero, 288×162 choice. |
| minigun | Mark V with unmistakable rotary-barrel minigun, real metal barrel cluster and belt. | 1120×630 hero, 288×162 Epic choice. |
| relentless-pursuit | Mark X passes inert mechanical debris without breaking stride. | 1120×630 hero, 288×162 choice. |
| termination-mode | Mark X advances through doorway, practical forearm blade visible. | 1120×630 hero, 288×162 choice. |
| adaptive-ai | Distinct Mark X studies hooded Mark V; both faces/silhouettes readable. | 1120×630 hero, 288×162 choice. |
| titanium-shield | Battered titanium plate integrated beneath open leather jacket. | 1120×630 hero, 288×162 choice; shared live/spent jeweled hearts. |
| advanced-ai | Opaque visor reflects small real cabinet indicator lights, no holograms. | 1120×630 hero, 288×162 choice; shared hearts. |
| counter-measures | Small practical metal hexagonal devices on corridor floor. | 1120×630 independent presence tile. |
| shock-awe | Physical lamp glare behind Mark V; face-free female hand braced on wall. | 1120×630 independent presence tile. |

Maximum main-photo budget 160 KiB; choice thumbnails 35 KiB. No upscaling. The five model states retain equal layout areas; two models stay in the same order. On phones model frames become 4:5; named cards remain wide and inactive choices stay compact. Individual original prompts combine the common direction with the scene description above. The header revision additionally specifies a whole figure at 85% of image height and the complete head within the top quarter to suit the actual shallow surface.

Opening/poster references use separate bounded JPEG derivatives from the existing Mark V portrait and new Mark X photograph. `node scripts/opening-references.mjs --only='The Hunter'` stages both immutable objects. See the import record for exact keys, digests and upload order. These JPEGs are not embedded in edge source.

Actual UI image review is captured by `tests/browser/hunter.spec.ts`: all Power/Finale/Minor photos, header, ongoing effects, fresh/shutdown/repaired/destroyed models, core trackers and shallow death tile at laptop/phone sizes. Screenshot files are verification output, not runtime assets.
