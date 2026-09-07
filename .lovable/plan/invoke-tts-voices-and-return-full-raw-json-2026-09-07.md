# Invoke `tts-voices` and return full raw JSON

## Goal
Run the diagnostic `tts-voices` edge function as a signed-in user and paste the complete, unedited JSON response into chat, including every entry in `allVoiceIds`.

## Steps
1. Confirm `supabase/functions/tts-voices/index.ts` is deployed; deploy it if it is not currently live.
2. Obtain a valid signed-in session token (reuse the injected browser session if present, otherwise mint one via `lovable auth-session --json --self`).
3. POST to the deployed function URL with both the `Authorization: Bearer <token>` and `apikey` headers.
4. Capture the full response body and return it verbatim, with no summarization or truncation of `allVoiceIds`.

## Notes
- This consumes one Inworld API voice-listing call and one slot against the `tts-voices` hourly limit.
- No project secrets (Inworld key, service-role key, user tokens) will be echoed in the response; only the public voice ID list is returned.