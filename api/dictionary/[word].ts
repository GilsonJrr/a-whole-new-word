import type { IncomingMessage } from "node:http";
import { handleApiRequest } from "../../server/apiHandler";

interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(data?: string): void;
}

export default function dictionaryHandler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  const rawWord = request.query.word;
  const word = Array.isArray(rawWord) ? rawWord[0] : rawWord;
  const encodedWord = encodeURIComponent(word ?? "");

  return handleApiRequest(
    request,
    response,
    `/api/dictionary/${encodedWord}`,
  );
}
