import { DIETARY_FILTERS } from "../data/menu";

export default function SearchBar({
  query,
  onQueryChange,
  dietFilter,
  onDietFilterChange,
}) {
  return (
    <div className="px-6 mb-6 space-y-3 max-w-7xl mx-auto">
      {/* Search input */}
      <div className="relative max-w-md mx-auto">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-muted"
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
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search menu items"
          className="w-full pl-10 pr-4 py-3 rounded-full neumorphic-inset font-display text-sm outline-none border-none"
          style={{ color: "var(--ink)", backgroundColor: "var(--bg-color)" }}
          placeholder="Search menu..."
        />
        {query && (
          <button
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-secondary-muted hover:text-[#3a1d0d] active:scale-75"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dietary filter chips */}
      <div
        className="flex justify-center flex-wrap gap-2"
        role="group"
        aria-label="Dietary filters"
      >
        <button
          onClick={() => onDietFilterChange(null)}
          className={`px-3 py-1.5 rounded-full font-mono-text text-xs font-semibold transition-colors ${
            dietFilter === null
              ? "bg-[#3a1d0d] text-[#f1c7a9]"
              : "neumorphic-sm text-[#3a1d0d]"
          }`}
        >
          All
        </button>
        {DIETARY_FILTERS.map((df) => (
          <button
            key={df.id}
            onClick={() =>
              onDietFilterChange(dietFilter === df.id ? null : df.id)
            }
            className={`px-3 py-1.5 rounded-full font-mono-text text-xs font-semibold transition-colors flex items-center gap-1 ${
              dietFilter === df.id
                ? "bg-[#3a1d0d] text-[#f1c7a9]"
                : "neumorphic-sm text-[#3a1d0d]"
            }`}
          >
            {df.emoji} {df.label}
          </button>
        ))}
      </div>
    </div>
  );
}
