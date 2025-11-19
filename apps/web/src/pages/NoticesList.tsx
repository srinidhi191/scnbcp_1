import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
      } catch (err: unknown) {
        const e = err as unknown as { response?: { data?: unknown }; message?: string };
        console.warn("Failed to load notices:", e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="container-max mx-auto p-6">Loading…</div>;

  return (
    <div className="container-max mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Notices</h1>
      {notices.length === 0 ? (
        <div className="text-slate-600">No notices yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {notices.map(n => (
            <Link key={n._id} to={`/notices/${n._id}`} className="card p-5 hover:shadow-lg transition">
              <h3 className="font-semibold">{n.title}</h3>
              <p className="text-slate-600 mt-1 line-clamp-3">{n.body}</p>
              <div className="mt-3 text-xs text-slate-500">{n.category ?? "General"} · {n.visibility ?? "public"} · {n.status ?? "draft"}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
