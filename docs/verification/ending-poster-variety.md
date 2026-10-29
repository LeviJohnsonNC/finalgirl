# Story-specific ending poster identities

Approved scope: retain the improved painted ending artwork, restore the typography/layout/framing/credit variety in Levi's older references, preserve reliable baked text and existing persistence safeguards. The visual reference ledger and eight finished studies are in [the review pack](../reference/ending-posters/README.md).

## Implementation

- `posterDesign.ts` defines four complete print layouts, five title faces and four coordinated palettes. The planner chooses bounded IDs; no arbitrary fonts, URLs, markup or pixel geometry can enter the renderer. Its schema example is seeded by the actual story, avoiding one constant example becoming the next house template. Selection remains story-directed and stable once chosen; no extra model call or history query is added.
- One resolved design drives both painting safe areas and the raster compositor. Upper-title layouts explicitly keep every face below the masthead; lower-title layouts protect the lower print zones. Source art is contained without stretching/cropping, including wrong-ratio PNG/JPEG/WebP inputs. Paper panels/borders are composed locally, not painted by the image model.
- Title faces include ragged hand lettering, marker, angular gothic, mechanical stencil and the retained literary serif. Palette-specific edging/shadows and intentional multiline fitting replace mandatory red serif lettering. Billing uses actual selected character names and established fictional studio crew, without adding story facts.
- Optional invalid/missing design metadata recovers to a bounded story-seeded design without discarding valid copy. Valid copy also survives a broken composition plan. Invalid/truncated copy uses the existing safe text fallback. Structured logs distinguish complete plans, recovered copy and fallback, recording only design IDs/status rather than story text.
- Typography and credits remain baked into a 1000×1500 PNG before upload and late attachment. Previously saved posters do not change unless reshot. Composition failure never uploads incomplete art or deletes the old image; attachment and discard ownership safeguards remain intact. Opening photography and its identity-reference loader are unchanged.
- Four additional static font subsets total 206,012 bytes before base64. Sources, licenses and hashes are pinned; no runtime font download. Asset checks bound and verify the font collection. See [font provenance](../../supabase/functions/_shared/poster-fonts/README.md).

## Verification

Completion evidence is recorded on the PR for its final head. Checks include the full lint/type/unit/edge suite, native Deno raster tests, function typechecking, asset validation, production build, actual ending-reader captures, existing save/reshoot/download/reload journeys and required Reliability CI.

Native tests exercise all title faces and layouts, punctuation and long copy, preserved central art, wrong-ratio source edges, PNG/JPEG/WebP decoding, corrupt-image rejection and embedded output lettering. Handler tests verify one shared design, selected-cast billing, partial-plan recovery, composed-before-upload ordering, failed composition/attachment, late attachment and discarded games. Frontend contracts retain outcome/fate and identity guidance.

The eight full-resolution studies were rendered with the actual compositor, then reviewed together and individually. They span four settings, win/loss contexts, repeated settings, short/long titles, five title faces and all layouts/palettes. Local raster timings were approximately 159–289ms per study; these are local wall-clock measurements, not hosted CPU/memory guarantees. See the reference pack for the manual initial-art corrections and limits of this evidence.

## Release

Redeploy **`generate-scene-image`**, including its changed shared prompt/design/compositor/font dependencies. No new request fields, database migration, secret, private identity-reference upload or frontend redesign. Other story/ending/visual-bible functions do not require this poster-specific deployment.

The development environment has no image-provider key or deployment access. Actual utility-planner choices, hosted function resource use and real image-provider compliance therefore remain **unverified**. After deploying to an authorized preview, review a batch of fresh posters including repeated settings, a long title, Poltergeist rescue and a loss; confirm design diversity, unobscured faces, complete stored/downloaded lettering and preserved previous poster on failed reshoot. Existing synthetic services and the separate image-generation tool do not establish those live results.
