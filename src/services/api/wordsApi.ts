import type { DailyWord, WordExample } from "../../types/word";

interface ApiWord {
  word: string;
  phonetic?: string;
  type: string;
  definition: {
    en: string;
    pt: string;
  };
  examples?: Array<{
    en: string;
    pt: string;
  }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiWord(value: unknown): value is ApiWord {
  return (
    isRecord(value) &&
    typeof value.word === "string" &&
    (typeof value.phonetic === "string" || value.phonetic === undefined) &&
    typeof value.type === "string" &&
    isRecord(value.definition) &&
    typeof value.definition.en === "string" &&
    typeof value.definition.pt === "string" &&
    (value.examples === undefined ||
      (Array.isArray(value.examples) &&
        value.examples.every(
          (example) =>
            isRecord(example) &&
            typeof example.en === "string" &&
            typeof example.pt === "string",
        )))
  );
}

function createDailyWord(entry: ApiWord): DailyWord {
  const examples: WordExample[] = (entry.examples ?? []).map((example) => ({
    text: example.en,
    translation: example.pt,
    attribution: null,
  }));

  return {
    word: entry.word,
    phonetic: entry.phonetic ?? "",
    audioUrl: null,
    sourceUrl: null,
    partOfSpeech: entry.type,
    definition: entry.definition.en,
    definitionTranslation: entry.definition.pt,
    definitionAttribution: null,
    example: examples[0]?.text ?? null,
    exampleAttribution: null,
    examples,
  };
}

function getWordsApiUrl(): string {
  const apiUrl = import.meta.env.VITE_WORDS_API_URL;
  if (!apiUrl) {
    throw new Error("A variável VITE_WORDS_API_URL não foi configurada.");
  }

  const parsedApiUrl = new URL(apiUrl);
  if (import.meta.env.DEV) {
    return `${parsedApiUrl.pathname.replace(/\/+$/, "")}/`;
  }

  return `${apiUrl.replace(/\/+$/, "")}/`;
}

async function fetchWord(
  path: string,
  signal?: AbortSignal,
): Promise<DailyWord> {
  const response = await fetch(`${getWordsApiUrl()}words/${path}`, { signal });
  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "Palavra não encontrada."
        : `Não foi possível carregar a palavra (HTTP ${response.status}).`,
    );
  }

  const result: unknown = await response.json();
  if (!isApiWord(result)) {
    throw new Error("A API retornou uma palavra em formato inválido.");
  }

  return createDailyWord(result);
}

export function getTodaysWord(signal?: AbortSignal): Promise<DailyWord> {
  return fetchWord("", signal);
}

export function getWordByName(
  word: string,
  signal?: AbortSignal,
): Promise<DailyWord> {
  return fetchWord(encodeURIComponent(word), signal);
}
