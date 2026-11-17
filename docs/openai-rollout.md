# Final Girl OpenAI rollout

Add `OPENAI_API_KEY` under **More → Settings → Secrets** in the [Final Girl Lovable project](https://lovable.dev/projects/d59a27fc-afa4-4428-82bf-1d9eb9c59108). Use a key from the OpenAI project in the organization with the credits.

Deploy these Edge Functions from the same revision: `ai-capabilities`, `generate-story`, `generate-ending`, `generate-death-scene`, `generate-visual-bible`, and `generate-scene-image`. Shared modules are bundled into each consumer, including the image function's shot planner.

| Secret | When set to `openai` | Default when unset |
| --- | --- | --- |
| `AI_TEXT_PROVIDER` | OpenAI Responses for stories, endings, death scenes, visual continuity and shot planning | `lovable` |
| `AI_IMAGE_PROVIDER` | OpenAI Images for opening stills, Reshoots and ending posters | `lovable` |

1. With the provider secrets unset, call the signed-in Edge Function `GET /functions/v1/ai-capabilities?provider=openai`. It only lists models. Expect `gpt-5.6-sol` and `gpt-6-luna` in the text candidates and `gpt-image-2.6-sunburst` in the image candidates. A successful list confirms access to the catalog. Generation and billing are verified by actual use.
2. Set `AI_TEXT_PROVIDER` to `openai` and confirm the probe reports it. Test a new story, an ending, an uncached death scene, and a new scene's continuity and shot planning. Confirm usage in the OpenAI project.
3. Set `AI_IMAGE_PROVIDER` to `openai` in a test deployment first. Compare a fresh Sheila opening and a Reshoot to the vetted portrait. Check the widescreen crop, portrait poster composition, archive attachment, and image usage in the OpenAI project. After that comparison, enable OpenAI images in production.
4. To roll back either route, set its provider secret to `lovable` and confirm the active providers in the probe. A direct request that fails stays on the selected provider, and failed image replacements preserve the previous image.

Optional model overrides are `OPENAI_TEXT_MODEL`, `OPENAI_UTILITY_MODEL`, `OPENAI_DEATH_MODEL`, and `OPENAI_IMAGE_MODEL`. Voice playback uses the Inworld integration. The provider switch only covers generated prose, planning and artwork.
