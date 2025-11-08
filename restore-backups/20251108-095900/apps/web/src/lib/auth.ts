import type { User } from "../types";

export function saveAuth(token: string, user: User) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  // notify the app (and other tabs) that auth changed
  try {
    window.dispatchEvent(new CustomEvent("authChanged", { detail: { token, user } }));
  } catch {
    /* ignore in non-browser envs */
  }
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  try {
    window.dispatchEvent(new CustomEvent("authChanged", { detail: { token: null, user: null } }));
  } catch {
    /* ignore in non-browser envs */
  }
  location.href = "/login";
}

export function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? (JSON.parse(raw) as User) : null;
}

export function isAuthed() {
  return !!localStorage.getItem("token");
}
