import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getUser } from "../../lib/auth";
import DashboardCard from "../../components/DashboardCard";
import type { Notice } from "../../types";

export default function Faculty() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const me = getUser();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get<{ items?: Notice[] }>("/notices");
        if (mounted) setNotices(data.items || []);
      } catch (err) {
        console.error("Failed to load notices for faculty", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const myNotices = me ? notices.filter((n) => {
    const cb = n.createdBy;
    const cid = typeof cb === 'string' ? cb : (cb && typeof cb === 'object' ? (cb as { _id?: string })._id : undefined);
    return String(cid) === String(me._id);
  }) : [];
  const recent = myNotices.slice(0, 6);

  async function publishNow(id: string) {
    try {
      await api.post(`/notices/${id}/publish`);
      // refresh notices
      const { data } = await api.get("/notices");
      setNotices(data.items || []);
    } catch (err) {
      console.error("Failed to publish", err);
      alert("Failed to publish notice");
    }
  }

  return (
    <div className="container-max mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
          <p className="text-slate-600 mt-2">Create and manage your department notices.</p>
        </div>
        <div>
          <a className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center' }} href="/create">Create Notice</a>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <DashboardCard title="Your Notices" value={loading ? '—' : myNotices.length} subtitle="Created by you" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="#6366f1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18"/></svg>} accent="#6366f1" />
            <DashboardCard title="Published" value={loading ? '—' : myNotices.filter(m => m.status === 'published').length} subtitle="Visible to audience" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="#10b981" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>} />
            <DashboardCard title="Drafts" value={loading ? '—' : myNotices.filter(m => m.status === 'draft').length} subtitle="Not yet published" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="#f59e0b" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 20h9"/></svg>} />
          </div>
      <section className="mt-6 card p-4">
        <h2 className="text-lg font-medium">Recent your notices</h2>
        {loading && <div className="text-sm text-slate-500 mt-2">Loading…</div>}
        {!loading && recent.length === 0 && <div className="text-sm text-slate-500 mt-2">You don't have any notices yet — create one to notify your students.</div>}
        {!loading && recent.length > 0 && (
          <ul className="mt-3 space-y-2">
            {recent.map((n) => (
              <li key={n._id} className="flex items-start justify-between p-3 border rounded bg-white hover:shadow-sm transition-shadow">
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-slate-500">{n.category} • {n.visibility} • {n.status}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-400">{n.publishAt ? new Date(n.publishAt).toLocaleString() : ''}</div>
                  {n.status === 'draft' && (
                    <button onClick={() => publishNow(n._id)} className="px-2 py-1 text-sm bg-green-600 text-white rounded">Publish</button>
                  )}
                  <a className="px-2 py-1 text-sm border rounded" href={`/notices/${n._id}/edit`}>Edit</a>
                  <AudienceCount noticeId={n._id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function AudienceCount({ noticeId }: { noticeId: string }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/notices/${noticeId}/audience`);
        if (mounted) setCount((data.audience || []).length);
      } catch (err) {
        console.error('Failed to fetch audience for', noticeId, err);
      }
    })();
    return () => { mounted = false };
  }, [noticeId]);
  return (
    <div className="text-sm text-slate-500">Audience: {count === null ? '…' : count}</div>
  );
}
