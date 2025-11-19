import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getUser } from "../../lib/auth";
import DashboardCard from "../../components/DashboardCard";
import type { Notice } from "../../types";

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

  // build a small sparkline from the last 14 days using publishAt or createdAt
  function sparklineData(items: Notice[], days = 14) {
    const counts: number[] = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    for (let i = days - 1; i >= 0; i--) {
      const start = new Date(now - i * dayMs);
      const end = new Date(now - (i - 1) * dayMs);
      const c = items.filter((n) => {
        const raw = (n.publishAt ?? n.createdAt) as string | number | Date | undefined;
        if (!raw) return false;
        const d = new Date(raw as string | number | Date);
        return d >= start && d < end;
      }).length;
      counts.push(c);
    }
    return counts;
  }

  function Sparkline({ items }: { items: Notice[] }) {
    const data = sparklineData(items, 14);
    const max = Math.max(...data, 1);
    const w = 120;
    const h = 28;
    const step = w / (data.length - 1);
    const points = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
        <polyline fill="none" stroke="#6366f1" strokeWidth={2} points={points} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <div className="container-max mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-600 mt-2">Manage users and campus-wide notices here.</p>
          {user && <div className="text-sm text-slate-500 mt-1">Signed in as <strong>{user.name || user.email}</strong></div>}
        </div>
        <div className="flex gap-3">
          <a className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center' }} href="/create">Create Notice</a>
          <a className="px-4 py-2 rounded border" href="/notices">View Notices</a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <DashboardCard title="Total Notices" value={loading ? '—' : total} subtitle="All notices in the system" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}><path stroke="#6366f1" strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M8.757 15.243l-2.121 2.121m12.728 0l-2.121-2.121M8.757 8.757L6.636 6.636"/></svg>} accent="#6366f1">
          <div className="mt-2"><Sparkline items={notices} /></div>
        </DashboardCard>
        <DashboardCard title="Published" value={loading ? '—' : published} subtitle="Live notices" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="#10b981" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M5 12l4 4L19 6"/></svg>}>
          <div className="text-green-600 font-semibold">{loading ? '—' : published}</div>
        </DashboardCard>
        <DashboardCard title="Drafts" value={loading ? '—' : drafts} subtitle="Work in progress" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="#f59e0b" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 20h9"/></svg>}>
          <div className="text-amber-600 font-semibold">{loading ? '—' : drafts}</div>
        </DashboardCard>
        <DashboardCard title="Targeted" value={loading ? '—' : targeted} subtitle="Notices sent to specific audiences" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="#6366f1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7z"/></svg>}>
          <div className="text-sky-600 font-semibold">{loading ? '—' : targeted}</div>
        </DashboardCard>
      </div>

      <section className="mt-6 card p-4">
        <h2 className="text-lg font-medium">Recent notices</h2>
        {loading && <div className="text-sm text-slate-500 mt-2">Loading…</div>}
        {!loading && notices.length === 0 && <div className="text-sm text-slate-500 mt-2">No notices yet. Create one to get started.</div>}
        {!loading && notices.length > 0 && (
          <ul className="mt-3 space-y-2">
            {notices.slice(0, 8).map((n: Notice) => (
              <li key={String(n._id)} className="flex items-start justify-between p-3 border rounded bg-white hover:shadow-sm transition-shadow">
                <div>
                      <div className="font-semibold">{n.title}</div>
                      <div className="text-sm text-slate-500">{n.category} • {n.visibility} • {n.status}</div>
                </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-slate-400">{n.publishAt ? new Date(n.publishAt as string | number | Date).toLocaleString() : ''}</div>
                      <a className="px-2 py-1 text-sm border rounded" href={`/notices/${n._id}/edit`}>Edit</a>
                    </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
