import { defineConfig, devices } from '@playwright/test';

const testEnv = {
  NODE_ENV: 'test',
  PORT: '4200',
  NG_APP_ZITADEL_DOMAIN: 'https://test.zitadel.cloud',
  NG_APP_ZITADEL_CLIENT_ID: 'test-client-id',
  NG_APP_ZITADEL_REDIRECT_URI: 'http://localhost:4200/auth/callback',
  NG_APP_ZITADEL_POST_LOGOUT_REDIRECT_URI:
    'http://localhost:4200/auth/logout/callback',
  NG_APP_ZITADEL_SCOPE: 'openid profile email',
};

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  testDir: './test',
  outputDir: './build/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    [
      'junit',
      {
        outputFile: './build/reports/junit.xml',
      },
    ],
  ],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: testEnv,
  },
});
