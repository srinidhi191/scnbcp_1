import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getUser } from "../../lib/auth";
import DashboardCard from "../../components/DashboardCard";
import type { Notice } from "../../types";

export default function Student() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const me = getUser();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // show published notices primarily
        const { data } = await api.get("/notices?status=published");
        if (mounted) setNotices(data.items || []);
        // fetch persisted acks for this user to initialize acked state
        try {
          const { data } = await api.get<{ acks?: Array<{ noticeId?: string; acknowledged?: boolean; viewedAt?: string }> }>('/notices/acks');
          const map: Record<string, boolean> = {};
          (data.acks || []).forEach((row) => {
            const noticeId = row.noticeId;
            const acknowledged = row.acknowledged;
            const viewedAt = row.viewedAt;
            if (acknowledged || viewedAt) map[String(noticeId)] = true;
          });
          if (mounted) setAcked(map);
        } catch {
          // ignore if endpoint not available or error
        }
      } catch (err) {
        console.error("Failed to load notices for student", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  // local ack state (optimistic). We don't have an endpoint to list acks, so track locally per-session.
  const [acked, setAcked] = useState<Record<string, boolean>>({});

  async function acknowledge(id: string) {
    try {
      await api.post(`/notices/${id}/ack`);
      setAcked((s) => ({ ...s, [id]: true }));
    } catch (err) {
      console.error('Ack failed', err);
      alert('Failed to mark as read');
    }
  }

  const unreadCount = notices.filter((n) => !acked[String(n._id)]).length;

  return (
    <div className="container-max mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-slate-600 mt-2">View notices relevant to your courses and campus events.</p>
          {me && <div className="text-sm text-slate-500 mt-1">Welcome, <strong>{me.name || me.email}</strong></div>}
        </div>
        <div>
          <a className="px-4 py-2 rounded border" href="/notices">All Notices</a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <DashboardCard title="Published notices" value={loading ? '—' : notices.length} subtitle="Latest visible to you" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="#6366f1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 12h8M8 17h8"/></svg>} accent="#6366f1" />
        <DashboardCard title="Unread" value={loading ? '—' : unreadCount} subtitle="Not yet marked read" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="#ef4444" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"/></svg>} />
        <DashboardCard title="Quick actions" value={<a className="text-indigo-600" href="/notices">Browse</a>} subtitle="Open notices or queries" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path stroke="#6366f1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M3 12h18"/></svg>} />
      </div>

      <section className="mt-6 card p-4">
        <h2 className="text-lg font-medium">Latest notices</h2>
        {loading && <div className="text-sm text-slate-500 mt-2">Loading…</div>}
        {!loading && notices.length === 0 && <div className="text-sm text-slate-500 mt-2">No recent notices. Check back later or contact your faculty.</div>}
        {!loading && notices.length > 0 && (
          <ul className="mt-3 space-y-2">
            {notices.slice(0, 8).map((n) => (
              <li key={String(n._id)} className={`p-3 border rounded hover:shadow-sm flex items-start justify-between ${acked[String(n._id)] ? 'bg-gray-50' : 'bg-white'}`}>
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-slate-500">{n.category} • {n.visibility}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-400">{n.publishAt ? new Date(n.publishAt as string | number | Date).toLocaleDateString() : ''}</div>
                  {!acked[String(n._id)] && (
                    <button onClick={() => acknowledge(String(n._id))} className="px-2 py-1 text-sm text-white rounded" style={{ backgroundColor: '#6366f1' }}>Mark read</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium">Quick actions</h3>
          <div className="mt-3 space-y-2">
            <a className="block px-3 py-2 bg-slate-100 rounded" href="/notices">Browse all notices</a>
            <a className="block px-3 py-2 bg-slate-100 rounded" href="/queries">Ask a question</a>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium">Tips</h3>
          <ul className="mt-2 text-sm text-slate-600 list-disc list-inside">
            <li>Click a notice title to read full details and attachments.</li>
            <li>Use the Queries page to ask faculty directly about courses or events.</li>
            <li>Enable notifications in your profile to get realtime updates.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
