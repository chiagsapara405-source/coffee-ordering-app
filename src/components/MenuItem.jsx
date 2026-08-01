import { useState } from "react";
import { fmt, DIETARY_FILTERS } from "../data/menu";

export default function MenuItem({ item, onCustomize, onQuickAdd, isFavorite, onToggleFavorite }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isUnavailable = item.available === false;

  return (
    <div
      className={`menu-item item-card neumorphic rounded-[2rem] p-5 flex gap-4 items-center ${
        isUnavailable ? "opacity-70 grayscale" : ""
      }`}
      aria-disabled={isUnavailable}
    >
      <div className="relative w-24 h-24 rounded-2xl flex-shrink-0 overflow-hidden shadow-md">
        {/* Skeleton loader */}
        {!imgLoaded && !imgError && (
          <div
            className="absolute inset-0 bg-[#d0a587]/40 animate-pulse rounded-2xl"
            aria-hidden="true"
          />
        )}
        {imgError ? (
          <div className="w-full h-full bg-[#e8bf99] rounded-2xl flex items-center justify-center text-[#603318]/50 text-xs font-mono-text">
            ☕
          </div>
        ) : (
          <img
            src={item.img}
            alt={item.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold text-[#3a1d0d] truncate">
            {item.name}
          </h3>
          {isUnavailable && (
            <span
              className="flex-shrink-0 font-mono-text text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
              style={{ backgroundColor: "rgba(231,76,60,0.12)", color: "#e74c3c" }}
            >
              Unavailable
            </span>
          )}
        </div>
        <p className="font-mono-text text-xs text-secondary mb-1 line-clamp-1">
          {item.note}
        </p>
        {/* Dietary tags */}
        {item.dietary && item.dietary.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.dietary.map((d) => {
              const df = DIETARY_FILTERS.find((f) => f.id === d);
              return df ? (
                <span
                  key={d}
                  className="inline-flex items-center gap-0.5 text-[10px] font-mono-text px-1.5 py-0.5 rounded-full bg-[#603318]/10 text-secondary-soft"
                >
                  {df.emoji} {df.label}
                </span>
              ) : null;
            })}
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-mono-text text-sm font-semibold" style={{ color: "var(--ink)" }}>
              {fmt(item.price)}
            </span>
            {onQuickAdd && !isUnavailable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Pass the card's bounding rect for fly animation
                  const card = e.currentTarget.closest(".item-card");
                  onQuickAdd(item, card ? card.getBoundingClientRect() : undefined);
                }}
                className="text-[10px] font-mono-text text-left transition-all active:scale-90"
                style={{ color: "var(--ink-soft)" }}
                onMouseEnter={(e) => e.target.style.color = "var(--ink)"}
                onMouseLeave={(e) => e.target.style.color = "var(--ink-soft)"}
                aria-label={`Quick add ${item.name} with defaults`}
              >
                + Quick add
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {/* Favorite toggle */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isUnavailable) onToggleFavorite(item.id);
                }}
                disabled={isUnavailable}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={isFavorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                style={{ color: isFavorite ? "#e74c3c" : "var(--ink-soft)" }}
              >
                <svg className="w-3.5 h-3.5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => {
                if (!isUnavailable) onCustomize(item);
              }}
              id="add"
              disabled={isUnavailable}
              className="btn-primary rounded-full w-9 h-9 flex items-center justify-center font-bold text-lg transition-transform active:scale-90 flex-shrink-0"
              aria-label={isUnavailable ? `${item.name} is unavailable` : `Customize ${item.name}`}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
