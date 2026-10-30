import {
  ArrowLeft,
  BookOpen,
  Check,
  MessageSquareText,
  Play,
  Volume2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import PronunciationButton from "../../components/common/PronunciationButton";
import { findCatalogWord, markWordLearned } from "../../services/wordService";
import type { DailyWord, WordExample } from "../../types/word";

function getExamples(word: DailyWord): WordExample[] {
  if (word.examples?.length) {
    return word.examples;
  }

  if (word.example) {
    return [
      {
        text: word.example,
        translation: null,
        attribution: word.exampleAttribution,
      },
    ];
  }

  return [];
}

function highlightMainWord(text: string, mainWord: string): ReactNode[] {
  const wordPattern = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match = wordPattern.exec(text);

  while (match) {
    const [matchedWord] = match;
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    if (matchedWord.toLocaleLowerCase() === mainWord.toLocaleLowerCase()) {
      parts.push(
        <strong key={`${matchIndex}-${matchedWord}`} className="font-black">
          {matchedWord}
        </strong>,
      );
    } else {
      parts.push(matchedWord);
    }

    lastIndex = matchIndex + matchedWord.length;
    match = wordPattern.exec(text);
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function WordDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const word: DailyWord | null = findCatalogWord(id ?? "");
  const examples = word ? getExamples(word) : [];
  const [learningError, setLearningError] = useState<string | null>(null);

  if (!word) {
    return (
      <main className="mx-auto flex min-h-dvh w-full flex-col bg-white px-6 py-8 text-navy sm:my-6 sm:min-h-[min(52rem,calc(100dvh-3rem))] sm:rounded-[1.75rem] sm:border sm:border-border">
        <Button
          variant="icon"
          className="h-10 w-10 rounded-full"
          aria-label="Voltar"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </Button>
        <h1 className="mt-8 text-xl font-bold">Palavra não encontrada</h1>
      </main>
    );
  }

  function handleLearnedWord() {
    if (!word) {
      return;
    }

    try {
      markWordLearned(word);
      navigate("/", { state: { loadNextWord: true } });
    } catch (error) {
      setLearningError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar seu progresso.",
      );
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh flex-col overflow-hidden bg-white text-navy">
      <header className="rounded-b-2xl w-full bg-blue-950 px-7 pb-9 pt-5 text-white">
        <Button
          variant="icon"
          className="h-10 w-5 rounded-full text-white hover:bg-white/10"
          aria-label="Voltar para a palavra do dia"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={23} aria-hidden="true" />
        </Button>

        <h1 className="mt-8 break-words text-5xl font-extrabold tracking-[-0.05em] sm:text-[3.5rem]">
          {word.word}
        </h1>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xl">{word.phonetic || word.word}</span>
          <PronunciationButton
            variant="icon"
            audioUrl={word.audioUrl}
            word={word.word}
            className="h-10 w-10 rounded-full text-white hover:bg-white/10"
            iconSize={23}
          />
        </div>
        <span className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium">
          {word.partOfSpeech}
        </span>
      </header>

      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-7 py-7">
        <section aria-labelledby="definition-heading">
          <h2
            id="definition-heading"
            className="flex items-center gap-3 text-xl font-bold text-blue-900"
          >
            <BookOpen size={25} aria-hidden="true" />
            Definição
          </h2>
          <p className="mt-3 text-base leading-relaxed text-blue-900 font-bold">
            {word.definitionTranslation}
          </p>
        </section>

        <section aria-labelledby="examples-heading">
          <h2
            id="examples-heading"
            className="flex items-center gap-3 text-xl font-bold text-blue-900"
          >
            <MessageSquareText size={25} aria-hidden="true" />
            Exemplos
          </h2>
          {examples.length ? (
            <ul className="mt-4 space-y-4">
              {examples.map((example, index) => (
                <li
                  key={`${example.text}-${index}`}
                  className="rounded-2xl bg-gradient-to-br from-surface to-[#edf3fc] px-5 py-4"
                >
                  <p className="leading-relaxed text-blue-900 font-medium">
                    “{highlightMainWord(example.text, word.word)}”
                  </p>
                  {example.translation && (
                    <p className="mt-1 leading-relaxed text-blue-800/60 text-sm">
                      “{example.translation}”
                    </p>
                  )}
                  {example.attribution && (
                    <p className="mt-2 text-xs text-blue-900 font-semibold">
                      {example.attribution}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="ml-12 mt-3 text-sm text-muted">
              Nenhum exemplo disponível para esta palavra.
            </p>
          )}
        </section>

        <section aria-labelledby="pronunciation-heading">
          <h2
            id="pronunciation-heading"
            className="flex items-center gap-3 text-xl font-bold text-blue-900"
          >
            <Volume2 size={25} aria-hidden="true" />
            Pronúncia
          </h2>
          <div className="mt-4 flex py-2 items-center gap-4 rounded-full bg-[#eaf2ff] px-4">
            <PronunciationButton
              variant="primary"
              audioUrl={word.audioUrl}
              word={word.word}
              className="h-11 w-11 rounded-full"
              iconSize={20}
              icon={<Play size={20} aria-hidden="true" />}
            />
            <span className="text-blue-700 font-semibold">Ouvir pronúncia</span>
          </div>
        </section>
      </div>
      <footer className="shrink-0 border-t border-border bg-white px-7 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <Button
          className="min-h-12 w-full rounded-2xl"
          onClick={handleLearnedWord}
        >
          <Check size={19} className="mr-2" aria-hidden="true" />
          Agora eu sei
        </Button>
        {learningError && (
          <p className="mt-2 text-center text-sm text-red-700" role="alert">
            {learningError}
          </p>
        )}
      </footer>
    </main>
  );
}
