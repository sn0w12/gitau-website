import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

import { encode } from "blurhash";
import sharp from "sharp";

const PUBLIC_DIR = join(process.cwd(), "public");
const OUT_DIR = join(process.cwd(), ".generated");
const OUT_FILE = join(OUT_DIR, "blurhash.json");

const COMPONENTS_X = 4;
const COMPONENTS_Y = 3;
const SAMPLE_WIDTH = 32;
const IMAGE_PATTERN = /\.(png|webp|jpe?g)$/i;

async function hashFor(file) {
    const { data, info } = await sharp(file)
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

/* Screenshots live in subdirectories, so a flat `readdir` of `public/` never
 * reached them and they were left without a placeholder. */
async function collectImages(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await collectImages(path)));
        } else if (IMAGE_PATTERN.test(entry.name)) {
            files.push(path);
        }
    }

    return files;
}

const images = await collectImages(PUBLIC_DIR);

const hashes = {};
for (const file of images) {
    const key = `/${relative(PUBLIC_DIR, file).split(sep).join("/")}`;
    try {
        hashes[key] = await hashFor(file);
    } catch (error) {
        console.warn(`Could not hash ${key}: ${String(error)}`);
    }
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(hashes, null, 4)}\n`);
console.log(
    `Wrote ${Object.keys(hashes).length} blurhashes to .generated/blurhash.json`
);
