import { Download, Info } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "./Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    setIsInstalled(isStandalone());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowInstructions(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) {
      setShowInstructions((visible) => !visible);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  }

  if (isInstalled) {
    return null;
  }

  return (
    <div className="flex flex-col items-end">
      <Button
        variant="outline"
        className="min-h-10 gap-2 rounded-xl px-3 py-2 text-xs"
        aria-expanded={showInstructions}
        onClick={() => void handleInstall()}
      >
        {installPrompt ? (
          <Download size={16} aria-hidden="true" />
        ) : (
          <Info size={16} aria-hidden="true" />
        )}
        Instalar app
      </Button>
      {showInstructions && (
        <p
          className="mt-2 max-w-52 rounded-xl bg-surface px-3 py-2 text-right text-xs leading-relaxed text-blue-900"
          role="status"
        >
          No Android, abra o menu do navegador e escolha “Instalar app” ou
          “Adicionar à tela inicial”.
        </p>
      )}
    </div>
  );
}
