/* Gera a imagem Open Graph (1200×630) a partir do bg.png.
   Executar: node scripts/generate-og.mjs  (também corre no prebuild) */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src/assets/bg.png');
const outDir = join(root, 'public/og');
const out = join(outDir, 'degan-og.jpg');

const W = 1200;
const H = 630;

const overlay = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#080A0F" stop-opacity="0.35"/>
      <stop offset="0.55" stop-color="#080A0F" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#080A0F" stop-opacity="0.92"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <text x="80" y="500" fill="#EAEDF2" font-family="Georgia, 'Times New Roman', serif" font-size="86" font-weight="300" letter-spacing="3">R.S. Degan</text>
  <rect x="82" y="524" width="120" height="2" fill="#C9974D"/>
  <text x="80" y="576" fill="#9FB8D4" font-family="Georgia, serif" font-style="italic" font-size="34">Os Dragões Brancos</text>
  <text x="80" y="112" fill="#C9974D" font-family="Arial, sans-serif" font-size="20" letter-spacing="6">Bem vindo à Elarion</text>
</svg>`);

await mkdir(outDir, { recursive: true });
await sharp(src)
  .resize(W, H, { fit: 'cover', position: 'top' })
  .modulate({ saturation: 0.62, brightness: 0.62 })
  .composite([{ input: overlay }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(out);

console.log('OG image gerada:', out);
