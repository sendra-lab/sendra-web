/**
 * Pulls docs/ from the sendra-lab/Sendra repo and rewrites it into this
 * repo's Docusaurus docs structure.
 *
 * Pinning strategy
 * -----------------
 * SOURCE_REF below is a full commit SHA, not `main` and not a tag. As of
 * writing, sendra-lab/Sendra has no tags/releases at all, so "track the
 * latest release" isn't an option yet. Floating on `main` was rejected
 * because it makes this repo's build non-reproducible: an unrelated doc
 * edit landing on sendra's main could change generated output — or break
 * the build outright — on a sendra-web PR that touched nothing docs-related.
 * Pinning to a commit SHA means sync output only changes when a human
 * deliberately bumps SOURCE_REF (and reviews the diff in the PR that does
 * it), the same way a lockfile pins a dependency version.
 *
 * Revisit once sendra ships a release process: switch SOURCE_REF to track
 * the latest tag (or a `vX.Y.Z` pin) instead of a raw commit SHA, so docs
 * updates follow the same cadence as the releases they document.
 *
 * Override: set SENDRA_DOCS_REF to sync against a different ref (a branch,
 * tag, or commit) for local testing without editing this file.
 */

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SOURCE_OWNER = "sendra-lab";
const SOURCE_REPO = "Sendra";
const SOURCE_REF = "17c88bda43c5d3d8f4a3e2fc6036567bc3c9510e";
const SOURCE_DOCS_ROOT = "docs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const DOCS_DIR = path.join(repoRoot, "docs");
// Synced content lives entirely under docs/cli/ so it never collides with
// hand-written docs elsewhere in docs/ (e.g. docs/intro.md). The whole
// directory is wiped and rewritten on every run, which is what makes the
// sync idempotent — nothing outside it is ever touched.
const SYNC_TARGET_DIR = path.join(DOCS_DIR, "cli");

const ref = process.env.SENDRA_DOCS_REF ?? SOURCE_REF;
const token = process.env.SENDRA_DOCS_TOKEN;

interface TreeEntry {
  path: string;
  type: "blob" | "tree";
  sha: string;
}

interface GitTreeResponse {
  tree: TreeEntry[];
  truncated: boolean;
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "sendra-web-docs-sync",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchDocsFileList(): Promise<string[]> {
  const url = `https://api.github.com/repos/${SOURCE_OWNER}/${SOURCE_REPO}/git/trees/${ref}?recursive=1`;
  const res = await fetch(url, { headers: githubHeaders() });
  if (!res.ok) {
    throw new Error(
      `Failed to list ${SOURCE_OWNER}/${SOURCE_REPO}@${ref} tree: ${res.status} ${res.statusText}\n` +
        (await res.text()),
    );
  }
  const data = (await res.json()) as GitTreeResponse;
  if (data.truncated) {
    throw new Error(
      "GitHub tree API response was truncated — repo is too large for a single recursive listing.",
    );
  }
  return data.tree
    .filter((entry) => entry.type === "blob")
    .map((entry) => entry.path)
    .filter(
      (p) => p.startsWith(`${SOURCE_DOCS_ROOT}/`) && p.endsWith(".md"),
    );
}

async function fetchRawFile(sourcePath: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${SOURCE_OWNER}/${SOURCE_REPO}/${ref}/${sourcePath}`;
  const res = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

/** Path relative to docs/, e.g. "reference/requests.md" or "reference.md". */
type DocsRelPath = string;

function toDocsRelPath(fullPath: string): DocsRelPath {
  return fullPath.slice(`${SOURCE_DOCS_ROOT}/`.length);
}

/**
 * Maps a source docs/-relative path to this repo's output path (relative to
 * docs/cli/). `README.md` becomes `index.md` per Docusaurus's convention for
 * a folder's landing page. `reference.md` is special-cased the same way even
 * though it isn't literally named README.md: it's sendra's own topic index
 * for the sibling reference/ folder (a bullet list linking into it), so it
 * belongs *inside* reference/ as that category's landing page — left as a
 * sibling file, it and the reference/ folder both show up in the sidebar
 * labeled "Reference", which is confusing rather than merely sparse.
 */
function toOutputRelPath(sourceRel: DocsRelPath): string {
  if (sourceRel === "reference.md") return "reference/index.md";
  const base = path.posix.basename(sourceRel, ".md");
  const dir = path.posix.dirname(sourceRel); // "." for top-level files
  const outBase = base === "README" ? "index" : base;
  return dir === "." ? `${outBase}.md` : path.posix.join(dir, `${outBase}.md`);
}

/** Docusaurus route (site-root-relative) for a docs/-relative source path. */
function toDocRoute(sourceRel: DocsRelPath): string {
  const outRel = toOutputRelPath(sourceRel).replace(/\.md$/, "");
  const withoutIndex = outRel.replace(/(^|\/)index$/, "");
  const routeSuffix = withoutIndex === "" ? "" : `/${withoutIndex}`;
  return `/docs/cli${routeSuffix}`;
}

function extractTitle(body: string): string | undefined {
  const match = body.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim();
}

/** Order derived from reference.md / decisions/README.md's own bullet lists. */
function extractOrder(indexBody: string, indexDir: string): Map<string, number> {
  const order = new Map<string, number>();
  const linkPattern = /\]\(([^)#]+\.md)(#[^)]*)?\)/g;
  let i = 0;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(indexBody))) {
    const target = path.posix.normalize(path.posix.join(indexDir, match[1]));
    if (!order.has(target)) order.set(target, ++i);
  }
  return order;
}

function resolveLinkTarget(sourceRel: DocsRelPath, linkPath: string): string {
  const sourceDir = path.posix.dirname(sourceRel);
  return path.posix.normalize(path.posix.join(sourceDir, linkPath));
}

function rewriteLinks(
  body: string,
  sourceRel: DocsRelPath,
  knownDocs: Set<string>,
): string {
  // Matches every markdown link target: [text](target). Docusaurus's broken-
  // link check validates *any* relative link, not just ones ending in .md —
  // sendra's docs also link out to source files (../../sendra-core/src/...)
  // and example fixtures (../../examples/auth.yaml) that this sync doesn't
  // pull in, so every relative link needs handling, not just doc-to-doc ones.
  return body.replace(
    /(\]\()([^)\s]+)(\))/g,
    (full, open: string, target: string, close: string) => {
      // Leave scheme URLs (http:, https:, mailto:, ...) untouched.
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return full;
      // Leave same-page anchors and already-absolute paths untouched.
      if (target.startsWith("#") || target.startsWith("/")) return full;

      const hashIdx = target.indexOf("#");
      const linkPath = hashIdx === -1 ? target : target.slice(0, hashIdx);
      const fragment = hashIdx === -1 ? "" : target.slice(hashIdx);
      if (linkPath === "") return full;

      const resolved = resolveLinkTarget(sourceRel, linkPath);

      if (linkPath.endsWith(".md") && knownDocs.has(resolved)) {
        const route = toDocRoute(resolved);
        return `${open}${route}${fragment}${close}`;
      }

      // Anything else — a doc outside docs/ (../README.md), or a non-doc
      // file (source, example fixture) — isn't synced, so link straight at
      // the pinned commit on GitHub instead of a Docusaurus route that
      // would 404.
      const repoPath = path.posix.normalize(
        path.posix.join(SOURCE_DOCS_ROOT, path.posix.dirname(sourceRel), linkPath),
      );
      const githubUrl = `https://github.com/${SOURCE_OWNER}/${SOURCE_REPO}/blob/${ref}/${repoPath}${fragment}`;
      return `${open}${githubUrl}${close}`;
    },
  );
}

function buildFrontMatter(opts: {
  id: string;
  title: string;
  sidebarPosition?: number;
  editUrl: string;
}): string {
  const lines = [
    "---",
    `id: ${opts.id}`,
    `title: "${opts.title.replace(/"/g, '\\"')}"`,
    `custom_edit_url: ${opts.editUrl}`,
  ];
  if (opts.sidebarPosition !== undefined) {
    lines.push(`sidebar_position: ${opts.sidebarPosition}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

interface CategoryMeta {
  label: string;
  position: number;
  collapsed: boolean;
  link:
    | { type: "doc"; id: string }
    | { type: "generated-index"; description?: string };
}

async function writeCategory(dir: string, meta: CategoryMeta): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, "_category_.json"),
    `${JSON.stringify(meta, null, 2)}\n`,
    "utf8",
  );
}

async function main() {
  console.log(`Syncing docs/ from ${SOURCE_OWNER}/${SOURCE_REPO}@${ref}...`);

  const filePaths = await fetchDocsFileList();
  if (filePaths.length === 0) {
    throw new Error("No markdown files found under docs/ at the pinned ref — refusing to sync.");
  }

  const sourceRelPaths = filePaths.map(toDocsRelPath);
  const knownDocs = new Set(sourceRelPaths);

  const contents = new Map<DocsRelPath, string>();
  for (const rel of sourceRelPaths) {
    contents.set(rel, await fetchRawFile(`${SOURCE_DOCS_ROOT}/${rel}`));
  }

  const topOrder = extractOrder(contents.get("reference.md") ?? "", ".");
  const decisionsOrder = extractOrder(contents.get("decisions/README.md") ?? "", "decisions");

  // Clean previous run's output. Scoped to SYNC_TARGET_DIR only, so any
  // hand-written docs living elsewhere under docs/ are never touched.
  await rm(SYNC_TARGET_DIR, { recursive: true, force: true });
  await mkdir(SYNC_TARGET_DIR, { recursive: true });

  for (const rel of sourceRelPaths) {
    const raw = contents.get(rel)!;
    const title = extractTitle(raw) ?? path.basename(rel, ".md");
    const rewritten = rewriteLinks(raw, rel, knownDocs);

    const outRel = toOutputRelPath(rel);
    // Docusaurus ids may not contain a slash — location within docs/cli/
    // already disambiguates identically-named files in different folders
    // (e.g. reference/exit-codes.md vs decisions/exit-codes.md), so the
    // bare basename is all `id` needs to be.
    const id = path.posix.basename(outRel, ".md");
    // The two folder-index docs (reference/index.md, decisions/index.md) get
    // their place in the sidebar from their _category_.json's own
    // `position` below, not from a per-doc sidebar_position.
    const sidebarPosition = rel.startsWith("reference/")
      ? topOrder.get(rel)
      : rel.startsWith("decisions/")
        ? decisionsOrder.get(rel)
        : undefined;

    // "Edit this page" should send contributors to the actual source (the
    // sendra repo's main branch), not to sendra-web — editing the synced
    // copy here would be silently discarded on the next `pnpm sync-docs`.
    const editUrl = `https://github.com/${SOURCE_OWNER}/${SOURCE_REPO}/edit/main/${SOURCE_DOCS_ROOT}/${rel}`;

    const frontMatter = buildFrontMatter({ id, title, sidebarPosition, editUrl });
    const banner =
      `<!-- Auto-generated by \`pnpm sync-docs\` from ` +
      `${SOURCE_OWNER}/${SOURCE_REPO}@${ref.slice(0, 12)}:${SOURCE_DOCS_ROOT}/${rel}. ` +
      `Do not edit directly — edit the source in the sendra repo and re-run the sync. -->\n\n`;

    const outputPath = path.join(SYNC_TARGET_DIR, outRel);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, frontMatter + banner + rewritten, "utf8");
  }

  // Category metadata for the autogenerated sidebar. Written fresh every
  // run (SYNC_TARGET_DIR is wiped above) since it lives in the same synced
  // tree as the docs it describes.
  // "Documentation", not "CLI Reference" — sendra ships both `run`/`test`
  // (CLI) and `sendra tui` (interactive TUI), and reference/tui.md lives
  // right alongside the CLI-flag docs, so a CLI-scoped label would misdescribe
  // half the category's own contents.
  await writeCategory(SYNC_TARGET_DIR, {
    label: "Documentation",
    position: 2, // after hand-written docs/intro.md (sidebar_position: 1)
    collapsed: false,
    link: {
      type: "generated-index",
      description:
        "Reference and design-decision docs for Sendra, synced from the sendra-lab/Sendra repo.",
    },
  });
  await writeCategory(path.join(SYNC_TARGET_DIR, "reference"), {
    label: "Reference",
    position: 1,
    collapsed: false,
    link: { type: "doc", id: "index" },
  });
  await writeCategory(path.join(SYNC_TARGET_DIR, "decisions"), {
    label: "Design Decisions",
    position: 2,
    collapsed: false,
    link: { type: "doc", id: "index" },
  });

  console.log(`Synced ${sourceRelPaths.length} file(s) into ${path.relative(repoRoot, SYNC_TARGET_DIR)}/`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
