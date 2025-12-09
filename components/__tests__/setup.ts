import '@testing-library/jest-dom';

// Mock Audio API since JSDOM doesn't support it
(globalThis as any).Audio = class {
  volume: number = 1;
  constructor(src?: string) {}
  play() { return Promise.resolve(); }
  pause() {}
};