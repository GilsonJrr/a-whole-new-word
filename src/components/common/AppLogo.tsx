import { Link } from "react-router-dom";

export default function AppLogo() {
  return (
    <Link
      to="/"
      aria-label="A Whole New Word - home"
      className="inline-flex flex-col text-3xl font-extrabold leading-[0.82] tracking-[-0.06em] text-blue-900"
    >
      <span>a whole</span>
      <span>
        new <span className="text-accent">word</span>
      </span>
    </Link>
  );
}
