import { useRef, useEffect } from "react";
import gsap from "gsap";
import AdminSearchInput from "./AdminSearchInput";

export default function AdminTopbar({
  adminName,
  onLogout,
  searchQuery,
  onSearchChange,
  pendingCount = 0,
  onGoToOrders,
}) {
  const barRef = useRef(null);

  useEffect(() => {
    if (!barRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(barRef.current, {
        y: -20,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        delay: 0.1,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });
    }, barRef);

    return () => ctx.revert();
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header
      ref={barRef}
      className="neumorphic rounded-[1.5rem] p-4 flex items-center justify-between gap-4"
    >
      {/* Greeting */}
      <div className="min-w-0">
        <h1
          className="font-display text-lg font-bold truncate"
          style={{ color: "var(--ink)" }}
        >
          {greeting}, {adminName || "Admin"}</h1>
        <p
          className="font-mono-text text-xs mt-0.5"
          style={{ color: "var(--ink-soft)" }}
        >
          Here&apos;s what&apos;s happening at Caffeine today
        </p>
      </div>

      {/* Right section: search + pending orders + logout */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Search — filters orders & menu live (desktop) */}
        <div className="hidden sm:block w-44 lg:w-56">
          <AdminSearchInput value={searchQuery} onChange={onSearchChange} />
        </div>

        {/* Pending orders shortcut (real count, jumps to Orders) */}
        <button
          onClick={onGoToOrders}
          className="relative w-9 h-9 rounded-full neumorphic-sm flex items-center justify-center active:scale-90 transition-all"
          aria-label={`${pendingCount} order${pendingCount === 1 ? "" : "s"} pending — go to orders`}
          title="Pending orders"
          style={{ color: "var(--ink-soft)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          {pendingCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-mono-text font-bold flex items-center justify-center"
              style={{ backgroundColor: "#e74c3c", color: "#fff" }}
              aria-hidden="true"
            >
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </button>

        {/* Admin avatar / logout */}
        <button
          onClick={onLogout}
          className="w-9 h-9 rounded-full neumorphic-sm flex items-center justify-center active:scale-90 transition-all"
          aria-label="Log out"
          title="Log out"
          style={{ color: "var(--ink-soft)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}

