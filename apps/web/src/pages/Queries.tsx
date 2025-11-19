import { useEffect, useState } from "react";
import api from "../lib/api";
import { getUser } from "../lib/auth";

type QueryItem = { _id?: string; subject?: string; message?: string; email?: string; createdAt?: string; role?: string; from?: { email?: string; roles?: string[] } };

export default function Queries() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [items, setItems] = useState<QueryItem[]>([]);

  useEffect(() => {
    const me = getUser();
    const roles = me?.roles || [];
    if (roles.some((r) => ["admin", "faculty"].includes(r))) {
      // fetch queries for admin/faculty
      api.get<{ items?: QueryItem[] }>("/queries").then((res) => setItems(res.data.items || [])).catch(() => {});
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!subject || !message) return setMsg("Subject and message are required");
    setLoading(true);
    try {
      const me = getUser();
      const payload: Record<string, unknown> = { subject, message, from: me?._id, email: me?.email, role: me?.roles?.[0] };
      // try server endpoint if available, otherwise simulate saved locally
      try {
        await api.post("/queries", payload);
        setMsg("Query submitted. We'll get back to you soon.");
      } catch {
        // fallback: save to localStorage as unsent queries
        const pending = JSON.parse(localStorage.getItem("pendingQueries") || "[]");
        pending.push({ ...(payload as Record<string, unknown>), createdAt: new Date().toISOString() });
        localStorage.setItem("pendingQueries", JSON.stringify(pending));
        setMsg("Query saved locally (no server endpoint). It will be sent when available.");
      }
      setSubject("");
      setMessage("");
    } catch {
      setMsg("Failed to submit query");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-max mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Queries & Clarifications</h1>
      <p className="mb-4 text-sm text-slate-600">Use this form to ask questions or request clarification. Your portal admins will be notified.</p>

      {items.length > 0 && (
        <div className="mb-4 card p-4">
          <h2 className="text-lg font-medium mb-2">Recent Queries</h2>
          <div className="space-y-2">
            {items.map((q) => (
              <div key={q._id} className="border-b py-2">
                <div className="text-sm font-medium">{q.subject}</div>
                <div className="text-xs text-slate-500">From: {q.email || q.from?.email || 'unknown'} • Role: {q.role || q.from?.roles?.[0]}</div>
                <div className="mt-1 text-sm">{q.message}</div>
                <div className="text-xs text-slate-400 mt-1">{q.createdAt ? new Date(q.createdAt).toLocaleString() : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 card p-6">
        {msg && <div role="status" className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded p-2">{msg}</div>}
        <input className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
        <textarea className="border rounded-lg px-3 py-2 w-full min-h-[140px] focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Your question or clarification" value={message} onChange={e => setMessage(e.target.value)} required />
        <div className="flex justify-end">
          <button disabled={loading} className="btn-primary" aria-disabled={loading}>{loading ? "Sending…" : "Send Query"}</button>
        </div>
      </form>
    </div>
  );
}
