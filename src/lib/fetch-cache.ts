import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

/* Astro re-evaluates page frontmatter on every dev request, so an in-memory
 * promise only survives a single build. Responses go to disk instead, keyed by
 * URL and token, so reloads and repeat builds read the file rather than spend
 * the API rate limit again. */

const CACHE_DIR = join(process.cwd(), "node_modules/.cache/gitau-website");

const DEFAULT_TTL_MS = 15 * 60 * 1000;

interface CacheEntry<T> {
    expiresAt: number;
    value: T;
}

function ttlMs(): number {
    const raw = import.meta.env.GITHUB_CACHE_TTL_MS;
    if (raw === undefined || raw === "") return DEFAULT_TTL_MS;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : DEFAULT_TTL_MS;
}

function cachePath(key: string): string {
    /* The token rides in the key so switching between authenticated and
     * unauthenticated builds never reuses the other's quota. Only the digest
     * reaches the filesystem. */
    const digest = createHash("sha256")
        .update(`${key}\n${import.meta.env.GITHUB_TOKEN ?? ""}`)
        .digest("hex")
        .slice(0, 32);
    return join(CACHE_DIR, `${digest}.json`);
}

async function read<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
        const raw = await readFile(cachePath(key), "utf8");
        const entry = JSON.parse(raw) as CacheEntry<T>;
        return entry.expiresAt > Date.now() ? entry : null;
    } catch {
        /* A miss, an unreadable file, or a half-written entry all mean the
         * same thing to the caller: go to the network. */
        return null;
    }
}

async function write<T>(key: string, value: T): Promise<void> {
    const entry: CacheEntry<T> = { expiresAt: Date.now() + ttlMs(), value };
    const path = cachePath(key);
    const temp = `${path}.${process.pid}.tmp`;

    try {
        await mkdir(CACHE_DIR, { recursive: true });
        await writeFile(temp, JSON.stringify(entry), "utf8");
        /* Rename last so a concurrent reader never sees a partial write. */
        await rename(temp, path);
    } catch {
        /* A cache that cannot be written is not worth failing a build over,
         * so the next read pays the network price again. */
    }
}

export async function withCache<T>(
    key: string,
    load: () => Promise<T>,
    isCacheable: (value: T) => boolean = () => true
): Promise<T> {
    const cached = await read<T>(key);
    if (cached) return cached.value;

    const value = await load();
    if (isCacheable(value)) await write(key, value);
    return value;
}

export const CACHE_PATH = CACHE_DIR;
