import {
  ArrowLeft,
  BookOpen,
  Check,
  MessageSquareText,
  Play,
  Volume2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import LoadingScreen from "../../components/common/LoadingScreen";
import PronunciationButton from "../../components/common/PronunciationButton";
import useWordDetails from "../../hooks/useWordDetails";
import { markWordLearned } from "../../services/wordService";
import type { DailyWord, WordExample } from "../../types/word";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDailyWord(value: unknown): value is DailyWord {
  return (
    isRecord(value) &&
    typeof value.word === "string" &&
    typeof value.phonetic === "string" &&
    (typeof value.audioUrl === "string" ||
      value.audioUrl === null ||
      value.audioUrl === undefined) &&
    (typeof value.sourceUrl === "string" ||
      value.sourceUrl === null ||
      value.sourceUrl === undefined) &&
    typeof value.partOfSpeech === "string" &&
    typeof value.definition === "string" &&
    (typeof value.definitionTranslation === "string" ||
      value.definitionTranslation === null ||
      value.definitionTranslation === undefined) &&
    (typeof value.definitionAttribution === "string" ||
      value.definitionAttribution === null) &&
    (typeof value.example === "string" || value.example === null) &&
    (typeof value.exampleAttribution === "string" ||
      value.exampleAttribution === null) &&
    (value.examples === undefined ||
      (Array.isArray(value.examples) &&
        value.examples.every(
          (example) =>
            isRecord(example) &&
            typeof example.text === "string" &&
            (typeof example.translation === "string" ||
              example.translation === null) &&
            (typeof example.attribution === "string" ||
              example.attribution === null),
        )))
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
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const navigationState = location.state;
  const navigationWord =
    isRecord(navigationState) &&
    isDailyWord(navigationState.dailyWord) &&
    navigationState.dailyWord.word.toLocaleLowerCase() ===
      id?.toLocaleLowerCase()
      ? navigationState.dailyWord
      : null;
  const wordQuery = useWordDetails(id, !navigationWord);
  const word = navigationWord ?? wordQuery.data ?? null;
  const examples = word ? getExamples(word) : [];
  const [learningError, setLearningError] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const confirmationDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = confirmationDialogRef.current;
    if (!dialog) {
      return;
    }

    if (isConfirmationOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isConfirmationOpen && dialog.open) {
      dialog.close();
    }
  }, [isConfirmationOpen]);

  if (!navigationWord && wordQuery.isPending) {
    return <LoadingScreen />;
  }

  if (!word) {
    return (
      <main className="app-glass-shell relative isolate mx-auto flex min-h-dvh w-full max-w-[36rem] flex-col overflow-hidden border border-[#d6e3ff] px-6 py-8 text-navy shadow-[0_12px_40px_rgba(27,65,123,0.08)] sm:my-3 sm:min-h-[calc(100dvh-1.5rem)] sm:rounded-[2.25rem]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-16 z-0 h-64 w-64 rounded-full bg-[#dce9ff]/70"
        />
        <Button
          variant="icon"
          className="relative z-10 h-12 w-12 rounded-full bg-white/70 shadow-sm"
          aria-label="Voltar"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </Button>
        <h1 className="relative z-10 mt-8 text-xl font-bold">
          {wordQuery.error
            ? "Não foi possível carregar a palavra"
            : "Palavra não encontrada"}
        </h1>
        {wordQuery.error && (
          <>
            <p className="relative z-10 mt-3 text-sm text-muted" role="alert">
              {wordQuery.error instanceof Error
                ? wordQuery.error.message
                : "Não foi possível carregar esta palavra."}
            </p>
            <Button
              variant="outline"
              className="relative z-10 mt-5 min-h-11 px-5 text-sm"
              onClick={() => void wordQuery.refetch()}
            >
              Tentar novamente
            </Button>
          </>
        )}
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
    <main className="app-glass-shell relative isolate mx-auto flex min-h-dvh w-full max-w-[36rem] flex-col overflow-hidden border border-[#d6e3ff] text-navy shadow-[0_12px_40px_rgba(27,65,123,0.08)] sm:my-3 sm:min-h-[calc(100dvh-1.5rem)] sm:rounded-[2.25rem]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-52 z-0 h-64 w-64 rounded-full bg-[#dce9ff]/70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-14 z-0 h-40 w-40 rounded-full bg-[#dce9ff]/70"
      />

      <header className="relative z-10 px-6 pb-5 pt-10 sm:px-8 sm:pt-8">
        <div className="flex items-center justify-between">
          <Button
            variant="icon"
            className="glass-control h-12 w-12 rounded-full shadow-sm"
            aria-label="Voltar para a palavra do dia"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={23} aria-hidden="true" />
          </Button>
          <Button
            className="min-h-11 rounded-full px-4 py-3 text-sm"
            onClick={() => {
              setLearningError(null);
              setIsConfirmationOpen(true);
            }}
          >
            <Check size={18} className="mr-2" aria-hidden="true" />
            Aprendi
          </Button>
        </div>

        <h1 className="mt-8 break-words text-[clamp(2.8rem,11vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.05em] text-blue-950">
          {word.word}
        </h1>
        <div className="mt-3 flex items-center gap-1 text-blue-950">
          <span className="text-xl font-medium">
            {word.phonetic || word.word}
          </span>
          <PronunciationButton
            variant="icon"
            audioUrl={word.audioUrl}
            word={word.word}
            className="h-10 w-10 rounded-full"
            iconSize={23}
          />
        </div>
        <span className="mt-3 inline-flex rounded-full bg-[#dce9ff] px-4 py-1.5 text-sm font-bold leading-tight text-accent">
          {word.partOfSpeech}
        </span>
      </header>

      <article className="glass-panel relative z-10 mx-5 mb-5 rounded-[2rem] px-6 py-6 sm:mx-7 sm:px-8">
        <section
          aria-labelledby="definition-heading"
          className="border-b border-[#dce6f7] pb-5"
        >
          <h2
            id="definition-heading"
            className="flex items-center gap-3 text-xl font-bold text-blue-950"
          >
            <BookOpen size={27} aria-hidden="true" />
            Definição
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-blue-950">
            {word.definitionTranslation}
          </p>
        </section>

        <section
          aria-labelledby="examples-heading"
          className="border-b border-[#dce6f7] py-5"
        >
          <h2
            id="examples-heading"
            className="flex items-center gap-3 text-xl font-bold text-blue-950"
          >
            <MessageSquareText size={27} aria-hidden="true" />
            Exemplos
          </h2>
          {examples.length ? (
            <ul className="mt-3 space-y-3">
              {examples.map((example, index) => (
                <li
                  key={`${example.text}-${index}`}
                  className="glass-surface rounded-[1.35rem] px-5 py-4"
                >
                  <p className="text-base leading-relaxed text-blue-950">
                    “{highlightMainWord(example.text, word.word)}”
                  </p>
                  {example.translation && (
                    <p className="mt-1 text-base leading-relaxed text-blue-900/75">
                      “{example.translation}”
                    </p>
                  )}
                  {example.attribution && (
                    <p className="mt-2 text-xs font-semibold text-blue-900">
                      {example.attribution}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="ml-10 mt-3 text-sm text-muted">
              Nenhum exemplo disponível para esta palavra.
            </p>
          )}
        </section>

        <section aria-labelledby="pronunciation-heading" className="pt-5">
          <h2
            id="pronunciation-heading"
            className="flex items-center gap-3 text-xl font-bold text-blue-950"
          >
            <Volume2 size={27} aria-hidden="true" />
            Pronúncia
          </h2>
          <div className="glass-surface mt-3 flex min-h-[4.5rem] items-center gap-4 rounded-full px-4">
            <PronunciationButton
              variant="primary"
              audioUrl={word.audioUrl}
              word={word.word}
              className="h-12 w-12 shrink-0 rounded-full"
              iconSize={20}
              icon={<Play size={20} aria-hidden="true" />}
            />
            <span className="text-base font-medium text-blue-800">
              Ouvir pronúncia
            </span>
          </div>
        </section>
      </article>

      <dialog
        ref={confirmationDialogRef}
        aria-labelledby="learned-confirmation-title"
        aria-describedby="learned-confirmation-description"
        className="fixed inset-0 m-0 h-full w-full max-h-none max-w-none bg-transparent p-0 backdrop:bg-blue-950/35"
        onClose={() => setIsConfirmationOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            confirmationDialogRef.current?.close();
          }
        }}
      >
        <div className="flex min-h-full items-center justify-center px-5 py-8">
          <div className="glass-panel w-full max-w-sm rounded-[2rem] p-6 text-center text-navy shadow-[0_20px_60px_rgba(16,36,72,0.2)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf1fd] text-blue-900">
              <Check size={28} aria-hidden="true" />
            </div>
            <h2
              id="learned-confirmation-title"
              className="mt-4 text-xl font-bold text-blue-950"
            >
              Palavra aprendida?
            </h2>
            <p
              id="learned-confirmation-description"
              className="mt-2 text-sm leading-relaxed text-blue-900/70"
            >
              Confirme que você aprendeu “{word.word}” para salvar seu progresso.
            </p>
            {learningError && (
              <p className="mt-3 text-sm text-red-700" role="alert">
                {learningError}
              </p>
            )}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="min-h-11 rounded-xl px-3 py-3 text-sm"
                onClick={() => confirmationDialogRef.current?.close()}
              >
                Ainda não
              </Button>
              <Button
                className="min-h-11 rounded-xl px-3 py-3 text-sm"
                onClick={handleLearnedWord}
              >
                Sim, aprendi
              </Button>
            </div>
          </div>
        </div>
      </dialog>
    </main>
  );
}
