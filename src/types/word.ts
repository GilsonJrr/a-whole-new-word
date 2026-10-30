export interface WordExample {
  text: string;
  translation: string | null;
  attribution: string | null;
}

export interface WordDetails {
  word: string;
  phonetic: string;
  audioUrl?: string | null;
  sourceUrl?: string | null;
  partOfSpeech: string;
  definition: string;
  definitionTranslation?: string | null;
  definitionAttribution: string | null;
  example: string | null;
  exampleAttribution: string | null;
  examples?: WordExample[];
}

export interface DailyWord extends WordDetails {
  source: 'local' | 'dictionaryapi' | 'mock';
  fallbackReason: string | null;
}
