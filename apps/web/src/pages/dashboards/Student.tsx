import { useEffect, useState } from "react";
import api from "../../lib/api";
import { getUser } from "../../lib/auth";

export default function Student() {
  const [notices, setNotices] = useState<any[]>([]);
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
          const a = await api.get('/notices/acks');
          const map: Record<string, boolean> = {};
          (a.data.acks || []).forEach((row: any) => {
            if (row.acknowledged || row.viewedAt) map[String(row.noticeId)] = true;
          });
          if (mounted) setAcked(map);
        } catch (e) {
          // ignore if endpoint not available or error
          // console.error('failed to load acks', e);
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

  const unreadCount = notices.filter((n) => !acked[n._id]).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
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

      <section className="mt-6 bg-white border rounded-lg p-4">
        <h2 className="text-lg font-medium">Latest notices</h2>
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">{loading ? '...' : `${notices.length} published notices`}</div>
          <div className="text-sm font-medium text-sky-600">Unread: {loading ? '—' : unreadCount}</div>
        </div>
        {loading && <div className="text-sm text-slate-500 mt-2">Loading…</div>}
        {!loading && notices.length === 0 && <div className="text-sm text-slate-500 mt-2">No recent notices. Check back later or contact your faculty.</div>}
        {!loading && notices.length > 0 && (
          <ul className="mt-3 space-y-2">
            {notices.slice(0, 8).map((n) => (
              <li key={n._id} className={`p-3 border rounded hover:shadow-sm flex items-start justify-between ${acked[n._id] ? 'bg-gray-50' : 'bg-white'}`}>
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-slate-500">{n.category} • {n.visibility}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-400">{n.publishAt ? new Date(n.publishAt).toLocaleDateString() : ''}</div>
                  {!acked[n._id] && (
                    <button onClick={() => acknowledge(n._id)} className="px-2 py-1 text-sm bg-sky-600 text-white rounded">Mark read</button>
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
