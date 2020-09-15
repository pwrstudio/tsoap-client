import App from "./App.svelte"

// Sentry.init({ dsn: 'https://9b240ab9fa0746c2a1748b32489b5837@o433904.ingest.sentry.io/5390057' });

const app = new App({
  target: document.body,
})

export default app
