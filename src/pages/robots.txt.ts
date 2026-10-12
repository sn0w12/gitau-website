import type { APIRoute } from "astro";

export const prerender = true;

const AI_CRAWLERS = [
    "GPTBot",
    "OAI-SearchBot",
    "PerplexityBot",
    "ClaudeBot",
    "Google-Extended",
    "Applebot-Extended",
];

export const GET: APIRoute = ({ site }) => {
    const lines = ["User-agent: *", "Allow: /"];

    for (const crawler of AI_CRAWLERS) {
        lines.push("", `User-agent: ${crawler}`, "Allow: /");
    }

    if (site) {
        lines.push("", `Sitemap: ${new URL("/sitemap.xml", site).href}`);
    }

    return new Response(`${lines.join("\n")}\n`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
};
