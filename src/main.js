import App from './App.svelte';

Sentry.init({ dsn: 'https://eb5cd043feb84ed2bdb3fec414cb9241@o65254.ingest.sentry.io/5377423' });

const app = new App({
	target: document.body,
});

export default app;