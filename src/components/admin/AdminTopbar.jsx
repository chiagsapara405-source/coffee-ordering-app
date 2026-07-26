import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function AdminTopbar({ adminName, onLogout }) {
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

      {/* Right section: search + notifications + logout */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Search */}
        <div className="relative hidden sm:block">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: "var(--ink-soft)" }}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="search"
            className="neumorphic-inset rounded-full py-2 pl-9 pr-4 font-display text-xs w-44 lg:w-56 outline-none"
            style={{ color: "var(--ink)", backgroundColor: "var(--bg-color)" }}
            placeholder="Search orders, items..."
            aria-label="Search admin"
          />
        </div>

        {/* Notification bell */}
        <button
          className="relative w-9 h-9 rounded-full neumorphic-sm flex items-center justify-center active:scale-90 transition-all"
          aria-label="Notifications"
          style={{ color: "var(--ink-soft)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[8px] font-mono-text font-bold flex items-center justify-center"
            style={{ backgroundColor: "#e74c3c", color: "#fff" }}
          >
            3
          </span>
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

