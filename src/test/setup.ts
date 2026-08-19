import "@testing-library/jest-dom";

if (typeof window === "undefined") {
  // Node-environment test files (e.g. backend access-rule tests) need no DOM shims.
} else
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
