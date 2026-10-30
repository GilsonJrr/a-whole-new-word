import PronunciationButton from "../common/PronunciationButton";

interface WordCardProps {
  word: string;
  phonetic: string;
  audioUrl?: string | null;
  partOfSpeech: string;
  translatedDefinition?: string;
  isTranslatingDefinition?: boolean;
  definitionTranslationError?: boolean;
}

export default function WordCard({
  word,
  phonetic,
  audioUrl,
  partOfSpeech,
  translatedDefinition,
}: WordCardProps) {
  return (
    <article className="relative flex h-4/5 flex-col items-center justify-center rounded-[1.125rem] bg-gradient-to-br from-surface to-[#edf3fc] px-6 py-10 text-center">
      <h2 className="text-[2.75rem] font-black leading-tight tracking-[-0.04em] text-blue-900 sm:text-5xl mt-10">
        {word}
      </h2>

      <div className="mt-2 flex items-center gap-2 text-accent">
        <span className="text-base text-blue-500 font-medium">
          {phonetic || word}
        </span>
        <PronunciationButton
          variant="icon"
          audioUrl={audioUrl}
          word={word}
          className="h-9 w-auto gap-1 rounded-full px-2 py-0 text-xs text-blue-900"
          iconSize={19}
          showLabel
        ></PronunciationButton>
      </div>

      <span className="mt-4 rounded-xl bg-[#dfe9f7] px-4 py-1 text-sm leading-tight text-blue-800 font-semibold">
        {partOfSpeech}
      </span>

      <div className="mt-5 mb-10 max-w-[17rem] px-5">
        {translatedDefinition && (
          <p className="text-base font-semibold leading-snug text-blue-800">
            {translatedDefinition}
          </p>
        )}
      </div>
    </article>
  );
}
