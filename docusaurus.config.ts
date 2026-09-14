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

  // Used for the "edit this page" links and GitHub pages config.
  organizationName: 'sendra-lab', // Usually your GitHub org/user name.
  projectName: 'sendra', // Usually your repo name.

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

  // JetBrains Mono powers headings + code blocks (see src/css/custom.css) to
  // reinforce the terminal/CLI feel; body text stays on the system font stack.
  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
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
          // PLACEHOLDER — confirm this repo path once the docs source location is final.
          editUrl: 'https://github.com/sendra-lab/sendra-web/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // PLACEHOLDER — confirm this repo path once the docs source location is final.
          editUrl: 'https://github.com/sendra-lab/sendra-web/tree/main/',
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
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Docs',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/sendra-lab/sendra',
            },
          ],
        },
      ],
      // PLACEHOLDER copyright line.
      copyright: `Copyright © ${new Date().getFullYear()} Sendra. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
