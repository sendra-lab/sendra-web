---
slug: sandboxing-sendra-scripts
title: "How Sendra keeps request scripts sandboxed"
description: "Sendra's pre_request and post_request hooks can shape a request and inspect a response, but they cannot access the filesystem or network."
authors: [sendra]
tags: [design-notes, deep-dive]
date: 2026-10-23
mdx:
  format: md
---

Request scripts are useful when a request needs a little logic before it is
sent or after a response comes back. They also create an important boundary:
what should a script be allowed to reach from inside an API request file?

<!-- truncate -->

## The script only sees the request and response

Sendra registers no functions, types, packages, or modules into its embedded
interpreter. The only Sendra-shaped values available to a script are `request`
and `response`, made up of strings, integers, and arrays. There is no helper
that can access the filesystem or make a network call.

That small surface is easier to reason about than a list of capabilities that
must be audited and secured. The interpreter does not get a Sendra-powered way
to reach the outside world in the first place.

## Close off the interpreter's other doors

The default Rhai module resolver can load `.rhai` files from disk, so Sendra
removes `import` at compile time. `eval` is disabled too. It is not a
filesystem or network capability, but disabling it means scripts are checked
before the request is sent instead of being dynamically compiled during the
run.

Each script also has a ten-million-operation limit. That turns an accidental
`while true` into a named error instead of a process that hangs indefinitely.
It is a backstop for mistakes, not a defense against a hostile script; request
files are part of the project being run.

## Keep script output out of JSON results

`print`, `debug`, and script errors go to stderr, alongside Sendra's progress
and error messages. That keeps stdout available for the single JSON document
promised by `--json`. If a script prints and then throws, its output remains
available to explain the failure.

The choice of output stream belongs to each front end. `sendra-core` returns
the script's printed lines and its verdict without printing anything itself;
the CLI decides to put those lines on stderr. The TUI does not run these hooks,
so the same output decision does not apply there.

See [Scripting](/docs/cli/reference/scripting) for the fields and hook order,
and [the interactive TUI reference](/docs/cli/reference/tui) for what the TUI
supports.
