import { BookOpen, Users, GraduationCap, Calendar, DollarSign, Megaphone } from "lucide-react";

const items = [
  { key: "dashboard", label: "Dashboard", icon: GraduationCap },
  { key: "students", label: "Students", icon: Users },
  { key: "teachers", label: "Teachers", icon: GraduationCap },
  { key: "classes", label: "Classes", icon: BookOpen },
  { key: "timetable", label: "Timetable", icon: Calendar },
  { key: "finance", label: "Finance", icon: DollarSign },
  { key: "announcements", label: "Announcements", icon: Megaphone },
];

export default function Sidebar({ current, onChange, open }) {
  return (
    <aside className={`transition-all duration-200 ${open ? "w-64" : "w-0"} overflow-hidden border-r border-white/10 bg-slate-900/60` }>
      <div className="p-2">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left text-sm hover:bg-white/10 ${current === key ? "bg-white/10 text-white" : "text-blue-200"}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
