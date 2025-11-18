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
        <Stat title="Invoices" endpoint="/invoices" />
        <Stat title="Payments" endpoint="/payments" />
        <Stat title="Announcements" endpoint="/announcements" />
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
          createFields={[
            { name: "admission_number", label: "Admission #", type: "text", required: true },
            { name: "first_name", label: "First Name", type: "text", required: true },
            { name: "last_name", label: "Last Name", type: "text", required: true },
            { name: "class_id", label: "Class ID", type: "text" },
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
          createFields={[
            { name: "first_name", label: "First Name", type: "text", required: true },
            { name: "last_name", label: "Last Name", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
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
          createFields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "year", label: "Year", type: "number", required: true },
          ]}
        />
      </div>
    ),
    finance: (
      <div className="space-y-8">
        <div>
          <SectionHeader title="Invoices" subtitle="Recent fee invoices" />
          <EntityList
            title="Invoices"
            endpoint="/invoices"
            columns={[
              { key: "invoice_number", label: "Invoice #" },
              { key: "student_id", label: "Student" },
              { key: "amount", label: "Amount" },
              { key: "paid", label: "Paid" },
              { key: "balance", label: "Balance" },
              { key: "status", label: "Status" },
            ]}
            createFields={[
              { name: "student_id", label: "Student ID", type: "text", required: true },
              { name: "invoice_number", label: "Invoice #", type: "text", required: true },
              { name: "issue_date", label: "Issue Date", type: "date", required: true },
              { name: "due_date", label: "Due Date", type: "date", required: true },
              { name: "amount", label: "Amount", type: "number", required: true },
            ]}
          />
        </div>
        <div>
          <SectionHeader title="Payments" subtitle="Recorded payments" />
          <EntityList
            title="Payments"
            endpoint="/payments"
            columns={[
              { key: "invoice_id", label: "Invoice" },
              { key: "student_id", label: "Student" },
              { key: "amount", label: "Amount" },
              { key: "date", label: "Date" },
              { key: "method", label: "Method" },
              { key: "reference", label: "Reference" },
            ]}
            createFields={[
              { name: "invoice_id", label: "Invoice ID", type: "text", required: true },
              { name: "student_id", label: "Student ID", type: "text", required: true },
              { name: "amount", label: "Amount", type: "number", required: true },
              { name: "date", label: "Date", type: "date", required: true },
              { name: "method", label: "Method", type: "text", required: true },
              { name: "reference", label: "Reference", type: "text" },
            ]}
          />
        </div>
      </div>
    ),
    announcements: (
      <div>
        <SectionHeader title="Announcements" subtitle="School-wide communications" />
        <EntityList
          title="Announcements"
          endpoint="/announcements"
          columns={[
            { key: "title", label: "Title" },
            { key: "audience", label: "Audience" },
            { key: "pinned", label: "Pinned" },
            { key: "published_at", label: "Published" },
          ]}
          createFields={[
            { name: "title", label: "Title", type: "text", required: true },
            { name: "body", label: "Body", type: "text", required: true },
            { name: "audience", label: "Audience", type: "text" },
            { name: "published_at", label: "Published At", type: "datetime-local" },
          ]}
        />
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
        if (Array.isArray(data)) setCount(data.length);
        else if (data && Array.isArray(data.items)) setCount(data.items.length);
        else setCount(0);
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
