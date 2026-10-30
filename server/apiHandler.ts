import type { IncomingMessage } from "node:http";

interface ApiResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(data?: string): void;
}

const dictionaryApiUrl = "https://api.dictionaryapi.dev/api/v2/entries/en";
const randomWordsApiUrl = "https://random-word-api.herokuapp.com/word";
const translationApiUrl = "https://api.mymemory.translated.net/get";
const wordPattern = /^[a-z][a-z'-]{0,39}$/i;
const randomWordPattern = /^[a-z][a-z'-]{1,39}$/i;

function sendJson(
  response: ApiResponse,
  statusCode: number,
  payload: Record<string, string>,
) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

export async function handleApiRequest(
  request: IncomingMessage,
  response: ApiResponse,
  requestUrlOverride?: string,
): Promise<void> {
  const requestUrl = new URL(
    requestUrlOverride ?? request.url ?? "/",
    "http://localhost",
  );
  const match = requestUrl.pathname.match(/^\/api\/dictionary\/([^/]+)$/);
  const isRandomWordsRequest = requestUrl.pathname === "/api/random-words";
  const isTranslationRequest = requestUrl.pathname === "/api/translate";

  if (
    request.method !== "GET" ||
    (!match && !isRandomWordsRequest && !isTranslationRequest)
  ) {
    sendJson(response, 404, { error: "API route not found." });
    return;
  }

  try {
    let apiUrl: URL;
    if (isTranslationRequest) {
      const text = requestUrl.searchParams.get("text")?.trim() ?? "";
      if (!text || text.length > 5000) {
        sendJson(response, 400, {
          error: "Translation text must contain between 1 and 5000 characters.",
        });
        return;
      }

      apiUrl = new URL(translationApiUrl);
      apiUrl.searchParams.set("q", text);
      apiUrl.searchParams.set("langpair", "en|pt-BR");
    } else if (isRandomWordsRequest) {
      const count = Number(requestUrl.searchParams.get("number") ?? 10);
      if (!Number.isInteger(count) || count < 1 || count > 20) {
        sendJson(response, 400, {
          error: "The random word count must be between 1 and 20.",
        });
        return;
      }

      apiUrl = new URL(randomWordsApiUrl);
      apiUrl.searchParams.set("number", String(count));
    } else {
      const word = decodeURIComponent(match?.[1] ?? "");
      if (!wordPattern.test(word)) {
        sendJson(response, 400, {
          error: "A valid English word is required.",
        });
        return;
      }
      apiUrl = new URL(`${dictionaryApiUrl}/${encodeURIComponent(word)}`);
    }

    const apiResponse = await fetch(apiUrl, {
      headers: { Accept: "application/json" },
    });
    const body = await apiResponse.text();
    if (isRandomWordsRequest && apiResponse.ok) {
      let payload: unknown;
      try {
        payload = JSON.parse(body);
      } catch {
        sendJson(response, 502, {
          error: "The random word service returned invalid JSON.",
        });
        return;
      }

      if (
        !Array.isArray(payload) ||
        !payload.every((word) => typeof word === "string")
      ) {
        sendJson(response, 502, {
          error: "The random word service returned an invalid word list.",
        });
        return;
      }

      const validWords = payload.filter(
        (word): word is string =>
          typeof word === "string" && randomWordPattern.test(word),
      );
      if (validWords.length === 0) {
        sendJson(response, 502, {
          error: "The random word service did not return valid English words.",
        });
        return;
      }

      response.statusCode = apiResponse.status;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.setHeader("Cache-Control", "no-store");
      response.end(JSON.stringify(validWords));
      return;
    }

    response.statusCode = apiResponse.status;
    response.setHeader(
      "Content-Type",
      apiResponse.headers.get("content-type") ??
        "application/json; charset=utf-8",
    );
    response.setHeader("Cache-Control", "no-store");
    response.end(body);
  } catch (error) {
    console.error("[API proxy]", error);
    sendJson(response, 502, {
      error:
        error instanceof Error
          ? error.message
          : "Could not reach an external API.",
    });
  }
}
