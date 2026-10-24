// Edge-schema tests substitute this Deno URL with the installed Zod module.
declare module 'https://deno.land/x/zod@v3.22.4/mod.ts' {
  export { z } from 'zod';
}
