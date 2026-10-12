import type { APIRoute } from "astro";

import { renderOgImage } from "../lib/og";
import { getLatestRelease } from "../lib/releases";

export const GET: APIRoute = async () => {
    const release = await getLatestRelease();
    const png = await renderOgImage(release.version);

    return new Response(new Uint8Array(png), {
        headers: { "Content-Type": "image/png" },
    });
};
