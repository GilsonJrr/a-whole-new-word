import { BookOpen } from "lucide-react";

export default function LoadingScreen() {
  return (
    <main
      className="loading-screen w-full"
      role="status"
      aria-label="Carregando uma nova palavra"
    >
      <div className="loading-screen__content w-full">
        <h1 className="loading-screen__logo">
          <span>a whole</span>
          <span>
            new <span className="loading-screen__accent">word</span>
          </span>
        </h1>
        <p className="loading-screen__tagline">
          Uma palavra nova por dia.
          <br />
          Um mundo maior para você.
        </p>
        <div className="loading-screen__book" aria-hidden="true">
          <span className="loading-screen__ray loading-screen__ray--left" />
          <span className="loading-screen__ray loading-screen__ray--middle" />
          <span className="loading-screen__ray loading-screen__ray--right" />
          <BookOpen size={58} strokeWidth={1.5} />
        </div>
      </div>
      <div
        className="loading-screen__progress"
        role="progressbar"
        aria-label="Carregando palavra"
        aria-valuetext="Carregando"
      >
        <span />
      </div>
    </main>
  );
}
