// replace contents of Nav.tsx or merge
import { useEffect, useState, useRef } from "react";
import { clearAuth, getUser } from "../lib/auth";
import type { User } from "../types";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";

export default function Nav() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // initialize
    setUser(getUser());

    // update on auth changes (saveAuth/clearAuth dispatches this)
    const handler = (e: Event) => {
      try {
        const d = (e as CustomEvent)?.detail?.user ?? getUser();
        setUser(d as User | null);
      } catch {
        setUser(getUser());
      }
    };
    window.addEventListener("authChanged", handler as EventListener);
    return () => window.removeEventListener("authChanged", handler as EventListener);
  }, []);

  // close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">
          <span className="text-sky-600">SCN</span>BCP
        </Link>

        <nav className="flex items-center gap-4 text-sm relative">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/notices" className="hover:underline">Notices</Link>
          <Link to="/queries" className="hover:underline">Queries</Link>

          {user ? (
            <div className="relative">
              <div ref={containerRef} className="flex items-center gap-3" /* container for avatar & logout */>
              <button
                className="flex items-center gap-2"
                onClick={() => setOpen(v => !v)}
                title={`${user.name} (${user.roles?.[0]})`}
              >
                <Avatar name={user.name} />
                <span className="hidden sm:inline text-slate-700">
                  {user.name} <span className="text-slate-500">({user.roles?.[0]})</span>
                </span>
              </button>

              {/* visible logout button */}
              <button
                onClick={clearAuth}
                className="px-3 py-1 rounded border text-sm"
                title="Logout"
              >
                Logout
              </button>

              {open && (
                <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border bg-white shadow p-2">
                  <div className="px-3 py-2 border-b">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                    <div className="text-xs text-slate-500 mt-1">Portal: {user.roles?.[0] || "student"}{user.departmentId ? ` • Dept:${user.departmentId}` : ""}{user.programId ? ` • Prog:${user.programId}` : ""}{user.batchId ? ` • Batch:${user.batchId}` : ""}</div>
                  </div>
                  <div className="py-1">
                    <Link className="block px-3 py-2 hover:bg-slate-50" to="/queries">
                      Queries
                    </Link>
                    {/* show create only for faculty/admin */}
                    {(user.roles || []).some((r: string) => ["admin", "faculty"].includes(r)) && (
                      <Link className="block px-3 py-2 hover:bg-slate-50" to="/create">
                        Create Notice
                      </Link>
                    )}
                  </div>
                </div>
              )}
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1 rounded border">Login</Link>
              <Link to="/signup" className="px-3 py-1 rounded bg-sky-600 text-white">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
