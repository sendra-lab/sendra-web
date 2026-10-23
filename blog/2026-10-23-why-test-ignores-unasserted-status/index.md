---
slug: why-test-ignores-unasserted-status
title: "Why sendra test ignores unasserted statuses"
description: "A test should report whether a response met the expectations in its request file, not invent expectations of its own."
authors: [sendra]
tags: [design-notes, deep-dive]
date: 2026-10-23
mdx:
  format: md
---

What should `sendra test` do when an API responds with `404`, but the request
file never said which status to expect? Sendra leaves that response unasserted.
The test command reports what the file asked it to check; it does not add a
status assertion on the author's behalf.

<!-- truncate -->

## A check is about the expectation in the file

A request can be checked in two ways: with an `assertions` block or with a
`post_request` script. Both inspect the same response, so a request with a
script and no assertions is still checked. If the script succeeds, the request
passes; if it throws, it counts as a failure alongside an assertion that did
not match.

That keeps the result focused on the thing that matters to the person reading
the run: did the response match what this request file said it should do? A
runtime script failure and a failed assertion answer that question the same
way. Adding a separate count for them would create another number most users
would have to fold back into `failed`.

Compilation errors are different. Both hooks compile before Sendra sends the
request, so a script that cannot compile is a broken request and lands in the
`no response` count. Trying to distinguish a deliberate `throw` from an
accidental type error at runtime would make the outcome depend on where the
error happened, such as inside a helper function.

## An unchecked request is not a passing request

`without assertions` means the request really had no checks. That should not
be folded into `passed`: a collection with no expectations anywhere should not
look like a perfectly green test run. It should not automatically fail either,
because adding a request before writing its expectations should not break the
build. Sendra reports the unchecked count plainly so it is visible and leaves
the policy to the team.

## Status codes stay explicit

A bare `404` does not fail `sendra test`. Doing so would make Sendra assert
something the request file never asked for. When you want a particular status,
write the expectation explicitly:

```yaml
assertions:
  status: 200
```

This also keeps useful setup requests intact: a login or initialization call
can be part of a collection to reach an endpoint, even when its response is
not the thing being tested. For inspecting raw status codes, `sendra run`
already reports the response and exits nonzero for error statuses.

The test summary is the safeguard: it shows that a request ran without checks,
so an unchecked response cannot be mistaken for a verified pass. For the full
test behavior, see [Running and testing requests](/docs/cli/reference/running-and-testing).
