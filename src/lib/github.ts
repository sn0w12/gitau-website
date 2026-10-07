import { withCache } from "./fetch-cache";
import { REPO } from "./site";

const API = "https://api.github.com";

const LANGUAGE_COLORS: Record<string, string> = {
    Astro: "#ff5a03",
    C: "#555555",
    "C++": "#f34b7d",
    CMake: "#DA3434",
    CSS: "#663399",
    Dockerfile: "#384d54",
    Go: "#00ADD8",
    HTML: "#e34c26",
    Java: "#b07219",
    JavaScript: "#f1e05a",
    JSON: "#292929",
    Kotlin: "#A97BFF",
    Lua: "#000080",
    Makefile: "#427819",
    Markdown: "#083fa1",
    Nix: "#7e7eff",
    Python: "#3572A5",
    Ruby: "#701516",
    Rust: "#dea584",
    SCSS: "#c6538c",
    Shell: "#89e051",
    Svelte: "#ff3e00",
    TOML: "#9c4221",
    TypeScript: "#3178c6",
    Vue: "#41b883",
    Zig: "#ec915c",
};

export interface RepositoryLanguage {
    language: string;
    percent: number;
    color?: string;
}

export interface ShowcaseRepository {
    repo: string;
    description?: string;
    stars?: number;
    forks?: number;
    avatarUrl?: string;
    languages: RepositoryLanguage[];
}

export const SHOWCASE_REPOS = [
    REPO,
    "tauri-apps/tauri",
    "facebook/react",
    "tailwindlabs/tailwindcss",
];

const REQUEST_TIMEOUT_MS = 8000;
const MAX_LANGUAGES = 3;

interface RepoResponse {
    full_name?: string;
    description?: string | null;
    stargazers_count?: number;
    forks_count?: number;
    owner?: { avatar_url?: string };
}

function toLanguages(bytes: Record<string, number>): RepositoryLanguage[] {
    const entries = Object.entries(bytes).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    if (total === 0) return [];

    const top = entries.slice(0, MAX_LANGUAGES);
    const languages = top.map(([language, count]) => ({
        language,
        percent: Math.round((count / total) * 100),
        color: LANGUAGE_COLORS[language],
    }));

    /* Rounding three shares independently can leave the bar a percent short,
     * which shows as a gap in the track. */
    const rounded = languages.reduce((sum, item) => sum + item.percent, 0);
    if (languages.length === entries.length && rounded !== 100) {
        languages[0].percent += 100 - rounded;
    }

    return languages;
}

interface GitHubResponse {
    ok: boolean;
    status: number;
    body: unknown;
}

async function github(path: string): Promise<GitHubResponse> {
    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "User-Agent": "gitau-website",
    };
    const token = import.meta.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    return withCache(
        `${API}${path}`,
        async () => {
            const response = await fetch(`${API}${path}`, {
                headers,
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            });
            return {
                ok: response.ok,
                status: response.status,
                body: await response.json(),
            };
        },
        (response) => response.ok
    );
}

async function fetchRepository(repo: string): Promise<ShowcaseRepository> {
    const [info, languages] = await Promise.all([
        github(`/repos/${repo}`),
        github(`/repos/${repo}/languages`),
    ]);

    if (!info.ok) {
        throw new Error(`GitHub responded with ${info.status} for ${repo}`);
    }
    if (!languages.ok) {
        throw new Error(
            `GitHub responded with ${languages.status} for ${repo} languages`
        );
    }

    const data = info.body as RepoResponse;

    return {
        repo: data.full_name ?? repo,
        description: data.description ?? undefined,
        stars: data.stargazers_count,
        forks: data.forks_count,
        avatarUrl: data.owner?.avatar_url,
        languages: toLanguages(languages.body as Record<string, number>),
    };
}

/* One repo failing should not empty the whole section, so a bad fetch falls
 * back to a card carrying the name and nothing else. Unlike the install
 * script, nothing here breaks the site when GitHub is unreachable or the
 * unauthenticated rate limit is spent. */
export async function getShowcaseRepositories(): Promise<ShowcaseRepository[]> {
    return Promise.all(
        SHOWCASE_REPOS.map(async (repo) => {
            try {
                return await fetchRepository(repo);
            } catch (error) {
                console.warn(
                    `Could not read ${repo} from GitHub: ${String(error)}`
                );
                return { repo, languages: [] };
            }
        })
    );
}
