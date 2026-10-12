import {
    LICENSE_URL,
    MAINTAINER,
    MAINTAINER_URL,
    REPO_URL,
    SITE_DESCRIPTION,
    SITE_NAME,
} from "./site";

export function structuredData(origin: URL) {
    const home = origin.href;
    const maintainer = `${home}#maintainer`;

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Person",
                "@id": maintainer,
                name: MAINTAINER,
                url: MAINTAINER_URL,
                sameAs: [MAINTAINER_URL],
            },
            {
                "@type": "WebSite",
                "@id": `${home}#website`,
                url: home,
                name: SITE_NAME,
                description: SITE_DESCRIPTION,
                inLanguage: "en",
                publisher: { "@id": maintainer },
            },
            {
                "@type": "SoftwareApplication",
                "@id": `${home}#app`,
                name: SITE_NAME,
                description: SITE_DESCRIPTION,
                applicationCategory: "DeveloperApplication",
                operatingSystem: "Linux, macOS, Windows",
                license: LICENSE_URL,
                codeRepository: REPO_URL,
                sameAs: [REPO_URL],
                author: { "@id": maintainer },
                offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                },
            },
        ],
    };
}
