import path from 'path';
import fs from 'fs';
import { PNG } from 'pngjs';

function makeIconSync(size, outPath) {
  const png = new PNG({ width: size, height: size });
  // fill background green (#10B981)
  const r = 0x10, g = 0xB9, b = 0x81, a = 0xFF;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  // draw a white circle-ish center badge
  const center = size / 2;
  const radius = Math.floor(size * 0.25);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center + Math.floor(size * 0.05);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        const idx = (size * y + x) << 2;
        png.data[idx] = 0xFF;
        png.data[idx + 1] = 0xFF;
        png.data[idx + 2] = 0xFF;
        png.data[idx + 3] = 0xFF;
      }
    }
  }

  // draw a white rectangle at bottom
  const rectW = Math.floor(size * 0.6);
  const rectH = Math.floor(size * 0.12);
  const rectX = Math.floor((size - rectW) / 2);
  const rectY = Math.floor(size * 0.65);
  for (let yy = rectY; yy < rectY + rectH; yy++) {
    for (let xx = rectX; xx < rectX + rectW; xx++) {
      const idx = (size * yy + xx) << 2;
      png.data[idx] = 0xFF;
      png.data[idx + 1] = 0xFF;
      png.data[idx + 2] = 0xFF;
      png.data[idx + 3] = 0xFF;
    }
  }

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(outPath, buffer);
  console.log('Wrote', outPath);
}

function main(){
  const outDir = path.join(process.cwd(), 'public', 'icons');
  makeIconSync(192, path.join(outDir, 'icon-192.png'));
  makeIconSync(512, path.join(outDir, 'icon-512.png'));
  makeIconSync(180, path.join(outDir, 'apple-touch-icon.png'));
  
  // Generate favicon.ico (32x32 is standard)
  makeIconSync(32, path.join(process.cwd(), 'public', 'favicon.ico'));
  console.log('Wrote', path.join(process.cwd(), 'public', 'favicon.ico'));
}

main();
