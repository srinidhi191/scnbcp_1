import { useState } from "react";
import api from "../lib/api";
import { saveAuth } from "../lib/auth";
import type { AxiosErrorLike, ImportMetaEnvLike } from "../lib/types";
import { useNavigate, Link } from "react-router-dom";

type Role = "student" | "faculty" | "admin";

export default function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const { data } = await api.post("/auth/register", { name, email, password, role });
      // Save auth locally
      saveAuth(data.token, data.user);

      // OPTIONAL: open Gmail after signup (new tab)
      if (((import.meta as unknown) as { env?: ImportMetaEnvLike }).env?.VITE_OPEN_GMAIL_AFTER_LOGIN === "true") {
        window.open("https://mail.google.com", "_blank");
      }

      // Redirect based on role
      const r = data.user.roles?.[0] || "student";
      nav(r === "admin" ? "/admin" : r === "faculty" ? "/faculty" : "/student");
    } catch (err: unknown) {
      const e = err as AxiosErrorLike;
  const serverData = (e?.response as unknown) as { data?: unknown };
  const sd = (serverData?.data as unknown) as Record<string, unknown> | undefined;
  const serverMsg = sd?.error as string | undefined || sd?.message as string | undefined;
      const networkMsg = e?.message && !e?.response ? "Unable to reach server" : null;
      setMsg(serverMsg || networkMsg || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="min-h-[80vh] grid place-items-center px-4 auth-background">
      <form onSubmit={onSubmit} className="w-full max-w-md card p-6 space-y-5">
        <h1 className="text-2xl font-semibold text-center">Create an account</h1>

        {msg && (
          <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">
            {msg}
          </div>
        )}

        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-medium">Full name</label>
          <input
            id="name"
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            aria-required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="role" className="text-sm font-medium">Role</label>
          <select
            id="role"
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={role}
            onChange={e => setRole(e.target.value as Role)}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
        </div>

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
          {loading ? "Creating…" : "Create account"}
        </button>

        <p className="text-center text-sm muted">
          Already have an account? <Link to="/login" className="text-indigo-600 font-medium">Login</Link>
        </p>
      </form>
    </div>
  );
}
