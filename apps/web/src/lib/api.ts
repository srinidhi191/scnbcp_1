import axios, { type InternalAxiosRequestConfig } from "axios";

const API_URL = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  timeout: 8000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const t = localStorage.getItem("token");
  if (t) {
    // Ensure headers object exists and assign Authorization in a TS-friendly way
    if (!config.headers) config.headers = {} as any;
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${t}`;
  }
  return config;
});

export default api;
