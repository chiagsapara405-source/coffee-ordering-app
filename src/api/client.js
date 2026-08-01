const getAuthHeaders = () => {
  const token = localStorage.getItem("caffeine-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleUnauthorized = (response) => {
  if (response.status === 401) {
    localStorage.removeItem("caffeine-token");
    localStorage.removeItem("caffeine-current-user");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
};

// Convert a failed response into a user-safe Error — never surface raw server
// internals, stack traces, or network-level details to the UI.
const toSafeError = async (res) => {
  let message = "Request failed";
  try {
    const body = await res.json();
    if (body && typeof body.error === "string" && body.error.trim()) {
      message = body.error.trim();
    }
  } catch {
    // Non-JSON response body — keep the generic message
  }
  return new Error(message);
};

const request = async (method, url, body) => {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    // Network-level failure (server unreachable, offline, etc.)
    throw new Error("Network error. Please check your connection and try again.");
  }

  if (!res.ok) {
    handleUnauthorized(res);
    throw await toSafeError(res);
  }
  return res.json();
};

export const api = {
  get: (url) => request("GET", url),
  post: (url, body) => request("POST", url, body),
  put: (url, body) => request("PUT", url, body),
  delete: (url) => request("DELETE", url),
};
