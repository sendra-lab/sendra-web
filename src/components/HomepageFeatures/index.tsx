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
    preview: 'CLI + TUI',
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

function TerminalDemo({onInteract}: {onInteract: () => void}) {
  const [mode, setMode] = useState<'cli' | 'tui'>('cli');
  const [selectedRequest, setSelectedRequest] = useState(0);
  const [runState, setRunState] = useState<'ready' | 'running' | 'done'>('ready');
  const [tuiTab, setTuiTab] = useState<'request' | 'response'>('request');
  const requests = [
    {method: 'GET', file: 'users.yaml', path: '/api/users', status: '200 OK', duration: '148 ms', body: [{key: 'id', value: '42'}, {key: 'name', value: '"Alex Morgan"'}, {key: 'active', value: 'true'}]},
    {method: 'POST', file: 'sessions.yaml', path: '/api/sessions', status: '201 Created', duration: '203 ms', body: [{key: 'session_id', value: '"s_83ab1"'}, {key: 'expires_in', value: '3600'}]},
    {method: 'GET', file: 'health.yaml', path: '/api/health', status: '200 OK', duration: '24 ms', body: [{key: 'status', value: '"healthy"'}, {key: 'uptime', value: '86400'}]},
  ];
  const request = requests[selectedRequest];

  useEffect(() => {
    if (runState !== 'running') return undefined;
    const timeout = window.setTimeout(() => setRunState('done'), 1200);
    return () => window.clearTimeout(timeout);
  }, [runState]);

  return (
    <div className={styles.terminalArt}>
      <div className={styles.demoToolbar}>
        <div className={styles.demoModes} role="tablist" aria-label="Terminal demo mode">
          <button type="button" role="tab" aria-selected={mode === 'cli'} onClick={() => { onInteract(); setMode('cli'); setRunState('ready'); setTuiTab('request'); }}>CLI</button>
          <button type="button" role="tab" aria-selected={mode === 'tui'} onClick={() => { onInteract(); setMode('tui'); setRunState('ready'); setTuiTab('request'); }}>TUI</button>
        </div>
        <span>{mode === 'cli' ? 'shell' : 'sendra tui'}</span>
      </div>
      {mode === 'cli' ? (
        <div className={styles.cliDemo}>
          <div className={styles.cliPrompt}><i>$</i> sendra run {request.file}</div>
          {runState === 'ready' && <p className={styles.cliHint}>Run a request from your terminal.</p>}
          {runState === 'running' && <div className={styles.cliOutput}><p><i className={styles.loadingMark}>◌</i> Loading request and environment…</p><p><i className={styles.loadingMark}>◌</i> Sending {request.method} {request.path}</p></div>}
          {runState === 'done' && <div className={styles.cliOutput}><p><i>✓</i> {request.method} {request.path} <b>{request.status}</b></p><p><i>✓</i> 3 assertions passed <small>{request.duration}</small></p></div>}
          <button className={styles.runAction} type="button" onClick={() => { onInteract(); setRunState('running'); }} disabled={runState === 'running'}>
            {runState === 'running' ? 'Running…' : runState === 'done' ? 'Run again' : 'Run request'} <kbd>↵</kbd>
          </button>
        </div>
      ) : (
        <div className={styles.tuiDemo}>
          <aside className={styles.tuiSidebar}>
            <strong>COLLECTIONS</strong>
            {requests.map((item, index) => (
              <button key={item.file} type="button" className={index === selectedRequest ? styles.tuiSelected : ''} onClick={() => { onInteract(); setSelectedRequest(index); setRunState('ready'); setTuiTab('request'); }}>
                <span>{item.method}</span> {item.file}
              </button>
            ))}
            <strong className={styles.tuiEnvironmentLabel}>ENVIRONMENT</strong>
            <div className={styles.tuiEnvironment}>staging <i>v</i></div>
          </aside>
          <section className={styles.tuiMain}>
            <div className={styles.tuiTabs} role="tablist" aria-label="Request details">
              <button type="button" role="tab" aria-selected={tuiTab === 'request'} onClick={() => setTuiTab('request')}>Request</button>
              <button type="button" role="tab" aria-selected={tuiTab === 'response'} disabled={runState !== 'done'} onClick={() => setTuiTab('response')}>Response</button>
            </div>
            {tuiTab === 'request' ? (
              <div className={styles.tuiTabPanel} role="tabpanel">
                <div className={styles.tuiRequest}><span>{request.method}</span><code>{request.path}</code></div>
                <button className={styles.runAction} type="button" onClick={() => { onInteract(); setRunState('running'); }} disabled={runState === 'running'}>
                  {runState === 'running' ? 'Running…' : runState === 'done' ? 'Run again' : 'r  Run request'}
                </button>
                <p className={styles.tuiEmptyResponse}>{runState === 'running' ? 'Sending request…' : runState === 'done' ? 'Request complete. Open Response to inspect the result.' : 'Run this request to see its response.'}</p>
              </div>
            ) : (
              <div className={styles.tuiTabPanel} role="tabpanel">
                <div className={styles.tuiResponseHeader}><b>{request.method} {request.path}</b><span>{request.status}</span><small>{request.duration}</small></div>
                <div className={styles.tuiJson}><span>{'{'}</span>{request.body.map((field, index) => <p key={field.key}><i>"{field.key}"</i>: {field.value}{index < request.body.length - 1 ? ',' : ''}</p>)}<span>{'}'}</span></div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function PreviewArt({id, onInteract}: {id: string; onInteract: () => void}) {
  if (id === 'collections') {
    return <div className={styles.collectionArt}><div><i /> Requests <small>12</small></div><div className={`${styles.collectionItem} ${styles.collectionItemOne}`}>GET&nbsp; /users</div><div className={`${styles.collectionItem} ${styles.collectionItemTwo}`}>POST&nbsp; /sessions</div><div className={`${styles.collectionItem} ${styles.collectionItemThree}`}>GET&nbsp; /health</div><div><i /> Environments</div><div className={styles.envPill}>production</div></div>;
  }
  if (id === 'terminal') {
    return <TerminalDemo onInteract={onInteract} />;
  }
  if (id === 'checks') {
    return <div className={styles.checkArt}><div><span>✓</span> status equals 200 <b>PASS</b></div><div><span>✓</span> body.id is present <b>PASS</b></div><div className={styles.mutedCheck}><span>✓</span> duration under 500 ms <b>PASS</b></div><div className={styles.runSummary}>3 checks passed</div></div>;
  }
  if (id === 'oauth') {
    return <div className={styles.oauthArt}><div>Authorization <span>● Connected</span></div><section><label>Grant type</label><b>Client credentials</b></section><section><label>Token URL</label><b>https://auth.example.com/token</b></section><div className={styles.tokenBar}>Bearer token&nbsp; · &nbsp;••••••••••••</div></div>;
  }
  if (id === 'ci') {
    return (
      <div className={styles.ciArt}>
        <div className={styles.ciRunHeader}><i /> sendra test <span>workflow run #184</span></div>
        <div className={styles.ciSteps}>
          <div><span className={styles.ciNode}>1</span><section><b>Checkout repository</b><small>actions/checkout@v4</small></section><span className={styles.nodeCheck}>✓</span></div>
          <div><span className={styles.ciNode}>2</span><section><b>Run API checks</b><small>sendra test</small></section><span className={styles.nodeCheck}>✓</span></div>
        </div>
        <div className={styles.ciLogs}>
          <p>$ sendra test</p>
          <p>Loading request collection…</p>
          <p>Loaded 6 request files</p>
          <p>GET&nbsp; /api/users&nbsp; <b>200 OK</b></p>
          <p>✓&nbsp; status assertion passed</p>
          <p>POST&nbsp; /api/sessions&nbsp; <b>201 Created</b></p>
          <p>✓&nbsp; 14 assertions passed · 0.84s</p>
          <p className={styles.ciFinalLog}>✓&nbsp; Workflow completed successfully</p>
        </div>
      </div>
    );
  }
  return <div className={styles.yamlArt}><div><span>1</span><code><em>method:</em> GET</code></div><div><span>2</span><code><em>url:</em> https://api.example.com/users</code></div><div><span>3</span><code><em>assertions:</em></code></div><div><span>4</span><code>&nbsp;&nbsp;<em>status:</em> 200</code></div><div><span>5</span><code>&nbsp;&nbsp;<em>body.id:</em> exists</code></div></div>;
}

export default function HomepageFeatures(): ReactNode {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pauseUntil, setPauseUntil] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || Date.now() < pauseUntil) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % FEATURES.length);
    }, 8000);
    return () => window.clearInterval(interval);
  }, [pauseUntil]);

  useEffect(() => {
    if (!pauseUntil) return undefined;
    const timeout = window.setTimeout(() => setPauseUntil(0), Math.max(0, pauseUntil - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [pauseUntil]);

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
  const pauseAutoAdvance = () => setPauseUntil(Date.now() + 18000);

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
                  onClick={() => { setActiveIndex(index); pauseAutoAdvance(); }}>
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
                <PreviewArt id={active.id} onInteract={pauseAutoAdvance} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
