import { Bookmark, CalendarDays } from "lucide-react";
import PronunciationButton from "../common/PronunciationButton";

interface WordCardProps {
  word: string;
  phonetic: string;
  audioUrl?: string | null;
  partOfSpeech: string;
  definition: string;
  translatedDefinition?: string;
  isTranslatingDefinition?: boolean;
  definitionTranslationError?: boolean;
}

export default function WordCard({
  word,
  phonetic,
  audioUrl,
  partOfSpeech,
  definition,
  translatedDefinition,
}: WordCardProps) {
  return (
    <article className="glass-panel flex min-h-[27rem] flex-col rounded-[2rem] px-6 py-7 sm:px-8 sm:py-8">
      <header className="flex items-center gap-3 text-navy">
        <CalendarDays
          size={25}
          className="shrink-0 text-accent"
          aria-hidden="true"
        />
        <h1 id="daily-word-heading" className="text-lg font-extrabold">
          Palavra do dia
        </h1>
        <Bookmark size={25} className="ml-auto shrink-0" aria-hidden="true" />
      </header>

      <div className="flex flex-1 flex-col justify-center pb-2 pt-5">
        <h2 className="break-words text-[clamp(2.65rem,11vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.045em] text-blue-900">
          {word}
        </h2>

        <div className="mt-4 flex items-center gap-2 text-accent">
          <span className="text-xl font-medium text-blue-700">
            {phonetic || word}
          </span>
          <PronunciationButton
            variant="icon"
            audioUrl={audioUrl}
            word={word}
            className="h-10 w-10 rounded-full p-0 text-navy"
            iconSize={23}
          />
        </div>

        <span className="mt-4 w-fit rounded-full bg-[#dfebff] px-4 py-1.5 text-sm font-bold leading-tight text-accent">
          {partOfSpeech}
        </span>

        <div className="mt-5 space-y-2">
          <p className="text-lg font-medium leading-snug text-blue-900">
            {translatedDefinition}
          </p>
        </div>
      </div>
    </article>
  );
}
