// Requires ImageMagick. Commit the generated thumbnails alongside updated box art.
import { readdirSync, mkdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
const root = 'src/assets/box-art';
let before = 0, after = 0, count = 0;
function visit(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const input = join(dir, item.name);
    if (item.isDirectory()) { visit(input); continue; }
    if (!input.endsWith('.png')) continue;
    const output = join('src/assets/collection-thumbnails', relative(root, input).replace(/\.png$/, '.webp'));
    mkdirSync(output.slice(0, output.lastIndexOf('/')), { recursive: true });
    execFileSync('magick', [input, '-auto-orient', '-resize', '288x432>', '-strip', '-quality', '80', output]);
    before += statSync(input).size; after += statSync(output).size; count++;
  }
}
visit(root);
console.log(`${count} thumbnails: ${(before / 1024 / 1024).toFixed(2)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB (${Math.round((1 - after / before) * 100)}% smaller)`);
