import { NAV_ITEMS } from "./navItems";

export default function AdminBottomNav({ active, onNavigate }) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t px-2 pb-[env(safe-area-inset-bottom)]"
      style={{
        backgroundColor: "var(--bg-color)",
        borderColor: "var(--dash-color)",
        boxShadow: "0 -6px 20px var(--shadow-dark)",
      }}
      aria-label="Admin sections"
    >
      <div className="flex items-stretch justify-between max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl transition-all duration-200 active:scale-95"
              aria-current={isActive ? "page" : undefined}
              style={{
                color: isActive ? "var(--bg-color)" : "var(--ink-soft)",
                backgroundColor: isActive ? "var(--ink)" : "transparent",
              }}
            >
              <span className="font-mono-text font-bold text-sm leading-none">
                {item.icon}
              </span>
              <span className="font-display font-semibold text-[9px] leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
