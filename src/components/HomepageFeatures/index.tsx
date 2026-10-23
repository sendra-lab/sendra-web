import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import Heading from '@theme/Heading';

import styles from './styles.module.css';

const FEATURES = [
  {
    id: 'yaml',
    title: 'Requests as YAML',
    description: 'Readable request files that live, diff, and review alongside your code.',
    preview: 'get-request.yaml',
  },
  {
    id: 'collections',
    title: 'Collections & environments',
    description: 'Group related requests and switch between targets with environment files.',
    preview: 'collections/',
  },
  {
    id: 'terminal',
    title: 'CLI and interactive TUI',
    description: 'Explore collections in the terminal UI, or run requests directly from the shell.',
    preview: 'sendra tui',
  },
  {
    id: 'checks',
    title: 'Assertions & scripting',
    description: 'Validate responses and handle custom request logic in one workflow.',
    preview: 'assertions:',
  },
  {
    id: 'oauth',
    title: 'OAuth built in',
    description: 'Authorize requests with OAuth flows without extra client setup.',
    preview: 'auth: oauth',
  },
  {
    id: 'ci',
    title: 'Ready for CI',
    description: 'Use the same request checks from your laptop and automated builds.',
    preview: 'sendra test',
  },
];

function PreviewArt({id}: {id: string}) {
  if (id === 'collections') {
    return <div className={styles.collectionArt}><div><i /> Requests <small>12</small></div><div className={styles.selectedRow}>GET&nbsp; /users</div><div>POST&nbsp; /sessions</div><div><i /> Environments</div><div className={styles.envPill}>production</div></div>;
  }
  if (id === 'terminal') {
    return (
      <div className={styles.terminalArt}>
        <div className={styles.tuiTopBar}>
          <b>REQUESTS</b><span>collection: users.yaml</span>
        </div>
        <div className={styles.tuiLayout}>
          <aside className={styles.tuiSidebar}>
            <strong>COLLECTIONS</strong>
            <div className={styles.tuiSelected}><span>GET</span> users.yaml</div>
            <div><span>POST</span> sessions.yaml</div>
            <div><span>GET</span> health.yaml</div>
            <strong className={styles.tuiEnvironmentLabel}>ENVIRONMENT</strong>
            <div className={styles.tuiEnvironment}>staging <i>v</i></div>
          </aside>
          <section className={styles.tuiMain}>
            <div className={styles.tuiTabs}><b>Request</b><span>Response</span></div>
            <div className={styles.tuiRequest}><span>GET</span><code>/api/users</code><span className={styles.tuiRunKey}>r Run</span></div>
            <div className={styles.tuiResponseHeader}><b>Response</b><span>200 OK</span><small>148 ms</small></div>
            <div className={styles.tuiJson}><span>{'{'}</span><p><i>"id"</i>: 42,</p><p><i>"name"</i>: "Alex Morgan",</p><p><i>"active"</i>: true</p><span>{'}'}</span></div>
          </section>
        </div>
        <div className={styles.tuiStatusBar}><span>Arrows Navigate</span><span>Enter Select</span><span>r Run request</span></div>
      </div>
    );
  }
  if (id === 'checks') {
    return <div className={styles.checkArt}><div><span>✓</span> status equals 200 <b>PASS</b></div><div><span>✓</span> body.id is present <b>PASS</b></div><div className={styles.mutedCheck}><span>✓</span> duration under 500 ms <b>PASS</b></div><div className={styles.runSummary}>3 checks passed</div></div>;
  }
  if (id === 'oauth') {
    return <div className={styles.oauthArt}><div>Authorization <span>● Connected</span></div><section><label>Grant type</label><b>Client credentials</b></section><section><label>Token URL</label><b>https://auth.example.com/token</b></section><div className={styles.tokenBar}>Bearer token&nbsp; · &nbsp;••••••••••••</div></div>;
  }
  if (id === 'ci') {
    return <div className={styles.ciArt}><div><span className={styles.ciNode}>1</span><section><b>Checkout repository</b><small>actions/checkout@v4</small></section><span className={styles.nodeCheck}>✓</span></div><div><span className={styles.ciNode}>2</span><section><b>Run API checks</b><small>sendra test</small></section><span className={styles.nodeCheck}>✓</span></div><div className={styles.ciComplete}>✓&nbsp; All checks passed</div></div>;
  }
  return <div className={styles.yamlArt}><div><span>1</span><code><em>method:</em> GET</code></div><div><span>2</span><code><em>url:</em> https://api.example.com/users</code></div><div><span>3</span><code><em>assertions:</em></code></div><div><span>4</span><code>&nbsp;&nbsp;<em>status:</em> 200</code></div><div><span>5</span><code>&nbsp;&nbsp;<em>body.id:</em> exists</code></div></div>;
}

export default function HomepageFeatures(): ReactNode {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % FEATURES.length);
    }, 5200);
    return () => window.clearInterval(interval);
  }, [activeIndex]);

  useEffect(() => {
    const activeTab = document.getElementById(`feature-tab-${FEATURES[activeIndex].id}`);
    const featureList = activeTab?.parentElement;
    if (!activeTab || !featureList) return;

    const tabBounds = activeTab.getBoundingClientRect();
    const listBounds = featureList.getBoundingClientRect();
    const isAbove = tabBounds.top < listBounds.top;
    const isBelow = tabBounds.bottom > listBounds.bottom;
    if (!isAbove && !isBelow) return;

    const scrollOffset = isAbove
      ? tabBounds.top - listBounds.top
      : tabBounds.bottom - listBounds.bottom;
    featureList.scrollTo({
      top: featureList.scrollTop + scrollOffset,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, [activeIndex]);

  const active = FEATURES[activeIndex];

  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <Heading as="h2" className={styles.sectionTitle}>A workspace for the whole request</Heading>
          <p className={styles.sectionIntro}>Move between the parts of your API workflow. The same files stay at the center.</p>
        </div>
        <div className={styles.showcase}>
          <div className={styles.featureListFrame}>
            <div className={styles.featureList} role="tablist" aria-label="Sendra features">
              {FEATURES.map((feature, index) => (
                <button
                  key={feature.id}
                  id={`feature-tab-${feature.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active.id === feature.id}
                  aria-controls="feature-preview"
                  className={`${styles.featureTab} ${active.id === feature.id ? styles.featureTabActive : ''}`}
                  onClick={() => setActiveIndex(index)}>
                  <span className={styles.featureTabTitle}>{feature.title}</span>
                  <span className={styles.featureTabDescription}>{feature.description}</span>
                </button>
              ))}
            </div>
          </div>
          <div id="feature-preview" role="tabpanel" aria-labelledby={`feature-tab-${active.id}`} className={styles.previewPanel}>
            <div className={styles.previewWindow}>
              <div className={styles.previewToolbar}>
                <div className={styles.windowDots}><i /><i /><i /></div>
                <span>{active.preview}</span>
              </div>
              <div className={styles.previewCanvas} key={active.id}>
                <PreviewArt id={active.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
