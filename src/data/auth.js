export const USERS_KEY = "caffeine-users";
export const CURRENT_USER_KEY = "caffeine-current-user";

const ADMIN_EMAIL = "admin@caffeine.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Admin";

function getUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn("Failed to save users:", err);
  }
}

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "h" + Math.abs(hash).toString(16);
}

// Seed default admin account on module load
(function seedAdmin() {
  try {
    const users = getUsers();
    const exists = users.find((u) => u.email === ADMIN_EMAIL);
    if (!exists) {
      users.push({
        id: "u-admin",
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashPassword(ADMIN_PASSWORD),
        role: "admin",
        createdAt: new Date().toISOString(),
      });
      saveUsers(users);
    }
  } catch {
    // Silently fail; non-critical
  }
})();

export function registerUser(name, email, password) {
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    return { success: false, error: "Email already registered" };
  }
  if (password.length < 4) {
    return { success: false, error: "Password must be at least 4 characters" };
  }
  const newUser = {
    id: "u" + Date.now().toString(36),
    name,
    email,
    password: hashPassword(password),
    role: "customer",
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return { success: true, user: newUser };
}

export function loginUser(email, password) {
  const users = getUsers();
  const hashed = hashPassword(password);
  const found = users.find((u) => u.email === email && u.password === hashed);
  if (!found) {
    return { success: false, error: "Invalid email or password" };
  }
  const safeUser = { ...found };
  delete safeUser.password;
  return { success: true, user: safeUser };
}

export function saveCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
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
