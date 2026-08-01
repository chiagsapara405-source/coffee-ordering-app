import { api } from "../api/client.js";

const DEFAULT_SETTINGS = {
  storeName: "Caffeine",
  openingHours: "8:00 AM – 10:00 PM",
  taxRate: 5,
  currency: "INR (₹)",
};

export async function fetchSettings() {
  try {
    return await api.get("/api/settings");
  } catch (err) {
    console.warn("Falling back to default store settings:", err);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(updates) {
  return api.put("/api/settings", updates);
}
