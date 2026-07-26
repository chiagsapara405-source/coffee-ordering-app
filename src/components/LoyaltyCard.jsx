const MAX_STAMPS = 9;

export default function LoyaltyCard({ orderCount }) {
  const progress = Math.min(orderCount, MAX_STAMPS);
  const isComplete = orderCount >= MAX_STAMPS;

  return (
    <div
      className="neumorphic-sm rounded-2xl p-4 text-center"
      style={{ color: "var(--ink)" }}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="font-display font-bold text-sm">
          {isComplete ? "🎉 Free drink ready!" : "Loyalty Card"}
        </span>
      </div>
      <div className="flex justify-center gap-1.5 mb-2" aria-label={`${progress} of ${MAX_STAMPS} stamps collected`}>
        {Array.from({ length: MAX_STAMPS }, (_, i) => (
          <span
            key={i}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
              i < progress
                ? "scale-100"
                : "scale-90 opacity-40"
            }`}
            style={{
              backgroundColor: i < progress ? "var(--ink)" : "transparent",
              color: i < progress ? "var(--bg-color)" : "var(--ink-soft)",
              border: `2px solid ${i < progress ? "var(--ink)" : "var(--shadow-dark)"}`,
            }}
            aria-hidden="true"
          >
            {i < progress ? "☕" : i + 1}
          </span>
        ))}
      </div>
      <p className="font-mono-text text-[10px] text-secondary-muted">
        {isComplete
          ? "Your next drink is on us!"
          : (() => {
              const remaining = MAX_STAMPS - progress;
              return `${remaining} more ${remaining === 1 ? "stamp" : "stamps"} for a free drink`;
            })()}
      </p>
    </div>
  );
}
