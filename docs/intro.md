---
sidebar_position: 1
---

# Introduction

Sendra is a terminal-native HTTP client, think Postman, but requests are
plain YAML files that live in your repo next to the code they exercise, and
you send them from the shell. A file holds either one request or a named
collection, run against variables from an environment file so the same
request can point at staging or production, and can declare what the
response should look like which `sendra test` then passes or fails your
build on. An interactive terminal UI ships in the same binary for browsing
and running requests without one shell invocation per request.

## Getting started

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

Or grab a prebuilt binary directly from the
[v0.1.0 release](https://github.com/sendra-lab/Sendra/releases/tag/v0.1.0).

A request is just a YAML file. Write one and run it:

```sh
cat > get-request.yaml <<'EOF'
method: GET
url: https://httpbin.org/get
EOF

sendra run get-request.yaml
```

That sends a real request to `https://httpbin.org/get` and prints the status,
headers and body. From there, [Request and collection file shape](/docs/cli/reference/requests)
covers what a request file can contain, and [Running and testing requests](/docs/cli/reference/running-and-testing)
covers `sendra run`/`sendra test`.

## Where to go next

This site's documentation — request/collection shape, config, environments,
assertions, capture, scripting, every CLI flag, `--json` output, exit codes,
the interactive TUI, and the design rationale behind the harder calls — is
synced directly from the [sendra](https://github.com/sendra-lab/sendra)
repo's own docs, split into two parts:

- **[Reference](/docs/cli/reference)** — the schema and behavior: what a
  field is called, what a flag does, what `--json` outputs. Look here when
  you know what you want to do and need the exact shape of it.
- **[Design decisions](/docs/cli/decisions)** — the "why" behind choices
  that could reasonably have gone another way: why `sendra test` ignores an
  unasserted status, how exit codes are split and ranked, the script
  sandboxing guarantees. Look here when the reference tells you *what*
  happens but you want to know *why*.
