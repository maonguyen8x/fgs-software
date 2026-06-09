import { readFileSync, writeFileSync } from "fs";
import { PNG } from "pngjs";

const inputPath = "public/images/vietnam-map.png";
const buf = readFileSync(inputPath);
const png = PNG.sync.read(buf);

for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const i = (png.width * y + x) << 2;
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const isNearWhite = r > 210 && g > 210 && b > 210 && max - min < 28;
    if (isNearWhite) {
      png.data[i + 3] = 0;
    }
  }
}

writeFileSync(inputPath, PNG.sync.write(png));
console.log(`Transparent PNG saved: ${png.width}x${png.height}`);
