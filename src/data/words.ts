export interface Word {
  id: number;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
}

export const words: Word[] = [
  {
    id: 1,
    word: 'serene',
    phonetic: '/səˈriːn/',
    partOfSpeech: 'adjetivo',
    definition: 'Calmo, tranquilo, sem agitação.',
  },
  {
    id: 2,
    word: 'luminous',
    phonetic: '/ˈluːmɪnəs/',
    partOfSpeech: 'adjetivo',
    definition: 'Que emite ou reflete luz; brilhante.',
  },
  {
    id: 3,
    word: 'wander',
    phonetic: '/ˈwɑːndər/',
    partOfSpeech: 'verbo',
    definition: 'Caminhar sem destino ou direção definida.',
  },
];
