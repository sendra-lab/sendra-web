/**
 * Circular-reveal theme transition, expanding from the point the user
 * clicked, using the View Transitions API. Falls back to an instant
 * (unanimated) change on browsers without support (Firefox, older Safari)
 * and for users who've asked for reduced motion.
 */

export function changeColorModeWithTransition(
  apply: () => void,
  origin: {x: number; y: number},
): void {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  if (typeof document.startViewTransition !== 'function' || prefersReducedMotion) {
    apply();
    return;
  }

  const endRadius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );

  const root = document.documentElement;
  root.style.setProperty('--color-mode-transition-x', `${origin.x}px`);
  root.style.setProperty('--color-mode-transition-y', `${origin.y}px`);
  root.style.setProperty('--color-mode-transition-r', `${endRadius}px`);

  document.startViewTransition(apply);
}
