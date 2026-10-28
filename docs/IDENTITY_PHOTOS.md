# Killer, location and Final Girl identity photos

Levi's direction, 2026-10-25: when a new generated identity image is needed for a killer, location or Final Girl, it should look like someone casually took a real photograph with a camera in the 1980s. A polished illustration with added grain does not meet this bar.

Reference: the approved Inkanyamba jungle photo at `src/assets/characters/ai/inkanyamba.png`, supplied as `image(20261026-010847).png` (attachment `file_000000003ce881fdb87259361374372b`). Inspect that actual image before generating. Preserve good existing images unless the current task requests replacement; prefer a supplied approved replacement over generating another interpretation.

For current import scope and deliberately retained artwork, read the [approved module standard](MODULE_STANDARD.md). Its defaults incorporate the later approved card, environment, header and tracker extensions below.

## Direction

- Depict a physically believable person or place caught in an unposed moment. A masked killer should look like a real performer wearing a tangible practical costume: visible cloth, wood, feathers, leather, wear and human proportions, faithful to the verified identity. Final Girls should look like real people with period-appropriate clothing, hair and expressions. Locations should look like actual places photographed from an ordinary human viewpoint.
- Use available daylight, dappled shade, ordinary indoor light or plausible consumer-camera flash. Include natural skin texture, imperfect materials, vegetation and small environmental irregularities. Keep details plausible for the selected character and location.
- Aim for a scanned 1980s consumer 35mm color print: restrained grain, gentle optical softness, restrained color, natural exposure and imperfect focus or framing. Keep the subject recognizable and the image readable at small UI sizes. The film treatment supports the realism; it should not hide synthetic anatomy or materials.
- Avoid painted/concept-art textures, game renders, plastic skin, exaggerated anatomy, polished cosplay studio poses, fashion-editorial lighting, cinematic teal/orange grading, fantasy spectacle, heavy faux VHS scanlines, date stamps, borders, captions, logos and text. A period photograph is the target, not a modern digital portrait with a vintage filter.
- Use supplied identity/component references for the face, mask, silhouette, clothing and key props. Do not infer new game rules, powers, weapons or setting restrictions from a photographic background. A killer's reference setting does not bind them to that location in mixed games.

## Starting prompt

Adapt the following to the verified subject and setting; use image references when available:

> A candid photograph of [verified person / practical-costume killer / real location], caught naturally in [appropriate environment]. Looks like an ordinary person took one unposed snapshot using a consumer 35mm camera in the 1980s. Believable human anatomy, tangible costume and materials, natural skin and environmental textures, available light, slightly imperfect framing and focus, restrained film grain and natural color-negative tonal transitions. Physically real, lifelike, not polished or posed. Preserve [specific identity details]. No illustration, concept art, CGI, studio lighting, text, logos, date stamp or decorative frame.

## Scope and review

This direction governs newly generated killer, location and Final Girl **identity images**, and was explicitly extended to new owner headers, Power/Finale/Minor photos, Sacred-space environmental states and the approved photographic trackers. The [module standard](MODULE_STANDARD.md) defines current defaults for new imports. This is not a request to replace every existing UI image: intentionally retained Divine Wrath/Fickleness artwork, tokens/diagrams and painted ending posters keep their approved treatment unless the task requests otherwise. Opening photographs have their own provider contract, documented in [PHOTOGRAPHIC_OPENINGS.md](PHOTOGRAPHIC_OPENINGS.md). The 2026-10-26 opening follow-up applies the same physical-material and well-cared-for film direction to opening/Reshoot generation. Death vignettes are prose; painted ending posters keep their established medium.

Review the full image and actual casting/detail crops on laptop and phone before shipping. Keep the essential face/mask and silhouette visible; never stretch the picture. Preserve the existing AI-art setting, official-art fallback and user-custom-image precedence. Record approved source provenance alongside affected artwork. Keep all labels and interactive state in HTML.

2026-10-26 refinement: the film reference governs capture/reproduction, not the scene's wardrobe or technology. Prefer a well-cared-for photograph without decorative scratches, dust, artificial light leaks, sepia or a faded-print overlay. Grain, dirt and softness must never substitute for credible anatomy, materials and light.

2026-10-27 approved extension: Bloodlust tracker photographs and Inkanyamba's five Killer Wrath backgrounds use this physically believable photographic treatment. Bloodlust is a killer-agnostic visual metaphor without people, identifiable killers or weapons; Wrath preserves the approved Inkanyamba identity and escalates through posture and proximity. Their decorative content establishes no gameplay or story facts. Divine Wrath and other UI artwork keep their current medium. See `src/assets/play/bloodlust/README.md` and `src/assets/play/inkanyamba/README.md` for sources and mappings.

2026-10-27 Bloodlust refresh: Levi supplied three moonlit-lake intensity references. The eleven-stage set keeps a fixed cabin/dock/canoe composition, moving from cold moonlight through crimson dread to a red-moon climax. Translate the reference into photographic materials and light. This decorative lake motif does not establish the selected game Location, actual weather or an event in a story. Preserve the verified per-killer track mappings and unknown/legacy behavior.

2026-10-28 Final Girl health extension: healthy and critically exhausted portraits are independent edits from each girl's existing AI photograph, preserving her face and identity, camera, clothing design and setting. Use them only in the Play health tracker initially. Full verified session health uses healthy; 0–2 HP uses critical with the explicit zero-health label at 0; intermediate/unknown states retain the original as documented in the [health-photo manifest](../src/assets/play/final-girl-health/README.md). Preserve permanent features, freckles, moles and identifying scars. Critical uses non-graphic exhaustion, bruising, grime and worn clothing without disfigurement. Inspect all trios and actual tracker crops; decorative injuries never become story facts. Casting portraits, official preference and trusted private opening references remain unchanged.
