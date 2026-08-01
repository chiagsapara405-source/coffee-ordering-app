export const MENU = [
  {
    id: "cappuccino",
    name: "Cappuccino",
    price: 220,
    cat: "hot",
    img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80",
    note: "Espresso, steamed milk, thick foam",
    dietary: [],
  },
  {
    id: "americano",
    name: "Americano",
    price: 180,
    cat: "hot",
    img: "https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&w=500&q=80",
    note: "Double shot, hot water, bright finish",
    dietary: ["vegan", "dairy-free"],
  },
  {
    id: "espresso",
    name: "Espresso",
    price: 160,
    cat: "hot",
    img: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=500&q=80",
    note: "Single origin, pulled to order",
    dietary: ["vegan", "dairy-free"],
  },
  {
    id: "latte",
    name: "Vanilla Latte",
    price: 210,
    cat: "hot",
    img: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?auto=format&fit=crop&w=500&q=80",
    note: "Silky milk, house vanilla syrup",
    dietary: [],
  },
  {
    id: "flatwhite",
    name: "Flat White",
    price: 230,
    cat: "hot",
    img: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=500&q=80",
    note: "Double ristretto, microfoam",
    dietary: [],
  },
  {
    id: "coldbrew",
    name: "Cold Brew",
    price: 190,
    cat: "iced",
    img: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=500&q=80",
    note: "Steeped 18 hours, served over ice",
    dietary: ["vegan", "dairy-free"],
  },
  {
    id: "icedlatte",
    name: "Iced Latte",
    price: 210,
    cat: "iced",
    img: "https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=500&q=80",
    note: "Chilled espresso, cold milk, ice",
    dietary: [],
  },
  {
    id: "mocha",
    name: "Iced Mocha",
    price: 240,
    cat: "iced",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ50FIUEke4G1KmlYFayyh5VWMXR7btXTMuEmlTZV6IsA&s=10",
    note: "Dark cocoa, espresso, cold milk",
    dietary: [],
  },
  {
    id: "caramel",
    name: "Caramel Macchiato",
    price: 250,
    cat: "iced",
    img: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=500&q=80",
    note: "Vanilla, milk, espresso, caramel drizzle",
    dietary: [],
  },
  {
    id: "strawberry",
    name: "Strawberry Refresher",
    price: 250,
    cat: "specialty",
    img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=80",
    note: "Muddled strawberry, soda, mint",
    dietary: ["vegan", "dairy-free", "gluten-free"],
  },
  {
    id: "matcha",
    name: "Matcha Latte",
    price: 230,
    cat: "specialty",
    img: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=500&q=80",
    note: "Ceremonial matcha, oat milk option",
    dietary: ["gluten-free"],
  },
];

export const DIETARY_FILTERS = [
  { id: "vegan", label: "Vegan", emoji: "🌱" },
  { id: "dairy-free", label: "Dairy-Free", emoji: "🧊" },
  { id: "gluten-free", label: "Gluten-Free", emoji: "🌾" },
];

export const SIZES = [
  { id: "s", label: "S", mult: 0.9 },
  { id: "m", label: "M", mult: 1 },
  { id: "l", label: "L", mult: 1.15 },
];

export const MILKS = [
  { id: "whole", label: "Whole", extra: 0 },
  { id: "oat", label: "Oat", extra: 20 },
  { id: "almond", label: "Almond", extra: 20 },
  { id: "skim", label: "Skim", extra: 0 },
];

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "hot", label: "Hot Coffee" },
  { id: "iced", label: "Iced & Cold" },
  { id: "specialty", label: "Specialty" },
];

export const SUGAR_LEVELS = [
  { id: "none", label: "None" },
  { id: "less", label: "Less" },
  { id: "normal", label: "Normal" },
  { id: "extra", label: "Extra" },
];

export const SHOTS = [
  { id: "single", label: "Single", extra: 0 },
  { id: "double", label: "Double", extra: 30 },
  { id: "triple", label: "Triple", extra: 60 },
];

export const SYRUPS = [
  { id: "none", label: "None", extra: 0 },
  { id: "vanilla", label: "Vanilla", extra: 15 },
  { id: "caramel", label: "Caramel", extra: 15 },
  { id: "hazelnut", label: "Hazelnut", extra: 15 },
  { id: "peppermint", label: "Peppermint", extra: 20 },
];

export const TEMPS = [
  { id: "regular", label: "Regular" },
  { id: "extra-hot", label: "Extra Hot" },
];

export const ICE_LEVELS = [
  { id: "regular", label: "Regular" },
  { id: "less", label: "Less Ice" },
  { id: "none", label: "No Ice" },
];

/** Drinks that can have extra shots (coffee/espresso based) */
export const COFFEE_DRINKS = [
  "cappuccino",
  "americano",
  "espresso",
  "latte",
  "flatwhite",
  "coldbrew",
  "icedlatte",
  "mocha",
  "caramel",
];

export const CART_STORAGE_KEY = "caffeine-cart";
export const PREFERENCES_KEY = "caffeine-preferences";
export const ORDER_HISTORY_KEY = "caffeine-order-history";
export const THEME_KEY = "caffeine-theme";
export const LOYALTY_KEY = "caffeine-loyalty";
export const FAVORITES_KEY = "caffeine-favorites";

export const fmt = (n) => "₹" + Math.round(n);

import { api } from "../api/client.js";

/** Normalize a server menu item into the frontend shape (id = itemId || _id) */
export function normalizeMenuItem(item) {
  return {
    ...item,
    id: item.itemId || item._id,
  };
}

export async function fetchMenuItems() {
  try {
    const items = await api.get("/api/menu");
    return items.map(normalizeMenuItem);
  } catch (err) {
    console.warn("Falling back to local menu static data:", err);
    return MENU;
  }
}

export async function fetchAllMenuItems() {
  const items = await api.get("/api/menu/all");
  return items.map(normalizeMenuItem);
}

export async function createMenuItem(data) {
  const item = await api.post("/api/menu", data);
  return normalizeMenuItem(item);
}

export async function updateMenuItem(id, data) {
  const item = await api.put(`/api/menu/${id}`, data);
  return normalizeMenuItem(item);
}

export async function deleteMenuItem(id) {
  return api.delete(`/api/menu/${id}`);
}

export async function createOrder(orderData) {
  try {
    return await api.post("/api/orders", orderData);
  } catch (err) {
    console.error("Order creation failed:", err);
    throw err;
  }
}

export async function fetchMyOrders() {
  const data = await api.get("/api/orders/my?limit=20");
  return data.orders || [];
}

