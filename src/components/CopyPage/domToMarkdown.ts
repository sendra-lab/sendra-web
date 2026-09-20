/**
 * Converts the rendered content of a page (the `.markdown` element
 * Docusaurus renders MDX into) back into Markdown.
 *
 * It works from the DOM rather than the source files because the site's
 * pages are MDX compiled at build time — the source isn't available in the
 * browser, and the rendered DOM is what the reader is actually looking at
 * (including synthetic titles, synced docs, and embedded components).
 *
 * UI-only elements are dropped: buttons (code-block "Copy", etc.), the
 * "#" heading anchors, SVG icons, `aria-hidden` decoration, nav, and hidden
 * elements. Relative links and images are resolved to absolute URLs so they
 * still work once the Markdown has left the site.
 *
 * No dependencies; only DOM APIs, so this must only run in the browser.
 */

export type MarkdownOptions = {
  /** Base for resolving relative links/images, normally `location.href`. */
  baseUrl: string;
  /** Prepended as an H1 if the content doesn't already start with one. */
  title?: string;
};

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'TEMPLATE',
  'BUTTON',
  'SVG',
  'NAV',
  'FORM',
  'INPUT',
  'SELECT',
  'TEXTAREA',
  'IFRAME',
  'CANVAS',
  'AUDIO',
  'VIDEO',
]);

const BLOCK_TAGS = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'DETAILS',
  'DD',
  'DIV',
  'DL',
  'DT',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'HR',
  'LI',
  'MAIN',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'TABLE',
  'UL',
]);

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

type Ctx = {baseUrl: string};

function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

function shouldSkip(el: Element): boolean {
  return (
    SKIP_TAGS.has(el.tagName.toUpperCase()) ||
    el.classList.contains('hash-link') ||
    el.getAttribute('aria-hidden') === 'true' ||
    el.hasAttribute('hidden')
  );
}

function isAlphanumeric(ch: string | undefined): boolean {
  return ch !== undefined && /[A-Za-z0-9]/.test(ch);
}

/** Escapes characters that would otherwise be parsed as Markdown syntax. */
function escapeText(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (ch === '\\' || ch === '`' || ch === '*' || ch === '[' || ch === ']') {
      out += '\\' + ch;
    } else if (ch === '_') {
      // Intraword underscores (snake_case) aren't emphasis; leave them.
      out +=
        isAlphanumeric(text[i - 1]) && isAlphanumeric(text[i + 1]) ? ch : '\\_';
    } else if (ch === '<' && /[A-Za-z/!?]/.test(text[i + 1] ?? '')) {
      out += '\\<';
    } else {
      out += ch;
    }
  }
  return out;
}

/** Escapes a paragraph's leading characters that would start a block. */
function escapeBlockStart(text: string): string {
  return text
    .replace(/^(#{1,6})(\s)/, '\\$1$2')
    .replace(/^([-+>])(\s)/, '\\$1$2')
    .replace(/^(\d+)([.)])(\s)/, '$1\\$2$3');
}

function resolveUrl(raw: string | null, baseUrl: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw, baseUrl);
    if (!SAFE_PROTOCOLS.has(url.protocol)) return null;
    // Parentheses and spaces would end a Markdown link destination early.
    return url.href.replace(
      /[()\s]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`,
    );
  } catch {
    return null;
  }
}

function inlineCode(text: string): string {
  const flat = text.replace(/\s*\n\s*/g, ' ');
  const longestRun = Math.max(
    0,
    ...(flat.match(/`+/g) ?? []).map((run) => run.length),
  );
  const fence = '`'.repeat(longestRun + 1);
  const pad = flat.startsWith('`') || flat.endsWith('`') ? ' ' : '';
  return `${fence}${pad}${flat}${pad}${fence}`;
}

/** Wraps `inner` in a Markdown mark, keeping edge whitespace outside it. */
function wrapMark(mark: string, inner: string): string {
  const trimmed = inner.trim();
  if (!trimmed) return inner;
  const lead = inner.slice(0, inner.length - inner.trimStart().length);
  const trail = inner.slice(inner.trimEnd().length);
  return `${lead}${mark}${trimmed}${mark}${trail}`;
}

function inlineChildren(parent: Node, ctx: Ctx): string {
  let out = '';
  parent.childNodes.forEach((child) => {
    out += inline(child, ctx);
  });
  return out;
}

function inline(node: Node, ctx: Ctx): string {
  if (node.nodeType === Node.TEXT_NODE) {
    // Zero-width characters are invisible on the page but noise in Markdown.
    const text = (node.textContent ?? '')
      .replace(new RegExp('[\\u200B-\\u200D\\uFEFF]', 'g'), '')
      .replace(/\s+/g, ' ');
    return escapeText(text);
  }
  if (!isElement(node) || shouldSkip(node)) return '';

  const tag = node.tagName.toUpperCase();
  switch (tag) {
    case 'BR':
      return '\\\n';
    case 'CODE':
      return inlineCode(node.textContent ?? '');
    case 'STRONG':
    case 'B':
      return wrapMark('**', inlineChildren(node, ctx));
    case 'EM':
    case 'I':
      return wrapMark('*', inlineChildren(node, ctx));
    case 'DEL':
    case 'S':
    case 'STRIKE':
      return wrapMark('~~', inlineChildren(node, ctx));
    case 'A': {
      const text = inlineChildren(node, ctx);
      const href = resolveUrl(node.getAttribute('href'), ctx.baseUrl);
      if (!href) return text;
      return text.trim() ? `[${text.trim()}](${href})` : '';
    }
    case 'IMG': {
      const alt = (node.getAttribute('alt') ?? '').replace(/\s+/g, ' ').trim();
      // `data:` (inlined) images resolve to null and would bloat the output.
      const src = resolveUrl(node.getAttribute('src'), ctx.baseUrl);
      return src ? `![${escapeText(alt)}](${src})` : escapeText(alt);
    }
    default: {
      const inner = inlineChildren(node, ctx);
      // Block elements met in an inline context (e.g. <p> inside a table
      // cell) still need a separator so their words don't run together.
      return BLOCK_TAGS.has(tag) ? ` ${inner} ` : inner;
    }
  }
}

function tidyInline(text: string): string {
  return text
    .replace(/[ \t]*\\\n[ \t]*/g, '\\\n')
    .replace(/(^|\n)[ \t]+/g, '$1')
    .trim();
}

function blockquote(el: Element, ctx: Ctx): string {
  const body = blocks(el, ctx).join('\n\n');
  return body
    .split('\n')
    .map((line) => (line ? `> ${line}` : '>'))
    .join('\n');
}

function codeFence(el: Element): string {
  const pre = el.tagName.toUpperCase() === 'PRE' ? el : el.querySelector('pre');
  if (!pre) return '';

  const lines = pre.querySelectorAll('.token-line');
  const code = (
    lines.length
      ? Array.from(lines, (line) => line.textContent ?? '').join('\n')
      : (pre.textContent ?? '')
  ).replace(/\n+$/, '');

  const languageClass = [el, pre, pre.querySelector('code')]
    .flatMap((node) => Array.from(node?.classList ?? []))
    .find((name) => name.startsWith('language-'));
  const language = languageClass?.slice('language-'.length) ?? '';
  const title = el
    .querySelector('[class*="codeBlockTitle"]')
    ?.textContent?.trim();

  const longestRun = Math.max(
    2,
    ...(code.match(/`{3,}/gm) ?? []).map((run) => run.length),
  );
  const fence = '`'.repeat(longestRun + 1);
  const info = language + (title ? ` title="${title.replace(/"/g, "'")}"` : '');
  return `${fence}${info}\n${code}\n${fence}`;
}

function admonition(el: Element, ctx: Ctx): string {
  const heading = el
    .querySelector('[class*="admonitionHeading"]')
    ?.textContent?.trim();
  const content = el.querySelector('[class*="admonitionContent"]');
  const body = blocks(content ?? el, ctx).join('\n\n');
  const label = heading
    ? `**${heading.charAt(0).toUpperCase()}${heading.slice(1)}**`
    : '';
  return [label, body]
    .filter(Boolean)
    .join('\n\n')
    .split('\n')
    .map((line) => (line ? `> ${line}` : '>'))
    .join('\n');
}

/** Renders every tab's content (not just the selected one), labelled. */
function tabs(el: Element, ctx: Ctx): string[] {
  const owned = (selector: string) =>
    Array.from(el.querySelectorAll(selector)).filter(
      (node) => node.closest('.tabs-container') === el,
    );
  const labels = owned('[role="tab"]');
  const panels = owned('[role="tabpanel"]');
  if (!labels.length || labels.length !== panels.length) return blocks(el, ctx);
  return labels.flatMap((label, i) => [
    `**${(label.textContent ?? '').trim()}**`,
    ...blocks(panels[i]!, ctx),
  ]);
}

function table(el: Element, ctx: Ctx): string {
  const rows = Array.from(el.querySelectorAll('tr'))
    .filter((tr) => tr.closest('table') === el)
    .map((tr) =>
      Array.from(tr.children)
        .filter((cell) => /^(TD|TH)$/i.test(cell.tagName))
        .map((cell) =>
          inlineChildren(cell, ctx)
            .replace(/\\\n|\n+/g, '<br>')
            .replace(/\|/g, '\\|')
            .trim(),
        ),
    )
    .filter((cells) => cells.length);
  if (!rows.length) return '';

  const width = Math.max(...rows.map((cells) => cells.length));
  const line = (cells: string[]) =>
    `| ${Array.from({length: width}, (_, i) => cells[i] ?? '').join(' | ')} |`;
  return [
    line(rows[0]!),
    line(Array.from({length: width}, () => '---')),
    ...rows.slice(1).map(line),
  ].join('\n');
}

const LIST_START = /^\s*([-+*]|\d+[.)])\s/;

function list(el: Element, ctx: Ctx): string {
  const ordered = el.tagName.toUpperCase() === 'OL';
  let number = Number.parseInt(el.getAttribute('start') ?? '1', 10);
  if (Number.isNaN(number)) number = 1;

  let loose = false;
  const items: string[] = [];
  for (const li of Array.from(el.children)) {
    if (li.tagName.toUpperCase() !== 'LI' || shouldSkip(li)) continue;

    const marker = ordered ? `${number++}. ` : '- ';
    const checkbox = li.querySelector<HTMLInputElement>(
      ':scope > input[type="checkbox"], :scope > p > input[type="checkbox"]',
    );
    const task = checkbox ? (checkbox.checked ? '[x] ' : '[ ] ') : '';

    const parts = blocks(li, ctx);
    let body = '';
    parts.forEach((part, i) => {
      // A nested list hugs the text above it; other blocks get a blank line.
      const tight = i === 0 || LIST_START.test(part);
      if (i > 0 && !tight) loose = true;
      body += (i === 0 ? '' : tight ? '\n' : '\n\n') + part;
    });

    const indent = ' '.repeat(marker.length);
    const text = `${task}${body}`
      .split('\n')
      .map((line, i) => (i === 0 || !line ? line : indent + line))
      .join('\n');
    items.push(marker + text);
  }
  return items.join(loose ? '\n\n' : '\n');
}

function block(el: Element, ctx: Ctx): string[] {
  const tag = el.tagName.toUpperCase();
  if (/^H[1-6]$/.test(tag)) {
    const text = tidyInline(inlineChildren(el, ctx)).replace(/\s*\n\s*/g, ' ');
    return text ? [`${'#'.repeat(Number(tag[1]))} ${text}`] : [];
  }
  switch (tag) {
    case 'UL':
    case 'OL':
      return [list(el, ctx)];
    case 'PRE':
      return [codeFence(el)];
    case 'BLOCKQUOTE':
      return [blockquote(el, ctx)];
    case 'TABLE':
      return [table(el, ctx)];
    case 'HR':
      return ['---'];
    case 'DETAILS': {
      const summary = el.querySelector(':scope > summary');
      // Plain text: the label is wrapped in bold below, which can't nest.
      const label = (summary?.textContent ?? '').replace(/\s+/g, ' ').trim();
      const rest = Array.from(el.childNodes).filter((n) => n !== summary);
      const wrapper = document.createElement('div');
      wrapper.append(...rest.map((n) => n.cloneNode(true)));
      return [...(label ? [`**${label}**`] : []), ...blocks(wrapper, ctx)];
    }
  }
  if (el.classList.contains('theme-code-block')) return [codeFence(el)];
  if (el.classList.contains('theme-admonition')) return [admonition(el, ctx)];
  if (el.classList.contains('tabs-container')) return tabs(el, ctx);
  return blocks(el, ctx);
}

/** Converts a container's children to a list of Markdown blocks. */
function blocks(parent: Node, ctx: Ctx): string[] {
  const out: string[] = [];
  let run = '';
  const flush = () => {
    const text = tidyInline(run);
    if (text) out.push(escapeBlockStart(text));
    run = '';
  };

  parent.childNodes.forEach((child) => {
    if (!isElement(child)) {
      run += inline(child, ctx);
      return;
    }
    if (shouldSkip(child)) return;
    if (BLOCK_TAGS.has(child.tagName.toUpperCase())) {
      flush();
      out.push(...block(child, ctx).filter(Boolean));
    } else {
      run += inline(child, ctx);
    }
  });
  flush();
  return out;
}

export function domToMarkdown(root: Element, options: MarkdownOptions): string {
  let markdown = blocks(root, {baseUrl: options.baseUrl}).join('\n\n');
  if (options.title && !markdown.startsWith('# ')) {
    markdown = `# ${escapeText(options.title)}\n\n${markdown}`;
  }
  return `${markdown.trim()}\n`;
}
