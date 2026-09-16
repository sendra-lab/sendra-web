/**
 * Decides whether the docs-sync CI job should run `docusaurus docs:version`
 * for the Sendra version currently being synced.
 *
 * Docusaurus versioning snapshots the *current* docs into
 * versioned_docs/version-X.Y.Z + versions.json. That's meaningful at a
 * minor/major boundary (the docs shape or content may have actually
 * changed) but not at a patch bump — patch releases don't warrant a new
 * permanent snapshot, so docs stay on "current" (tracking main) for those.
 *
 * This only decides *whether* to version; it never touches docs/ content
 * itself (that's scripts/sync-docs.ts's job) and never touches
 * versioned_docs/ or versions.json directly (that's `docusaurus
 * docs:version`'s job).
 */

import { appendFileSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SOURCE_OWNER = "sendra-lab";
const SOURCE_REPO = "Sendra";
const SOURCE_BRANCH = "main";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const VERSIONS_JSON = path.join(repoRoot, "versions.json");
const VERSIONED_DOCS_DIR = path.join(repoRoot, "versioned_docs");

const token = process.env.SENDRA_DOCS_TOKEN;

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "sendra-web-docs-sync",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Mirrors scripts/sync-docs.ts's ref resolution so the version we read
 * matches the content that was actually synced in this run. */
async function resolveHeadSha(): Promise<string> {
  const url = `https://api.github.com/repos/${SOURCE_OWNER}/${SOURCE_REPO}/commits/${SOURCE_BRANCH}`;
  const res = await fetch(url, {
    headers: { ...githubHeaders(), Accept: "application/vnd.github.sha" },
  });
  if (!res.ok) {
    throw new Error(
      `Failed to resolve ${SOURCE_OWNER}/${SOURCE_REPO}@${SOURCE_BRANCH} HEAD: ${res.status} ${res.statusText}\n` +
        (await res.text()),
    );
  }
  return (await res.text()).trim();
}

async function fetchCargoToml(ref: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${SOURCE_OWNER}/${SOURCE_REPO}/${ref}/Cargo.toml`;
  const res = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

interface SemVer {
  major: number;
  minor: number;
  patch: number;
  raw: string;
}

function parseSemVer(raw: string): SemVer {
  const match = raw.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) throw new Error(`Not a semver string: "${raw}"`);
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    raw,
  };
}

/** Reads `version = "X.Y.Z"` out of Cargo.toml's [workspace.package] table. */
function extractWorkspaceVersion(cargoToml: string): SemVer {
  const sectionMatch = cargoToml.match(/\[workspace\.package\]([\s\S]*?)(?:\n\[|$)/);
  if (!sectionMatch) {
    throw new Error("Cargo.toml has no [workspace.package] section.");
  }
  const versionMatch = sectionMatch[1].match(/^\s*version\s*=\s*"([^"]+)"/m);
  if (!versionMatch) {
    throw new Error("[workspace.package] has no version field.");
  }
  return parseSemVer(versionMatch[1]);
}

/**
 * Returns the most recently versioned docs snapshot already committed, or
 * `undefined` if none exists yet (the first-ever versioning case).
 *
 * versions.json is Docusaurus's own source of truth for version ordering
 * (newest first), so it's preferred over listing versioned_docs/ directly.
 * Falls back to scanning versioned_docs/ if versions.json is missing but the
 * directory somehow isn't (shouldn't normally happen — they're written
 * together by `docusaurus docs:version` — but this keeps the "no last
 * version" path strictly meaning "no snapshot exists", not "one file is
 * missing").
 */
async function findLastVersionedSnapshot(): Promise<SemVer | undefined> {
  const versions = await readVersionsJson();
  if (versions.length > 0) return parseSemVer(versions[0]);

  const dirVersions = await readVersionedDocsDir();
  if (dirVersions.length === 0) return undefined;
  dirVersions.sort((a, b) => b.major - a.major || b.minor - a.minor || b.patch - a.patch);
  return dirVersions[0];
}

async function readVersionsJson(): Promise<string[]> {
  try {
    const raw = await readFile(VERSIONS_JSON, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function readVersionedDocsDir(): Promise<SemVer[]> {
  let entries: string[];
  try {
    entries = await readdir(VERSIONED_DOCS_DIR);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  return entries
    .map((name) => name.match(/^version-(\d+\.\d+\.\d+)$/)?.[1])
    .filter((v): v is string => Boolean(v))
    .map(parseSemVer);
}

function writeOutput(name: string, value: string): void {
  console.log(`${name}=${value}`);
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `${name}=${value}\n`);
  }
}

async function main() {
  // SENDRA_RELEASE_VERSION short-circuits ref resolution + the Cargo.toml
  // fetch: the docs-version workflow already knows the exact released
  // version (from the release event's payload) and shouldn't re-derive it
  // from main HEAD, which may have moved past that release by the time this
  // runs.
  const explicitVersion = process.env.SENDRA_RELEASE_VERSION;
  const newVersion = explicitVersion
    ? parseSemVer(explicitVersion)
    : extractWorkspaceVersion(await fetchCargoToml(process.env.SENDRA_DOCS_REF ?? (await resolveHeadSha())));
  const lastVersion = await findLastVersionedSnapshot();

  let shouldVersion: boolean;
  let reason: string;

  if (!lastVersion) {
    shouldVersion = true;
    reason = `no versioned snapshot exists yet: first-ever versioning`;
  } else if (newVersion.major !== lastVersion.major || newVersion.minor !== lastVersion.minor) {
    shouldVersion = true;
    reason = `minor/major bump`;
  } else {
    shouldVersion = false;
    reason = `patch only`;
  }

  const fromLabel = lastVersion ? lastVersion.raw : "(none)";
  console.log(
    `${fromLabel} -> ${newVersion.raw}: ${reason}, ${shouldVersion ? "versioning docs" : "skipping docs:version"}`,
  );

  writeOutput("version", newVersion.raw);
  writeOutput("should_version", String(shouldVersion));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
