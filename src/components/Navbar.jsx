import { forwardRef } from "react";
import { Link } from "react-router-dom";

const Navbar = forwardRef(function Navbar(
  { count, onCartClick, theme, onThemeToggle, user, onLogout },
  ref,
) {
  return (
    <nav
      className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-40 px-6 py-4 rounded-full shadow-sm flex justify-between items-center border border-white/20"
      style={{
        backgroundColor: "var(--bg-color)",
        backdropFilter: "blur(16px)",
      }}
    >
      <a href="#" className="flex items-center gap-3" aria-label="Caffeine home">
        <svg
          className="w-7 h-7"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ color: "var(--ink-soft)" }}
        >
          <path d="M4 19h16v2H4zM20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm-2 5h-2V5h2v3z" />
        </svg>
        <span
          className="font-display font-bold text-xl"
          style={{ color: "var(--ink)" }}
        >
          Caffeine
        </span>
      </a>
      <div
        className="font-display font-semibold text-sm md:text-base flex items-center gap-3"
        style={{ color: "var(--ink)" }}
      >
        <span
          className="hidden sm:inline font-mono-text text-xs uppercase tracking-[0.2em]"
          style={{ color: "var(--ink-soft)" }}
        >
          Order online
        </span>

        {/* User section */}
        {/* User section — always shown since app is protected */}
        <div className="flex items-center gap-2">
          <span
            className="hidden sm:inline font-mono-text text-xs truncate max-w-[80px]"
            style={{ color: "var(--ink-soft)" }}
            title={user?.name}
          >
            {user?.name}
          </span>

          {/* Admin Dashboard Link */}
          <Link
            to="/admin"
            className="w-9 h-9 rounded-full neumorphic-sm flex items-center justify-center hover:scale-105 active:scale-90 transition-all"
            aria-label="Admin dashboard"
            title="Admin dashboard"
            style={{ color: "var(--ink-soft)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </Link>

          <button
            onClick={onLogout}
            className="w-9 h-9 rounded-full neumorphic-sm flex items-center justify-center"
            aria-label="Log out"
            title="Log out"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              style={{ color: "var(--ink)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="w-9 h-9 rounded-full neumorphic-sm flex items-center justify-center"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "var(--ink)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.66l-.71.71M21 12h-1M4 12H3m16.66 7.66l-.71-.71M4.05 4.34l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "var(--ink)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Cart button */}
        <button
          ref={ref}
          onClick={onCartClick}
          className="relative w-11 h-11 rounded-full neumorphic-sm flex items-center justify-center"
          aria-label={`Open cart${count > 0 ? ` (${count} item${count !== 1 ? "s" : ""})` : ""}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ color: "var(--ink)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l3.2-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M9 21a1 1 0 100-2 1 1 0 000 2zM17 21a1 1 0 100-2 1 1 0 000 2z"
            />
          </svg>
          {count > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full text-[10px] font-mono-text font-bold flex items-center justify-center"
              style={{
                backgroundColor: "var(--ink)",
                color: "var(--bg-color)",
              }}
              aria-live="polite"
              aria-atomic="true"
            >
              {count}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
});

export default Navbar;
