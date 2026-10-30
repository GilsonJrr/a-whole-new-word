import type { IncomingMessage } from "node:http";
import { handleApiRequest } from "../server/apiHandler";

interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(data?: string): void;
}

function getQueryValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function randomWordsHandler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  const params = new URLSearchParams();
  const count = getQueryValue(request.query.number);
  if (count !== undefined) {
    params.set("number", count);
  }

  return handleApiRequest(
    request,
    response,
    `/api/random-words?${params.toString()}`,
  );
}
