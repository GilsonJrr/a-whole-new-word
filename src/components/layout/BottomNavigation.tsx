import { BarChart3, BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Palavra do dia", Icon: BookOpen },
  { to: "/statistics", label: "Estatísticas", Icon: BarChart3 },
] as const;

export default function BottomNavigation() {
  return (
    <nav
      aria-label="Navegação principal"
      className="grid grid-cols-2 border-t border-border bg-white px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
    >
      {links.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex min-h-14 flex-col items-center justify-center gap-1 text-[0.625rem] transition-colors ${
              isActive ? "font-semibold text-navy" : "text-muted"
            }`
          }
        >
          <Icon size={21} strokeWidth={2.2} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
