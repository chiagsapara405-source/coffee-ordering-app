import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { fetchMyOrders, fmt } from "../data/menu";
import { useFocusTrap } from "../hooks/useFocusTrap";

const STATUS_LABELS = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

function StatusDot({ status }) {
  const colors = {
    pending: "#f39c12",
    preparing: "#3498db",
    ready: "#9b59b6",
    completed: "#2ecc71",
    cancelled: "#e74c3c",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono-text text-[10px] font-semibold px-2.5 py-1 rounded-full"
      style={{
        backgroundColor: `${colors[status] || "#999"}1c`,
        color: colors[status] || "#999",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: colors[status] || "#999" }}
        aria-hidden="true"
      />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// Mounted only while open (parent conditionally renders), so state resets per open.
export default function OrderHistoryModal({ onClose, onReorder }) {
  const [orders, setOrders] = useState(null); // null = loading
  const [error, setError] = useState("");
  const modalRef = useRef(null);
  const focusTrapRef = useFocusTrap(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMyOrders();
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load your orders");
      }
    })();
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
      );
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const loading = orders === null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Order history"
    >
      <div className="modal-overlay absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        ref={(el) => {
          modalRef.current = el;
          focusTrapRef.current = el;
        }}
        className="relative neumorphic rounded-[2rem] w-full max-w-md p-7 max-h-[80vh] flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full neumorphic-sm flex items-center justify-center text-sm active:scale-90"
          aria-label="Close order history"
          style={{ color: "var(--ink)" }}
        >
          ✕
        </button>

        <h2
          className="font-display text-2xl font-bold mb-1"
          style={{ color: "var(--ink)" }}
        >
          Your orders
        </h2>
        <p
          className="font-mono-text text-xs mb-5"
          style={{ color: "var(--ink-soft)" }}
        >
          Past orders from your account
        </p>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-[120px]">
          {loading && (
            <p className="text-center py-10 font-mono-text text-xs" style={{ color: "var(--ink-soft)" }}>
              Loading your orders…
            </p>
          )}

          {!loading && error && (
            <p className="text-center py-10 font-mono-text text-xs" style={{ color: "#e74c3c" }} role="alert">
              {error}
            </p>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <div className="text-4xl opacity-40" aria-hidden="true">🧾</div>
              <p className="font-display font-semibold text-sm" style={{ color: "var(--ink-soft)" }}>
                No orders yet
              </p>
              <p className="font-mono-text text-xs" style={{ color: "var(--ink-soft)" }}>
                Your placed orders will show up here
              </p>
            </div>
          )}

          {!loading && !error &&
            orders.map((order) => (
              <div key={order._id} className="neumorphic-sm rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-text text-xs font-bold" style={{ color: "var(--ink)" }}>
                    Ticket #{order.ticketNo}
                  </span>
                  <StatusDot status={order.status} />
                </div>
                <p className="font-mono-text text-[10px] mb-2" style={{ color: "var(--ink-soft)" }}>
                  {new Date(order.createdAt).toLocaleString([], {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" · "}
                  {order.pickupTime === "asap"
                    ? "ASAP"
                    : order.pickupTime === "15min"
                      ? "15 min"
                      : order.pickupTime === "30min"
                        ? "30 min"
                        : "1 hour"}
                </p>
                <div className="ticket-dash pt-2 mb-2 space-y-1">
                  {order.items.map((it, i) => (
                    <div key={i} className="flex justify-between font-mono-text text-[11px]" style={{ color: "var(--ink-soft)" }}>
                      <span>
                        {it.qty}× {it.name} ({it.size})
                      </span>
                      <span>{fmt(it.unitPrice * it.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-mono-text text-sm font-bold" style={{ color: "var(--ink)" }}>
                    {fmt(order.totalPrice)}
                  </span>
                  <button
                    onClick={() => onReorder(order)}
                    className="neumorphic-sm px-4 py-2 rounded-full font-display font-semibold text-xs active:scale-95 transition-transform"
                    style={{ color: "var(--ink)" }}
                  >
                    ↩ Reorder
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
