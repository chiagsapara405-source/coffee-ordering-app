export const SIZES = {
  s: { label: "S", mult: 0.9 },
  m: { label: "M", mult: 1.0 },
  l: { label: "L", mult: 1.15 },
};

export const MILKS = {
  whole: { label: "Whole", extra: 0 },
  oat: { label: "Oat", extra: 20 },
  almond: { label: "Almond", extra: 20 },
  skim: { label: "Skim", extra: 0 },
};

export const SHOTS = {
  single: { label: "Single", extra: 0 },
  double: { label: "Double", extra: 30 },
  triple: { label: "Triple", extra: 60 },
};

export const SYRUPS = {
  none: { label: "None", extra: 0 },
  vanilla: { label: "Vanilla", extra: 15 },
  caramel: { label: "Caramel", extra: 15 },
  hazelnut: { label: "Hazelnut", extra: 15 },
  peppermint: { label: "Peppermint", extra: 20 },
};

export const PICKUP_TIMES = ["asap", "15min", "30min", "1hour"];

export function calculateItemUnitPrice(basePrice, options = {}) {
  const sizeKey = (options.size || "m").toLowerCase();
  const milkKey = (options.milk || "whole").toLowerCase();
  const shotKey = (options.shots || "single").toLowerCase();
  const syrupKey = (options.syrup || "none").toLowerCase();

  const size = SIZES[sizeKey] || SIZES["m"];
  const milk = MILKS[milkKey] || MILKS["whole"];
  const shot = SHOTS[shotKey] || SHOTS["single"];
  const syrup = SYRUPS[syrupKey] || SYRUPS["none"];

  const unitPrice = basePrice * size.mult + milk.extra + shot.extra + syrup.extra;
  return Math.round(unitPrice);
}
