// Runs before every test file: adds DOM matchers such as toBeInTheDocument() and
// toHaveAttribute(), plus jest-axe's toHaveNoViolations(), to Jest's expect.
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// jsdom does not implement scrolling; the list scrolls its results into view on page changes.
Element.prototype.scrollIntoView = jest.fn();
