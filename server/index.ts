import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';

const dictionaryApiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const randomWordsApiUrl = 'https://random-word-api.herokuapp.com/word';
const translationApiUrl = 'https://api.mymemory.translated.net/get';
const port = Number(process.env.API_PORT ?? 3002);
const wordPattern = /^[a-z][a-z'-]{0,39}$/i;
const randomWordPattern = /^[a-z][a-z'-]{1,39}$/i;

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: Record<string, string>,
) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

const server = createServer(
  async (request: IncomingMessage, response: ServerResponse) => {
    const requestUrl = new URL(request.url ?? '/', 'http://localhost');
    const match = requestUrl.pathname.match(/^\/api\/dictionary\/([^/]+)$/);
    const isRandomWordsRequest = requestUrl.pathname === '/api/random-words';
    const isTranslationRequest = requestUrl.pathname === '/api/translate';

    if (
      request.method !== 'GET' ||
      (!match && !isRandomWordsRequest && !isTranslationRequest)
    ) {
      sendJson(response, 404, { error: 'API route not found.' });
      return;
    }

    try {
      let apiUrl: URL;
      if (isTranslationRequest) {
        const text = requestUrl.searchParams.get('text')?.trim() ?? '';
        if (!text || text.length > 5000) {
          sendJson(response, 400, {
            error: 'Translation text must contain between 1 and 5000 characters.',
          });
          return;
        }

        apiUrl = new URL(translationApiUrl);
        apiUrl.searchParams.set('q', text);
        apiUrl.searchParams.set('langpair', 'en|pt-BR');
      } else if (isRandomWordsRequest) {
        const count = Number(requestUrl.searchParams.get('number') ?? 10);
        if (!Number.isInteger(count) || count < 1 || count > 20) {
          sendJson(response, 400, {
            error: 'The random word count must be between 1 and 20.',
          });
          return;
        }

        apiUrl = new URL(randomWordsApiUrl);
        apiUrl.searchParams.set('number', String(count));
      } else {
        const word = decodeURIComponent(match?.[1] ?? '');
        if (!wordPattern.test(word)) {
          sendJson(response, 400, {
            error: 'A valid English word is required.',
          });
          return;
        }
        apiUrl = new URL(`${dictionaryApiUrl}/${encodeURIComponent(word)}`);
      }

      const apiResponse = await fetch(apiUrl, {
        headers: { Accept: 'application/json' },
      });
      const body = await apiResponse.text();
      if (isRandomWordsRequest && apiResponse.ok) {
        let payload: unknown;
        try {
          payload = JSON.parse(body);
        } catch {
          sendJson(response, 502, {
            error: 'The random word service returned invalid JSON.',
          });
          return;
        }

        if (!Array.isArray(payload) || !payload.every((word) => typeof word === 'string')) {
          sendJson(response, 502, {
            error: 'The random word service returned an invalid word list.',
          });
          return;
        }

        const validWords = payload.filter(
          (word): word is string =>
            typeof word === 'string' && randomWordPattern.test(word),
        );
        if (validWords.length === 0) {
          sendJson(response, 502, {
            error: 'The random word service did not return valid English words.',
          });
          return;
        }

        response.writeHead(apiResponse.status, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        response.end(JSON.stringify(validWords));
        return;
      }

      response.writeHead(apiResponse.status, {
        'Content-Type':
          apiResponse.headers.get('content-type') ??
          'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      response.end(body);
    } catch (error) {
      console.error('[API proxy]', error);
      sendJson(response, 502, {
        error:
          error instanceof Error
            ? error.message
            : 'Could not reach the Free Dictionary API.',
      });
    }
  },
);

server.listen(port, '127.0.0.1', () => {
  console.log(`Dictionary API proxy listening on http://127.0.0.1:${port}`);
});
