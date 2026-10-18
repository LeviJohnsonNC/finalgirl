// ImageScript decodes PNG/JPEG. Keep the gateway's existing WebP output path
// with a lazy, pinned libwebp WASM decoder. These fixed dependency URLs never
// contain user data or credentials.
let loading: Promise<typeof import('https://cdn.jsdelivr.net/npm/@jsquash/webp@1.5.0/decode.js')> | undefined;

export async function decodeWebp(bytes: Uint8Array) {
  loading ??= (async () => {
    // The codec returns a browser-style pixel record; Deno has no ImageData.
    if (typeof globalThis.ImageData === 'undefined') Object.defineProperty(globalThis, 'ImageData', {
      value: class { constructor(public data: Uint8ClampedArray, public width: number, public height: number) {} },
      configurable: true,
    });
    const decoder = await import('https://cdn.jsdelivr.net/npm/@jsquash/webp@1.5.0/decode.js');
    const response = await fetch('https://cdn.jsdelivr.net/npm/@jsquash/webp@1.5.0/codec/dec/webp_dec.wasm');
    if (!response.ok) throw new Error('WebP decoder unavailable');
    await decoder.init(await WebAssembly.compile(await response.arrayBuffer()));
    return decoder;
  })().catch(error => { loading = undefined; throw error; });
  const decoder = await loading;
  return await decoder.default(bytes.slice().buffer);
}
