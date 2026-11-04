import { BarChart3, House } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Palavra do dia", Icon: House },
  { to: "/statistics", label: "Estatísticas", Icon: BarChart3 },
] as const;

export default function BottomNavigation() {
  return (
    <nav
      aria-label="Navegação principal"
      className="glass-nav relative z-10 mt-auto grid grid-cols-2 rounded-t-[2rem] px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
    >
      {links.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex min-h-[4.25rem] flex-col items-center justify-center gap-1 text-xs transition-colors ${
              isActive ? "font-semibold text-accent" : "text-muted"
            }`
          }
        >
          <Icon size={24} strokeWidth={2.2} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
