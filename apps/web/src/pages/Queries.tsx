import { useEffect, useState } from "react";
import api from "../lib/api";
import { getUser } from "../lib/auth";

export default function Queries() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [items, setItems] = useState<Array<any>>([]);

  useEffect(() => {
    const me = getUser();
    const roles = me?.roles || [];
    if (roles.some((r: string) => ["admin", "faculty"].includes(r))) {
      // fetch queries for admin/faculty
      api.get("/queries").then((res) => setItems(res.data.items || [])).catch(() => {});
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!subject || !message) return setMsg("Subject and message are required");
    setLoading(true);
    try {
      const me = getUser();
      const payload: any = { subject, message, from: me?._id, email: me?.email, role: me?.roles?.[0] };
      // try server endpoint if available, otherwise simulate saved locally
      try {
        await api.post("/queries", payload);
        setMsg("Query submitted. We'll get back to you soon.");
      } catch (err) {
        // fallback: save to localStorage as unsent queries
        const pending = JSON.parse(localStorage.getItem("pendingQueries" ) || "[]");
        pending.push({ ...payload, createdAt: new Date().toISOString() });
        localStorage.setItem("pendingQueries", JSON.stringify(pending));
        setMsg("Query saved locally (no server endpoint). It will be sent when available.");
      }
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setMsg("Failed to submit query");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Queries & Clarifications</h1>
      <p className="mb-4 text-sm text-slate-600">Use this form to ask questions or request clarification. Your portal admins will be notified.</p>

      {items.length > 0 && (
        <div className="mb-4 bg-white rounded-2xl border shadow-sm p-4">
          <h2 className="text-lg font-medium mb-2">Recent Queries</h2>
          <div className="space-y-2">
            {items.map((q: any) => (
              <div key={q._id} className="border-b py-2">
                <div className="text-sm font-medium">{q.subject}</div>
                <div className="text-xs text-slate-500">From: {q.email || q.from?.email || 'unknown'} • Role: {q.role || q.from?.roles?.[0]}</div>
                <div className="mt-1 text-sm">{q.message}</div>
                <div className="text-xs text-slate-400 mt-1">{new Date(q.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 bg-white rounded-2xl border shadow-sm p-6">
        {msg && <div className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded p-2">{msg}</div>}
        <input className="border rounded-lg px-3 py-2 w-full" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
        <textarea className="border rounded-lg px-3 py-2 w-full min-h-[140px]" placeholder="Your question or clarification" value={message} onChange={e => setMessage(e.target.value)} required />
        <div className="flex justify-end">
          <button disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white">{loading ? "Sending…" : "Send Query"}</button>
        </div>
      </form>
    </div>
  );
}
