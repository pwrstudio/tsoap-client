import App from "./App.svelte"
import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

// https://654df1d18dc64c9689fda729c827c4e8@o433904.ingest.sentry.io/5473110
Sentry.init({
  dsn: 'https://654df1d18dc64c9689fda729c827c4e8@o433904.ingest.sentry.io/5473110',
  integrations: [
    new Integrations.BrowserTracing(),
  ],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 0.4,
});

const app = new App({
  target: document.body,
})

export default app
