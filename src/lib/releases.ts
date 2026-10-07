import { withCache } from "./fetch-cache";
import { RELEASES_URL, REPO } from "./site";

export interface ReleaseAsset {
    name: string;
    url: string;
    size: number;
}

export interface Release {
    tag: string;
    version: string;
    publishedAt: string | null;
    url: string;
    assets: ReleaseAsset[];
}

export interface DownloadVariant {
    label: string;
    fileName: string;
    url: string;
    size: number | null;
}

export interface DownloadOption {
    id: "macos" | "windows";
    kind: "download";
    label: string;
    variants: DownloadVariant[];
}

/** A bare AppImage in the downloads folder is a worse first run than letting
 *  the script pick the right build and put it on PATH. */
export interface InstallOption {
    id: "linux";
    kind: "install";
    label: string;
}

export type PlatformOption = DownloadOption | InstallOption;

const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;
const REQUEST_TIMEOUT_MS = 8000;
const FALLBACK_VERSION = "0.2.0";

let pending: Promise<Release> | null = null;

export function getLatestRelease(): Promise<Release> {
    pending ??= fetchLatestRelease();
    return pending;
}

async function fetchLatestRelease(): Promise<Release> {
    try {
        const response = await withCache(
            API_URL,
            async () => {
                const fetched = await fetch(API_URL, {
                    headers: {
                        Accept: "application/vnd.github+json",
                        "User-Agent": "gitau-website",
                    },
                    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
                });
                return {
                    ok: fetched.ok,
                    status: fetched.status,
                    body: await fetched.json(),
                };
            },
            (result) => result.ok
        );

        if (!response.ok) {
            throw new Error(`GitHub responded with ${response.status}`);
        }

        const data = response.body as {
            tag_name?: string;
            published_at?: string;
            html_url?: string;
            assets?: {
                name?: string;
                browser_download_url?: string;
                size?: number;
            }[];
        };

        const tag = data.tag_name;
        if (!tag) {
            throw new Error("the latest release has no tag");
        }

        return {
            tag,
            version: tag.replace(/^v/, ""),
            publishedAt: data.published_at ?? null,
            url: data.html_url ?? `${RELEASES_URL}/tag/${tag}`,
            assets: (data.assets ?? []).flatMap((asset) =>
                asset.name && asset.browser_download_url
                    ? [
                          {
                              name: asset.name,
                              url: asset.browser_download_url,
                              size: asset.size ?? 0,
                          },
                      ]
                    : []
            ),
        };
    } catch (error) {
        console.warn(
            `Could not read the latest release from GitHub, using v${FALLBACK_VERSION}: ${String(error)}`
        );
        return {
            tag: `v${FALLBACK_VERSION}`,
            version: FALLBACK_VERSION,
            publishedAt: null,
            url: `${RELEASES_URL}/tag/v${FALLBACK_VERSION}`,
            assets: [],
        };
    }
}

interface VariantSpec {
    label: string;
    fileName: (version: string) => string;
}

function toVariant(release: Release, spec: VariantSpec): DownloadVariant {
    const fileName = spec.fileName(release.version);
    const asset = release.assets.find(
        (candidate) => candidate.name === fileName
    );

    /* A platform the release notes promise but the API has no asset for still
     * gets a link: Tauri names its bundles predictably, so the URL is right as
     * soon as the build lands. */
    return {
        label: spec.label,
        fileName,
        url:
            asset?.url ?? `${RELEASES_URL}/download/${release.tag}/${fileName}`,
        size: asset && asset.size > 0 ? asset.size : null,
    };
}

export function platformOptions(release: Release): PlatformOption[] {
    const variant = (spec: VariantSpec) => toVariant(release, spec);

    return [
        {
            id: "macos",
            kind: "download",
            label: "macOS",
            variants: [
                variant({
                    label: "Universal",
                    fileName: (v) => `gitau_${v}_universal.dmg`,
                }),
            ],
        },
        {
            id: "windows",
            kind: "download",
            label: "Windows",
            variants: [
                variant({
                    label: "Intel/AMD",
                    fileName: (v) => `gitau_${v}_x64-setup.exe`,
                }),
            ],
        },
        {
            id: "linux",
            kind: "install",
            label: "Linux",
        },
    ];
}

export function formatBytes(bytes: number | null): string | null {
    if (!bytes) return null;
    const megabytes = bytes / (1024 * 1024);
    if (megabytes >= 1) return `${megabytes.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
}
