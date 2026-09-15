---
slug: sendra-0-1-0
title: "Sendra 0.1.0: the first tagged release"
authors: [sendra]
tags: [changelog, announcement]
date: 2026-09-15
mdx:
  format: md
---

<!--
FIRST DRAFT — for review, not final copy. Every claim below (install
methods, package names, feature list) was checked directly against the live
v0.1.0 GitHub Release (github.com/sendra-lab/Sendra/releases/tag/v0.1.0),
its release notes/assets, the live npm registry entry for
@sendra-lab/sendra, the live crates.io entry for sendra-cli, and the live
sendra-lab/homebrew-tap formula — not carried over from earlier release
planning. Wording/structure is a first pass.
-->

Sendra 0.1.0 is out — the first tagged release, and the first time you can
install it instead of building it from source.

<!-- truncate -->

## What "0.1.0" means here

Nothing in this release is new relative to what's been in the repo — it's
the same request/collection model, CLI, and TUI [introduced](/blog/introducing-sendra)
and [described in depth](/blog/one-binary-two-interfaces) in the last two
posts. What changes is that it's now built, checksummed, and published
under a version number, with prebuilt binaries and package-manager entries
instead of a `git clone` + `cargo build`.

## What's in the box

- **Requests and collections as plain YAML** — method, URL, headers, and a
  body as `body`, `json`, `body_file`, `form`, or `multipart`, with
  `auth: bearer`/`basic`/`api_key`.
- **`sendra run`** and **`sendra test`** — send a request or collection from
  the shell, or run it against `assertions:` and fail the build on a miss.
  `test` supports `--junit` for CI report output.
- **Assertions** on status, headers, and body, including JSON-path checks
  and an operator sub-language (`greater_than`, `matches`, `not:`, and
  more).
- **Capture and chaining** — pull a value out of one response (JSON path,
  header, or status code) and substitute it into a later request in the
  same run.
- **Environments and variables** — `.sendra/environments/*.yaml` resolved
  via `--env`, with `{{variable}}` and `${OS_VAR}` substitution.
- **Config, layered** — `.sendra/config.yaml` for default headers, timeout,
  redirects, TLS, proxy, and cookie-jar settings, resolved project-over-global,
  overridable per-invocation with flags like `-H`, `--var`, `--insecure`,
  `--proxy`.
- **Scripting** — `pre_request`/`post_request` hooks in an embedded
  scripting language (Rhai), with no external runtime to install.
- **OAuth** — an `authorization_code` login flow for requests that need a
  browser-based token first.
- **`sendra import curl`**, **`sendra init`**, and **`sendra schema`** — convert
  a curl command into a request file, scaffold a new `.sendra/` project, and
  emit JSON Schemas for editor tooling.
- **The TUI** (`sendra tui`, or a bare `sendra`) — the full-screen terminal
  app covered in [the last post](/blog/one-binary-two-interfaces), built on
  the same core as the CLI.
- **One binary.** `sendra-cli` and `sendra-tui` build into a single `sendra`
  binary — installing it gets you both.

## Install it

Shell:

```sh
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/sendra-lab/Sendra/releases/latest/download/sendra-cli-installer.sh | sh
```

PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://github.com/sendra-lab/Sendra/releases/latest/download/sendra-cli-installer.ps1 | iex"
```

npm:

```sh
npm install @sendra-lab/sendra
```

pnpm:

```sh
pnpm add @sendra-lab/sendra
```

Bun:

```sh
bun add @sendra-lab/sendra
```

Homebrew:

```sh
brew install sendra-lab/tap/sendra-cli
```

Cargo:

```sh
cargo install sendra-cli
```

Or download a prebuilt binary directly from the
[v0.1.0 release page](https://github.com/sendra-lab/Sendra/releases/tag/v0.1.0),
which also has checksums for every artifact.

Once it's on your `PATH`:

```sh
cat > get-request.yaml <<'EOF'
method: GET
url: https://httpbin.org/get
EOF

sendra run get-request.yaml
```

From there, [the docs](/docs/intro) cover the full request/collection
schema, every CLI flag, and the TUI's keybinding reference.
