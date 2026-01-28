const API_HOST = typeof window !== "undefined" ? window.location.hostname : "localhost";
const API_BASE = import.meta.env.VITE_API_BASE || `http://${API_HOST}:8000/api`;

export const getToken = () => localStorage.getItem("admin_token");

export async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Token ${token}`;
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    // Token хүчингүй болсон үед автоматаар logout хийнэ
    if (response.status === 401 && typeof window !== "undefined") {
      try {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_username");
      } catch {
        // ignore storage errors
      }
      // Login хуудас руу буцаана
      window.location.href = "/admin";
    }

    throw new Error(error.detail || "Request failed");
  }
  return response.json();
}
