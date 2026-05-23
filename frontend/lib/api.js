import axios from "axios";

/** Use env URL, or Next.js proxy (same origin) when empty */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: { "Content-Type": "application/json" }
});

export function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === "ECONNABORTED") return "Request timed out. Is the backend running?";
  if (error?.message === "Network Error") {
    return "Cannot reach backend. Start it with: cd backend && npm run dev";
  }
  return error?.message || "Something went wrong";
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;