import { useRef, useEffect } from "react";
import gsap from "gsap";
import { NAV_ITEMS } from "./navItems";

export default function AdminSidebar({ active, onNavigate, collapsed, onToggle }) {
  const sidebarRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    if (!sidebarRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(sidebarRef.current, {
        x: -20,
        opacity: 0,
      }, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });
    }, sidebarRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!navRef.current) return;

    const buttons = navRef.current.querySelectorAll("button.nav-item");
    if (buttons.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(buttons, {
        x: -10,
        opacity: 0,
      }, {
        x: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.04,
        ease: "power2.out",
        clearProps: "transform,opacity",
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className={`hidden lg:flex flex-shrink-0 flex-col min-h-0 self-stretch transition-all duration-300 ease-out ${
        collapsed ? "w-[72px]" : "w-60"
      }`}
    >
      <div className="neumorphic rounded-[1.5rem] p-4 flex flex-col h-full min-h-[calc(100vh-2rem)]">
        <div className="flex items-center gap-3 px-2 pb-5 mb-5 border-b" style={{ borderColor: "var(--dash-color)" }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-lg flex-shrink-0"
            style={{ backgroundColor: "var(--ink)", color: "var(--bg-color)" }}
          >
            C
          </div>
          <span
            className={`font-display font-bold text-base truncate transition-opacity duration-300 ${
              collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            }`}
            style={{ color: "var(--ink)" }}
          >
            Caffeine
          </span>
        </div>

        <nav ref={navRef} className="flex-1 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-display text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "shadow-[inset_3px_3px_8px_var(--shadow-dark),inset_-3px_-3px_8px_var(--shadow-light)]"
                    : "hover:shadow-[inset_2px_2px_6px_var(--shadow-dark),inset_-2px_-2px_6px_var(--shadow-light)]"
                }`}
                style={{
                  color: isActive ? "var(--bg-color)" : "var(--ink-soft)",
                  backgroundColor: isActive ? "var(--ink)" : "transparent",
                }}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <span className="text-sm flex-shrink-0 w-6 text-center font-mono-text font-bold">{item.icon}</span>
                <span
                  className={`truncate transition-opacity duration-300 ${
                    collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={onToggle}
          className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl btn-outline text-sm font-display font-semibold"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}>
            &lt;
          </span>
          <span
            className={`truncate transition-opacity duration-300 ${
              collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            }`}
          >
            Collapse
          </span>
        </button>
      </div>
    </aside>
  );
}