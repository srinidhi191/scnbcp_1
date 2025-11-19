import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { getUser } from "../lib/auth";
import type { AxiosErrorLike } from "../lib/types";

type Notice = {
  _id?: string;
  title?: string;
  body?: string;
  publishAt?: string | number | Date;
  createdAt?: string | number | Date;
  category?: string;
  visibility?: string;
  status?: string;
};

export default function NoticeDetail() {
  const { id } = useParams();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [audience, setAudience] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const user = getUser();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const { data: noticeData } = await api.get(`/notices/${id}`);
        setNotice(noticeData.notice ?? noticeData);
      } catch (err: unknown) {
        const e = err as AxiosErrorLike;
        const resp = (e?.response as unknown) as { data?: unknown };
        console.warn("Failed to fetch notice:", resp?.data || e?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await api.get<{ audience?: Array<Record<string, unknown>> }>(`/notices/${id}/audience`);
        setAudience(data.audience ?? []);
      } catch {
        // non-fatal
      }
    })();
  }, [id]);

  const submitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { subject: subject.trim(), message: message.trim(), noticeId: id };
      await api.post("/queries", payload);
      // simple success feedback
      setSubject("");
      setMessage("");
      alert("Query submitted. The relevant staff will review it.");
    } catch (err: unknown) {
      const e = err as AxiosErrorLike;
      const resp = (e?.response as unknown) as { data?: { error?: string } };
      console.error("Failed to submit query", resp?.data || e?.message);
      alert("Failed to submit query: " + (resp?.data?.error || e?.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-6">Loading…</div>;
  if (!notice) return <div className="max-w-4xl mx-auto p-6">Notice not found.</div>;

  function safeDate(d?: string | number | Date) {
    if (!d) return "";
    try {
      return new Date(d as string | number | Date).toLocaleString();
    } catch {
      return "";
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{notice.title}</h1>
  <div className="text-sm text-slate-500 mb-4">{safeDate(notice.publishAt ?? notice.createdAt)}</div>
      <div className="prose max-w-none mb-6"><p>{notice.body}</p></div>

      <div className="mb-6">
        <h3 className="font-semibold">Details</h3>
        <div className="text-sm text-slate-600">Category: {notice.category || "General"}</div>
        <div className="text-sm text-slate-600">Visibility: {notice.visibility || "public"}</div>
        <div className="text-sm text-slate-600">Status: {notice.status || "draft"}</div>
        <div className="text-sm text-slate-600">Audience rows: {audience.length}</div>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold mb-2">Ask a question about this notice</h3>
        <form onSubmit={submitQuery} className="space-y-3">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full border rounded px-3 py-2"
            required
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your question or comment"
            className="w-full border rounded px-3 py-2 h-28"
            required
          />
          <div className="flex items-center gap-3">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded" disabled={submitting}>
              {submitting ? "Sending…" : "Submit Query"}
            </button>
            <div className="text-sm text-slate-500">Signed in as {user?.name || user?.email || "you"}</div>
          </div>
        </form>
      </div>

    </div>
  );
}
