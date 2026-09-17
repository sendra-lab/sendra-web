# Contributing

## Branching & pull requests

`main` is the protected, stable branch — it always reflects what's deployed.
`dev` is the integration branch where work lands before it reaches `main`.

- Create your feature/fix branch from `dev`, not `main`.
- Open your pull request against `dev`, not `main`.
- Do not open pull requests directly against `main`; `main` is only updated
  by merging `dev` in.

Workflow:

```
dev -> create feature/fix branch -> make changes -> PR into dev
```

## Local development

See [Local development](README.md#local-development) in the README for
setup (`pnpm install`, `pnpm sync-docs`, `pnpm start`).
