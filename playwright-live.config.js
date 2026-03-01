// playwright-live.config.js — Tests grandeur nature (production GitHub Pages)
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'live.spec.js',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'https://edsouvarine.github.io/BATCH/',
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
});
