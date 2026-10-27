// Run from any directory. --write is an explicit metadata refresh, not approval.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const names = readdirSync(join(root, "images")).sort();
if (
  names.length !== 32 ||
  names.some((name) => !/-(desktop|phone)\.jpg$/.test(name))
)
  throw new Error("Expected all 32 reviewed desktop/phone JPGs.");
const records = names.map((file) => {
  const bytes = readFileSync(join(root, "images", file));
  return {
    file,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
});
const manifestPath = join(root, "manifest.json");
if (process.argv.includes("--write")) {
  const sourceRevision = process.argv[process.argv.indexOf("--source") + 1];
  if (
    !process.argv.includes("--source") ||
    !/^[a-f0-9]{40}$/.test(sourceRevision ?? "")
  )
    throw new Error("Supply --source with the approved source revision.");
  const images = records.map((record) => {
    const [width, height] = execFileSync(
      "magick",
      ["identify", "-format", "%w %h", join(root, "images", record.file)],
      { encoding: "utf8" },
    )
      .split(" ")
      .map(Number);
    return { ...record, width, height };
  });
  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        sourceRevision,
        synthetic: true,
        viewports: {
          desktop: [1366, 768],
          phone: [390, 844],
          narrowValidation: [320, 568],
        },
        images,
      },
      null,
      2,
    ) + "\n",
  );
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.images.length !== records.length)
    throw new Error("Manifest inventory differs.");
  for (const record of records) {
    const saved = manifest.images.find((image) => image.file === record.file);
    if (
      !saved ||
      saved.bytes !== record.bytes ||
      saved.sha256 !== record.sha256
    )
      throw new Error(`Reference differs: ${record.file}`);
  }
}
console.log(
  `Verified ${records.length} reference images (${records.reduce((sum, record) => sum + record.bytes, 0)} bytes).`,
);
