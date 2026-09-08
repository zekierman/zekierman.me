import Lenis from 'lenis';

// One Lenis for the page, owned here rather than on `window` — the library
// already declares a `window.lenis` of its own for feature detection.
let instance: Lenis | undefined;

export const reducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Starts the page's smooth scroll. Smooth scrolling is what makes the hero scrub
 * read as a camera move rather than a slider, so it is skipped entirely when the
 * visitor asked for less motion.
 */
export function startSmoothScroll(): void {
  if (instance || reducedMotion()) return;

  // `anchors` routes in-page links through Lenis. A native hash jump would not:
  // Lenis keeps its own target and animates back, and the hero reads `scrollY`
  // directly every frame, so the film would fight the jump.
  const lenis = new Lenis({ lerp: 0.1, anchors: true });
  instance = lenis;

  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

/** The running instance, or `undefined` when there is no smooth scroll to drive. */
export const smoothScroll = (): Lenis | undefined => instance;
