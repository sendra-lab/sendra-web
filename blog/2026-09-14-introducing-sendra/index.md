---
slug: introducing-sendra
title: Introducing Sendra
authors: [sendra]
tags: [announcement, changelog]
date: 2026-09-14
mdx:
  format: md
---

<!--
FIRST DRAFT — for review, not final copy. Every factual claim below (CLI
surface, TUI feature set, unified binary, OAuth grant types, multi-collection
tabs) was checked against the real sendra-lab/Sendra repo's synced docs
(docs/reference/tui.md, docs/reference.md) as of commit 17c88bda43c5, the SHA
scripts/sync-docs.ts currently pins. Nothing here is invented, but the
wording, structure, and tone are a first pass and should be reviewed before
this is treated as shipped copy.
-->

Sendra is a terminal-native HTTP client. Requests are plain YAML files that
live in your repo next to the code they exercise, and you send them from the
shell instead of a GUI.

<!-- truncate -->

## Why Sendra exists

Most HTTP client tools ask you to leave your editor and your repo behind: a
separate app, a proprietary export format, requests that live in someone's
cloud workspace instead of version control. Sendra starts from the opposite
assumption — a request is a file. It belongs in your repo, gets reviewed in a
pull request like any other change, and diffs over time the same way your
code does.

A request or collection file is checked against variables from an environment
file, so the same request can point at staging or production without
touching the file itself. It can also declare what the response *should*
look like — status, headers, body shape — which `sendra test` then passes or
fails your build on. No separate assertion library, no glue script: the
check lives in the same YAML as the request it's checking.

## What's in the box today

Sendra ships as a single binary. There's no separate install step for a
scripting engine, a test runner, or a UI — building or installing `sendra`
gets you all of it:

- **`sendra run`** sends a request and prints the result.
- **`sendra test`** runs one or a whole collection and fails your build on
  unmet assertions.
- **`sendra tui`** — or just `sendra` with nothing else on the command
  line — opens a full-screen terminal UI for browsing and running requests
  interactively, built directly on the same request model, YAML loading,
  environment resolution, and HTTP execution the CLI commands use.

The CLI side has been usable for a while: run and test requests, assert on
status/headers/body, capture a value out of one response and chain it into
the next request, layer config → environment → CLI overrides in a
predictable precedence order, and run `pre_request`/`post_request` scripts
in a sandbox with no filesystem or network access.

What's new is that the TUI has caught up past "browse and run" into a
genuinely complete editor. From inside the TUI you can now:

- **Edit any part of a request in place** — method, URL, headers, body,
  auth, assertions, captures — with a form that refuses to save on an
  invalid method or unparsable JSON body, and discards cleanly on `Esc`.
- **Work across multiple collections at once**, each open in its own tab
  with fully independent selection, run state, and edit session.
- **Log into OAuth `authorization_code` flows interactively** — the TUI
  opens your browser, runs a local callback listener, and caches the token
  for the rest of the session, the same as `client_credentials`/`password`
  tokens are.
- **Browse in-session run history** per request, up to 20 runs deep, without
  anything touching disk.

None of this is a second product bolted onto the CLI. The TUI reuses
`sendra-core` directly — the same request model the CLI commands run on —
with one deliberate, documented gap: `pre_request`/`post_request` scripts
don't run from the TUI. Everything else behaves identically whether a
request is sent from a shell command or a keypress.

## Try it

There's no packaged release yet, so building from source is the way in:

```sh
git clone https://github.com/sendra-lab/Sendra.git
cd Sendra
cargo build --workspace --release
./target/release/sendra run examples/get-request.yaml
```

From there, [the docs](/docs/intro) cover the full request/collection
schema, every CLI flag, the TUI's complete keybinding reference, and the
design rationale behind the harder calls — like why `sendra test` ignores an
unasserted status, or how the sandboxing guarantees around scripts work.

This is the first post on this blog, and we're planning to use it for
release-note-style updates too (tagged [`changelog`](/blog/tags/changelog))
rather than standing up a separate changelog page — see the tag description
for why.
