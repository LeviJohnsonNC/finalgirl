// Small derivatives only; source identity images are never modified.
import { readdirSync, mkdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { execFileSync } from "node:child_process";
const root = "src/assets/characters";
let count = 0,
  total = 0;
function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const input = join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(input);
      continue;
    }
    if (!input.endsWith(".png")) continue;
    const output = join(
      "src/assets/collection-portraits",
      relative(root, input).replace(/\.png$/, ".webp"),
    );
    mkdirSync(dirname(output), { recursive: true });
    execFileSync("magick", [
      input,
      "-auto-orient",
      "-resize",
      "256x256>",
      "-strip",
      "-quality",
      "78",
      output,
    ]);
    const bytes = statSync(output).size;
    if (bytes > 30 * 1024)
      throw new Error("Portrait exceeds shelf budget: " + output);
    total += bytes;
    count++;
  }
}
visit(root);
console.log(
  `${count} shelf portrait derivatives: ${(total / 1024).toFixed(0)} KiB total`,
);
