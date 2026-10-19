# Photographic opening stills

A reported Buddyland opening rendered Rena and Billy as outlined cartoon characters. The configured image model chain had not changed recently. The code did contain competing medium cues: a combined cinematographer/poster planner, continuity planning that discussed painting, and Billy's repeated "cartoon welcome" description. The exact model and generated planning text for the reported request could not be retrieved, so these are identified prompt weaknesses rather than a proven reconstruction of that request.

## Change

Opening stills now use a dedicated live-action photography planner. Its JSON contains only three candidate shots and a selected index. It no longer requests poster titles, taglines or painted compositions. A separate parser accepts complete opening plans without poster copy; malformed plans still fall back to the full story.

The opening image prompt explicitly asks for photographed adult performers, natural skin and hair, tangible sets, and physically credible creature effects. Billy remains an orange-brown physical animatronic machine with his original clothing, materials and mechanical details. His welcoming mascot expression is described through physical features instead of the ambiguous "cartoon welcome" phrase.

Continuity planning records physical identity, architecture, materials, palette and light sources without prescribing a rendering medium. The opening renderer explicitly treats inherited continuity and shot instructions as identity/composition only, protecting resumed sessions with older notes. The requested medium is independent of those inputs. Explicit `sceneType` takes precedence over an incidental outcome field when choosing the planner and scene facts.

Closing posters retain their separate painted 1980s treatment, copy validation, typography composition and opening identity reference. The model candidates, overrides, fallback policy, 16:9 request, number of AI calls, image persistence and replacement behavior are unchanged. No UI or saved-image migration is included. Prompt constraints reduce ambiguity; they cannot guarantee the visual quality of every stochastic generation.

## Release

After merging, deploy the frontend and these two edge functions so their bundled shared prompts update:

```sh
supabase functions deploy generate-scene-image
supabase functions deploy generate-visual-bible
```

No SQL migration, new secret, dependency or model change. Existing images stay as saved. In the opening image viewer, **Reshoot** generates a replacement using the deployed prompt while preserving the story and session.

## Validation

Automated checks exercise real prompt builders and parsers through the image handler with mocked model responses. They cover both Buddyland Final Girls, explicit opening/ending planner isolation, legacy continuity with conflicting style wording, missing poster copy, invalid plans, full-story fallback, 16:9 requests, poster composition, safe replacement and discard handling.

Passed locally: 252 frontend tests, 60 edge checks, 22 desktop/mobile narration and reliability browser checks, type checking, production build and validation of 226 original artwork files. Lint has zero errors and nine existing React Refresh warnings.

Live gateway image comparison was not available: this environment has no gateway generation key, and the connected Lovable account token lacks the scope required for the attempted database inspection. No generated examples from another image model are presented as evidence for this gateway. After deployment, visually review fresh Rena and Gwynn openings plus a Reshoot of a session with older continuity, checking photographed human features, physical animatronic materials, readable scene detail and the absence of drawn outlines/cel shading. Confirm a closing poster still has the intended painted treatment.
