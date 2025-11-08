export default function Admin() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-slate-600 mt-2">Manage users and campus-wide notices here.</p>
      <div className="mt-6 flex gap-3">
        <a className="px-4 py-2 rounded bg-sky-600 text-white" href="/create">Create Notice</a>
        <a className="px-4 py-2 rounded border" href="/notices">View Notices</a>
      </div>
    </div>
  );
}
