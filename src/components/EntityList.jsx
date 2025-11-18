import { useEffect, useState } from "react";

export default function EntityList({ title, endpoint, columns }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const base = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(`${base}${endpoint}`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setItems(data);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [endpoint]);

  if (loading) return <div className="text-blue-200">Loading {title}…</div>;
  if (error) return <div className="text-red-300">{error}</div>;

  return (
    <div className="overflow-x-auto rounded border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-blue-200">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2 text-left font-medium">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 text-blue-100">
          {items.map((item, idx) => (
            <tr key={item._id || idx} className="hover:bg-white/5">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2">{String(item[c.key] ?? "-")}</td>
              ))}
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-center text-blue-300" colSpan={columns.length}>No records yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
