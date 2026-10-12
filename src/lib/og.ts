import { readFile } from "node:fs/promises";
import { join } from "node:path";

import satori from "satori";
import { jsx } from "satori/jsx/jsx-runtime";
import sharp from "sharp";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const ROOT = process.cwd();

/* Colors and the dot lattice are the dark theme from global.css, so the card
 * reads as the site rather than a second visual language. `convertColors`
 * below turns the oklch() and color-mix() values into rgb() for the SVG. */
const BACKGROUND = "color-mix(in srgb, oklch(0.145 0 0) 95%, white)";
const FOREGROUND = "oklch(0.97 0 0)";
const MUTED = "color-mix(in srgb, oklch(0.556 0 0) 90%, white)";
const ACCENT = "oklch(0.708 0 0)";

/* Satori parses fonts with opentype.js, which reads WOFF but not the WOFF2
 * that Fontsource ships, so the static WOFF of each face is used instead. The
 * variable faces would also carry an `fvar` table the parser cannot read. */
const FONT_FILES = {
    heading:
        "node_modules/@fontsource/kalnia/files/kalnia-latin-600-normal.woff",
    display:
        "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff",
};

async function font(file: string, name: string, weight: number) {
    return {
        name,
        weight: weight as 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
        style: "normal" as const,
        data: await readFile(join(ROOT, file)),
    };
}

async function loadFonts() {
    return Promise.all([
        font(FONT_FILES.heading, "Kalnia", 600),
        font(FONT_FILES.display, "Instrument Serif", 400),
    ]);
}

/* Same 10px lattice as the `carbon` utility, faded from the top center. It
 * rides on the root as a background so it always paints behind the type; an
 * absolutely positioned child would render over it. */
function dotLattice(): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
<defs>
<radialGradient id="fade" cx="50%" cy="0%" r="80%">
<stop offset="0%" stop-color="#fff" stop-opacity="0.34"/>
<stop offset="100%" stop-color="#fff" stop-opacity="0"/>
</radialGradient>
<pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
<circle cx="5" cy="5" r="1.5" fill="${ACCENT}"/>
</pattern>
<mask id="mask"><rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#fade)"/></mask>
</defs>
<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#dots)" mask="url(#mask)"/>
</svg>`;

    return `url("data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}")`;
}

export async function renderOgImage(version: string): Promise<Buffer> {
    const fonts = await loadFonts();

    const tree = jsx("div", {
        style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
            gap: "30px",
            width: `${OG_WIDTH}px`,
            height: `${OG_HEIGHT}px`,
            padding: "72px",
            backgroundColor: BACKGROUND,
            backgroundImage: dotLattice(),
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%",
            color: FOREGROUND,
            fontFamily: "Kalnia",
        },
        children: [
            jsx("div", {
                style: {
                    fontFamily: "Kalnia",
                    fontWeight: 600,
                    fontSize: "220px",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                },
                children: "GITAU",
            }),
            jsx("div", {
                style: {
                    fontFamily: "Instrument Serif",
                    fontSize: "92px",
                    lineHeight: 1,
                    color: MUTED,
                },
                children: `v${version}`,
            }),
        ],
    });

    const svg = await satori(tree, {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        fonts,
        convertColors: true,
    });

    return sharp(Buffer.from(svg)).png().toBuffer();
}
