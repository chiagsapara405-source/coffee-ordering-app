import { fmt } from "../data/menu";

export default function CartRow({ item, onChangeQty }) {
  // Build customization summary string
  const parts = [item.size, item.milk];
  if (item.sugar && item.sugar !== "normal") {
    parts.push(item.sugar === "none" ? "No sugar" : `${item.sugar} sugar`);
  }
  if (item.shots && item.shots !== "single") {
    parts.push(item.shots === "double" ? "Double shot" : "Triple shot");
  }
  if (item.syrup && item.syrup !== "none") {
    parts.push(item.syrup);
  }
  if (item.temp && item.temp === "extra-hot") {
    parts.push("Extra hot");
  }
  if (item.ice && item.ice === "less") {
    parts.push("Less ice");
  } else if (item.ice && item.ice === "none") {
    parts.push("No ice");
  }

  return (
    <div className="flex items-center gap-3">
      <img
        src={item.img}
        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-sm"
        alt={item.name}
      />
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-sm text-[#3a1d0d] truncate">
          {item.name}
        </p>
        <p className="font-mono-text text-[11px] text-secondary truncate">
          {parts.join(" · ")}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => onChangeQty(item.key, -1)}
            className="qty-btn font-display font-bold text-[#3a1d0d] active:text-[#603318]"
            aria-label={`Decrease quantity of ${item.name}`}
          >
            −
          </button>
          <span
            className="font-mono-text text-xs w-4 text-center"
            aria-live="polite"
            aria-atomic="true"
          >
            {item.qty}
          </span>
          <button
            onClick={() => onChangeQty(item.key, 1)}
            className="qty-btn font-display font-bold text-[#3a1d0d] active:text-[#603318]"
            aria-label={`Increase quantity of ${item.name}`}
          >
            +
          </button>
        </div>
      </div>
      <span className="font-mono-text text-sm text-[#3a1d0d] whitespace-nowrap">
        {fmt(item.unitPrice * item.qty)}
      </span>
    </div>
  );
}
