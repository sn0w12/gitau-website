import raw from "../../.generated/screenshots.json";

interface ScreenshotSource {
    width: number;
    height: number;
    srcset: string;
}

const sources = raw as Record<string, ScreenshotSource>;

/* Desktop resolves to the 1080p master rather than the ~1088px the layout gives
 * it, because the dialog zooms this same file and a narrow candidate upscales
 * there. */
const DESKTOP = "(min-width: 1024px) 1920px";

export const HERO_SIZES = `${DESKTOP}, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2.5rem)`;
export const DIALOG_SIZES = `${DESKTOP}, 96vw`;

export function screenshotSource(path: string): ScreenshotSource {
    const source = sources[path];
    if (!source) {
        throw new Error(
            `${path} has no resized variants. Screenshots live in public/screenshots, and scripts/screenshots.mjs writes the ladder.`
        );
    }
    return source;
}
