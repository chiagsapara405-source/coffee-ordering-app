

import { api } from "../api/client.js";

export const TOKEN_KEY = "caffeine-token";
export const CURRENT_USER_KEY = "caffeine-current-user";

export async function registerUser(name, email, password) {
  try {
    const data = await api.post("/api/auth/register", { name, email, password });
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      saveCurrentUser(data.user);
    }
    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function loginUser(email, password) {
  try {
    const data = await api.post("/api/auth/login", { email, password });
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      saveCurrentUser(data.user);
    }
    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function saveCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.warn("Failed to save current user:", err);
  }
}

export function getCurrentUser() {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function logoutUser() {
  saveCurrentUser(null);
}

export function isAdminUser() {
  const user = getCurrentUser();
  return user?.role === "admin";
}

/** Loyalty progress (0–9) derived from the server-authoritative user object */
export function getStampsProgress(user) {
  if (!user) return 0;
  if (typeof user.stampsProgress === "number") return user.stampsProgress;
  if (typeof user.stamps === "number") return user.stamps % 10;
  return 0;
}

/** Re-sync current user from the server (refreshes role/stamps/favorites) */
export async function refreshCurrentUser() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const data = await api.get("/api/auth/me");
    saveCurrentUser(data.user);
    return data.user;
  } catch {
    // Token invalid/expired — the api client already cleared storage + redirected
    return null;
  }
}

/** Replace the user's favorites on the server (returns { success, favorites? }) */
export async function updateFavorites(favorites) {
  try {
    const data = await api.put("/api/auth/me/favorites", { favorites });
    return { success: true, favorites: data.favorites };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function fetchAdminStats() {
  try {
    return await api.get("/api/auth/admin/stats");
  } catch {
    return { totalUsers: 0, admins: 0 };
  }
}

