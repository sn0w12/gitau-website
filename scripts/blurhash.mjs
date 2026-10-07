import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { encode } from "blurhash";
import sharp from "sharp";

const PUBLIC_DIR = join(process.cwd(), "public");
const OUT_DIR = join(process.cwd(), ".generated");
const OUT_FILE = join(OUT_DIR, "blurhash.json");

const COMPONENTS_X = 4;
const COMPONENTS_Y = 3;
const SAMPLE_WIDTH = 32;

async function hashFor(file) {
    const { data, info } = await sharp(join(PUBLIC_DIR, file))
        .resize(SAMPLE_WIDTH, SAMPLE_WIDTH, { fit: "inside" })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    return encode(
        new Uint8ClampedArray(data),
        info.width,
        info.height,
        COMPONENTS_X,
        COMPONENTS_Y
    );
}

const entries = await readdir(PUBLIC_DIR);
const images = entries.filter((file) => /\.(png|webp|jpe?g)$/.test(file));

const hashes = {};
for (const file of images) {
    try {
        hashes[`/${file}`] = await hashFor(file);
    } catch (error) {
        console.warn(`Could not hash ${file}: ${String(error)}`);
    }
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(hashes, null, 4)}\n`);
console.log(
    `Wrote ${Object.keys(hashes).length} blurhashes to .generated/blurhash.json`
);
