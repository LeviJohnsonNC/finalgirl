// Requires ImageMagick. Commit the generated thumbnails alongside updated box art.
import { readdirSync, mkdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";
const root = "src/assets/box-art";
let before = 0,
  after = 0,
  count = 0;
function visit(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const input = join(dir, item.name);
    if (item.isDirectory()) {
      visit(input);
      continue;
    }
    if (!input.endsWith(".png")) continue;
    const output = join(
      "src/assets/collection-thumbnails",
      relative(root, input).replace(/\.png$/, ".webp"),
    );
    mkdirSync(output.slice(0, output.lastIndexOf("/")), { recursive: true });
    // Remove uniform empty margins around the photographed/rendered box.
    // The source art and every face of the actual box remain unchanged.
    // 384px supports the larger shelf at 2× density. A small post-resize
    // unsharp mask restores edge definition without redrawing the artwork.
    execFileSync("magick", [
      input,
      "-auto-orient",
      "-fuzz",
      "1%",
      "-trim",
      "+repage",
      "-filter",
      "Lanczos",
      "-resize",
      "384x576>",
      "-unsharp",
      "0x0.5+0.5+0.02",
      "-strip",
      "-quality",
      "86",
      output,
    ]);
    before += statSync(input).size;
    after += statSync(output).size;
    count++;
  }
}
visit(root);
console.log(
  `${count} thumbnails: ${(before / 1024 / 1024).toFixed(2)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB (${Math.round((1 - after / before) * 100)}% smaller)`,
);
