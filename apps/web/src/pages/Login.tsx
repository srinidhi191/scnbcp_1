import { useState } from "react";
import api from "../lib/api";
import { saveAuth } from "../lib/auth";
import type { AxiosErrorLike, ImportMetaEnvLike } from "../lib/types";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@college.edu");
  const [password, setPassword] = useState("pass");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      // Save auth locally
      saveAuth(data.token, data.user);

      // OPTIONAL: open Gmail after login (new tab)
      if (((import.meta as unknown) as { env?: ImportMetaEnvLike }).env?.VITE_OPEN_GMAIL_AFTER_LOGIN === "true") {
        window.open("https://mail.google.com", "_blank");
      }

      // Redirect based on role
      const role = data.user.roles?.[0] || "student";
      nav(role === "admin" ? "/admin" : role === "faculty" ? "/faculty" : "/student");
    } catch (err: unknown) {
      // Prefer server-provided error, then common message fields, then network/fallback messages
      const e = err as AxiosErrorLike;
  const serverData = (e?.response as unknown) as { data?: unknown };
  const sd = (serverData?.data as unknown) as Record<string, unknown> | undefined;
  const serverMsg = sd?.error as string | undefined || sd?.message as string | undefined;
      const networkMsg = e?.message && !e?.response ? "Unable to reach server" : null;
      setMsg(serverMsg || networkMsg || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="min-h-[80vh] grid place-items-center px-4 auth-background">
      <form onSubmit={onSubmit} className="w-full max-w-md card p-6 space-y-5">
        <h1 className="text-2xl font-semibold text-center">Sign in to your account</h1>

        {msg && (
          <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">
            {msg}
          </div>
        )}

        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input
            id="password"
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-required
          />
        </div>

        <button disabled={loading} className="w-full btn-primary" aria-disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm muted">
          No account? <Link to="/signup" className="text-indigo-600 font-medium">Create one</Link>
        </p>
      </form>
    </div>
  );
}
