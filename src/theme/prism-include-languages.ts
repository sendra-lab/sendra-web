/**
 * Swizzled from @docusaurus/theme-classic. The stock version only knows how
 * to `require('prismjs/components/prism-<lang>')` for each entry in
 * `themeConfig.prism.additionalLanguages` — fine for real Prism languages
 * (see `bash` in docusaurus.config.ts), but two languages actually used in
 * the synced docs (docs/cli/**) have no Prism component at all:
 *
 * - `jsonc` — checked prismjs's components.json; only json/json5/jsonp
 *   exist, no jsonc. It's JSON plus comments, so it's registered here as an
 *   extension of the (already-bundled-by-default) json grammar.
 * - `rhai` — sendra's embedded scripting language (see
 *   docs/cli/reference/scripting.md). Not a language Prism ships in any
 *   form, custom or otherwise, so it's hand-written below: syntax-compatible
 *   enough with clike (it's deliberately Rust-flavored) to extend from it.
 */

import siteConfig from '@generated/docusaurus.config';

// Avoid a hard type dependency on the `prismjs` package (not a direct
// dependency here, only pulled in transitively) — same reasoning the
// original component already used `require()` for, just extended to types.
type PrismLanguages = Record<string, unknown>;
type PrismInstance = {
  languages: PrismLanguages & {
    extend: (parentId: string, extension: PrismLanguages) => PrismLanguages;
    insertBefore: (
      parentId: string,
      before: string,
      extension: PrismLanguages,
      target?: PrismLanguages,
    ) => PrismLanguages;
  };
};

function registerJsonc(PrismObject: PrismInstance): void {
  PrismObject.languages.jsonc = PrismObject.languages.insertBefore(
    'json',
    'property',
    {
      comment: {
        pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
        greedy: true,
      },
    },
    PrismObject.languages,
  );
}

function registerRhai(PrismObject: PrismInstance): void {
  PrismObject.languages.rhai = PrismObject.languages.extend('clike', {
    keyword:
      /\b(?:fn|let|const|if|else|while|loop|for|in|do|switch|case|return|break|continue|throw|try|catch|import|export|private|this|type_of|is_shared|curry|global)\b/,
    boolean: /\b(?:true|false)\b/,
    // Closures: |x, y| expr — not a Rust/C-like construct, so clike's
    // default punctuation/operator tokens don't already cover it.
    closure: {
      pattern: /\|[^|]*\|/,
      alias: 'function',
    },
    string: {
      pattern: /"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/,
      greedy: true,
    },
  });
}

export default function prismIncludeLanguages(
  PrismObject: PrismInstance,
): void {
  const {
    themeConfig: {prism},
  } = siteConfig as unknown as {
    themeConfig: {prism: {additionalLanguages: string[]}};
  };
  const {additionalLanguages} = prism;

  // Prism components work on the Prism instance on the window, while prism-
  // react-renderer uses its own Prism instance. We temporarily mount the
  // instance onto window, import components to enhance it, then remove it to
  // avoid polluting global namespace.
  const PrismBefore = (globalThis as {Prism?: unknown}).Prism;
  (globalThis as {Prism?: unknown}).Prism = PrismObject;

  additionalLanguages.forEach((lang) => {
    if (lang === 'php') {
      // eslint-disable-next-line global-require
      require('prismjs/components/prism-markup-templating.js');
    }
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(`prismjs/components/prism-${lang}`);
  });

  registerJsonc(PrismObject);
  registerRhai(PrismObject);

  // Clean up and eventually restore former globalThis.Prism object (if any)
  delete (globalThis as {Prism?: unknown}).Prism;
  if (typeof PrismBefore !== 'undefined') {
    (globalThis as {Prism?: unknown}).Prism = PrismObject;
  }
}
