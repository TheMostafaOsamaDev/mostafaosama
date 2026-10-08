// Turns a portrait photo into the site's dithered mask.
//
//   node scripts/portrait/build.mjs path/to/photo.jpg
//
// Grayscale, a square crop around the face, contrast normalised, then a 4×4 ordered (Bayer) dither.
// The output is two alpha masks drawn with CSS `mask-image` and filled with the ink token:
//   public/portrait-mask.png       opaque where the photo is dark  (light theme: dark ink on paper)
//   public/portrait-mask-dark.png  opaque where the photo is light (dark theme: light ink on paper)
// Without the second one, the dark theme would show a photo negative.
// Keep the source photo out of the repo; only the two masks are committed.
import sharp from "sharp";

const SIZE = 192; // 2x the largest size it is shown at (96px)
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const [, , input, outDir = "public"] = process.argv;
if (!input) {
  console.error("Usage: node scripts/portrait/build.mjs <photo> [outDir]");
  process.exit(1);
}

const { data, info } = await sharp(input)
  .rotate() // respect EXIF orientation
  .resize(SIZE, SIZE, { fit: "cover", position: sharp.strategy.attention })
  .grayscale()
  .normalise()
  .linear(1.15, -12) // a little extra contrast so the dither keeps the features
  .raw()
  .toBuffer({ resolveWithObject: true });

const light = Buffer.alloc(SIZE * SIZE * 4);
const dark = Buffer.alloc(SIZE * SIZE * 4);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const lum = data[(y * info.width + x) * info.channels] / 255;
    const threshold = (BAYER[y % 4][x % 4] + 0.5) / 16;
    const i = (y * SIZE + x) * 4;
    const isDark = lum < threshold;
    light[i + 3] = isDark ? 255 : 0;
    dark[i + 3] = isDark ? 0 : 255;
  }
}

for (const [buffer, name] of [
  [light, "portrait-mask.png"],
  [dark, "portrait-mask-dark.png"],
]) {
  const file = `${outDir}/${name}`;
  await sharp(buffer, { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .png({ compressionLevel: 9, palette: true, colours: 2 })
    .toFile(file);
  console.log(`Wrote ${file} (${SIZE}×${SIZE})`);
}
