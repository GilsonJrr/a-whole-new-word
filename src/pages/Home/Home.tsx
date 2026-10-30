import { CalendarDays } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppLogo from "../../components/common/AppLogo";
import Button from "../../components/common/Button";
import LoadingScreen from "../../components/common/LoadingScreen";
import BottomNavigation from "../../components/layout/BottomNavigation";
import WordCard from "../../components/word/WordCard";
import { translateText } from "../../functions/translateText";
import {
  getDailyWord,
  getNextDailyWord,
  markWordKnown,
} from "../../services/wordService";
import type { DailyWord } from "../../types/word";

function getLocalDateKey(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dailyWord, setDailyWord] = useState<DailyWord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [definitionTranslations, setDefinitionTranslations] = useState<
    Record<string, string>
  >({});
  const [definitionTranslationErrors, setDefinitionTranslationErrors] =
    useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const requestController = useRef<AbortController | null>(null);
  const loadedDate = useRef(getLocalDateKey());
  const loadWord = useCallback(async (loadNextWord = false) => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setIsLoading(true);
    setError(null);

    try {
      const nextWord = loadNextWord
        ? await getNextDailyWord(controller.signal)
        : await getDailyWord(controller.signal);
      setDailyWord(nextWord);
      setError(nextWord.source === "mock" ? nextWord.fallbackReason : null);
    } catch (loadError) {
      if (!controller.signal.aborted) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar uma palavra.",
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  function handleAlreadyKnown() {
    if (!dailyWord) {
      return;
    }

    try {
      markWordKnown(dailyWord);
      setActionError(null);
      void loadWord(true);
    } catch (learnError) {
      setActionError(
        learnError instanceof Error
          ? learnError.message
          : "Não foi possível salvar seu progresso.",
      );
    }
  }

  useEffect(() => {
    const shouldLoadNextWord =
      typeof location.state === "object" &&
      location.state !== null &&
      "loadNextWord" in location.state &&
      location.state.loadNextWord === true;
    if (shouldLoadNextWord) {
      navigate("/", { replace: true, state: null });
    }
    void loadWord(shouldLoadNextWord);

    function checkForNewDay() {
      if (document.visibilityState !== "visible") {
        return;
      }

      const currentDate = getLocalDateKey();
      if (currentDate !== loadedDate.current) {
        loadedDate.current = currentDate;
        void loadWord();
      }
    }

    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      100,
    );
    const midnightTimer = window.setTimeout(
      checkForNewDay,
      nextMidnight.getTime() - now.getTime(),
    );
    window.addEventListener("focus", checkForNewDay);
    document.addEventListener("visibilitychange", checkForNewDay);

    return () => {
      window.clearTimeout(midnightTimer);
      window.removeEventListener("focus", checkForNewDay);
      document.removeEventListener("visibilitychange", checkForNewDay);
      requestController.current?.abort();
    };
  }, [loadWord]);

  useEffect(() => {
    const definition = dailyWord?.definition;
    if (
      !definition ||
      definitionTranslations[definition] ||
      definitionTranslationErrors[definition]
    ) {
      return;
    }

    let isCurrentDefinition = true;
    void translateText(definition)
      .then((translation) => {
        if (isCurrentDefinition) {
          setDefinitionTranslations((current) => ({
            ...current,
            [definition]: translation,
          }));
        }
      })
      .catch(() => {
        if (isCurrentDefinition) {
          setDefinitionTranslationErrors((current) => ({
            ...current,
            [definition]: true,
          }));
        }
      });

    return () => {
      isCurrentDefinition = false;
    };
  }, [dailyWord?.definition]);

  const isTranslatingDailyDefinition =
    dailyWord !== null &&
    !definitionTranslations[dailyWord.definition] &&
    !definitionTranslationErrors[dailyWord.definition];

  if (isLoading || isTranslatingDailyDefinition) {
    return <LoadingScreen />;
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full flex-col bg-white text-navy sm:my-6 sm:min-h-[min(52rem,calc(100dvh-3rem))] sm:overflow-hidden sm:rounded-[1.75rem] sm:border sm:border-border sm:shadow-xl">
      <header className="flex items-center justify-between px-6 pb-5 pt-6">
        <AppLogo />
        {/* <InstallAppButton /> */}
      </header>

      <section
        aria-labelledby="daily-word-heading"
        className="flex flex-1 flex-col px-5 pb-6 mt-4"
      >
        <div className="mb-4 flex items-center gap-2 px-1 text-sm font-semibold">
          <CalendarDays size={18} aria-hidden="true" />
          <h1 id="daily-word-heading" className="text-blue-900 font-bold">
            Palavra do dia
          </h1>
        </div>

        {error && !dailyWord ? (
          <div
            className="flex min-h-[19.5rem] flex-col items-center justify-center gap-4 rounded-[1.125rem] bg-surface px-6 text-center"
            role="alert"
          >
            <p className="text-sm text-navy">{error}</p>
            <Button
              variant="outline"
              className="min-h-11 px-5 text-sm"
              onClick={() => void loadWord()}
            >
              Tentar novamente
            </Button>
          </div>
        ) : dailyWord ? (
          <WordCard
            word={dailyWord.word}
            phonetic={dailyWord.phonetic}
            audioUrl={dailyWord.audioUrl}
            partOfSpeech={dailyWord.partOfSpeech}
            definition={dailyWord.definition}
            translatedDefinition={definitionTranslations[dailyWord.definition]}
            isTranslatingDefinition={
              !definitionTranslations[dailyWord.definition] &&
              !definitionTranslationErrors[dailyWord.definition]
            }
            definitionTranslationError={
              definitionTranslationErrors[dailyWord.definition] ?? false
            }
          />
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="min-h-[3.125rem] rounded-2xl text-sm"
            onClick={handleAlreadyKnown}
            disabled={isLoading || !dailyWord}
          >
            Já sabia
          </Button>
          <Button
            className="min-h-[3.125rem] rounded-2xl text-sm"
            disabled={isLoading || !dailyWord}
            onClick={() => {
              if (dailyWord) {
                navigate(`/words/${encodeURIComponent(dailyWord.word)}`, {
                  state: { word: dailyWord },
                });
              }
            }}
          >
            Não sabia
          </Button>
        </div>
        {actionError && (
          <p className="mt-3 text-center text-sm text-red-700" role="alert">
            {actionError}
          </p>
        )}
      </section>

      <BottomNavigation />
    </div>
  );
}
