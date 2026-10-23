import type {ReactNode} from 'react';
import {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

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
  return (
    <header className={styles.heroBanner}>
      <div className={clsx('container', styles.heroGrid)}>
        <div className={styles.heroCopy}>
          <Heading as="h1" className={styles.heroTitle}>
            Test APIs with requests that live in your repo.
          </Heading>
          <p className={styles.heroSubtitle}>
            Define requests in YAML, run them from the CLI, and keep your
            checks alongside the code they protect.
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

const WORKFLOW = [
  {
    number: '01',
    title: 'Write once',
    body: 'Keep each request in a readable YAML file beside the code that uses it.',
    icon: 'file',
  },
  {
    number: '02',
    title: 'Run anywhere',
    body: 'Use the same request from the command line or the interactive terminal UI.',
    icon: 'terminal',
  },
  {
    number: '03',
    title: 'Verify every change',
    body: 'Run assertions locally or in CI, and catch unexpected responses before they ship.',
    icon: 'check',
  },
];

function WorkflowIcon({name}: {name: string}) {
  const paths: Record<string, ReactNode> = {
    file: <><path d="M6 3.75h7l5 5v11.5H6z" /><path d="M13 3.75v5h5M9 13h6M9 16.5h6" /></>,
    terminal: <><rect x="3.75" y="5" width="16.5" height="14" rx="2" /><path d="m7.5 10 2.5 2.25-2.5 2.25M12.5 14.5h3" /></>,
    check: <><path d="M12 3.5 19 6v5.25c0 4.35-2.95 7.4-7 9.25-4.05-1.85-7-4.9-7-9.25V6z" /><path d="m8.75 12 2.1 2.1 4.4-4.5" /></>,
  };
  return <svg className={styles.workflowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function WhySendra() {
  return (
    <section className={styles.whySection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          A simple path from request to regression check
        </Heading>
        <div className={styles.workflowGrid}>
          {WORKFLOW.map((step) => (
            <div key={step.number} className={styles.workflowStep}>
              <div className={styles.workflowStepTop}>
                <span className={styles.workflowNumber}>{step.number}</span>
                <WorkflowIcon name={step.icon} />
              </div>
              <Heading as="h3" className={styles.pillarTitle}>{step.title}</Heading>
              <p className={styles.pillarBody}>{step.body}</p>
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
    command: <>npm install -g @sendra-lab/sendra</>,
  },
  {
    id: 'pnpm',
    label: 'pnpm',
    path: 'terminal',
    command: <>pnpm add -g @sendra-lab/sendra</>,
  },
  {
    id: 'bun',
    label: 'Bun',
    path: 'terminal',
    command: <>bun add -g @sendra-lab/sendra</>,
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
            Install Sendra with the package manager you already use.
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
  return (
    <Layout
      title="Terminal-native HTTP client"
      description="Sendra is a terminal-native HTTP client. Define requests in YAML, then run, test, and chain them from the CLI or the TUI. One Rust binary, no Node.js runtime.">
      <HomepageHeader />
      <main>
        <WhySendra />
        <HomepageFeatures />
        <GetStarted />
      </main>
    </Layout>
  );
}
