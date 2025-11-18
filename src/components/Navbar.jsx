import { Menu } from "lucide-react";

export default function Navbar({ onToggleSidebar }) {
  return (
    <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded hover:bg-white/10 text-white"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <span className="text-white font-semibold">School ERP</span>
      </div>
      <div className="text-blue-200 text-sm">Powered by Flames Blue</div>
    </div>
  );
}
