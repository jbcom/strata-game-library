import { defineConfig, markdown } from "sourcey";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";

const contentRoot = import.meta.dirname;

function sourcePages(directory: string): string[] {
  const absolute = join(contentRoot, directory);
  const pages: string[] = [];
  const visit = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) {
        visit(path);
      } else if (
        entry.isFile() &&
        /\.md$/i.test(entry.name) &&
        entry.name !== "AGENTS.md"
      ) {
        pages.push(relative(contentRoot, path).replace(/\.md$/i, ""));
      }
    }
  };
  visit(absolute);
  return pages.sort();
}

export default defineConfig({
  name: "Strata Game Library",
  siteUrl: "https://jonbogaty.com",
  baseUrl: "/strata-game-library",
  prettyUrls: "slash",
  theme: {
    preset: "default",
    colors: {
      primary: "#2d9d78",
      light: "#5bcf9b",
      dark: "#176247",
    },
    fonts: {
      sans: "Space Grotesk",
      mono: "JetBrains Mono",
    },
    layout: {
      sidebar: "18rem",
      toc: "15rem",
      content: "52rem",
    },
  },
  logo: {
    light: "../.github/assets/strata-hero.webp",
    dark: "../.github/assets/strata-hero.webp",
    href: "/strata-game-library/",
  },
  favicon: "../.github/assets/strata-favicon.svg",
  ogImage: "../.github/assets/strata-hero.webp",
  repo: "https://github.com/jbcom/strata-game-library",
  editBranch: "main",
  editBasePath: "docs",
  codeSamples: ["typescript", "javascript"],
  navigation: {
    tabs: [
      {
        tab: "Documentation",
        slug: "",
        source: markdown({
          groups: [
            {
              group: "Getting Started",
              pages: ["introduction", "quickstart", "architecture", ...sourcePages("getting-started")],
            },
            {
              group: "Reference",
              pages: ["packages", "contributing", "security", "MIGRATION_MAP"],
            },
            {
              group: "Core systems",
              pages: sourcePages("core"),
            },
            {
              group: "Shaders and presets",
              pages: [...sourcePages("shaders"), ...sourcePages("presets")],
            },
            {
              group: "Framework design",
              pages: [
                "architecture/PACKAGE_STRATEGY",
                "architecture/rfc/RFC-001-GAME-ORCHESTRATION", // pragma: allowlist secret
                "architecture/rfc/RFC-002-COMPOSITIONAL-OBJECTS", // pragma: allowlist secret
                "architecture/rfc/RFC-003-WORLD-TOPOLOGY", // pragma: allowlist secret
                "architecture/rfc/RFC-004-DECLARATIVE-GAMES", // pragma: allowlist secret
              ],
            },
            {
              group: "Migration guides",
              pages: [
                "architecture/guides/MIGRATION",
                "architecture/guides/MIGRATION_DECLARATIVE", // pragma: allowlist secret
                "architecture/guides/MIGRATION_V2",
                "architecture/guides/TSUP_MIGRATION",
              ],
            },
            {
              group: "Adapters and plugins",
              pages: [
                ...sourcePages("audio-synth"),
                ...sourcePages("capacitor-plugin"),
                ...sourcePages("mobile"),
                ...sourcePages("model-synth"),
              ],
            },
            {
              group: "Guides and examples",
              pages: [...sourcePages("guides"), ...sourcePages("examples"), ...sourcePages("showcase")],
            },
            {
              group: "API reference",
              pages: sourcePages("packages"),
            },
          ],
        }),
      },
    ],
  },
  navbar: {
    links: [{ type: "github", href: "https://github.com/jbcom/strata-game-library", label: "GitHub" }],
    primary: { type: "button", label: "Get started", href: "/strata-game-library/quickstart/" },
  },
  footer: {
    links: [
      { type: "github", href: "https://github.com/jbcom/strata-game-library", label: "GitHub" },
      { type: "npm", href: "https://www.npmjs.com/package/strata-game-library", label: "npm" },
    ],
  },
  search: { featured: ["introduction", "quickstart", "packages"] },
});
