import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found.');
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register('/service-worker.js')
      .catch((error: unknown) => {
        console.error('Não foi possível registrar o service worker.', error);
      });
  });
}

if ('serviceWorker' in navigator && import.meta.env.DEV) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .getRegistrations()
      .then(async (registrations) => {
        const serviceWorkerUrl = new URL(
          '/service-worker.js',
          window.location.origin,
        ).href;
        const appRegistrations = registrations.filter((registration) =>
          [
            registration.active,
            registration.waiting,
            registration.installing,
          ].some((worker) => worker?.scriptURL === serviceWorkerUrl),
        );

        await Promise.all(
          appRegistrations.map((registration) => registration.unregister()),
        );
        await caches.delete('whole-new-word-v1');
      })
      .catch((error: unknown) => {
        console.error('Não foi possível limpar o cache do app em desenvolvimento.', error);
      });
  });
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
