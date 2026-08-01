export default function AdminSearchInput({ value, onChange }) {
  return (
    <div className="relative">
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="neumorphic-inset rounded-full py-2.5 pl-9 pr-9 font-display text-xs w-full outline-none"
        style={{ color: "var(--ink)", backgroundColor: "var(--bg-color)" }}
        placeholder="Search orders, items..."
        aria-label="Search admin"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs hover:opacity-70 active:scale-75"
          style={{ color: "var(--ink-soft)" }}
          aria-label="Clear admin search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
