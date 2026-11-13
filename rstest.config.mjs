import { defineConfig } from '@rstest/core';

import { pluginTestFrontend } from './tests/helpers/frontend-server.mjs';

export default defineConfig({
  include: ['{packages,src}/**/*.test.{ts,tsx}', 'tests/webview/*.test.mjs'],
  plugins: [pluginTestFrontend()],
  browser: { enabled: true, provider: 'playwright', headless: true },
  // Every webview test boots the whole host bundle, so the first test of a file
  // can spend well over the 15 s browser default while the suite runs in
  // parallel. Keep the limit generous enough to absorb that, still finite.
  testTimeout: 30_000,
  setupFiles: ['./tests/helpers/rstest-setup.mjs'],
  restoreMocks: true,
  unstubGlobals: true,
  tools: {
    swc: {
      jsc: {
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    },
  },
});
