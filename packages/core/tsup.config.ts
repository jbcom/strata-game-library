import { existsSync, readFileSync } from "node:fs";
import { libraryBuild } from "@strata-game-library/vite/tsup";

/**
 * Build config for @strata-game-library/core.
 *
 * Pure TypeScript algorithms — no React. React Three Fiber components live in
 * @strata-game-library/r3f.
 *
 * Entries are DERIVED from package.json's `exports` rather than listed by
 * hand. The previous config carried a comment claiming the two were kept in
 * sync, and they were not: three subpaths had no entry, so they resolved to
 * files the build never produced. Deriving them makes that impossible.
 */
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  exports: Record<string, { import?: string } | string>;
};

const entry: Record<string, string> = {};
for (const [subpath, target] of Object.entries(pkg.exports)) {
  const dist = typeof target === "string" ? target : target.import;
  if (!dist) continue;
  // "./dist/core/maze/index.js" -> entry key "core/maze/index"
  const key = dist.replace(/^\.\/dist\//, "").replace(/\.js$/, "");
  if (subpath === ".") {
    entry[key] = "src/index.ts";
    continue;
  }
  // Most subpaths mirror their dist path into src. A few predate the domain
  // layout and are flat files — ./shaders builds dist/shaders/index.js from
  // src/shaders.ts — so fall back to the barrel-less form when the mirrored
  // path does not exist.
  const mirrored = `src/${key}.ts`;
  const flattened = `src/${key.replace(/\/index$/, "")}.ts`;
  entry[key] = existsSync(mirrored) ? mirrored : flattened;
}

export default libraryBuild({
  name: "@strata-game-library/core",
  entry,
  external: ["three"],
});
