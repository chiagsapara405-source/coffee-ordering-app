import { useEffect, useRef } from "react";
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
        className="relative neumorphic rounded-[2rem] w-full max-w-md max-h-[90vh] overflow-y-auto p-7"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full neumorphic-sm flex items-center justify-center text-[#3a1d0d] text-sm"
          aria-label="Close customize modal"
        >
          ✕
        </button>
        <div className="flex items-center gap-4 mb-5">
          <img
            src={item.img}
            alt={item.name}
            className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
          />
          <div>
            <h3 className="font-display text-2xl font-bold text-[#3a1d0d]">
              {item.name}
            </h3>
            <p className="font-mono-text text-[#603318]">
              {fmt(item.price)} base
            </p>
          </div>
        </div>

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
                className={`size-btn neumorphic-sm flex-1 py-2.5 rounded-full font-display font-semibold text-sm text-[#3a1d0d] ${
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
                className={`milk-btn neumorphic-sm px-4 py-2 rounded-full font-display font-semibold text-sm text-[#3a1d0d] ${
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
                className={`milk-btn neumorphic-sm flex-1 py-2 rounded-full font-display font-semibold text-xs text-[#3a1d0d] ${
                  sugar === s.id ? "active" : ""
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>

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
                  className={`milk-btn neumorphic-sm flex-1 py-2 rounded-full font-display font-semibold text-xs text-[#3a1d0d] ${
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
                className={`milk-btn neumorphic-sm px-4 py-2 rounded-full font-display font-semibold text-xs text-[#3a1d0d] ${
                  syrup === s.id ? "active" : ""
                }`}
              >
                {s.label}
                {s.extra ? ` +₹${s.extra}` : ""}
              </button>
            ))}
          </div>
        </fieldset>

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
                  className={`milk-btn neumorphic-sm flex-1 py-2 rounded-full font-display font-semibold text-xs text-[#3a1d0d] ${
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
                  className={`milk-btn neumorphic-sm flex-1 py-2 rounded-full font-display font-semibold text-xs text-[#3a1d0d] ${
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
        <div className="flex items-center justify-between mb-6 mt-2">
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

        <button
          onClick={onAddToCart}
          className="w-full py-4 rounded-full bg-[#3a1d0d] text-[#f1c7a9] font-display font-bold flex items-center justify-center gap-2 transition-colors hover:bg-[#603318]"
        >
          Add to cup ·{" "}
          <span className="font-mono-text">{fmt(totalPrice)}</span>
        </button>
      </div>
    </div>
  );
}
