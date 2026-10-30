# A Whole New Word

## Installing on Android

The app is configured as an installable PWA. Open the deployed site over HTTPS in Chrome on Android and use **Instalar app** in the Home page header. If Chrome does not expose its install prompt yet, tap the same button for instructions to install it from the browser menu. The app manifest and 192px, 512px, and maskable icons live in `public/`; `public/service-worker.js` provides an offline app shell and caches same-origin static resources. API requests are intentionally not cached.

## Daily random words and dictionary data

The app gets random English words from [Random Word API](https://random-word-api.herokuapp.com/) and retrieves definitions, phonetics, examples, and audio (when available) from the free [Free Dictionary API](https://dictionaryapi.dev/). Neither API requires a key. The browser requests these local endpoints:

```text
GET /api/dictionary/{word}
GET /api/random-words?number=10
```

The local Node server forwards requests to:

```text
GET https://api.dictionaryapi.dev/api/v2/entries/en/serene
GET https://random-word-api.herokuapp.com/word?number=10
```

The response contains phonetic spellings and, when available, audio URLs, meanings, definitions, and example sentences. Definitions are returned in English. Audio and examples are not available for every entry.

Definitions and examples without a provided Portuguese translation are translated on the word details page through the free [MyMemory Translation API](https://mymemory.translated.net/), using the `en|pt-BR` language pair. The request is forwarded by the local server at `GET /api/translate?text=...`; the provider's free tier has usage limits and may not always be available.

On the first app visit each day, the app requests a batch of random words, skips words already saved as seen in local storage, and checks candidates until it finds one with a dictionary entry. The chosen word and the seen-word list are saved in local storage. Revisiting or refreshing the app on the same local calendar day shows the same daily word. The daily word advances only when the user selects “Já sabia”, selects “Agora eu sei” on the word details page, or a new local calendar day begins.

The Statistics page counts all unique words saved as seen; its first metric is labeled “palavras novas” until the user selects “Já sabia”, then changes to “todas as palavras”. Words count as learned only when the user selects “Agora eu sei” on the word details page. Word history and response statuses are persisted in the same local storage record; existing saved vocabulary is retained when these fields are added.

If either API is unavailable or no candidate has a dictionary entry, an unseen sample from `src/data/mockWords.ts` is used as a fallback and labeled in the Home page. If the local samples are also exhausted while the APIs are unavailable, the app shows an error rather than repeating a seen word.

Run `npm run dev` to start the Vite frontend and local API proxy. The proxy avoids browser CORS restrictions. On Vercel, `api/[...path].ts` exposes the same proxy endpoints as a serverless function for `/api/dictionary/:word`, `/api/random-words`, and `/api/translate`. Deploy the project root with the Vite build command `npm run build` and output directory `dist`; Vercel detects the API function from the `api/` directory. When available, the word details page links to the source URL included in the dictionary response.
