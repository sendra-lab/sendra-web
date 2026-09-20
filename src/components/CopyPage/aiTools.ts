/**
 * The AI tools a page can be opened in. To add another, append an entry to
 * `AI_TOOLS` — the Markdown generation, prompt building, and menu are all
 * driven from this list.
 *
 * Each tool is opened through the query-string prefill it publicly supports
 * (`?q=` on ChatGPT, `/new?q=` on Claude, `/search?q=` on Perplexity, and
 * Google's AI Mode for Gemini). None of them accept a file/attachment or a
 * request body from a link, so the page has to travel inside the prompt text.
 */

import type {ComponentType} from 'react';
import {ChatGptLogo, ClaudeLogo, GeminiLogo, PerplexityLogo} from './icons';

export type AiTool = {
  id: string;
  label: string;
  /** The tool's logo, shown beside it in the menu. */
  Logo: ComponentType<{className?: string}>;
  /** Builds the URL that opens the tool with `prompt` prefilled. */
  buildUrl: (prompt: string) => string;
  /** Overrides `MAX_LINK_LENGTH` for a tool with a tighter query limit. */
  maxLinkLength?: number;
};

export const AI_TOOLS: AiTool[] = [
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    Logo: ChatGptLogo,
    buildUrl: (prompt) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
  },
  {
    id: 'claude',
    label: 'Claude',
    Logo: ClaudeLogo,
    buildUrl: (prompt) =>
      `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
  },
  {
    id: 'perplexity',
    label: 'Perplexity',
    Logo: PerplexityLogo,
    buildUrl: (prompt) =>
      `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`,
  },
  {
    id: 'gemini',
    label: 'Gemini',
    Logo: GeminiLogo,
    // gemini.google.com ignores a query in the URL, so this goes to Google's
    // AI Mode (`udm=50`, Gemini-powered search), which does prefill the
    // prompt. Same approach as docusaurus-plugin-copy-page-button (pnpm.io).
    buildUrl: (prompt) =>
      `https://www.google.com/search?udm=50&q=${encodeURIComponent(prompt)}`,
    // It's a search box: Google queries are commonly cut off at ~2,000
    // characters, so only very short pages are sent inline.
    maxLinkLength: 2000,
  },
];

/**
 * Links this long risk being rejected or truncated by the tool's servers,
 * proxies, or the browser. Conservative on purpose: past it, the prompt
 * carries only the page URL and the full Markdown goes to the clipboard.
 */
export const MAX_LINK_LENGTH = 6000;

export type PageSnapshot = {
  /** The generated Markdown — the single source for every action. */
  markdown: string;
  /** Canonical-ish URL of the page (no query string or hash). */
  url: string;
  /** The page's title, e.g. "Assertions". */
  title: string;
  /** The site's name, e.g. "Sendra". */
  siteName: string;
  /** The page's own meta description: what it is, and what the product is. */
  description: string;
};

export type AiLaunch = {
  href: string;
  /** True when the Markdown can't travel in the link and must be pasted. */
  needsClipboard: boolean;
};

/**
 * Says what the page is and which product it's about, up front. Search-style
 * tools (Google AI Mode, Perplexity) can't be relied on to open a URL, and a
 * rare product name inside a URL alone sends them off to similar, better-known
 * tools — so the name, description and a concrete ask are in the prompt text.
 */
function describePage(page: PageSnapshot): string {
  const {title, siteName, description} = page;
  const about = description ? ` Its description: "${description}"` : '';
  return `the ${siteName} website page titled "${title}" (${page.url}).${about}`;
}

export function buildAiLaunch(tool: AiTool, page: PageSnapshot): AiLaunch {
  const {siteName} = page;
  const inlineHref = tool.buildUrl(
    `Here is ${describePage(page)} Summarize it, then answer my questions about ${siteName} using only this page.

${page.markdown}`,
  );
  if (inlineHref.length <= (tool.maxLinkLength ?? MAX_LINK_LENGTH)) {
    return {href: inlineHref, needsClipboard: false};
  }
  return {
    href: tool.buildUrl(
      `Explain ${describePage(page)} Answer about ${siteName} itself, not other tools. If you can't open the link, tell me and I'll paste the page as Markdown.`,
    ),
    needsClipboard: true,
  };
}
