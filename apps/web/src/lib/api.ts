import axios, { type InternalAxiosRequestConfig } from "axios";

// Use 127.0.0.1 by default to avoid potential IPv6/localhost resolution issues
const API_URL = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL || "http://127.0.0.1:4000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  timeout: 8000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const t = localStorage.getItem("token");
  if (t) {
    // Ensure headers object exists and assign Authorization. Use a shallow copy and a safe cast
    // because AxiosRequestHeaders may be an AxiosHeaders instance in newer axios versions.
  if (!config.headers) config.headers = {} as unknown as InternalAxiosRequestConfig["headers"];
    // Use a plain object for headers and then cast to the Axios headers type without using `any`.
    const headersObj = Object.assign({}, config.headers) as Record<string, string | number | boolean>;
    headersObj["Authorization"] = `Bearer ${t}`;
    config.headers = headersObj as unknown as InternalAxiosRequestConfig["headers"];
  }
  return config;
});

export default api;
