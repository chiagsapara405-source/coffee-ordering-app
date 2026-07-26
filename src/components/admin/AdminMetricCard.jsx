import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function AdminMetricCard({ title, value, subtitle, trend, icon, color, delay = 0 }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current, {
        y: 20,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        delay,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });
    }, cardRef);

    return () => ctx.revert();
  }, [delay]);

  const isUp = trend?.startsWith("+");
  const trendColor = isUp ? "#2ecc71" : "#e74c3c";

  return (
    <div
      ref={cardRef}
      className="neumorphic rounded-[1.5rem] p-5 flex flex-col gap-2 min-h-[132px]"
    >
      <div className="flex items-center justify-between">
        <span
          className="font-mono-text text-[10px] uppercase tracking-wider font-semibold"
          style={{ color: "var(--ink-soft)" }}
        >
          {title}
        </span>
        {icon && (
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
            style={{
              backgroundColor: color ? `${color}18` : "var(--shadow-dark)",
              color: color || "var(--ink-soft)",
            }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span
          className="font-display text-3xl font-bold tracking-tight"
          style={{ color: "var(--ink)" }}
        >
          {value}
        </span>
        {trend && (
          <span
            className="font-mono-text text-[11px] font-semibold flex items-center gap-0.5"
            style={{ color: trendColor }}
          >
            <span>{isUp ? "Up" : "Down"}</span>
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p
          className="font-mono-text text-[10px] mt-0.5"
          style={{ color: "var(--ink-soft)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

