import type { APIRoute } from "astro";

export const prerender = true;

const PATHS = ["/", "/download/"];

export const GET: APIRoute = ({ site }) => {
    if (!site) {
        throw new Error(
            "`site` must be set in astro.config.mjs to build the sitemap"
        );
    }

    const urls = PATHS.map(
        (path) => `    <url><loc>${new URL(path, site).href}</loc></url>`
    ).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

    return new Response(xml, {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
};
