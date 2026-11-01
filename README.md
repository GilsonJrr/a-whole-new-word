# A Whole New Word

## Installing on Android

The app is configured as an installable PWA. Open the deployed site over HTTPS in Chrome on Android and use **Instalar app** in the Home page header. If Chrome does not expose its install prompt yet, tap the same button for instructions to install it from the browser menu. The app manifest and 192px, 512px, and maskable icons live in `public/`; `public/service-worker.js` provides an offline app shell and caches same-origin static resources.

## Daily words

The frontend loads words through TanStack Query. Configure `VITE_WORDS_API_URL` in `.env` with the API base URL `https://a-whole-new-word.onrender.com/api/v1/` (copy `.env.example` to get the default). The API client appends `words/todaysWord` for the daily word and `words/{word}` for details. In development, Vite proxies those requests to the configured host to avoid browser CORS restrictions on localhost. The API provides the word, phonetic spelling, part of speech, English and Portuguese definitions, and bilingual examples. No mock or local word catalog is used by the frontend. Audio is read with the browser's English speech synthesis because the API does not provide audio URLs.

The development proxy only applies to `npm run dev`. A deployed frontend calling a different API origin still requires that API to allow the frontend's origin via CORS, or a reverse proxy configured by the frontend host.

On the first app visit each day, the app requests a word from the API and saves the response in local storage. Revisiting or refreshing the app on the same local calendar day shows the saved word. The daily word advances when the user selects “Já sabia”, selects “Agora eu sei” on the word details page, or a new local calendar day begins.

The Statistics page counts all unique words saved as seen; its first metric is labeled “palavras novas” until the user selects “Já sabia”, then changes to “todas as palavras”. Words count as learned only when the user selects “Agora eu sei” on the word details page. Word history and response statuses are persisted in the same local storage record; existing saved vocabulary is retained when these fields are added.

Run `npm run dev` to start the Vite frontend. The project is static and can be deployed with the Vite build command `npm run build` and output directory `dist`.
