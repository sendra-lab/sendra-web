# sendra-web

The public website for [Sendra](https://github.com/sendra-lab/sendra), a
terminal-native HTTP client — a "CLI Postman" written in Rust. This repo holds
the marketing/landing site and documentation, built with
[Docusaurus](https://docusaurus.io/); it does not contain any of the Sendra
CLI's source code, which lives in the main [sendra](https://github.com/sendra-lab/sendra)
repo.

This is currently a bare Docusaurus scaffold — landing page content, docs
content, and blog content are added in later issues.

## Requirements

- Node.js (see [.nvmrc](.nvmrc) for the pinned version)
- [pnpm](https://pnpm.io/)

## Local development

```bash
# install dependencies
pnpm install

# start the local dev server (http://localhost:3000)
pnpm start

# build the static production site into ./build
pnpm build

# serve the production build locally
pnpm serve
```
