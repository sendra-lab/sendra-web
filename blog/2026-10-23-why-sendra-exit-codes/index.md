---
slug: why-sendra-exit-codes
title: "Why Sendra's exit codes are split the way they are"
description: "Sendra uses separate exit codes for HTTP errors, failed assertions, and requests that could not be sent, so scripts and CI can respond to the right failure."
authors: [sendra]
tags: [design-notes, deep-dive]
date: 2026-10-23
mdx:
  format: md
---

An exit code is useful when it tells a script what happened. Sendra keeps
“the server returned an error,” “the response failed an assertion,” and
“Sendra could not send the request” distinct because those outcomes call for
different fixes.

<!-- truncate -->

## Different failures need different signals

For `sendra run`, an HTTP error status exits `3`. For `sendra test`, a failed
assertion exits `4`. Reusing `3` for both would give one number two meanings:
the server returned a 500, or the server returned a response that did not meet
the request's expectations. Those are different events and often need
different handling.

A request that Sendra could not send exits `1`, including an unsendable request
inside `sendra test`. That does not mean the API failed its expectations; it
means Sendra could not get far enough to find out. In CI, that distinction
separates “fix the API” from “fix the test setup.”

## Collections use the worst outcome

When a collection contains multiple requests, its overall exit code is the
worst outcome in the run, ranked `0` < `3` < `4` < `1`. One failing assertion
is enough for `sendra test` to exit `4`; one request that could not be sent
makes the whole run exit `1`.

Letting the last request decide would make a collection's result depend on
file order. Worst-outcome-wins keeps a successful exit code meaningful across
the full collection: nothing in the run failed.

```sh
sendra run examples/mixed-status-collection.yaml   # prints 200, 404, 500; exits 3
```

`sendra run` treats assertion and script results as informational; it does
not change its exit code based on them. That preserves existing shell scripts
that use `sendra run request.yaml && deploy.sh`. `sendra test` is the command
that makes checks decide success or failure.

You can opt out of `run`'s error-status exit with `--allow-error-status` when
you want to inspect a response without failing the surrounding script:

```sh
sendra run examples/get-request.yaml --allow-error-status
```

See [the exit-code reference](/docs/cli/reference/exit-codes) for the complete
table, and [why unasserted statuses do not fail `test`](/blog/why-test-ignores-unasserted-status)
for the related decision.
