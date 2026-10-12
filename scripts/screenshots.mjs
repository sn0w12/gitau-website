import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

import { IMAGE_PATTERN, isVariant, variantPath } from "./images.mjs";

const SOURCE_DIR = join(process.cwd(), "public", "screenshots");
const OUT_FILE = join(process.cwd(), ".generated", "screenshots.json");

const WIDTHS = [384, 768, 1152, 1280, 1600];

const entries = await readdir(SOURCE_DIR);
const masters = entries.filter(
    (name) => IMAGE_PATTERN.test(name) && !isVariant(name)
);

const manifest = {};
let generated = 0;

for (const name of masters) {
    const source = join(SOURCE_DIR, name);
    const { width, height } = await sharp(source).metadata();
    const { isOpaque } = await sharp(source).stats();
    const key = `/screenshots/${name}`;
    const candidates = [];

    for (const target of WIDTHS) {
        if (target >= width) continue;

        const variant = variantPath(name, target);
        const resized = sharp(source).resize({ width: target });
        if (isOpaque) resized.removeAlpha();

        await resized
            .png({ compressionLevel: 9, effort: 10 })
            .toFile(join(SOURCE_DIR, variant));
        candidates.push(`${key.replace(name, variant)} ${target}w`);
        generated += 1;
    }

    candidates.push(`${key} ${width}w`);
    manifest[key] = { width, height, srcset: candidates.join(", ") };
}

await mkdir(join(process.cwd(), ".generated"), { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(manifest, null, 4)}\n`);

console.log(
    `Wrote ${generated} resized variants for ${masters.length} screenshots to .generated/screenshots.json`
);
