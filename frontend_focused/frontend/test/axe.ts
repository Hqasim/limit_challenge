import { configureAxe } from 'jest-axe';

// axe-core accessibility checks for component tests: `expect(await axe(container))
// .toHaveNoViolations()`.
//
// Two rules are off because jsdom cannot evaluate them, not because they don't matter:
// - color-contrast needs real rendering; it is checked by running axe in a browser instead;
// - region expects every element inside a landmark, but these tests render components on
//   their own, outside the app shell's <header>/<main>/<footer>.
export const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
});
