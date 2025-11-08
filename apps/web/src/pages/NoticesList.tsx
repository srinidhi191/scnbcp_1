import { useEffect, useState } from "react";
import api from "../lib/api";

type Notice = {
  _id: string;
  title: string;
  body: string;
  category?: string;
  visibility?: string;
  status?: string;
  createdAt?: string;
};

export default function NoticesList() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/notices"); // requires backend route
        setNotices(data.items ?? data ?? []);
      } catch (e: any) {
        console.warn("Failed to load notices:", e?.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="max-w-6xl mx-auto p-6">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Notices</h1>
      {notices.length === 0 ? (
        <div className="text-slate-600">No notices yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {notices.map(n => (
            <div key={n._id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="font-semibold">{n.title}</h3>
              <p className="text-slate-600 mt-1">{n.body}</p>
              <div className="mt-3 text-xs text-slate-500">
                {n.category ?? "General"} · {n.visibility ?? "public"} · {n.status ?? "draft"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
