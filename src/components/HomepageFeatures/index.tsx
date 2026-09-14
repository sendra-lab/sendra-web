import type {ReactNode} from 'react';
import Heading from '@theme/Heading';

import styles from './styles.module.css';

/**
 * FIRST-DRAFT MARKETING COPY. Every claim below was checked against the
 * real sendra-lab/Sendra repo (docs/reference/*.md, README.md) before being
 * written, not assumed from a general description. Notably: OAuth's
 * `authorization_code` grant is TUI-only (an interactive browser login via
 * Ctrl+L). `client_credentials`/`password` are the only grants a plain
 * `auth: oauth:` block in a request file can use directly. See
 * docs/reference/requests.md and docs/reference/tui.md in the sendra repo.
 */
type Feature = {
  title: string;
  description: ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: 'Collections & environments',
    description: (
      <>
        A request is a YAML file: method, URL, headers, body, sent straight
        from the shell. Group related requests into a named collection in
        one file, and point the same requests at staging or production by
        swapping which environment loads, using{' '}
        <code>{'{{variable}}'}</code> substitution pulled from
        <code> .sendra/environments/*.yaml</code> or your shell's own
        environment.
      </>
    ),
  },
  {
    title: 'Scripting & assertions',
    description: (
      <>
        Attach a <code>pre_request</code> script to shape a request before
        it's sent, and a <code>post_request</code> script to check what
        comes back. Both are written in Rhai, with the interpreter linked
        straight into the binary, so a scripted request works anywhere{' '}
        <code>sendra</code> does. Add a declarative{' '}
        <code>assertions:</code> block and <code>sendra test</code> fails
        your build the moment a response doesn't match.
      </>
    ),
  },
  {
    title: 'A full interactive TUI',
    description: (
      <>
        <code>sendra tui</code>, or just <code>sendra</code> with no
        arguments, opens a real terminal UI, not a response viewer bolted
        onto the CLI: browse and run requests, edit every field in place,
        switch environments, search and filter, and open multiple
        collections at once in tabs. Every request's run history is one
        keypress away.
      </>
    ),
  },
  {
    title: 'OAuth, built in',
    description: (
      <>
        <code>auth: oauth:</code> acquires a token before the request goes
        out and sets the header for you. <code>client_credentials</code>{' '}
        and <code>password</code> grants work from any request file; the TUI
        adds <code>authorization_code</code> support with a real
        interactive login: it opens your browser, runs a local callback
        listener, and caches the token for the rest of the session.
      </>
    ),
  },
];

function FeatureCard({title, description}: Feature) {
  return (
    <div className={styles.card}>
      <Heading as="h3" className={styles.cardTitle}>
        {title}
      </Heading>
      <p className={styles.cardDescription}>{description}</p>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.grid}>
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
