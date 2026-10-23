---
slug: how-sendra-resolves-request-values
title: "How Sendra resolves request values"
description: "A request can draw values from defaults, config, environments, captures, command-line overrides, and scripts. Here is how those layers fit together."
authors: [sendra]
tags: [design-notes, deep-dive]
date: 2026-10-23
mdx:
  format: md
---

A request can get its values from several places: a built-in default, a config
file, an environment file, earlier responses, command-line flags, or a script.
When two sources provide the same value, Sendra needs one clear rule for
deciding which one takes effect.

<!-- truncate -->

## One chain, weakest to strongest

The order is:

```text
hardcoded default
  → global config
    → project config
      → environment file (--env, or the default one)
        → captured variables (as they accumulate through the run)
          → CLI overrides (-H, --var, --timeout, --insecure, --proxy,
                           --client-cert, --client-key, --cookie-jar)
```

Later values beat earlier values. Project config wins over global config for
the same key; captures can replace earlier captures, but Sendra refuses a
capture that collides with a variable from the environment file. A command-line
override is the last layer, so it wins over the layers below it.

## Headers and variables are separate

Headers and variables do not compete in one shared chain. Variable
substitution happens once before a request is sent, while config header merging
happens after that. A `-H` override competes with configured headers, not with
`--var`.

Client settings such as `--timeout`, `--insecure`, `--proxy`, `--client-cert`,
`--client-key`, and `--cookie-jar` are resolved when Sendra builds the client
for the whole run. They do not change request by request, so they are not
another per-request value layer.

## Scripts get the last word

A `pre_request` script runs after those overrides and can still change or
remove a value that an override set. The request file's own script is the most
specific instruction for that request.

The individual layers are covered in [Configuration](/docs/cli/reference/configuration),
[Environments and variables](/docs/cli/reference/environments),
[Capturing values](/docs/cli/reference/capturing), and
[CLI overrides](/docs/cli/reference/cli-overrides).
