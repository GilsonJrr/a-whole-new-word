import {
  ArrowLeft,
  BookOpen,
  Check,
  MessageSquareText,
  Play,
  Volume2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import LoadingScreen from "../../components/common/LoadingScreen";
import PronunciationButton from "../../components/common/PronunciationButton";
import { mockWords } from "../../data/mockWords";
import { translateText } from "../../functions/translateText";
import { markWordLearned } from "../../services/wordService";
import type { DailyWord, WordExample } from "../../types/word";

interface WordDetailsLocationState {
  word?: DailyWord;
}

function isWordDetailsLocationState(
  value: unknown,
): value is WordDetailsLocationState {
  return (
    typeof value === "object" &&
    value !== null &&
    "word" in value &&
    typeof value.word === "object" &&
    value.word !== null &&
    "word" in value.word &&
    typeof value.word.word === "string"
  );
}

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
        <strong
          key={`${matchIndex}-${matchedWord}`}
          className="font-black underline"
        >
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
  const location = useLocation();
  const { id } = useParams();
  const locationState = isWordDetailsLocationState(location.state)
    ? location.state
    : null;
  const mockWord = mockWords.find(
    (item) => item.word.toLowerCase() === (id ?? "").toLowerCase(),
  );
  const word: DailyWord | null =
    locationState?.word ??
    (mockWord
      ? {
          ...mockWord,
          source: "mock",
          fallbackReason: null,
        }
      : null);
  const examples = word ? getExamples(word) : [];
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translationErrors, setTranslationErrors] = useState<
    Record<string, boolean>
  >({});
  const [definitionTranslations, setDefinitionTranslations] = useState<
    Record<string, string>
  >({});
  const [definitionTranslationErrors, setDefinitionTranslationErrors] =
    useState<Record<string, boolean>>({});
  const [learningError, setLearningError] = useState<string | null>(null);

  useEffect(() => {
    if (!word) {
      return;
    }

    let isCurrentWord = true;
    void translateText(word.definition)
      .then((translation) => {
        if (isCurrentWord) {
          setDefinitionTranslations((current) => ({
            ...current,
            [word.definition]: translation,
          }));
        }
      })
      .catch(() => {
        if (isCurrentWord) {
          setDefinitionTranslationErrors((current) => ({
            ...current,
            [word.definition]: true,
          }));
        }
      });

    const examplesToTranslate = examples.filter(
      (example) => !example.translation && !translations[example.text],
    );

    for (const example of examplesToTranslate) {
      void translateText(example.text)
        .then((translation) => {
          if (isCurrentWord) {
            setTranslations((current) => ({
              ...current,
              [example.text]: translation,
            }));
          }
        })
        .catch(() => {
          if (isCurrentWord) {
            setTranslationErrors((current) => ({
              ...current,
              [example.text]: true,
            }));
          }
        });
    }

    return () => {
      isCurrentWord = false;
    };
  }, [word?.word]);

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

  const definitionTranslation = definitionTranslations[word.definition];
  const definitionTranslationError =
    definitionTranslationErrors[word.definition] ?? false;
  const isTranslationPending =
    (!definitionTranslation && !definitionTranslationError) ||
    examples.some(
      (example) =>
        !example.translation &&
        !translations[example.text] &&
        !translationErrors[example.text],
    );

  if (isTranslationPending) {
    return <LoadingScreen />;
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
    <main className="mx-auto flex min-h-dvh w-full flex-col overflow-hidden bg-white text-navy sm:my-6 sm:min-h-[min(52rem,calc(100dvh-3rem))] sm:rounded-[1.75rem] sm:border sm:border-border sm:shadow-xl">
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
          {/* <p className="mt-3 text-base leading-relaxed text-blue-900 font-bold">
            {word.definition}
          </p> */}
          {definitionTranslation ? (
            <p className="mt-3 text-base leading-relaxed text-blue-900 font-bold">
              {definitionTranslation}
            </p>
          ) : definitionTranslationError ? (
            <p className="mt-2 text-sm text-muted" role="status">
              Não foi possível traduzir a definição.
            </p>
          ) : (
            <p
              className="mt-2 text-sm text-muted"
              role="status"
              aria-live="polite"
            >
              Traduzindo definição...
            </p>
          )}
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
                  <p className="leading-relaxed text-blue-900 font-semibold">
                    “{highlightMainWord(example.text, word.word)}”
                  </p>
                  {(example.translation || translations[example.text]) && (
                    <p className="mt-1 leading-relaxed text-blue-800/60 text-sm">
                      “{example.translation || translations[example.text]}”
                    </p>
                  )}
                  {!example.translation &&
                    !translations[example.text] &&
                    (translationErrors[example.text] ? (
                      <p className="mt-2 text-sm text-muted" role="status">
                        Não foi possível traduzir este exemplo.
                      </p>
                    ) : (
                      <p
                        className="mt-2 text-sm text-muted"
                        role="status"
                        aria-live="polite"
                      >
                        Traduzindo exemplo...
                      </p>
                    ))}
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
