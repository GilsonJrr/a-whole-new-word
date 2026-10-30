import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLogo from "../../components/common/AppLogo";
import BottomNavigation from "../../components/layout/BottomNavigation";
import {
  getVocabularyStats,
  type VocabularyStats,
} from "../../services/wordService";

function formatHistoryDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  })
    .format(new Date(`${date}T12:00:00`))
    .replace(".", "");
}

export default function Statistics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<VocabularyStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setStats(getVocabularyStats());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar suas estatísticas.",
      );
    }
  }, []);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[27rem] flex-col overflow-hidden bg-white text-navy sm:my-6 sm:h-[min(52rem,calc(100dvh-3rem))] sm:rounded-[1.75rem] sm:border sm:border-border sm:shadow-xl">
      <header className="flex items-center justify-between px-6 pb-5 pt-6">
        <AppLogo />
        {/* <Button
          variant="icon"
          className="h-10 w-10 rounded-full"
          aria-label="Configurações"
        >
          <Settings size={20} aria-hidden="true" />
        </Button> */}
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-4">
        <h1 className="mb-5 mt-4 shrink-0 px-1 text-2xl font-extrabold text-blue-900">
          Seu progresso
        </h1>

        {error ? (
          <p
            className="rounded-2xl bg-surface px-5 py-4 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : (
          <>
            <section
              aria-label="Resumo do aprendizado"
              className="grid shrink-0 grid-cols-2 divide-x divide-border rounded-[1.5rem] bg-gradient-to-br from-surface to-[#edf3fc] px-3 py-6"
            >
              <div className="flex flex-col items-center px-2 text-center">
                <span className="text-4xl font-extrabold text-blue-900">
                  {stats?.newWords ?? 0}
                </span>
                <span className="mt-2 text-sm leading-5 text-blue-800">
                  {stats?.hasMarkedKnown
                    ? "todas as palavras"
                    : "palavras novas"}
                </span>
              </div>
              <div className="flex flex-col items-center px-2 text-center">
                <span className="text-4xl font-extrabold text-blue-900">
                  {stats?.learnedWords ?? 0}
                </span>
                <span className="mt-2 text-sm leading-5 text-blue-800">
                  palavras aprendidas
                </span>
              </div>
            </section>

            <section
              className="mt-8 flex min-h-0 flex-1 flex-col"
              aria-labelledby="history-heading"
            >
              <h2
                id="history-heading"
                className="mb-4 shrink-0 px-1 text-xl font-bold text-blue-900"
              >
                Histórico
              </h2>
              {stats?.history.length ? (
                <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain">
                  {stats.history.slice(0, 20).map((entry) => {
                    const isLearned = stats.learnedWordKeys.includes(
                      entry.word.word.toLowerCase(),
                    );
                    return (
                      <li key={`${entry.word.word}-${entry.date}`}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                          onClick={() =>
                            navigate(
                              `/words/${encodeURIComponent(entry.word.word)}`,
                              { state: { word: entry.word } },
                            )
                          }
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-lg font-bold text-blue-900">
                              {entry.word.word}
                            </span>
                            <span className="mt-1 inline-flex rounded-full bg-[#e6effc] px-3 py-1 text-xs font-medium text-blue-800">
                              {entry.word.partOfSpeech}
                            </span>
                            {isLearned && (
                              <span className="ml-2 inline-flex rounded-full bg-[#e6effc] px-3 py-1 text-xs font-medium text-blue-800">
                                Aprendida
                              </span>
                            )}
                          </span>
                          <span className="ml-3 flex shrink-0 items-center gap-2 text-sm text-muted">
                            {formatHistoryDate(entry.date)}
                            <ChevronRight
                              size={20}
                              className="text-blue-700"
                              aria-hidden="true"
                            />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="rounded-2xl bg-surface px-5 py-6 text-center text-sm text-muted">
                  Seu histórico de palavras aparecerá aqui.
                </p>
              )}
            </section>
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
