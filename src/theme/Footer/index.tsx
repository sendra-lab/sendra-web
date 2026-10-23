import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './styles.module.css';

type FooterLink = {label: string; to?: string; href?: string};

const GROUPS: {title: string; links: FooterLink[]}[] = [
  {
    title: 'Explore',
    links: [
      {label: 'Introduction', to: '/docs/intro'},
      {label: 'CLI reference', to: '/docs/cli/reference'},
      {label: 'Design decisions', to: '/docs/cli/decisions'},
    ],
  },
  {
    title: 'Project',
    links: [
      {label: 'Blog & updates', to: '/blog'},
      {label: 'Report an issue', href: 'https://github.com/sendra-lab/sendra/issues'},
      {label: 'Contributing', href: 'https://github.com/sendra-lab/sendra/blob/main/CONTRIBUTING.md'},
    ],
  },
];

function FooterAnchor({link}: {link: FooterLink}) {
  if (link.to) {
    return <Link className={styles.footerLink} to={link.to}>{link.label}</Link>;
  }
  return <a className={styles.footerLink} href={link.href}>{link.label}</a>;
}

function GitHubMark(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.31-3.76-1.31-.5-1.28-1.24-1.62-1.24-1.62-1.02-.7.08-.69.08-.69 1.12.08 1.7 1.15 1.7 1.15 1 1.68 2.6 1.2 3.23.92.1-.72.4-1.2.7-1.47-2.48-.28-5.08-1.24-5.08-5.52 0-1.22.43-2.22 1.15-3-.12-.28-.5-1.42.1-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.6 1.54.22 2.68.1 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.6 5.24-5.09 5.52.4.34.76 1.02.76 2.06v3.06c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
    </svg>
  );
}

export default function Footer(): ReactNode {
  const logoUrl = useBaseUrl('/img/sendra-logo.png');

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerMain}>
          <div className={styles.brandColumn}>
            <Link className={styles.brand} to="/" aria-label="Sendra home">
              <img src={logoUrl} alt="" width="54" height="54" />
              <span>Sendra</span>
            </Link>
            <p>Test APIs with requests that live in your repo.</p>
            <a className={styles.githubLink} href="https://github.com/sendra-lab/sendra">
              <GitHubMark /><span>GitHub</span>
            </a>
          </div>
          <div className={styles.footerLinks}>
            {GROUPS.map((group) => (
              <nav key={group.title} className={styles.linkGroup} aria-label={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.label}><FooterAnchor link={link} /></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>Copyright {new Date().getFullYear()} Sendra</span>
          <span>Built by <a href="https://oyibe.dev" target="_blank" rel="noreferrer">Oyibe</a></span>
        </div>
      </div>
    </footer>
  );
}
