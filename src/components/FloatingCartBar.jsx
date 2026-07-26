import { fmt } from "../data/menu";

export default function FloatingCartBar({ count, total, onClick }) {
  if (count <= 0) return null;

  return (
    <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-30 neumorphic rounded-full px-6 py-4 flex items-center justify-between">
      <div className="font-mono-text text-sm text-[#3a1d0d]">
        <span aria-live="polite" aria-atomic="true">
          {count} item{count !== 1 ? "s" : ""} · {fmt(total)}
        </span>
      </div>
      <button
        onClick={onClick}
        className="font-display font-bold text-sm bg-[#3a1d0d] text-[#f1c7a9] px-5 py-2.5 rounded-full active:scale-95 active:bg-[#2a1208] transition-all"
        aria-label={`View cart with ${count} item${count !== 1 ? "s" : ""}`}
      >
        View cart
      </button>
    </div>
  );
}
