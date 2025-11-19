import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { getUser } from "../lib/auth";
import type { AxiosErrorLike } from "../lib/types";
import type { Notice } from "../types";

const CATEGORY_OPTIONS = ["Academics", "Events", "Exams", "Circulars", "General"];

type AudienceEntry = { role?: string; departmentId?: string; programId?: string; batchId?: string; userId?: string };

export default function CreateNotice() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("General");
  const [visibility, setVisibility] = useState("public");
  const [audience, setAudience] = useState<AudienceEntry[]>([]);
  const [audienceEntry, setAudienceEntry] = useState<AudienceEntry>({ role: "", departmentId: "", programId: "", batchId: "", userId: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function addAudience() {
    // require at least one identifying field
    const hasAny = audienceEntry.role || audienceEntry.departmentId || audienceEntry.programId || audienceEntry.batchId || audienceEntry.userId;
    if (!hasAny) return setMsg("Provide at least one audience field before adding");
    setAudience([...audience, { ...audienceEntry }]);
    setAudienceEntry({ role: "", departmentId: "", programId: "", batchId: "", userId: "" });
    setMsg(null);
  }

  function removeAudience(idx: number) {
    setAudience(audience.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const me = getUser();
    const roles = (me?.roles ?? []) as string[];
    if (!roles.some((r) => ["admin", "faculty"].includes(r))) {
      return setMsg("Forbidden: only faculty or admin can create notices");
    }
    if (!title || !body) return setMsg("Title and body are required");
    if (visibility === "targeted" && audience.length === 0) return setMsg("Please add at least one audience entry for targeted visibility");
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { title, body, category, visibility };
      if (visibility === "targeted") payload.audience = audience;
      if (id) {
        await api.patch(`/notices/${id}`, payload);
        alert("Updated!");
      } else {
        await api.post("/notices", payload);
        alert("Created!");
      }
      // navigate to notices list
      location.href = "/notices";
    } catch (err: unknown) {
      const e = err as AxiosErrorLike;
      console.error("create notice error", e);
      const serverErr = e.response?.data as unknown;
      const status = e.response?.status;
      if (status === 401) setMsg("Not authenticated. Please login.");
      else if (status === 403) setMsg("Forbidden: you don't have permission to create notices");
      else if (serverErr && typeof serverErr === 'object' && 'error' in (serverErr as Record<string, unknown>)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val = (serverErr as any).error;
        setMsg(typeof val === "string" ? val : JSON.stringify(val));
      }
      else setMsg("Failed to create notice");
    } finally {
      setLoading(false);
    }
  }

  // load existing notice when editing
  useEffect(() => {
    let mounted = true;
    if (!id) return;
    (async () => {
      try {
        const res = await api.get<{ notice?: Notice; }>(`/notices/${id}`);
        if (!mounted) return;
        const n = res.data.notice ?? (res.data as unknown as Notice);
        setTitle(n?.title || "");
        setBody(n?.body || "");
        setCategory(n?.category || "General");
        setVisibility(n?.visibility || "public");
        // try to load audience separately (API provides /notices/:id/audience)
        try {
          const ares = await api.get<{ audience: AudienceEntry[] }>(`/notices/${id}/audience`);
          if (!mounted) return;
          setAudience(ares.data?.audience ?? []);
        } catch {
          // ignore audience load failures
        }
      } catch (err) {
        console.error('Failed to load notice for edit', err);
        setMsg('Failed to load notice for editing');
      }
    })();
    return () => { mounted = false };
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Edit Notice' : 'Create Notice'}</h1>
      <form onSubmit={onSubmit} className="space-y-4 bg-white rounded-2xl border shadow-sm p-6">
        {msg && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{msg}</div>}
        <input className="border rounded-lg px-3 py-2 w-full" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea className="border rounded-lg px-3 py-2 w-full min-h-[120px]" placeholder="Body" value={body} onChange={e => setBody(e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <select className="border rounded-lg px-3 py-2" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="border rounded-lg px-3 py-2" value={visibility} onChange={e => setVisibility(e.target.value)}>
            <option value="public">Public</option>
            <option value="targeted">Targeted</option>
          </select>
        </div>

        {visibility === "targeted" && (
          <div className="space-y-2 p-3 border rounded">
            <div className="text-sm font-medium">Audience</div>
            <div className="grid grid-cols-2 gap-2">
              <select className="border rounded px-2 py-1" value={audienceEntry.role} onChange={e => setAudienceEntry({ ...audienceEntry, role: e.target.value })}>
                <option value="">Role (optional)</option>
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
              </select>
              <input className="border rounded px-2 py-1" placeholder="departmentId (optional)" value={audienceEntry.departmentId} onChange={e => setAudienceEntry({ ...audienceEntry, departmentId: e.target.value })} />
              <input className="border rounded px-2 py-1" placeholder="programId (optional)" value={audienceEntry.programId} onChange={e => setAudienceEntry({ ...audienceEntry, programId: e.target.value })} />
              <input className="border rounded px-2 py-1" placeholder="batchId (optional)" value={audienceEntry.batchId} onChange={e => setAudienceEntry({ ...audienceEntry, batchId: e.target.value })} />
              <input className="border rounded px-2 py-1 col-span-2" placeholder="userId (optional)" value={audienceEntry.userId} onChange={e => setAudienceEntry({ ...audienceEntry, userId: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={addAudience} className="px-3 py-1 bg-slate-100 rounded">Add audience</button>
            </div>
            {audience.length > 0 && (
              <div className="mt-2 space-y-1">
                {audience.map((a, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="text-sm">{a.role || "role:"}{a.role ? ` ${a.role}` : ""} {a.departmentId ? ` dept:${a.departmentId}` : ""} {a.programId ? ` prog:${a.programId}` : ""} {a.batchId ? ` batch:${a.batchId}` : ""} {a.userId ? ` user:${a.userId}` : ""}</div>
                    <button type="button" onClick={() => removeAudience(i)} className="text-red-500">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white">{loading ? (id ? "Updating…" : "Saving…") : (id ? "Update" : "Save")}</button>
      </form>
    </div>
  );
}
