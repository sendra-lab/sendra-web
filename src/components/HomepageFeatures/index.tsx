import type {ReactNode} from 'react';
import Heading from '@theme/Heading';

import styles from './styles.module.css';

type Feature = {
  title: string;
  description: string;
  icon: ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: 'YAML request files',
    description: 'Readable, version controlled requests that fit naturally into your repo.',
    icon: <><path d="M6 3.75h7l5 5v11.5H6z" /><path d="M13 3.75v5h5M9 13h6M9 16.5h6" /></>,
  },
  {
    title: 'Collections & environments',
    description: 'Organize related requests and switch targets without changing the request.',
    icon: <><rect x="4" y="4" width="7" height="7" rx="1.3" /><rect x="13" y="4" width="7" height="7" rx="1.3" /><rect x="4" y="13" width="7" height="7" rx="1.3" /><rect x="13" y="13" width="7" height="7" rx="1.3" /></>,
  },
  {
    title: 'CLI & interactive TUI',
    description: 'Run a single request from the shell or work interactively in the terminal.',
    icon: <><rect x="3.75" y="5" width="16.5" height="14" rx="2" /><path d="m7.5 10 2.5 2.25-2.5 2.25M12.5 14.5h3" /></>,
  },
  {
    title: 'Assertions & scripting',
    description: 'Check responses and handle request logic with built in scripting.',
    icon: <><path d="m5 12 4.2 4.2L19 6.5" /><path d="M20 12a8 8 0 1 1-2.35-5.65" /></>,
  },
  {
    title: 'OAuth authentication',
    description: 'Use OAuth flows directly in requests and in interactive sessions.',
    icon: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v2" /></>,
  },
  {
    title: 'CI ready',
    description: 'Run the same request checks in local development and automated builds.',
    icon: <><path d="M4 12h3l2-6 4 12 2-6h5" /><path d="M3.5 4.5h17v15h-17z" /></>,
  },
];

function FeatureCard({title, description, icon}: Feature) {
  return (
    <div className={styles.card}>
      <div className={styles.cardIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </div>
      <div>
        <Heading as="h3" className={styles.cardTitle}>{title}</Heading>
        <p className={styles.cardDescription}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <Heading as="h2" className={styles.sectionTitle}>
            Product features
          </Heading>
          <p className={styles.sectionIntro}>
            A focused toolkit for API development and testing.
          </p>
        </div>
        <div className={styles.grid}>
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
