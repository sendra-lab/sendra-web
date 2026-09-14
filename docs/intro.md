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

This site's CLI reference, request/collection shape, config, environments,
assertions, capture, scripting, every CLI flag, `--json` output, exit codes,
the TUI, and the design rationale behind the harder calls is synced
directly from the [sendra](https://github.com/sendra-lab/sendra) repo's own
docs. Start at [Reference](/docs/cli/reference) for the full schema and
behavior reference, or [Design decisions](/docs/cli/decisions) for the "why"
behind choices that could reasonably have gone another way.
