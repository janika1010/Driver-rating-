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
    throw new Error(error.detail || "Request failed");
  }
  return response.json();
}
