import { mockWords } from '../data/mockWords';
import type {
  DailyWord,
  FreeDictionaryEntry,
  FreeDictionaryResponse,
  WordExample,
} from '../types/word';

const storageKey = 'a-whole-new-word:vocabulary:v1';
const randomWordsUrl = '/api/random-words';
const dictionaryUrl = '/api/dictionary';
const randomBatchSize = 10;

interface StoredDailyWord {
  date: string;
  word: DailyWord;
}

export interface WordHistoryEntry {
  date: string;
  word: DailyWord;
}

interface StoredVocabulary {
  seenWords: string[];
  dailyWord: StoredDailyWord | null;
  learnedWords: string[];
  knownWords: string[];
  history: WordHistoryEntry[];
}

export interface VocabularyStats {
  newWords: number;
  learnedWords: number;
  learnedWordKeys: string[];
  hasMarkedKnown: boolean;
  history: WordHistoryEntry[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === 'string')
  );
}

function isFreeDictionaryEntry(value: unknown): value is FreeDictionaryEntry {
  if (!isRecord(value) || typeof value.word !== 'string') {
    return false;
  }

  const validPhonetics =
    value.phonetics === undefined ||
    (Array.isArray(value.phonetics) &&
      value.phonetics.every(
        (phonetic) =>
          isRecord(phonetic) &&
          (phonetic.text === undefined ||
            typeof phonetic.text === 'string') &&
          (phonetic.audio === undefined ||
            typeof phonetic.audio === 'string'),
      ));

  const validMeanings =
    Array.isArray(value.meanings) &&
    value.meanings.every(
      (meaning) =>
        isRecord(meaning) &&
        typeof meaning.partOfSpeech === 'string' &&
        Array.isArray(meaning.definitions) &&
        meaning.definitions.every(
          (definition) =>
            isRecord(definition) &&
            typeof definition.definition === 'string' &&
            (definition.example === undefined ||
              typeof definition.example === 'string') &&
            (definition.synonyms === undefined ||
              isStringArray(definition.synonyms)) &&
            (definition.antonyms === undefined ||
              isStringArray(definition.antonyms)),
        ) &&
        (meaning.synonyms === undefined ||
          isStringArray(meaning.synonyms)) &&
        (meaning.antonyms === undefined ||
          isStringArray(meaning.antonyms)),
    );

  return (
    (value.phonetic === undefined ||
      typeof value.phonetic === 'string') &&
    (value.origin === undefined || typeof value.origin === 'string') &&
    (value.sourceUrls === undefined || isStringArray(value.sourceUrls)) &&
    validPhonetics &&
    validMeanings
  );
}

function isFreeDictionaryResponse(
  value: unknown,
): value is FreeDictionaryResponse {
  return Array.isArray(value) && value.every(isFreeDictionaryEntry);
}

function shuffleWords(words: string[]): string[] {
  const shuffled = [...words];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function isDailyWord(value: unknown): value is DailyWord {
  return (
    isRecord(value) &&
    typeof value.word === 'string' &&
    typeof value.phonetic === 'string' &&
    (typeof value.audioUrl === 'string' || value.audioUrl === null ||
      value.audioUrl === undefined) &&
    (typeof value.sourceUrl === 'string' || value.sourceUrl === null ||
      value.sourceUrl === undefined) &&
    typeof value.partOfSpeech === 'string' &&
    typeof value.definition === 'string' &&
    (typeof value.definitionAttribution === 'string' ||
      value.definitionAttribution === null) &&
    (typeof value.example === 'string' || value.example === null) &&
    (typeof value.exampleAttribution === 'string' ||
      value.exampleAttribution === null) &&
    (value.source === 'dictionaryapi' || value.source === 'mock') &&
    (typeof value.fallbackReason === 'string' ||
      value.fallbackReason === null)
  );
}

function isWordHistoryEntry(value: unknown): value is WordHistoryEntry {
  return (
    isRecord(value) &&
    typeof value.date === 'string' &&
    isDailyWord(value.word)
  );
}

function getLocalDateKey(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readVocabulary(): StoredVocabulary {
  const rawValue = localStorage.getItem(storageKey);

  if (!rawValue) {
    return {
      seenWords: [],
      dailyWord: null,
      learnedWords: [],
      knownWords: [],
      history: [],
    };
  }

  let value: unknown;
  try {
    value = JSON.parse(rawValue);
  } catch {
    throw new Error(
      'O histórico de palavras está corrompido. Limpe os dados do app no navegador para continuar.',
    );
  }

  if (
    !isRecord(value) ||
    !Array.isArray(value.seenWords) ||
    !value.seenWords.every((word) => typeof word === 'string') ||
    (value.learnedWords !== undefined &&
      !isStringArray(value.learnedWords)) ||
    (value.knownWords !== undefined && !isStringArray(value.knownWords)) ||
    (value.history !== undefined &&
      (!Array.isArray(value.history) ||
        !value.history.every(isWordHistoryEntry)))
  ) {
    throw new Error(
      'O histórico de palavras tem um formato inválido. Limpe os dados do app no navegador para continuar.',
    );
  }

  let dailyWord: StoredDailyWord | null = null;
  if (value.dailyWord !== null) {
    if (
      !isRecord(value.dailyWord) ||
      typeof value.dailyWord.date !== 'string' ||
      !isDailyWord(value.dailyWord.word)
    ) {
      throw new Error(
        'A palavra salva para hoje tem um formato inválido. Limpe os dados do app no navegador para continuar.',
      );
    }

    dailyWord = {
      date: value.dailyWord.date,
      word: value.dailyWord.word,
    };
  }

  const history: WordHistoryEntry[] = Array.isArray(value.history)
    ? value.history.filter(isWordHistoryEntry)
    : [];
  if (
    dailyWord &&
    !history.some(
      (entry) =>
        entry.word.word.toLowerCase() === dailyWord?.word.word.toLowerCase(),
    )
  ) {
    history.push(dailyWord);
  }

  return {
    seenWords: value.seenWords,
    dailyWord,
    learnedWords: isStringArray(value.learnedWords) ? value.learnedWords : [],
    knownWords: isStringArray(value.knownWords) ? value.knownWords : [],
    history,
  };
}

function writeVocabulary(value: StoredVocabulary): void {
  localStorage.setItem(storageKey, JSON.stringify(value));
}

function createDictionaryWord(entry: FreeDictionaryEntry): DailyWord | null {
  const definitionMeaning = entry.meanings.find(
    (meaning) => meaning.definitions.length > 0,
  );
  const definitionItem = definitionMeaning?.definitions.find(
    (item) => getString(item.definition) !== null,
  );
  const definition = definitionItem
    ? getString(definitionItem.definition)
    : null;

  if (!definition) {
    return null;
  }

  const phonetics = entry.phonetics ?? [];
  const phonetic =
    getString(entry.phonetic) ??
    phonetics.map((item) => getString(item.text)).find(
      (text): text is string => text !== null,
    ) ??
    '';
  const audioUrl =
    phonetics.map((item) => getString(item.audio)).find(
      (audio): audio is string => audio !== null,
    ) ?? null;
  const examples: WordExample[] = [];

  for (const meaning of entry.meanings) {
    for (const item of meaning.definitions) {
      const text = getString(item.example);
      if (text && !examples.some((example) => example.text === text)) {
        examples.push({ text, translation: null, attribution: null });
      }
      if (examples.length === 2) {
        break;
      }
    }
    if (examples.length === 2) {
      break;
    }
  }

  return {
    word: entry.word,
    phonetic,
    audioUrl:
      audioUrl?.startsWith('//') ? `https:${audioUrl}` : audioUrl,
    sourceUrl: entry.sourceUrls?.[0] ?? null,
    partOfSpeech: definitionMeaning?.partOfSpeech ?? 'word',
    definition,
    definitionAttribution: 'Free Dictionary API',
    example: examples[0]?.text ?? null,
    exampleAttribution: null,
    examples,
    source: 'dictionaryapi',
    fallbackReason: null,
  };
}

async function getRandomCandidates(signal?: AbortSignal): Promise<string[]> {
  const response = await fetch(
    `${randomWordsUrl}?number=${randomBatchSize}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`A API de palavras aleatórias respondeu com status ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (
    !Array.isArray(payload) ||
    !payload.every((word) => typeof word === 'string')
  ) {
    throw new Error('A API de palavras aleatórias retornou dados inválidos.');
  }

  return [...new Set(payload.map((word) => word.trim()).filter(Boolean))];
}

async function getDictionaryWord(
  word: string,
  signal?: AbortSignal,
): Promise<DailyWord | null> {
  const response = await fetch(
    `${dictionaryUrl}/${encodeURIComponent(word)}`,
    { signal },
  );

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(
      `A Free Dictionary API respondeu com status ${response.status}.`,
    );
  }

  const payload: unknown = await response.json();
  if (!isFreeDictionaryResponse(payload)) {
    throw new Error('A resposta da Free Dictionary API tem formato inválido.');
  }

  return payload
    .map(createDictionaryWord)
    .find((entry): entry is DailyWord => entry !== null) ?? null;
}

function saveDailyWord(
  vocabulary: StoredVocabulary,
  word: DailyWord,
): DailyWord {
  const updatedVocabulary: StoredVocabulary = {
    seenWords: [
      ...new Set([
        ...vocabulary.seenWords.map((item) => item.toLowerCase()),
        word.word.toLowerCase(),
      ]),
    ],
    dailyWord: {
      date: getLocalDateKey(),
      word,
    },
    learnedWords: vocabulary.learnedWords,
    knownWords: vocabulary.knownWords,
    history: [
      ...vocabulary.history.filter(
        (entry) => entry.word.word.toLowerCase() !== word.word.toLowerCase(),
      ),
      { date: getLocalDateKey(), word },
    ],
  };

  writeVocabulary(updatedVocabulary);
  return word;
}

function getMockWord(
  vocabulary: StoredVocabulary,
  excludedWord: string | undefined,
  fallbackReason: string,
): DailyWord | null {
  const seenWords = new Set(
    vocabulary.seenWords.map((word) => word.toLowerCase()),
  );
  const availableWords = mockWords.filter(
    ({ word }) =>
      !seenWords.has(word.toLowerCase()) &&
      word.toLowerCase() !== excludedWord?.toLowerCase(),
  );
  const candidate =
    availableWords[Math.floor(Math.random() * availableWords.length)];

  if (!candidate) {
    return null;
  }

  return {
    ...candidate,
    source: 'mock',
    fallbackReason,
  };
}

async function getUnseenWord(
  vocabulary: StoredVocabulary,
  signal?: AbortSignal,
  excludedWord?: string,
): Promise<DailyWord> {
  const seenWords = new Set(
    vocabulary.seenWords.map((word) => word.toLowerCase()),
  );
  let fallbackReason = 'Não foi possível encontrar uma nova palavra.';

  try {
    const candidates = await getRandomCandidates(signal);
    const unseenCandidates = candidates.filter(
        (word) =>
          /^[a-z][a-z'-]{1,39}$/i.test(word) &&
          !seenWords.has(word.toLowerCase()) &&
          word.toLowerCase() !== excludedWord?.toLowerCase(),
      );
    const shuffledCandidates = shuffleWords(unseenCandidates);

    for (const candidate of shuffledCandidates) {
      if (signal?.aborted) {
        throw new DOMException('Request was aborted.', 'AbortError');
      }

      try {
        const dictionaryWord = await getDictionaryWord(candidate, signal);
        if (dictionaryWord) {
          return dictionaryWord;
        }
      } catch (error) {
        if (signal?.aborted) {
          throw error;
        }
        fallbackReason =
          error instanceof Error
            ? error.message
            : 'A Free Dictionary API está indisponível.';
      }
    }
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    fallbackReason =
      error instanceof Error
        ? error.message
        : 'As APIs de palavras estão indisponíveis.';
  }

  const mockWord = getMockWord(vocabulary, excludedWord, fallbackReason);
  if (mockWord) {
    return mockWord;
  }

  throw new Error(
    `${fallbackReason} Todas as palavras mock também já foram vistas.`,
  );
}

export async function getDailyWord(signal?: AbortSignal): Promise<DailyWord> {
  const vocabulary = readVocabulary();
  const today = getLocalDateKey();

  if (vocabulary.dailyWord?.date === today) {
    return vocabulary.dailyWord.word;
  }

  const dailyWord = await getUnseenWord(vocabulary, signal);
  return saveDailyWord(vocabulary, dailyWord);
}

export async function getNextDailyWord(
  signal?: AbortSignal,
): Promise<DailyWord> {
  const vocabulary = readVocabulary();
  const currentWord = vocabulary.dailyWord?.word.word;
  const nextWord = await getUnseenWord(vocabulary, signal, currentWord);
  return saveDailyWord(vocabulary, nextWord);
}

function recordWordResponse(word: DailyWord, response: 'known' | 'learned'): void {
  const vocabulary = readVocabulary();
  const normalizedWord = word.word.toLowerCase();
  const learnedWords =
    response === 'learned'
      ? [
          ...new Set([
            ...vocabulary.learnedWords.map((item) => item.toLowerCase()),
            normalizedWord,
          ]),
        ]
      : vocabulary.learnedWords;
  const knownWords =
    response === 'known'
      ? [
          ...new Set([
            ...vocabulary.knownWords.map((item) => item.toLowerCase()),
            normalizedWord,
          ]),
        ]
      : vocabulary.knownWords;
  const seenWords = [
    ...new Set([
      ...vocabulary.seenWords.map((item) => item.toLowerCase()),
      normalizedWord,
    ]),
  ];
  const previousEntry = vocabulary.history.find(
    (entry) => entry.word.word.toLowerCase() === normalizedWord,
  );
  const history = vocabulary.history.filter(
    (entry) => entry.word.word.toLowerCase() !== normalizedWord,
  );
  history.push({
    date: previousEntry?.date ?? getLocalDateKey(),
    word,
  });

  writeVocabulary({
    ...vocabulary,
    seenWords,
    learnedWords,
    knownWords,
    history,
  });
}

export function markWordKnown(word: DailyWord): void {
  recordWordResponse(word, 'known');
}

export function markWordLearned(word: DailyWord): void {
  recordWordResponse(word, 'learned');
}

export function getVocabularyStats(): VocabularyStats {
  const vocabulary = readVocabulary();
  const seenWords = new Set(
    vocabulary.seenWords.map((word) => word.toLowerCase()),
  );
  const learnedWords = new Set(
    vocabulary.learnedWords.map((word) => word.toLowerCase()),
  );

  return {
    newWords: seenWords.size,
    learnedWords: [...learnedWords].filter((word) => seenWords.has(word)).length,
    learnedWordKeys: [...learnedWords].filter((word) => seenWords.has(word)),
    hasMarkedKnown: vocabulary.knownWords.length > 0,
    history: [...vocabulary.history].sort((first, second) =>
      second.date.localeCompare(first.date),
    ),
  };
}
