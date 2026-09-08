import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decode as base64Decode, encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { getCorsHeaders } from "../_shared/auth.ts";
import { NarrationRequestSchema, validateRequest } from "../_shared/validation.ts";
import { requireUser } from "../_shared/guard.ts";
import { castVoice } from "../_shared/voices.ts";


const MAX_CHUNK_SIZE = 1900; // Inworld limit is 2000, leave margin for safety

// Split text into chunks at sentence boundaries
function splitTextIntoChunks(text: string, maxSize: number): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxSize) {
      chunks.push(remaining);
      break;
    }

    // Find the last sentence boundary within maxSize
    let splitIndex = maxSize;
    const searchArea = remaining.slice(0, maxSize);
    
    // Look for sentence endings (. ! ?) followed by space
    const lastPeriod = searchArea.lastIndexOf('. ');
    const lastExclaim = searchArea.lastIndexOf('! ');
    const lastQuestion = searchArea.lastIndexOf('? ');
    
    const sentenceEnd = Math.max(lastPeriod, lastExclaim, lastQuestion);
    
    if (sentenceEnd > maxSize * 0.5) {
      // Found a good sentence boundary in the second half
      splitIndex = sentenceEnd + 2; // Include the punctuation and space
    } else {
      // Fall back to last space
      const lastSpace = searchArea.lastIndexOf(' ');
      if (lastSpace > maxSize * 0.3) {
        splitIndex = lastSpace + 1;
      }
    }

    chunks.push(remaining.slice(0, splitIndex).trim());
    remaining = remaining.slice(splitIndex).trim();
  }

  return chunks.filter(chunk => chunk.length > 0);
}

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
    const validation = validateRequest(NarrationRequestSchema, body);


    
    if (!validation.success) {
      return validation.error;
    }

    const { text } = validation.data;

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

    // Split text into chunks if needed
    const chunks = splitTextIntoChunks(text, MAX_CHUNK_SIZE);

    /** Synthesises one chunk, returning null if this voice id is rejected. */
    const speak = async (chunk: string, voiceId: string): Promise<string | null> => {
      const response = await fetch('https://api.inworld.ai/tts/v1/voice', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${INWORLD_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: chunk, voiceId, modelId: 'inworld-tts-1.5-max' }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.audioContent as string;
      }

      const errorText = await response.text();
      console.error(`Inworld error (voice ${voiceId}):`, response.status, errorText);

      // An unknown voice id is a casting problem, not an outage: report it so
      // the caller can try the next candidate.
      if (response.status === 400 || response.status === 404) return null;
      throw new Response(
        JSON.stringify({
          error: response.status === 429
            ? 'Too many requests. Please wait a moment.'
            : 'Failed to generate narration. Please try again.',
        }),
        { status: response.status === 429 ? 429 : 500, headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    };

    // Resolve the voice once, on the first chunk, then keep it for the rest —
    // a narration that changed voice halfway through would be worse than one
    // that used the fallback throughout.
    let voiceId: string | null = null;
    const audioChunks: string[] = [];

    for (const candidate of persona.candidates) {
      const first = await speak(chunks[0], candidate);
      if (first !== null) {
        voiceId = candidate;
        audioChunks.push(first);
        break;
      }
      console.warn(`Voice ${candidate} unavailable, trying next candidate`);
    }

    if (voiceId === null) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate narration. Please try again.' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    for (const chunk of chunks.slice(1)) {
      const audio = await speak(chunk, voiceId);
      if (audio === null) {
        // The voice worked a moment ago, so this is not a casting problem.
        return new Response(
          JSON.stringify({ error: 'Failed to generate narration. Please try again.' }),
          { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
        );
      }
      audioChunks.push(audio);
    }

    await guard.logUsage({ model: `inworld:${voiceId}`, kind: `narration-${persona.label}` });

    // Concatenate all audio chunks
    const combinedAudio = chunks.length === 1 
      ? audioChunks[0] 
      : concatenateBase64Audio(audioChunks);
    

    return new Response(
      JSON.stringify({ audioContent: combinedAudio, voiceId, persona: persona.label }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    );
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
