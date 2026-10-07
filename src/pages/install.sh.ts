import { withCache } from "../lib/fetch-cache";
import { SOURCE_INSTALL_URL } from "../lib/site";

export const prerender = true;

const FETCH_TIMEOUT_MS = 8000;

export async function GET(): Promise<Response> {
    const result = await withCache(
        SOURCE_INSTALL_URL,
        async () => {
            const response = await fetch(SOURCE_INSTALL_URL, {
                signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
            });
            return {
                ok: response.ok,
                status: response.status,
                script: await response.text(),
            };
        },
        (value) => value.ok
    );

    if (!result.ok) {
        throw new Error(
            `Could not download the install script from ${SOURCE_INSTALL_URL}: GitHub responded with ${result.status}`
        );
    }

    return new Response(result.script, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
