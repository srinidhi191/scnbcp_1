import { useState } from "react";
import api from "../lib/api";
import { saveAuth } from "../lib/auth";
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
      if ((import.meta as any).env?.VITE_OPEN_GMAIL_AFTER_LOGIN === "true") {
        window.open("https://mail.google.com", "_blank");
      }

      // Redirect based on role
      const role = data.user.roles?.[0] || "student";
      nav(role === "admin" ? "/admin" : role === "faculty" ? "/faculty" : "/student");
    } catch (err: any) {
      setMsg(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] grid place-items-center">
      <form onSubmit={onSubmit} className="w-[380px] bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">Login</h1>

        {msg && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{msg}</div>}

        <div className="grid gap-2">
          <label className="text-sm">Email</label>
          <input
            className="border rounded-lg px-3 py-2"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm">Password</label>
          <input
            className="border rounded-lg px-3 py-2"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button disabled={loading} className="w-full rounded-lg px-4 py-2 bg-sky-600 text-white">
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm">
          No account? <Link to="/signup" className="text-sky-600">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
