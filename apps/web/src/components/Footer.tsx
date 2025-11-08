export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-600 flex flex-col sm:flex-row gap-3 justify-between">
        <div><b>SCNBCP</b> · Connecting Campus Smarter</div>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Contact</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">@scnbcp</a>
        </div>
      </div>
    </footer>
  );
}
