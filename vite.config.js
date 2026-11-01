import { defineConfig } from 'vite';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_WORDS_API_URL;

  if (!apiUrl) {
    throw new Error('Configure VITE_WORDS_API_URL in the .env file.');
  }

  const parsedApiUrl = new URL(apiUrl);
  const apiOrigin = parsedApiUrl.origin;
  const apiWordsPath = `${parsedApiUrl.pathname.replace(/\/+$/, '')}/words`;

  return {
    plugins: [react()],
    server: {
      proxy: {
        [apiWordsPath]: {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
