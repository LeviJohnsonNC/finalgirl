import {GatewayError, storyStreamError, userFacingMessage} from './aiGateway.ts';
import {generateEvaluatedStory} from './storyEvaluation.ts';
import {buildEndingRecovery} from './storyPrompts.ts';

const encoder = new TextEncoder();
const frame = (event: unknown) => encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
const declined = 'The ending could not be written in a non-graphic form. Your game result is safe. You can revise your notes and try again.';

/** Ending-only opt-in protocol: one visibly reset rewrite after an explicit block.
 * Each attempt retains its own evaluation. No policy-driven model switching. */
export function generateEndingWithRecovery(
  options: Parameters<typeof generateEvaluatedStory>[0] & {kind:'ending'},
  context: Parameters<typeof buildEndingRecovery>[0],
  requestSignal?: AbortSignal,
): ReadableStream<Uint8Array> {
  const abort = new AbortController();
  const signal = requestSignal ? AbortSignal.any([abort.signal, requestSignal]) : abort.signal;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

  async function* frames(): AsyncGenerator<Uint8Array> {
    let model: string | undefined;
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        signal.throwIfAborted();
        let failure: GatewayError | undefined;
        let complete = false, hasText = false;
        try {
          const prompt = attempt === 0 ? options : buildEndingRecovery(context);
          const result = await generateEvaluatedStory({
            ...options, ...prompt, signal,
            ...(attempt === 1 && {candidates:[model!]}),
            promptVersion: attempt === 0 ? '2026-11-05-ending-v3' : '2026-11-05-ending-aftermath-v1',
          });
          model = result.model;
          await options.guard.logUsage({model, kind:'ending'});
          reader = result.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const chunk = await reader.read();
            signal.throwIfAborted();
            buffer += chunk.done ? decoder.decode() + '\n\n' : decoder.decode(chunk.value, {stream:true});
            let boundary: number;
            while ((boundary = buffer.indexOf('\n\n')) !== -1) {
              const wire = buffer.slice(0,boundary);
              buffer = buffer.slice(boundary+2);
              for (const line of wire.split('\n')) {
                if (!line.trim().startsWith('data:')) continue;
                const payload = line.trim().slice(5).trim();
                if (!payload || payload === '[DONE]') continue;
                let event;
                try { event = JSON.parse(payload); }
                catch { failure ??= new GatewayError('incomplete_response','Malformed story frame'); continue; }
                failure ??= storyStreamError(event) ?? undefined;
                const choice = event.choices?.[0];
                if (typeof choice?.delta?.content === 'string' && choice.delta.content.trim()) hasText = true;
                if (['stop','end_turn'].includes(choice?.finish_reason)) complete = true;
                // Evaluation status belongs to this attempt, even when its prose is discarded.
                if (!failure || event.evaluation) yield frame(event);
              }
            }
            if (chunk.done) break;
          }
          reader.releaseLock();
          reader = undefined;
          if (!failure && (!complete || !hasText)) failure = new GatewayError('incomplete_response','Ending did not complete');
        } catch (error) {
          if (signal.aborted) return;
          failure = error instanceof GatewayError ? error : new GatewayError('upstream','Ending request failed');
          model ??= failure.model;
          if (reader) { await reader.cancel().catch(()=>{}); reader.releaseLock(); reader = undefined; }
        }
        signal.throwIfAborted();
        if (!failure) { yield encoder.encode('data: [DONE]\n\n'); return; }
        if (attempt === 0 && failure.kind === 'content_policy' && model) {
          yield frame({recovery:{kind:'ending',state:'reframing'}});
          continue;
        }
        yield frame({error:failure.kind === 'content_policy' ? declined : userFacingMessage(failure), code:failure.kind});
        yield encoder.encode('data: [DONE]\n\n');
        return;
      }
    } finally {
      if (reader) { await reader.cancel().catch(()=>{}); reader.releaseLock(); reader = undefined; }
    }
  }
  const iterator = frames();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = await iterator.next();
        if (next.done) controller.close();
        else controller.enqueue(next.value);
      } catch (error) { controller.error(error); }
    },
    async cancel(reason) {
      abort.abort(reason);
      await reader?.cancel(reason).catch(()=>{});
      await iterator.return(undefined);
    },
  });
}
