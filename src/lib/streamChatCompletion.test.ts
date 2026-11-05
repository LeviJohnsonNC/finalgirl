import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {streamChatCompletion} from './streamChatCompletion';

vi.mock('@/integrations/supabase/client',()=>({supabase:{auth:{getSession:async()=>({data:{session:{access_token:'test-token'}}})}}}));
vi.mock('sonner',()=>({toast:{warning:vi.fn()}}));
const frame=(event:unknown)=>`data: ${JSON.stringify(event)}\n\n`;
const delta=(content:string)=>({choices:[{delta:{content}}]});
const stop={choices:[{finish_reason:'stop'}]};
const options=()=>({functionName:'generate-ending',body:{endingStreamVersion:1},onToken:vi.fn(),onRestart:vi.fn(),requireComplete:true});
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(()=>{fetchMock=vi.fn();vi.stubGlobal('fetch',fetchMock);});
afterEach(()=>vi.unstubAllGlobals());

describe('ending stream completion and recovery',()=>{
  it('discards the first draft on restart and returns only the complete rewrite from one HTTP request',async()=>{
    const opts=options();
    fetchMock.mockResolvedValue(new Response(frame(delta('Partial draft'))+frame({recovery:{kind:'ending',state:'reframing'}})+frame(delta('Complete ending.'))+frame(stop)));
    expect(await streamChatCompletion(opts)).toBe('Complete ending.');
    expect(opts.onRestart).toHaveBeenCalledTimes(1);
    expect(opts.onToken.mock.calls.map(call=>call[1])).toEqual(['Partial draft','','Complete ending.']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    frame(delta('Cut off'))+'data: [DONE]\n\n',
    frame(delta('Cut off'))+frame({choices:[{finish_reason:'length'}]}),
    frame(delta('Refused'))+frame({choices:[{finish_reason:'content_filter'}]}),
    frame(delta('Refused'))+frame({choices:[{finish_reason:'stop',native_finish_reason:'SAFETY'}]}),
    frame(delta('Cut off'))+'data: not-json\n\n'+frame(stop),
    frame(stop),
  ])('never returns incomplete, refused, malformed or empty text as a completed ending',async wire=>{
    fetchMock.mockResolvedValue(new Response(wire));
    await expect(streamChatCompletion(options())).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps a final policy rejection to useful copy and does not start another request',async()=>{
    fetchMock.mockResolvedValue(new Response(frame({recovery:{kind:'ending',state:'reframing'}})+frame({error:'private provider detail',code:'content_policy'})));
    await expect(streamChatCompletion(options())).rejects.toThrow(/non-graphic.*game result is safe/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('drains a trailing frame and split Unicode without losing the last completed text',async()=>{
    const bytes=new TextEncoder().encode(frame(delta('Café 🌙'))+'data: '+JSON.stringify(stop));
    fetchMock.mockResolvedValue(new Response(new ReadableStream({start(c){for(const byte of bytes)c.enqueue(Uint8Array.of(byte));c.close();}})));
    expect(await streamChatCompletion(options())).toBe('Café 🌙');
  });

  it('cancels the reader on failure and never emits tokens after cancellation',async()=>{
    let cancelled=false;
    const abort=new AbortController(),opts=options();
    opts.onToken.mockImplementation(()=>abort.abort());
    fetchMock.mockResolvedValue(new Response(new ReadableStream({start(c){c.enqueue(new TextEncoder().encode(frame(delta('First'))+frame(delta('Late'))));},cancel(){cancelled=true;}})));
    await expect(streamChatCompletion({...opts,signal:abort.signal})).rejects.toThrow();
    expect(opts.onToken).toHaveBeenCalledTimes(1);expect(cancelled).toBe(true);
  });
});
