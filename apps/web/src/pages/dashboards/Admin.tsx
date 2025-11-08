import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getUser } from "../../lib/auth";

type Notice = any;

export default function Admin() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const user = getUser();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/notices");
        if (mounted) setNotices(data.items || []);
      } catch (err) {
        console.error("Failed to load notices for admin dashboard", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const total = notices.length;
  const published = notices.filter((n) => n.status === "published").length;
  const drafts = notices.filter((n) => n.status === "draft").length;
  const targeted = notices.filter((n) => n.visibility === "targeted").length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-600 mt-2">Manage users and campus-wide notices here.</p>
          {user && <div className="text-sm text-slate-500 mt-1">Signed in as <strong>{user.name || user.email}</strong></div>}
        </div>
        <div className="flex gap-3">
          <a className="px-4 py-2 rounded bg-sky-600 text-white" href="/create">Create Notice</a>
          <a className="px-4 py-2 rounded border" href="/notices">View Notices</a>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="text-sm text-slate-500">Total Notices</div>
          <div className="text-2xl font-semibold">{loading ? "—" : total}</div>
        </div>
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="text-sm text-slate-500">Published</div>
          <div className="text-2xl font-semibold text-green-600">{loading ? "—" : published}</div>
        </div>
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="text-sm text-slate-500">Drafts</div>
          <div className="text-2xl font-semibold text-amber-600">{loading ? "—" : drafts}</div>
        </div>
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="text-sm text-slate-500">Targeted</div>
          <div className="text-2xl font-semibold text-sky-600">{loading ? "—" : targeted}</div>
        </div>
      </div>

      <section className="mt-6 bg-white border rounded-lg p-4">
        <h2 className="text-lg font-medium">Recent notices</h2>
        {loading && <div className="text-sm text-slate-500 mt-2">Loading…</div>}
        {!loading && notices.length === 0 && <div className="text-sm text-slate-500 mt-2">No notices yet. Create one to get started.</div>}
        {!loading && notices.length > 0 && (
          <ul className="mt-3 space-y-2">
            {notices.slice(0, 8).map((n: Notice) => (
              <li key={n._id} className="flex items-start justify-between p-3 border rounded">
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-slate-500">{n.category} • {n.visibility} • {n.status}</div>
                </div>
                <div className="text-sm text-slate-400">{n.publishAt ? new Date(n.publishAt).toLocaleString() : ''}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
