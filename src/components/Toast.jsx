import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Toast({ message, action, onDone }) {
  const toastRef = useRef(null);

  useEffect(() => {
    if (!message || !toastRef.current) return;

    const hasAction = !!action;
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => onDone?.(),
    });

    tl.fromTo(
      toastRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
    ).to(toastRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.25,
      delay: hasAction ? 4 : 1.8,
      ease: "power2.in",
    });

    tl.play();

    return () => {
      tl.kill();
    };
  }, [message, action, onDone]);

  if (!message) return null;

  return (
    <div
      ref={toastRef}
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-[#3a1d0d] text-[#f1c7a9] pl-5 pr-${action ? "1" : "5"} py-3 rounded-full font-display font-semibold shadow-lg whitespace-nowrap flex items-center gap-3 ${action ? "" : "pointer-events-none"}`}
    >
      <span>{message}</span>
      {action && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
          }}
          className="bg-[#f1c7a9] text-[#3a1d0d] px-3 py-1.5 rounded-full text-xs font-bold hover:bg-[#e8bf99] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
