import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppLogo from "../../components/common/AppLogo";
import Button from "../../components/common/Button";
import LoadingScreen from "../../components/common/LoadingScreen";
import BottomNavigation from "../../components/layout/BottomNavigation";
import WordCard from "../../components/word/WordCard";
import useDailyWord from "../../hooks/useDailyWord";
import { markWordKnown } from "../../services/wordService";

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
  const [actionError, setActionError] = useState<string | null>(null);
  const { dailyWord, error, isLoading, loadNextWord, reloadDailyWord } =
    useDailyWord();
  const loadedDate = useRef(getLocalDateKey());

  function handleAlreadyKnown() {
    if (!dailyWord) {
      return;
    }

    try {
      markWordKnown(dailyWord);
      setActionError(null);
      void loadNextWord().catch((learnError: unknown) => {
        setActionError(
          learnError instanceof Error
            ? learnError.message
            : "Não foi possível carregar a próxima palavra.",
        );
      });
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
      setActionError(null);
      void loadNextWord().catch((loadError: unknown) => {
        setActionError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar a próxima palavra.",
        );
      });
    }

    function checkForNewDay() {
      if (document.visibilityState !== "visible") {
        return;
      }

      const currentDate = getLocalDateKey();
      if (currentDate !== loadedDate.current) {
        loadedDate.current = currentDate;
        void reloadDailyWord().catch((loadError: unknown) => {
          setActionError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar a palavra do dia.",
          );
        });
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
    };
  }, [location.state, navigate, loadNextWord, reloadDailyWord]);

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Não foi possível carregar uma palavra.";

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-glass-shell relative isolate mx-auto flex min-h-dvh w-full max-w-[36rem] flex-col overflow-hidden border border-[#d6e3ff] text-navy shadow-[0_12px_40px_rgba(27,65,123,0.08)] sm:my-3 sm:min-h-[calc(100dvh-1.5rem)] sm:rounded-[2.25rem]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-16 z-0 h-64 w-64 rounded-full bg-[#dce9ff]/70"
      />
      <header className="relative z-10 flex items-center justify-between px-6 pb-4 pt-10 sm:pt-8">
        <AppLogo />
        {/* TODO: Exibir quando a tela de configurações estiver implementada. */}
        <button
          type="button"
          className="hidden h-11 w-11 items-center justify-center rounded-full text-navy"
          aria-label="Configurações"
        >
          <Settings size={22} aria-hidden="true" />
        </button>
      </header>

      <section
        aria-label="Palavra do dia"
        className="relative z-10 flex flex-1 flex-col px-5 pb-7 pt-7 sm:px-7"
      >
        {error && !dailyWord ? (
          <div
            className="glass-panel flex min-h-[27rem] flex-col items-center justify-center gap-4 rounded-[2rem] px-6 text-center"
            role="alert"
          >
            <p className="text-sm text-navy">{errorMessage}</p>
            <Button
              variant="outline"
              className="min-h-11 px-5 text-sm"
              onClick={() =>
                void reloadDailyWord()
                  .then(() => setActionError(null))
                  .catch((reloadError: unknown) => {
                    setActionError(
                      reloadError instanceof Error
                        ? reloadError.message
                        : "Não foi possível carregar uma palavra.",
                    );
                  })
              }
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
            translatedDefinition={dailyWord.definitionTranslation ?? ""}
          />
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
          <Button
            variant="outline"
            className="glass-control min-h-[4.5rem] rounded-[1.4rem] border-2 text-base hover:bg-white"
            disabled={isLoading || !dailyWord}
            onClick={handleAlreadyKnown}
          >
            Já sabia
          </Button>
          <Button
            className="min-h-[4.5rem] rounded-[1.4rem] text-base"
            disabled={isLoading || !dailyWord}
            onClick={() => {
              if (dailyWord) {
                navigate(`/words/${encodeURIComponent(dailyWord.word)}`, {
                  state: { dailyWord },
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
