// Simulates a screen width for MUI's useMediaQuery. jsdom has no window.matchMedia, which MUI
// reads as "no query matches" (i.e. a small screen). setScreenWidth installs a matchMedia that
// evaluates min-width/max-width queries against the given width; resetScreen removes it.

export const PHONE_WIDTH = 375;
export const DESKTOP_WIDTH = 1280;

function matches(query: string, width: number) {
  const min = /min-width:\s*([\d.]+)px/.exec(query);
  const max = /max-width:\s*([\d.]+)px/.exec(query);
  if (!min && !max) return false; // e.g. prefers-reduced-motion
  return (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]));
}

export function setScreenWidth(width: number) {
  window.matchMedia = ((query: string) => ({
    matches: matches(query, width),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

export function resetScreen() {
  delete (window as { matchMedia?: unknown }).matchMedia;
}
