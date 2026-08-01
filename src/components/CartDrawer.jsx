import { useEffect, useRef } from "react";
import gsap from "gsap";
import CartContent from "./CartContent";

export default function CartDrawer({
  isOpen,
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
  pickupTime,
  onPickupTimeChange,
  onClose,
  taxRate,
  isPlacing,
}) {
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!drawerRef.current || !overlayRef.current) return;

    // Set initial hidden state on first mount only
    if (!initializedRef.current) {
      initializedRef.current = true;
      gsap.set(drawerRef.current, { yPercent: 100 });
      gsap.set(overlayRef.current, { opacity: 0, display: "none" });
    }

    if (isOpen) {
      gsap.set(overlayRef.current, { display: "block" });
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power3.out",
      });
      gsap.to(drawerRef.current, {
        yPercent: 0,
        duration: 0.4,
        ease: "power4.out",
      });
    } else {
      gsap.to(drawerRef.current, {
        yPercent: 100,
        duration: 0.3,
        ease: "power3.in",
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: "power3.in",
        onComplete: () => {
          gsap.set(overlayRef.current, { display: "none" });
        },
      });
    }
  }, [isOpen]);

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <div
        ref={drawerRef}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[2.5rem] shadow-2xl px-6 pt-6 pb-8 max-h-[85vh] flex flex-col lg:hidden"
        style={{ backgroundColor: "var(--bg-color)" }}
        role="dialog"
        aria-modal={isOpen}
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
      >
        <div
          className="w-12 h-1.5 bg-[#3a1d0d]/20 rounded-full mx-auto mb-5"
          aria-hidden="true"
        />
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-2xl font-bold" style={{ color: "var(--ink)" }}>
            Your order
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full neumorphic-sm flex items-center justify-center active:scale-90"
            aria-label="Close cart"
            style={{ color: "var(--ink)" }}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <CartContent
            cart={cart}
            subtotal={subtotal}
            tax={tax}
            total={total}
            ticketNo={ticketNo}
            onChangeQty={onChangeQty}
            onPlaceOrder={onPlaceOrder}
            onReorder={onReorder}
            hasLastOrder={hasLastOrder}
            orderCount={orderCount}
            pickupTime={pickupTime}
            onPickupTimeChange={onPickupTimeChange}
            taxRate={taxRate}
            isPlacing={isPlacing}
          />
        </div>
      </div>
    </>
  );
}
