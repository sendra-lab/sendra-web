import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  // PLACEHOLDER copy — not final marketing copy, revisit before launch.
  title: 'Sendra',
  tagline: 'A terminal-native HTTP client — the CLI Postman',
  // Favicon is a cropped-down version of the product mark (static/img/sendra-logo.png).
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // PLACEHOLDER — set the real url/baseUrl once the Vercel domain is known (issue 7).
  url: 'https://sendra-web-placeholder.vercel.app',
  baseUrl: '/',

  // Used for the "edit this page" links and GitHub pages config. This is
  // sendra-web's own repo — the docs source repo (sendra-lab/Sendra) is
  // pointed at directly via each doc's `editUrl`/`custom_edit_url` instead,
  // since editing a synced copy here would be discarded on the next sync.
  organizationName: 'sendra-lab', // Usually your GitHub org/user name.
  projectName: 'sendra-web', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Sendra's docs (synced by `pnpm sync-docs`) use `{{variable}}` templating
  // syntax, `<https://...>` autolinks, and other constructs that are valid
  // CommonMark but not valid JSX — MDX's default JSX-aware parser rejects
  // them. Force plain CommonMark for .md files site-wide rather than
  // escaping every brace/angle-bracket in synced content; .mdx files (none
  // currently) would still get full MDX if ever needed.
  markdown: {
    format: 'md',
  },

  // Inter (body + headings) for clean, readable prose; JetBrains Mono stays
  // for code blocks only (see src/css/custom.css) to keep a CLI-flavored
  // accent without making every heading look like a terminal.
  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
      type: 'text/css',
    },
  ],

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Hand-written docs (docs/intro.md and friends) live in this repo,
          // so this is the fallback edit link for those. Synced CLI docs
          // under docs/cli/ override it per-page via `custom_edit_url`
          // (see scripts/sync-docs.ts) to point at the real source instead.
          editUrl: 'https://github.com/sendra-lab/sendra-web/edit/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/sendra-lab/sendra-web/edit/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // PLACEHOLDER social card — reusing the logo mark until a real og:image is designed.
    image: 'img/sendra-logo.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Sendra',
      // PLACEHOLDER lockup — this is the icon mark provided so far; the navbar
      // title text next to it ("Sendra" above) stands in for a real wordmark
      // until a finished logo/brand identity is decided.
      logo: {
        alt: 'Sendra',
        src: 'img/sendra-logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/sendra-lab/sendra',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'Sendra',
        src: 'img/sendra-logo.png',
        width: 32,
        height: 32,
      },
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Introduction', to: '/docs/intro'},
            {label: 'Reference', to: '/docs/cli/reference'},
            {label: 'Design Decisions', to: '/docs/cli/decisions'},
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Issues',
              href: 'https://github.com/sendra-lab/sendra/issues',
            },
            {
              label: 'Contributing',
              href: 'https://github.com/sendra-lab/sendra/blob/main/CONTRIBUTING.md',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'Blog', to: '/blog'},
            {label: 'GitHub', href: 'https://github.com/sendra-lab/sendra'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Sendra. Built by <a href="https://x.com/Eminencee_" target="_blank" rel="noreferrer">Oyibe</a>.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
