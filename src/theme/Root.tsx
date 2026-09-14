import type {ReactNode} from 'react';
import {Analytics} from '@vercel/analytics/react';

// Docusaurus has no built-in Root component of its own to extend — this
// file, once present under src/theme/, is picked up automatically and
// wraps the entire app. That makes it the right place to mount
// @vercel/analytics: it needs to render once, outside any page, and Root
// is the only place Docusaurus guarantees is common to every route
// (browser vs. server-rendered pages included).
//
// Vercel Web Analytics itself only reports anything once this site is
// deployed on Vercel with Analytics turned on for the project (Vercel
// dashboard → project → Analytics tab) — this component is inert
// (no requests, no error) in local dev and in any other hosting
// environment.
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
