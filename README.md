# A Whole New Word

## Installing on Android

The app is configured as an installable PWA. Open the deployed site over HTTPS in Chrome on Android and use **Instalar app** in the Home page header. If Chrome does not expose its install prompt yet, tap the same button for instructions to install it from the browser menu. The app manifest and 192px, 512px, and maskable icons live in `public/`; `public/service-worker.js` provides an offline app shell and caches same-origin static resources.

## Daily words

The app selects daily words from the local `src/data/words.json` catalog. The file contains 1,000 entries; entries with placeholder definitions or missing phonetics are excluded, leaving 177 usable words in the current dataset. Eligible entries include English and Portuguese definitions and bilingual examples. Words are shuffled locally and tracked in local storage, so selecting a daily word does not depend on the random-word or dictionary APIs. Audio is read with the browser's English speech synthesis because the catalog has no audio URLs.
All word, definition, and example content—including Portuguese translations—comes directly from this JSON file. The app does not call external dictionary, random-word, or translation APIs.

On the first app visit each day, the app picks an unseen entry from `words.json` and saves the word and seen-word list in local storage. Revisiting or refreshing the app on the same local calendar day shows the same daily word. The daily word advances only when the user selects “Já sabia”, selects “Agora eu sei” on the word details page, or a new local calendar day begins.

The Statistics page counts all unique words saved as seen; its first metric is labeled “palavras novas” until the user selects “Já sabia”, then changes to “todas as palavras”. Words count as learned only when the user selects “Agora eu sei” on the word details page. Word history and response statuses are persisted in the same local storage record; existing saved vocabulary is retained when these fields are added.

If all eligible catalog entries have been seen, the app shows an error rather than repeating a word.

Run `npm run dev` to start the Vite frontend. The project is static and can be deployed with the Vite build command `npm run build` and output directory `dist`.
