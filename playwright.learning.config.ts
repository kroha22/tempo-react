import {defineConfig} from "@playwright/test";

// Own loopback server and fresh browser contexts only; never accept a production URL.
export default defineConfig({
  testDir:"./tests/browser",
  fullyParallel:false,
  forbidOnly:Boolean(process.env.CI),
  retries:0,
  workers:1,
  reporter:[["list"],["html",{open:"never",outputFolder:"playwright-report/learning"}]],
  outputDir:"test-results/learning",
  use:{baseURL:"http://127.0.0.1:3103/tempo-react/",locale:"ru-RU",colorScheme:"light",trace:"retain-on-failure",screenshot:"only-on-failure"},
  projects:[
    {name:"adult-mobile",use:{browserName:"chromium",viewport:{width:390,height:844}}},
    {name:"adult-desktop",use:{browserName:"chromium",viewport:{width:1440,height:1000}}},
  ],
  webServer:{
    command:"npx --no-install vite preview --config vite.github-pages.config.ts --host 127.0.0.1 --port 3103 --strictPort",
    url:"http://127.0.0.1:3103/tempo-react/",
    reuseExistingServer:false,
    timeout:30_000,
  },
});
