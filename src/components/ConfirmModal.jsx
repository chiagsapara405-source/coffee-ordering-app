import { useEffect, useRef } from "react";
import gsap from "gsap";
import { fmt } from "../data/menu";
import { useFocusTrap } from "../hooks/useFocusTrap";

const CONFETTI_COLORS = ["#e74c3c", "#f39c12", "#2ecc71", "#3498db", "#9b59b6", "#e67e22", "#1abc9c", "#f1c40f"];

function createConfetti(container) {
  const particles = [];
  const count = 40;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const size = 4 + Math.random() * 6;
    const isCircle = Math.random() > 0.5;

    el.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${isCircle ? size : size * 2.5}px;
      background: ${color};
      border-radius: ${isCircle ? "50%" : "2px"};
      top: 50%;
      left: 50%;
      pointer-events: none;
      z-index: 10;
    `;

    container.appendChild(el);
    particles.push(el);
  }

  gsap.to(particles, {
    x: () => (Math.random() - 0.5) * 500,
    y: () => (Math.random() - 0.5) * 500,
    rotation: () => Math.random() * 720 - 360,
    scale: () => 0.2 + Math.random() * 0.8,
    opacity: 0,
    duration: () => 0.8 + Math.random() * 0.8,
    ease: "power3.out",
    delay: () => Math.random() * 0.2,
    onComplete: () => particles.forEach((p) => p.remove()),
  });
}

export default function ConfirmModal({
  isOpen,
  cart,
  total,
  ticketNo,
  onNewOrder,
}) {
  const modalRef = useRef(null);
  const confettiRef = useRef(null);
  const focusTrapRef = useFocusTrap(isOpen);
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.85, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.6)" },
      );
    }

    // Fire confetti once when opened
    if (isOpen && !hasFiredRef.current && confettiRef.current) {
      hasFiredRef.current = true;
      createConfetti(confettiRef.current);
    }
    if (!isOpen) {
      hasFiredRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Order confirmation"
    >
      <div className="modal-overlay absolute inset-0" aria-hidden="true" />
      <div
        ref={(el) => {
          modalRef.current = el;
          focusTrapRef.current = el;
        }}
        className="relative neumorphic rounded-[2.5rem] w-full max-w-sm p-8 text-center overflow-visible"
      >
        <div ref={confettiRef} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true" />
        <div className="text-6xl mb-4 cup-bounce" aria-hidden="true">
          ☕
        </div>
        <h3 className="font-serif italic text-3xl mb-2" style={{ color: "var(--ink)" }}>
          Order placed
        </h3>
        <p className="font-mono-text text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
          We&apos;re pulling your shots now.
        </p>

        <div className="ticket-edge" aria-hidden="true" />
        <div className="rounded-b-none px-5 py-5 text-left font-mono-text text-sm space-y-2" style={{ color: "var(--ink)", backgroundColor: "var(--ticket-bg)" }}>
          <div className="flex justify-between font-bold">
            <span>Ticket #{ticketNo}</span>
            <span>
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="ticket-dash pt-3 mt-1 space-y-1">
            {cart.map((c) => (
              <div key={c.key} className="flex justify-between">
                <span>
                  {c.qty}× {c.name} ({c.size})
                </span>
                <span>{fmt(c.unitPrice * c.qty)}</span>
              </div>
            ))}
          </div>
          <div className="ticket-dash pt-3 mt-1 flex justify-between font-bold text-base">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
        </div>
        <div className="ticket-edge scale-y-[-1]" aria-hidden="true" />

        <button
          onClick={onNewOrder}
          className="mt-6 w-full py-4 rounded-full font-display font-bold transition-colors"
          style={{ backgroundColor: "var(--ink)", color: "var(--bg-color)" }}
        >
          Start a new order
        </button>
      </div>
    </div>
  );
}
