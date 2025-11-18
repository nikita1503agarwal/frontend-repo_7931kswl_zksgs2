import { useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import SectionHeader from "./components/SectionHeader";
import EntityList from "./components/EntityList";

function App() {
  const [current, setCurrent] = useState("dashboard");
  const [open, setOpen] = useState(true);

  const sections = useMemo(() => ({
    dashboard: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat title="Students" endpoint="/students" />
        <Stat title="Teachers" endpoint="/teachers" />
        <Stat title="Classes" endpoint="/classes" />
      </div>
    ),
    students: (
      <div>
        <SectionHeader title="Students" subtitle="Recently added students" />
        <EntityList
          title="Students"
          endpoint="/students"
          columns={[
            { key: "admission_number", label: "Admission #" },
            { key: "first_name", label: "First Name" },
            { key: "last_name", label: "Last Name" },
            { key: "class_id", label: "Class" },
            { key: "status", label: "Status" },
          ]}
        />
      </div>
    ),
    teachers: (
      <div>
        <SectionHeader title="Teachers" subtitle="Active teaching staff" />
        <EntityList
          title="Teachers"
          endpoint="/teachers"
          columns={[
            { key: "first_name", label: "First Name" },
            { key: "last_name", label: "Last Name" },
            { key: "email", label: "Email" },
            { key: "status", label: "Status" },
          ]}
        />
      </div>
    ),
    classes: (
      <div>
        <SectionHeader title="Classes" subtitle="Classrooms for the current year" />
        <EntityList
          title="Classes"
          endpoint="/classes"
          columns={[
            { key: "name", label: "Name" },
            { key: "year", label: "Year" },
            { key: "class_teacher_id", label: "Class Teacher" },
          ]}
        />
      </div>
    ),
    finance: (
      <div>
        <SectionHeader title="Invoices" subtitle="Recent fee invoices" />
        <EntityList
          title="Invoices"
          endpoint="/invoices"
          columns={[
            { key: "invoice_number", label: "Invoice #" },
            { key: "student_id", label: "Student" },
            { key: "amount", label: "Amount" },
            { key: "status", label: "Status" },
          ]}
        />
      </div>
    ),
    announcements: (
      <div>
        <SectionHeader title="Announcements" subtitle="School-wide communications" />
        <p className="text-blue-200">Coming soon…</p>
      </div>
    ),
  }), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar onToggleSidebar={() => setOpen((v) => !v)} />
      <div className="flex">
        <Sidebar current={current} onChange={setCurrent} open={open} />
        <main className="flex-1 p-4">
          {sections[current]}
        </main>
      </div>
    </div>
  );
}

function Stat({ title, endpoint }) {
  const [count, setCount] = useState(0);
  useState(() => {
    const load = async () => {
      try {
        const base = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(`${base}${endpoint}`);
        const data = await res.json();
        setCount(Array.isArray(data) ? data.length : 0);
      } catch {}
    };
    load();
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-blue-300 text-sm">{title}</div>
      <div className="text-3xl font-semibold">{count}</div>
    </div>
  );
}

export default App;
