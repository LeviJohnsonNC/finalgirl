import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

/** Private bucket holding the reviewed portraits. Only the shared manifest names objects in it. */
const REFERENCE_BUCKET = 'opening-references';

let client: ReturnType<typeof createClient> | undefined;

/** Serves one reviewed portrait exactly as stored. A missing object is a hard failure, never a substitute. */
export async function downloadReference(path: string): Promise<Uint8Array> {
  if (!client) {
    client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  }
  const { data, error } = await client.storage.from(REFERENCE_BUCKET).download(path);
  if (error || !data) throw new Error(`${path} could not be loaded`);
  return new Uint8Array(await data.arrayBuffer());
}
