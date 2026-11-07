import { useEffect, useRef, useState } from 'react';
import { vertexShader } from './shaders';

interface Props {
  artwork: string;
  photograph?: string;
  shader: string;
  portrait?: boolean;
  /** Deterministic inspection in the development preview; never request progress. */
  inspectTime?: number;
  seed?: number;
}

/** One quad, two bounded textures, no per-frame React work. The photographic
 * DOM fallback stays mounted underneath until the first successful draw. */
export function MaterialCanvas({ artwork, photograph, shader, portrait = false, inspectTime, seed = 2 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderer, setRenderer] = useState<'loading' | 'webgl' | 'fallback'>('loading');
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof WebGLRenderingContext === 'undefined') { setRenderer('fallback'); return; }
    setRenderer('loading');
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
    if (!gl) { setRenderer('fallback'); return; }
    let failed = false;
    let disposed = false, frame = 0, visible = true, elapsed = 0, previous = 0, loaded = false, firstDraw = true;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const textures: WebGLTexture[] = [], shaders: WebGLShader[] = [], images: HTMLImageElement[] = [];
    let program: WebGLProgram | null = null, buffer: WebGLBuffer | null = null;
    let observer: ResizeObserver | undefined, intersection: IntersectionObserver | undefined;
    let photoRatio = 1;
    const assetTimeout = window.setTimeout(() => { if (!loaded && !disposed) { failed = true; setRenderer('fallback'); } }, 8000);
    const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
    const fail = () => { failed = true; stop(); if (!disposed) setRenderer('fallback'); };
    const lost = (event: Event) => { event.preventDefault(); loaded = false; fail(); };
    canvas.addEventListener('webglcontextlost', lost);
    const compile = (type: number, source: string) => {
      const s = gl.createShader(type);
      if (!s) throw new Error('Shader unavailable');
      shaders.push(s); gl.shaderSource(s, source); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('Shader compilation failed');
      return s;
    };
    const loadTexture = (url: string | undefined, unit: number) => new Promise<void>((resolve, reject) => {
      const texture = gl.createTexture();
      if (!texture) return reject(new Error('Texture unavailable'));
      textures.push(texture);
      const bind = () => {
        gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      };
      if (!url) { bind(); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([68, 61, 50, 255])); resolve(); return; }
      const img = new Image(); images.push(img); img.crossOrigin = 'anonymous';
      img.onerror = () => reject(new Error('Decorative artwork unavailable'));
      img.onload = () => {
        if (disposed) return resolve();
        try {
          // Bound decoded GPU texture size, including larger existing location art.
          const max = Math.min(1024, gl.getParameter(gl.MAX_TEXTURE_SIZE));
          const ratio = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
          const surface = document.createElement('canvas');
          surface.width = Math.max(1, Math.round(img.naturalWidth * ratio));
          surface.height = Math.max(1, Math.round(img.naturalHeight * ratio));
          const context = surface.getContext('2d');
          if (!context) throw new Error('Texture preparation failed');
          context.drawImage(img, 0, 0, surface.width, surface.height);
          bind(); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, surface);
          if (unit === 1) photoRatio = img.naturalWidth / img.naturalHeight;
          resolve();
        } catch (e) { reject(e); }
      };
      img.src = url;
    });
    const draw = (now: number) => {
      frame = 0;
      if (disposed || !loaded || !program || document.hidden || !visible) return;
      if (previous) elapsed += Math.min(.1, (now - previous) / 1000);
      previous = now;
      const t = inspectTime ?? (motion.matches ? 30 : elapsed);
      gl.uniform1f(gl.getUniformLocation(program, 'time'), t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (firstDraw) { firstDraw = false; setRenderer('webgl'); }
      if (!motion.matches && inspectTime === undefined) frame = requestAnimationFrame(draw);
    };
    const resume = () => { stop(); if (loaded && !disposed && !document.hidden && visible) frame = requestAnimationFrame(draw); };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const density = Math.min(window.devicePixelRatio || 1, 1.5, 960 / Math.max(1, rect.width, rect.height));
      canvas.width = Math.max(1, Math.round(rect.width * density));
      canvas.height = Math.max(1, Math.round(rect.height * density));
      gl.viewport(0, 0, canvas.width, canvas.height); resume();
    };
    document.addEventListener('visibilitychange', resume);
    motion.addEventListener('change', resume);
    try {
      program = gl.createProgram();
      if (!program) throw new Error('Program unavailable');
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, shader));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader link failed');
      gl.useProgram(program);
      buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1i(gl.getUniformLocation(program, 'artwork'), 0);
      gl.uniform1i(gl.getUniformLocation(program, 'photograph'), 1);
      gl.uniform1f(gl.getUniformLocation(program, 'portrait'), portrait ? 1 : 0);
      gl.uniform1f(gl.getUniformLocation(program, 'seed'), seed);
      void Promise.all([loadTexture(artwork, 0), loadTexture(photograph, 1)]).then(() => {
        if (disposed || failed) return;
        gl.uniform1f(gl.getUniformLocation(program!, 'photoAspect'), photoRatio);
        clearTimeout(assetTimeout); loaded = true; resize();
      }).catch(fail);
      if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(resize); observer.observe(canvas); }
      if (typeof IntersectionObserver !== 'undefined') {
        intersection = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; resume(); });
        intersection.observe(canvas);
      }
    } catch { fail(); }
    return () => {
      disposed = true; clearTimeout(assetTimeout); stop(); observer?.disconnect(); intersection?.disconnect();
      document.removeEventListener('visibilitychange', resume); motion.removeEventListener('change', resume);
      canvas.removeEventListener('webglcontextlost', lost);
      images.forEach(img => { img.onload = null; img.onerror = null; img.src = ''; });
      textures.forEach(t => gl.deleteTexture(t)); shaders.forEach(s => gl.deleteShader(s));
      gl.deleteBuffer(buffer); gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [artwork, photograph, shader, portrait, inspectTime, seed]);
  return <canvas ref={canvasRef} className="material-canvas" data-renderer={renderer} style={{ opacity: renderer === 'webgl' ? 1 : 0 }} aria-hidden="true" />;
}
