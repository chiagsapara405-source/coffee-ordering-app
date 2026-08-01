import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  fmt,
  SIZES,
  MILKS,
  SUGAR_LEVELS,
  SHOTS,
  SYRUPS,
  TEMPS,
  ICE_LEVELS,
  COFFEE_DRINKS,
} from "../data/menu";
import { useFocusTrap } from "../hooks/useFocusTrap";

export default function CustomizeModal({
  isOpen,
  item,
  size,
  milk,
  sugar,
  shots,
  syrup,
  temp,
  ice,
  qty,
  totalPrice,
  onSizeChange,
  onMilkChange,
  onSugarChange,
  onShotsChange,
  onSyrupChange,
  onTempChange,
  onIceChange,
  onQtyChange,
  onAddToCart,
  onClose,
}) {
  const modalRef = useRef(null);
  const focusTrapRef = useFocusTrap(isOpen);
  const [showMore, setShowMore] = useState(false);

  // Fresh collapsed disclosure per open (adjust-state-during-render pattern).
  // Comparing both directions keeps prevIsOpen in sync so the reset fires on
  // every open, not just the first one.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setShowMore(false);
  }

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
      );
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const isCoffee = COFFEE_DRINKS.includes(item.id);
  const isHot = item.cat === "hot";

  // Selected-options summary (compact, shown above the pinned CTA)
  const label = (list, id) => list.find((x) => x.id === id)?.label || "";
  const summaryParts = [
    label(SIZES, size),
    label(MILKS, milk),
    label(SUGAR_LEVELS, sugar),
  ];
  if (isCoffee) summaryParts.push(label(SHOTS, shots));
  if (syrup !== "none") summaryParts.push(`${label(SYRUPS, syrup)} syrup`);
  if (isHot) summaryParts.push(label(TEMPS, temp));
  else summaryParts.push(label(ICE_LEVELS, ice));
  const summary = summaryParts.filter(Boolean).join(" · ");

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Customize ${item.name}`}
    >
      <div
        className="modal-overlay absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={(el) => {
          modalRef.current = el;
          focusTrapRef.current = el;
        }}
        className="relative neumorphic rounded-[2rem] w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full neumorphic-sm flex items-center justify-center text-[var(--ink)] text-sm"
          aria-label="Close customize modal"
        >
          ✕
        </button>

        {/* Header (fixed) */}
        <div className="flex items-center gap-4 px-7 pt-7 pb-5 border-b" style={{ borderColor: "var(--dash-color)" }}>
          <img
            src={item.img}
            alt={item.name}
            className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <h3 className="font-display text-xl font-bold text-[var(--ink)] truncate">
              {item.name}
            </h3>
            <p className="font-mono-text text-secondary-soft text-sm">
              {fmt(item.price)} base
            </p>
          </div>
        </div>

        {/* Scrollable options */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          {/* Size selector */}
          <fieldset className="mb-4 border-0 p-0">
            <legend className="font-display font-semibold text-xs uppercase tracking-wider text-[#3a1d0d] mb-2">
              Size
            </legend>
            <div className="flex gap-2" role="radiogroup" aria-label="Select size">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSizeChange(s.id)}
                  role="radio"
                  aria-checked={size === s.id}
                  className={`option-btn flex-1 py-2.5 rounded-full font-display font-semibold text-sm ${
                    size === s.id ? "active" : ""
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Milk selector */}
          <fieldset className="mb-4 border-0 p-0">
            <legend className="font-display font-semibold text-xs uppercase tracking-wider text-[#3a1d0d] mb-2">
              Milk
            </legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select milk type">
              {MILKS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onMilkChange(m.id)}
                  role="radio"
                  aria-checked={milk === m.id}
                  className={`option-btn px-4 py-2 rounded-full font-display font-semibold text-sm ${
                    milk === m.id ? "active" : ""
                  }`}
                >
                  {m.label}
                  {m.extra ? ` +₹${m.extra}` : ""}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Sugar level */}
          <fieldset className="mb-4 border-0 p-0">
            <legend className="font-display font-semibold text-xs uppercase tracking-wider text-[#3a1d0d] mb-2">
              Sugar
            </legend>
            <div className="flex gap-2" role="radiogroup" aria-label="Select sugar level">
              {SUGAR_LEVELS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSugarChange(s.id)}
                  role="radio"
                  aria-checked={sugar === s.id}
                  className={`option-btn flex-1 py-2 rounded-full font-display font-semibold text-xs ${
                    sugar === s.id ? "active" : ""
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Less-frequently changed: extra shots + syrup (collapsed by default) */}
          <button
            onClick={() => setShowMore((s) => !s)}
            aria-expanded={showMore}
            className="btn-outline w-full py-2.5 rounded-full font-display font-semibold text-xs mb-4"
          >
            {showMore ? "− Hide shots & syrup" : "+ Shots & syrup"}
          </button>

          {showMore && (
            <>
              {/* Extra shots (coffee only) */}
              {isCoffee && (
                <fieldset className="mb-4 border-0 p-0">
                  <legend className="font-display font-semibold text-xs uppercase tracking-wider text-[#3a1d0d] mb-2">
                    Shots
                  </legend>
                  <div className="flex gap-2" role="radiogroup" aria-label="Select shot count">
                    {SHOTS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => onShotsChange(s.id)}
                        role="radio"
                        aria-checked={shots === s.id}
                        className={`option-btn flex-1 py-2 rounded-full font-display font-semibold text-xs ${
                          shots === s.id ? "active" : ""
                        }`}
                      >
                        {s.label}
                        {s.extra ? ` +₹${s.extra}` : ""}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {/* Syrup flavor */}
              <fieldset className="mb-4 border-0 p-0">
                <legend className="font-display font-semibold text-xs uppercase tracking-wider text-[#3a1d0d] mb-2">
                  Syrup
                </legend>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select syrup flavor">
                  {SYRUPS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSyrupChange(s.id)}
                      role="radio"
                      aria-checked={syrup === s.id}
                      className={`option-btn px-4 py-2 rounded-full font-display font-semibold text-xs ${
                        syrup === s.id ? "active" : ""
                      }`}
                    >
                      {s.label}
                      {s.extra ? ` +₹${s.extra}` : ""}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {/* Temperature (hot) / Ice level (iced) */}
          {isHot ? (
            <fieldset className="mb-4 border-0 p-0">
              <legend className="font-display font-semibold text-xs uppercase tracking-wider text-[#3a1d0d] mb-2">
                Temperature
              </legend>
              <div className="flex gap-2" role="radiogroup" aria-label="Select temperature">
                {TEMPS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onTempChange(t.id)}
                    role="radio"
                    aria-checked={temp === t.id}
                    className={`option-btn flex-1 py-2 rounded-full font-display font-semibold text-xs ${
                      temp === t.id ? "active" : ""
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : (
            <fieldset className="mb-4 border-0 p-0">
              <legend className="font-display font-semibold text-xs uppercase tracking-wider text-[#3a1d0d] mb-2">
                Ice
              </legend>
              <div className="flex gap-2" role="radiogroup" aria-label="Select ice level">
                {ICE_LEVELS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => onIceChange(l.id)}
                    role="radio"
                    aria-checked={ice === l.id}
                    className={`option-btn flex-1 py-2 rounded-full font-display font-semibold text-xs ${
                      ice === l.id ? "active" : ""
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* Quantity */}
          <div className="flex items-center justify-between mb-2 mt-2">
            <p className="font-display font-semibold text-xs uppercase tracking-wider text-[#3a1d0d]">
              Qty
            </p>
            <div className="flex items-center gap-4 neumorphic-inset rounded-full px-4 py-2">
              <button
                onClick={() => onQtyChange(Math.max(1, qty - 1))}
                className="qty-btn font-display font-bold text-lg text-[#3a1d0d]"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span
                className="font-mono-text font-bold text-[#3a1d0d] w-4 text-center"
                aria-live="polite"
                aria-atomic="true"
              >
                {qty}
              </span>
              <button
                onClick={() => onQtyChange(Math.min(20, qty + 1))}
                className="qty-btn font-display font-bold text-lg text-[#3a1d0d]"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Pinned footer: summary + Add to cup */}
        <div className="px-7 py-5 border-t" style={{ borderColor: "var(--dash-color)" }}>
          <p
            className="font-mono-text text-[11px] text-secondary-soft mb-3 truncate"
            aria-live="polite"
          >
            {summary}
          </p>
          <button
            onClick={onAddToCart}
            className="btn-primary w-full py-4 rounded-full font-display font-bold flex items-center justify-center gap-2 text-base"
          >
            Add to cup · <span className="font-mono-text">{fmt(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
