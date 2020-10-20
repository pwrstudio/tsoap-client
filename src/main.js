import App from "./App.svelte"

Sentry.init({
  dsn: 'https://654df1d18dc64c9689fda729c827c4e8@o433904.ingest.sentry.io/5473110'
});

const app = new App({
  target: document.body,
})

export default app
