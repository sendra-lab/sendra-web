---
slug: one-binary-two-interfaces
title: "One binary, two interfaces: how sendra run and sendra tui share a core"
authors: [sendra]
tags: [deep-dive]
date: 2026-09-13
mdx:
  format: md
---

<!--
FIRST DRAFT — for review, not final copy. Grounded in the real
sendra-lab/Sendra repo's synced docs (docs/reference/tui.md, docs/reference/
development.md) as of commit 17c88bda43c5, the SHA scripts/sync-docs.ts
currently pins — no invented internals. Wording/structure is a first pass.
-->

`sendra run` sends one request from your shell. `sendra tui` opens a
full-screen terminal app for browsing and running a whole collection. They
feel like different tools, but they're the same binary running the same
request pipeline — and that's a deliberate design choice worth explaining,
not an implementation accident.

<!-- truncate -->

## Why "one binary" is a constraint, not a slogan

It would have been easier, in some ways, to ship the TUI as a separate
crate with its own copy of request loading, environment resolution, and HTTP
execution. Instead, `sendra tui` reuses the same core the CLI commands run
on directly: the same request model, YAML loading, environment resolution,
capture logic, and HTTP execution that `run`/`test` use. There's no
translation layer between "what the CLI does" and "what the TUI does" —
there's one implementation, and two front ends that drive it.

That has a concrete payoff: a request behaves identically whether it's sent
with `sendra run request.yaml` or by pressing `Enter` on it in the TUI.
Environment substitution, config header merging, auth resolution, query and
body resolution, assertions, capture — all of it is the exact same code
path. If `sendra test` and the TUI ever disagreed about whether a request
passed its assertions, that would be a bug, not an edge case to document.

## The one honest gap

There's exactly one place the two front ends diverge: `pre_request`/
`post_request` scripts don't run from the TUI. Everything else about a
request's send pipeline is shared, but scripts are the one part that isn't
— and it's called out as a deliberate, documented gap rather than something
that quietly doesn't work. If you're relying on a `pre_request` script to
set something up, `sendra run`/`sendra test` are still the way to send that
particular request.

The TUI's editing surface has a handful of gaps drawn the same way. Only
`json:` path assertions get a row editor — every other assertion kind
(`status`, `status_in`, `headers`, `body_contains`, `body_matches`,
`elapsed_ms_under`) is preserved exactly as loaded when you edit a request,
but has no in-app editor yet. A `body_file` body is shown read-only because
it names a file some other tool may have open; `form`/`multipart` bodies are
read-only because they're structured, list-of-parts bodies that would need
their own dedicated editor. In each case the choice is to be visibly
read-only rather than silently drop or mangle something the editor doesn't
fully understand.

## What "complete" ended up meaning for the TUI

Early on, the TUI's job was narrower: load a collection, list its requests,
run whichever one you selected. Getting from there to something you could
actually work in all day meant three things landing together:

**In-place editing of a full request.** `i` opens any selected request in an
edit form — method, URL, headers, body, auth, assertions, captures — that
mirrors the shape of the YAML itself. Auth editing is scoped deliberately:
the editor only edits an `auth` block that already exists on the request,
never introduces a new auth type where there was none. Saving is guarded —
an invalid method or a `json:` body that doesn't parse as JSON blocks the
save with the problem shown, rather than writing something broken back out.

**Multiple collections open at once.** `o` opens another collection as a new
tab, and each tab is a fully independent session — its own selection, run
state, edit session, environment, and run history, none of it bleeding into
any other tab. This matters more than it sounds: without it, working across
a "staging" collection and a "webhooks" collection in the same sitting meant
either two terminal windows or closing one to open the other. Closing the
last remaining tab resets it to the welcome screen instead of leaving you
with zero tabs — there's always somewhere to land.

**Interactive OAuth for the one grant type that needs a browser.**
`client_credentials` and `password` grants can fetch a token from fields
alone — client ID, secret, token URL, nothing else required. `authorization_code`
can't, because it needs a real human clicking "allow" in a real browser. For
that one case, `Ctrl+l` inside the auth editor opens your browser to the
configured authorization URL, runs a local callback listener bound to the
configured redirect URI, waits up to five minutes for the provider to
redirect back, and exchanges the resulting code for a token. That token is
cached in memory for the rest of the session, and every later run of a
request sharing that `oauth:` config reuses it automatically — including,
as a side effect, `client_credentials`/`password` tokens, which get the same
in-session caching even though they didn't need the browser step to get
there.

## The bare `sendra` command

One small detail worth calling out: a bare `sendra`, with no subcommand at
all, launches the TUI with nothing preloaded — the same as `sendra tui`. This
was a deliberate choice, not a fallback for a missing argument. Typing just
`sendra` is meant to be a reasonable way to start, the same way you'd type
`git status` or `htop` without needing to remember a flag first. From there,
the welcome screen looks for `.yaml`/`.yml` files sitting directly in the
current directory and offers them as a picker, or gives you `o` to type a
path if nothing's nearby.

None of this — the shared core, the documented gaps, the bare-command
launch — reads as exciting on its own. Taken together, it's the difference
between a TUI that happens to exist next to the CLI, and one that's actually
the same tool wearing a different interface.
