import type { DailyWord } from '../types/word';
import { getTodaysWord } from './api/wordsApi';

const storageKey = 'a-whole-new-word:vocabulary:v1';

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

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === 'string')
  );
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
    (typeof value.definitionTranslation === 'string' ||
      value.definitionTranslation === null ||
      value.definitionTranslation === undefined) &&
    (value.examples === undefined ||
      (Array.isArray(value.examples) &&
        value.examples.every(
          (example) =>
            isRecord(example) &&
            typeof example.text === 'string' &&
            (typeof example.translation === 'string' ||
              example.translation === null) &&
            (typeof example.attribution === 'string' ||
              example.attribution === null),
        )))
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

export async function getDailyWord(signal?: AbortSignal): Promise<DailyWord> {
  const vocabulary = readVocabulary();
  const today = getLocalDateKey();

  if (
    vocabulary.dailyWord?.date === today &&
    isRecord(vocabulary.dailyWord.word) &&
    vocabulary.dailyWord.word.source === undefined
  ) {
    return vocabulary.dailyWord.word;
  }

  const dailyWord = await getTodaysWord(signal);
  return saveDailyWord(vocabulary, dailyWord);
}

export async function getNextDailyWord(
  signal?: AbortSignal,
): Promise<DailyWord> {
  const vocabulary = readVocabulary();
  const nextWord = await getTodaysWord(signal);
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
  const knownWords = new Set(
    vocabulary.knownWords.map((word) => word.toLowerCase()),
  );
  const history = vocabulary.history;

  return {
    newWords: seenWords.size,
    learnedWords: [...learnedWords].filter((word) => seenWords.has(word)).length,
    learnedWordKeys: [...learnedWords].filter((word) => seenWords.has(word)),
    hasMarkedKnown: knownWords.size > 0,
    history: history.sort((first, second) =>
      second.date.localeCompare(first.date),
    ),
  };
}
