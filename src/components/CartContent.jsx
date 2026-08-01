import CartRow from "./CartRow";
import LoyaltyCard from "./LoyaltyCard";
import { fmt } from "../data/menu";

const PICKUP_TIMES = [
  { id: "asap", label: "ASAP" },
  { id: "15min", label: "15 min" },
    { id: "30min", label: "30 min" },
  { id: "1hour", label: "1 hour" },
];

export default function CartContent({
  cart,
  subtotal,
  tax,
  total,
  ticketNo,
  onChangeQty,
  onPlaceOrder,
  onReorder,
  hasLastOrder,
  orderCount,
  pickupTime = "asap",
  onPickupTimeChange,
  emptyMessage = "Your cup is empty. Add something from the menu.",
  taxRate = 5,
  isPlacing = false,
}) {
  return (
    <>
      <h2 className="font-display text-2xl font-bold text-[#3a1d0d] mb-1">
        Your order
      </h2>
      <p className="font-mono-text text-xs text-secondary-soft mb-4">
        Ticket #{ticketNo} · Est. wait 5 mins
      </p>

      <div
        className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[60px]"
        role="list"
        aria-label="Cart items"
      >
        {cart.map((c) => (
          <div role="listitem" key={c.key}>
            <CartRow item={c} onChangeQty={onChangeQty} />
          </div>
        ))}
      </div>

      {cart.length === 0 && (
        <div className="py-8 text-center space-y-4">
          {/* Empty cup illustration */}
          <div className="text-5xl opacity-40 cup-bounce" aria-hidden="true">
            🫗
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-secondary-soft">
              Your cup is empty
            </p>
            <p className="font-mono-text text-xs text-secondary-muted mt-1">
              {emptyMessage}
            </p>
          </div>
          {hasLastOrder && onReorder && (
            <button
              onClick={onReorder}
              className="inline-block btn-outline px-5 py-2.5 rounded-full font-display font-semibold text-sm"
            >
              ↩ Reorder last order
            </button>
          )}
        </div>
      )}

      {/* Pickup time */}
      {cart.length > 0 && onPickupTimeChange && (
        <div className="mt-4">
          <p className="font-display font-semibold text-xs uppercase tracking-wider mb-2" style={{ color: "var(--ink)" }}>
            Pickup time
          </p>
          <div className="flex gap-2" role="radiogroup" aria-label="Select pickup time">
            {PICKUP_TIMES.map((t) => (
              <button
                key={t.id}
                onClick={() => onPickupTimeChange(t.id)}
                role="radio"
                aria-checked={pickupTime === t.id}
                className="flex-1 py-2 rounded-full font-mono-text text-xs font-semibold transition-all active:scale-95"
                style={{
                  backgroundColor: pickupTime === t.id ? "var(--ink)" : "transparent",
                  color: pickupTime === t.id ? "var(--bg-color)" : "var(--ink-soft)",
                  border: `2px solid ${pickupTime === t.id ? "var(--ink)" : "var(--shadow-dark)"}`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loyalty card */}
      <div className="mt-4">
        <LoyaltyCard orderCount={orderCount || 0} />
      </div>

      <div className="ticket-dash pt-4 mt-4 space-y-2">
        <div className="flex justify-between font-mono-text text-sm text-[#3a1d0d]">
          <span>Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between font-mono-text text-sm text-secondary-soft">
          <span>Tax ({taxRate}%)</span>
          <span>{fmt(tax)}</span>
        </div>
        <div className="flex justify-between font-display font-bold text-lg text-[#3a1d0d] pt-1">
          <span>Total</span>
          <span>{fmt(total)}</span>
        </div>
      </div>
      <button
        onClick={onPlaceOrder}
        disabled={cart.length === 0 || isPlacing}
        className="mt-5 w-full py-4 rounded-full bg-[#3a1d0d] text-[#f1c7a9] font-display font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#603318] active:scale-[0.97] active:bg-[#2a1208] transition-all"
        aria-label={cart.length === 0 ? "Cart is empty" : isPlacing ? "Placing order" : "Place order"}
      >
        {isPlacing ? "Placing order…" : "Place order"}
      </button>
    </>
  );
}
