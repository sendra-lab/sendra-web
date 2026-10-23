import {useEffect, useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type DocLink = {title: string; description: string; to: string};

const START_LINKS: DocLink[] = [
  {
    title: 'Write a request',
    description: 'Learn the YAML shape for a request or collection.',
    to: '/docs/cli/reference/requests',
  },
  {
    title: 'Run and verify it',
    description: 'Send requests, add assertions, and run a test suite.',
    to: '/docs/cli/reference/running-and-testing',
  },
  {
    title: 'Explore the TUI',
    description: 'Browse collections and work with requests interactively.',
    to: '/docs/cli/reference/tui',
  },
];

const INSTALL_OPTIONS = [
  ['PowerShell', 'powershell -ExecutionPolicy Bypass -c "irm https://github.com/sendra-lab/Sendra/releases/latest/download/sendra-cli-installer.ps1 | iex"'],
  ['npm', 'npm install -g @sendra-lab/sendra'],
  ['pnpm', 'pnpm add -g @sendra-lab/sendra'],
  ['Bun', 'bun add -g @sendra-lab/sendra'],
  ['Homebrew', 'brew install sendra-lab/tap/sendra-cli'],
  ['Cargo', 'cargo install sendra-cli'],
];

function Arrow(): ReactNode {
  return (
    <svg className={styles.arrow} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

export default function DocsHome(): ReactNode {
  return (
    <div className={styles.home}>
      <header className={styles.hero}>
            <h1>Test APIs with requests that live in your repo.</h1>
            <p>
              Write requests as YAML, run them from your terminal, and keep
              reliable API checks alongside your code.
            </p>
            <Link className={styles.primaryLink} to="/docs/cli/reference/requests">
              Start with a request <Arrow />
            </Link>
          </header>

          <section className={styles.quickStartSection} id="quick-start" aria-labelledby="quick-start-heading">
            <div className={styles.sectionHeading}>
              <div>
                <h2 id="quick-start-heading">Send your first request.</h2>
              </div>
              <Link className={styles.textLink} to="/docs/cli/reference/requests">
                Request file reference <Arrow />
              </Link>
            </div>
            <div className={styles.quickStart}>
              <div className={styles.panelHeader}>
                <span><i /><i /><i /></span>
                <span>get-request.yaml</span>
              </div>
              <div className={styles.panelBody}>
                <div className={styles.requestExample}>
                  <div className={styles.commandLabel}>1. Create a request file</div>
                  <pre><code><span className={styles.yamlKey}>method:</span> GET{`\n`}<span className={styles.yamlKey}>url:</span> https://httpbin.org/get</code></pre>
                </div>
                <div className={styles.runExample}>
                  <div className={styles.commandLabel}>2. Run it from your terminal</div>
                  <pre className={styles.lastCommand}><code><span className={styles.prompt}>$</span> sendra run get-request.yaml{`\n`}200 OK</code></pre>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section} id="start-here" aria-labelledby="start-heading">
            <div className={styles.sectionHeading}>
              <div>
                <h2 id="start-heading">Choose your next step.</h2>
              </div>
              <Link className={styles.textLink} to="/docs/cli/reference">
                Browse the reference <Arrow />
              </Link>
            </div>
            <div className={styles.startGrid}>
              {START_LINKS.map((item, index) => (
                <Link className={styles.startCard} key={item.title} to={item.to}>
                  <span className={styles.cardIndex}>0{index + 1}</span>
                  <strong>{item.title}</strong>
                  <span className={styles.cardDescription}>{item.description}</span>
                  <Arrow />
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.bottomRow} id="reference" aria-label="More documentation">
            <Link className={styles.resourceLink} to="/docs/cli/reference">
              <strong>CLI reference</strong>
              <span>Options, configuration, environments, assertions, and more.</span>
              <Arrow />
            </Link>
            <Link className={styles.resourceLink} to="/docs/cli/decisions">
              <strong>Design decisions</strong>
              <span>The tradeoffs behind how Sendra behaves.</span>
              <Arrow />
            </Link>
          </section>

          <section className={styles.installOptions} id="installation" aria-labelledby="installation-heading">
            <div className={styles.installHeading}>
              <div>
                <h2 id="installation-heading">Installation</h2>
                <p>Choose the package manager that fits your setup.</p>
              </div>
            </div>
            <div className={styles.installGrid}>
              {INSTALL_OPTIONS.map(([label, command]) => (
                <div className={styles.installItem} key={label}>
                  <strong>{label}</strong>
                  <code>{command}</code>
                </div>
              ))}
              <div className={styles.installItem}>
                <strong>Prebuilt binaries</strong>
                <Link to="https://github.com/sendra-lab/Sendra/releases/tag/v0.1.0" target="_blank" rel="noreferrer">
                  Download from the v0.1.0 release <Arrow />
                </Link>
              </div>
            </div>
          </section>
    </div>
  );
}

export function DocsHomeContents(): ReactNode {
  const [activeSection, setActiveSection] = useState('quick-start');

  useEffect(() => {
    const sectionIds = ['quick-start', 'start-here', 'reference', 'installation'];
    const updateActiveSection = () => {
      const readingLine = window.scrollY + window.innerHeight * 0.35;
      let current = sectionIds[0];

      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (section && section.offsetTop <= readingLine) current = id;
      }

      setActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, {passive: true});
    window.addEventListener('resize', updateActiveSection);
    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  return (
    <nav className={styles.pageNav} aria-label="Introduction page contents">
      <strong>On this page</strong>
      <a href="#quick-start" className={activeSection === 'quick-start' ? styles.pageNavActive : undefined} aria-current={activeSection === 'quick-start' ? 'location' : undefined}>Quick start</a>
      <a href="#start-here" className={activeSection === 'start-here' ? styles.pageNavActive : undefined} aria-current={activeSection === 'start-here' ? 'location' : undefined}>Get started</a>
      <a href="#reference" className={activeSection === 'reference' ? styles.pageNavActive : undefined} aria-current={activeSection === 'reference' ? 'location' : undefined}>Reference and decisions</a>
      <a href="#installation" className={activeSection === 'installation' ? styles.pageNavActive : undefined} aria-current={activeSection === 'installation' ? 'location' : undefined}>Installation</a>
    </nav>
  );
}
