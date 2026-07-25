import { CATEGORIES } from "../data/menu";

export default function CategoryFilter({ activeCategory, onChange }) {
  return (
    <div className="px-6 flex justify-center mb-10">
      <div
        className="neumorphic-inset rounded-full p-1.5 flex gap-1 font-display text-sm md:text-base font-semibold text-[#3a1d0d] overflow-x-auto max-w-full"
        role="tablist"
        aria-label="Filter by category"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={`cat-btn px-5 py-2.5 rounded-full whitespace-nowrap capitalize ${
              activeCategory === cat.id ? "active" : ""
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
