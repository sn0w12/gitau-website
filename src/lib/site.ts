export const SITE_NAME = "gitau";
export const SITE_DESCRIPTION =
    "A cross-platform Git desktop client. Status, diffs, and history run through a Rust backend, not a wrapper around the git command line.";

export const INSTALL_SCRIPT_PATH = "/install.sh";

export const REPO = "sn0w12/gitau";
export const REPO_URL = `https://github.com/${REPO}`;
export const README_URL = `${REPO_URL}#readme`;
export const RELEASES_URL = `${REPO_URL}/releases`;
export const LATEST_RELEASE_URL = `${RELEASES_URL}/latest`;
export const ISSUES_URL = `${REPO_URL}/issues`;
export const DISCUSSIONS_URL = `${REPO_URL}/discussions`;
export const LICENSE_URL = `${REPO_URL}/blob/master/LICENSE`;
export const LICENSE_NAME = "GPL-3.0";

export const SOURCE_INSTALL_URL = `https://raw.githubusercontent.com/${REPO}/master/scripts/install.sh`;

/**
 * The copyable one-liner. The origin comes in from `Astro.site`, which
 * `astro.config.mjs` is the only place to name, so a preview deployment or a
 * moved domain needs no source change.
 */
export function installCommand(origin: URL): string {
    return `curl -fsSL ${new URL(INSTALL_SCRIPT_PATH, origin).href} | sh`;
}
