import {deathFacts,deathSignatures} from '../_shared/play/death.ts';
import {validPlayLog} from '../_shared/play/events.ts';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decode as base64Decode, encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { getCorsHeaders } from "../_shared/auth.ts";
import { NarrationRequestSchema, validateRequest } from "../_shared/validation.ts";
import { requireUser } from "../_shared/guard.ts";
import { castVoice } from "../_shared/voices.ts";
import { NARRATION_PROFILE, NARRATION_MODEL, NARRATION_SAMPLE_RATE, delivery, narrationChunks, narrationMessages } from "../_shared/narration.ts";


// Concatenate multiple base64 audio chunks into one
function concatenateBase64Audio(base64Chunks: string[]): string {
  // Decode all chunks to binary
  const binaryArrays = base64Chunks.map(chunk => base64Decode(chunk));
  
  // Calculate total length
  const totalLength = binaryArrays.reduce((sum, arr) => sum + arr.length, 0);
  
  // Concatenate into single array
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of binaryArrays) {
    combined.set(arr, offset);
    offset += arr.length;
  }
  
  // Encode back to base64
  return base64Encode(combined.buffer);
}

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    // Auth + rate limit (narration can be heavier; allow more per hour)
    const guard = await requireUser(req, cors, { functionName: "narrate-story", hourlyLimit: 60 });
    if (!guard.ok) return guard.response;

    // Parse and validate request body
    const body = await req.json();
    const validation = validateRequest(NarrationRequestSchema, body, cors);


    
    if (!validation.success) {
      return validation.error;
    }

    let { text } = validation.data;
    if(validation.data.kind==='death') {
      const {data:scene,error:sceneError}=await guard.adminClient.from('play_death_scenes').select('scene_text,session_id,event_id,signature,status').eq('id',validation.data.deathSceneId!).eq('user_id',guard.user.id).maybeSingle();
      if(sceneError||!scene||scene.status!=='ready')return new Response(JSON.stringify({error:'Saved death scene unavailable.'}),{status:404,headers:{...cors,'Content-Type':'application/json'}});
      const {data:session}=await guard.adminClient.from('play_sessions').select('state').eq('id',scene.session_id).eq('user_id',guard.user.id).maybeSingle();
      const state=session?.state;
      const facts=state&&validPlayLog(state.playEvents)&&state.selection?deathFacts(state.selection,state.playEvents,scene.event_id):null;
      if(!facts||!(await deathSignatures(facts)).includes(scene.signature))return new Response(JSON.stringify({error:'That death was changed or undone.'}),{status:409,headers:{...cors,'Content-Type':'application/json'}});
      text=scene.scene_text;
    }

    const INWORLD_API_KEY = Deno.env.get('INWORLD_API_KEY');
    if (!INWORLD_API_KEY) {
      console.error('INWORLD_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Narration service not configured' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Cast the voice for this moment. An opening and a losing ending should
    // not be read by the same narrator in the same register.
    const persona = castVoice({
      kind: validation.data.kind,
      outcome: validation.data.outcome,
      filmId: validation.data.filmId,
    });

    const streaming = validation.data.stream === true;
    const direction = `[${delivery[persona.label] ?? delivery.dread}] `;
    const chunks = narrationChunks(text, (streaming ? 4000 : 2000) - direction.length - 24);
    if (!chunks.length) return new Response(JSON.stringify({ error: 'No spoken text was provided.' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    const abort = new AbortController();
    const signal = AbortSignal.any([req.signal, abort.signal, AbortSignal.timeout(140000)]);
    const started = performance.now();
    let voiceId = '', firstAudioMs = 0, audioCount = 0;
    const metadata = () => ({ profile: NARRATION_PROFILE, model: NARRATION_MODEL, voiceId, persona: persona.label, sampleRate: NARRATION_SAMPLE_RATE });
    const unavailableVoice = (payload: unknown) => {
      const error = payload as { code?: number; message?: string; error?: { code?: number; message?: string } };
      const detail = error?.error ?? error;
      return detail?.code === 5 && /voice/i.test(detail.message ?? '');
    };
    async function* synthesize(chunk: string, candidate: string): AsyncGenerator<string> {
      const response = await fetch(`https://api.inworld.ai/tts/v1/voice${streaming ? ':stream' : ''}`, {
        method: 'POST', headers: { Authorization: `Basic ${INWORLD_API_KEY}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.any([signal, AbortSignal.timeout(45000)]),
        body: JSON.stringify({ text: direction + chunk, voiceId: candidate, modelId: NARRATION_MODEL,
          audioConfig: { audioEncoding: streaming ? 'PCM' : 'MP3', sampleRateHertz: NARRATION_SAMPLE_RATE, speakingRate: 1, ...(streaming ? {} : { bitRate: 128000 }) } }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        if (unavailableVoice(payload)) throw new Error('VOICE_UNAVAILABLE');
        throw new Error(response.status === 429 ? 'Narration is busy. Please try again shortly.' : 'The narrator could not finish. Please try again.');
      }
      const messages = streaming && response.body ? narrationMessages(response.body) : [await response.json()];
      let received = false;
      for await (const message of messages) {
        if (message.error || message.code) {
          if (!received && unavailableVoice(message)) throw new Error('VOICE_UNAVAILABLE');
          throw new Error('The narration stream was interrupted. Please try again.');
        }
        const audio = (streaming ? message.result : message)?.audioContent;
        if (!audio) continue; // Timestamp / usage-only messages are valid.
        if (typeof audio !== 'string' || audio.length > 4_000_000) throw new Error('Invalid narration audio.');
        received = true; yield audio;
      }
      if (!received) throw new Error('The narrator returned no audio. Please try again.');
    }
    async function* generate(): AsyncGenerator<string> {
      // Only retry a genuinely missing voice, and only before a single audible byte.
      let resolved = false;
      for (const candidate of persona.candidates) {
        try {
          voiceId = candidate;
          for await (const audio of synthesize(chunks[0], candidate)) {
            if (!audioCount) firstAudioMs = performance.now() - started;
            audioCount++; yield audio;
          }
          resolved = true; break;
        } catch (error) {
          if (audioCount || !(error instanceof Error) || error.message !== 'VOICE_UNAVAILABLE') throw error;
        }
      }
      if (!resolved) throw new Error('The selected narrator is unavailable. Please try again later.');
      for (const chunk of chunks.slice(1)) for await (const audio of synthesize(chunk, voiceId)) { audioCount++; yield audio; }
      await guard.logUsage({ model: `${NARRATION_MODEL}:${voiceId}`, kind: `narration-${persona.label}` });
      console.info('narration_complete', { ...metadata(), firstAudioMs: Math.round(firstAudioMs), totalMs: Math.round(performance.now() - started), sections: chunks.length });
    }
    if (streaming) {
      const encoder = new TextEncoder();
      const generation = generate();
      let first = true;
      const body = new ReadableStream<Uint8Array>({
        async pull(controller) {
          const send = (value: unknown) => { if (!signal.aborted) controller.enqueue(encoder.encode(JSON.stringify(value) + '\n')); };
          try {
            // Backpressure bounds queued audio when the browser/network reads slowly.
            const next = await generation.next();
            if (next.done) { send({ type: 'done', ...metadata() }); controller.close(); return; }
            if (first) { send({ type: 'start', ...metadata() }); first = false; }
            send({ type: 'audio', audio: next.value });
          } catch (error) {
            if (!signal.aborted) send({ type: 'error', error: error instanceof Error ? error.message : 'Narration was interrupted.' });
            try { controller.close(); } catch { /* reader cancelled */ }
          }
        },
        async cancel() { abort.abort(); await generation.return(undefined).catch(() => {}); },
      });
      return new Response(body, { headers: { ...cors, 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store, no-transform', 'X-Accel-Buffering': 'no', 'X-Content-Type-Options': 'nosniff' } });
    }

    // Compatibility for older open tabs and browsers without Web Audio.
    const audioChunks: string[] = [];
    for await (const audio of generate()) audioChunks.push(audio);
    return new Response(JSON.stringify({ audioContent: concatenateBase64Audio(audioChunks), ...metadata() }),
      { headers: { ...cors, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    // speak() throws a ready-made Response for upstream failures it cannot retry.
    if (error instanceof Response) return error;
    console.error('Error generating narration:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate narration. Please try again.' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
});

