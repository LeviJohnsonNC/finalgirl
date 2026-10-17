import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const images = [];
function visit(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, item.name);
    if (item.isDirectory()) visit(file);
    else if (/\.(png|jpe?g|webp)$/i.test(file)) images.push(file);
  }
}
visit('src/assets');
if (!images.length) throw new Error('No artwork found. A build with missing artwork is not a release check.');
for (const file of images) {
  const bytes = readFileSync(file);
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = bytes[0] === 255 && bytes[1] === 216;
  const webp = bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  if (bytes.length < 32 || !(png || jpeg || webp)) throw new Error('Invalid or stubbed artwork: ' + file);
}
console.log(`Verified ${images.length} original artwork files.`);
