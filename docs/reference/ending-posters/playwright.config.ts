import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'.', testMatch:'capture.spec.ts', timeout:90000, workers:2,
  use:{baseURL:'http://127.0.0.1:4174', reducedMotion:'reduce', trace:'retain-on-failure'},
  webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4174',url:'http://127.0.0.1:4174',reuseExistingServer:false},
});
