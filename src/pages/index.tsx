import type {ReactNode} from 'react';
import {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

/**
 * FIRST-DRAFT MARKETING COPY. The hero headline/positioning line, the "Why
 * Sendra" pillars, and the terminal preview are a first pass, meant to be
 * reviewed as content, not shipped as final. Every factual claim (no
 * Node.js runtime, requests-as-YAML, the assertion output format, etc.) was
 * checked against the real sendra-lab/Sendra repo (README.md,
 * docs/reference/running-and-testing.md, docs/reference/assertions.md)
 * before being written. The terminal preview's output is the real
 * `assertions:` print format from docs/reference/assertions.md, not
 * invented.
 */
function TerminalWindow({
  path,
  children,
}: {
  path: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.terminal} aria-hidden="true">
      <div className={styles.terminalBar}>
        <span className={styles.terminalDot} data-color="red" />
        <span className={styles.terminalDot} data-color="yellow" />
        <span className={styles.terminalDot} data-color="green" />
        <span className={styles.terminalPath}>{path}</span>
      </div>
      <pre className={styles.terminalBody}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

function HeroTerminal() {
  return (
    <TerminalWindow path="get-request.yaml">
      <span className={styles.tKey}>method:</span> GET{'\n'}
      <span className={styles.tKey}>url:</span> https://httpbin.org/get
      {'\n'}
      <span className={styles.tKey}>assertions:</span>
      {'\n  '}
      <span className={styles.tKey}>status:</span> 200{'\n\n'}
      <span className={styles.tPrompt}>$</span> sendra run get-request.yaml
      {'\n'}
      200 OK{'  '}142 ms{'\n'}
      assertions{'\n'}
      {'  '}
      <span className={styles.tPass}>✓</span> status is 200{'\n'}
      {'  '}1 passed, 0 failed
    </TerminalWindow>
  );
}

function HomepageHeader() {
  const logoSrc = useBaseUrl('/img/sendra-logo.png');
  return (
    <header className={styles.heroBanner}>
      <div className={clsx('container', styles.heroGrid)}>
        <div className={styles.heroCopy}>
          <img
            src={logoSrc}
            alt=""
            className={styles.heroLogo}
            width={64}
            height={64}
          />
          <Heading as="h1" className={styles.heroTitle}>
            The terminal-native API testing tool.
          </Heading>
          <p className={styles.heroSubtitle}>
            Define HTTP requests in YAML.
            Run, test, automate, and chain API requests
            without leaving your terminal.
          </p>
          <div className={styles.heroButtons}>
            <Link className="button button--lg" to="/docs/intro">
              Read the docs
            </Link>
            <Link
              className={clsx(
                'button button--lg button--outline',
                styles.secondaryButton,
              )}
              to="https://github.com/sendra-lab/sendra">
              View on GitHub
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <HeroTerminal />
        </div>
      </div>
    </header>
  );
}

const PILLARS = [
  {
    title: 'The request is the file',
    body: 'Every request and collection lives in your repo as plain YAML: reviewable in a pull request, diffable over time, no export step.',
  },
  {
    title: 'One binary, nothing else',
    body: 'The scripting engine, the test runner, and the interactive TUI all ship inside sendra. No Node.js or other runtime to install alongside it.',
  },
  {
    title: 'Terminal-native, not bolted on',
    body: "Sendra isn't a GUI app with a CLI feature added later. The terminal is the whole interface, from a single request to the full TUI.",
  },
];

function WhySendra() {
  return (
    <section className={styles.whySection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Why Sendra
        </Heading>
        <div className={styles.pillarGrid}>
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className={styles.pillar}>
              <Heading as="h3" className={styles.pillarTitle}>
                {pillar.title}
              </Heading>
              <p className={styles.pillarBody}>{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Every install path below was checked against the LIVE v0.1.0 release,
 * not assumed from earlier release planning:
 * - shell/powershell: the installer scripts are real release assets on
 *   github.com/sendra-lab/Sendra/releases/tag/v0.1.0 (sendra-cli-installer.sh
 *   / .ps1), and the /releases/latest/download/ URLs used here 200.
 * - npm: @sendra-lab/sendra 0.1.0 is live on the npm registry right now
 *   (the earlier unscoped "sendra" name was rejected and never published).
 * - homebrew: sendra-lab/homebrew-tap has a real Formula/sendra-cli.rb on
 *   its main branch, pinned to v0.1.0 release assets.
 * - cargo: the "sendra-cli" crate (not "sendra") is live on crates.io at
 *   0.1.0.
 */
type InstallMethod = {
  id: string;
  label: string;
  path: string;
  command: ReactNode;
};

const INSTALL_METHODS: InstallMethod[] = [
  {
    id: 'shell',
    label: 'Shell',
    path: 'terminal',
    command: (
      <>
        curl --proto '=https' --tlsv1.2 -LsSf https://github.com/sendra-lab/Sendra/releases/latest/download/sendra-cli-installer.sh | sh
      </>
    ),
  },
  {
    id: 'npm',
    label: 'npm',
    path: 'terminal',
    command: <>npm install @sendra-lab/sendra</>,
  },
  {
    id: 'pnpm',
    label: 'pnpm',
    path: 'terminal',
    command: <>pnpm add @sendra-lab/sendra</>,
  },
  {
    id: 'bun',
    label: 'Bun',
    path: 'terminal',
    command: <>bun add @sendra-lab/sendra</>,
  },
  {
    id: 'powershell',
    label: 'PowerShell',
    path: 'terminal',
    command: (
      <>
        powershell -ExecutionPolicy Bypass -c "irm https://github.com/sendra-lab/Sendra/releases/latest/download/sendra-cli-installer.ps1 | iex"
      </>
    ),
  },
  {
    id: 'homebrew',
    label: 'Homebrew',
    path: 'terminal',
    command: <>brew install sendra-lab/tap/sendra-cli</>,
  },
  {
    id: 'cargo',
    label: 'Cargo',
    path: 'terminal',
    command: <>cargo install sendra-cli</>,
  },
];

function GetStarted() {
  const [activeId, setActiveId] = useState(INSTALL_METHODS[0].id);
  const active =
    INSTALL_METHODS.find((method) => method.id === activeId) ??
    INSTALL_METHODS[0];

  return (
    <section className={styles.getStartedSection}>
      <div className={clsx('container', styles.getStartedGrid)}>
        <div className={styles.getStartedCopy}>
          <Heading as="h2" className={styles.getStartedTitle}>
            Get started
          </Heading>
          <p className={styles.placeholderNote}>
            Install with the shell script or npm, or pick pnpm, Bun,
            PowerShell, Homebrew, or Cargo below.
          </p>
          <div className={styles.installTabs} role="tablist">
            {INSTALL_METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                role="tab"
                aria-selected={method.id === activeId}
                className={clsx(styles.installTab, {
                  [styles.installTabActive]: method.id === activeId,
                })}
                onClick={() => setActiveId(method.id)}>
                {method.label}
              </button>
            ))}
          </div>
          <p className={styles.getStartedFooter}>
            Prebuilt binaries, checksums, and the full changelog are on the{' '}
            <Link to="https://github.com/sendra-lab/Sendra/releases/tag/v0.1.0">
              v0.1.0 release
            </Link>
            . For everything else, the <Link to="/docs/intro">docs</Link>{' '}
            cover the rest.
          </p>
        </div>
        <div className={styles.heroVisual}>
          <TerminalWindow path={active.path}>
            <span className={styles.tPrompt}>$</span>{' '}
            <span className={styles.tWrap}>{active.command}</span>
            {'\n'}
            <span className={styles.tPrompt}>$</span> sendra run examples/get-request.yaml
          </TerminalWindow>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <WhySendra />
        <HomepageFeatures />
        <GetStarted />
      </main>
    </Layout>
  );
}
