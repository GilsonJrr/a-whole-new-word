import { Volume2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import Button from "./Button";

interface PronunciationButtonProps {
  audioUrl: string | null | undefined;
  word: string;
  className?: string;
  iconSize?: number;
  variant?: "primary" | "outline" | "icon";
  icon?: ReactNode;
}

export default function PronunciationButton({
  audioUrl,
  word,
  className = "",
  iconSize = 20,
  variant = "icon",
  icon,
}: PronunciationButtonProps) {
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  function speakWithBrowserVoice(): boolean {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      return false;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.onerror = (event) => {
      if (event.error !== "canceled" && event.error !== "interrupted") {
        setPlaybackError(`Não foi possível reproduzir o áudio de ${word}.`);
      }
    };
    window.speechSynthesis.speak(utterance);
    return true;
  }

  async function playPronunciation() {
    setPlaybackError(null);

    if (audioUrl) {
      try {
        const audio = new Audio(new URL(audioUrl, window.location.href).href);
        await audio.play();
        return;
      } catch {
        // Fall back to the browser voice when the dictionary audio cannot play.
      }
    }

    if (!speakWithBrowserVoice()) {
      setPlaybackError(
        `Não há áudio disponível para ${word} e a leitura por voz não é compatível com este navegador.`,
      );
    }
  }

  return (
    <>
      <Button
        variant={variant}
        className={className}
        aria-label={`Ouvir pronúncia de ${word}`}
        title={`Ouvir ${word}`}
        onClick={() => void playPronunciation()}
      >
        {icon ?? <Volume2 size={iconSize} aria-hidden="true" />}
      </Button>
      {playbackError && (
        <span className="sr-only" role="alert" aria-live="assertive">
          {playbackError}
        </span>
      )}
    </>
  );
}
