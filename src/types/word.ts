export interface WordExample {
  text: string;
  translation: string | null;
  attribution: string | null;
}

export interface FreeDictionaryPhonetic {
  text?: string;
  audio?: string;
}

export interface FreeDictionaryDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface FreeDictionaryMeaning {
  partOfSpeech: string;
  definitions: FreeDictionaryDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface FreeDictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: FreeDictionaryPhonetic[];
  origin?: string;
  meanings: FreeDictionaryMeaning[];
  sourceUrls?: string[];
}

export type FreeDictionaryResponse = FreeDictionaryEntry[];

export interface WordDetails {
  word: string;
  phonetic: string;
  audioUrl?: string | null;
  sourceUrl?: string | null;
  partOfSpeech: string;
  definition: string;
  definitionAttribution: string | null;
  example: string | null;
  exampleAttribution: string | null;
  examples?: WordExample[];
}

export interface DailyWord extends WordDetails {
  source: 'dictionaryapi' | 'mock';
  fallbackReason: string | null;
}
