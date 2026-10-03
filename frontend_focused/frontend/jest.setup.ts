// Runs before every test file: adds DOM matchers such as toBeInTheDocument() and
// toHaveAttribute() to Jest's expect.
import '@testing-library/jest-dom';

// jsdom does not implement scrolling; the list scrolls its results into view on page changes.
Element.prototype.scrollIntoView = jest.fn();
