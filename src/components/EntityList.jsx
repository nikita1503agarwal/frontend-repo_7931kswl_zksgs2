import { useEffect, useMemo, useState } from "react";

/*
Props:
- title: string
- endpoint: base endpoint e.g. "/students"
- columns: [{key,label}]
- createFields: [{name,label,type}] to render quick create form
*/
export default function EntityList({ title, endpoint, columns, createFields = [] }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({});
  const [viewItem, setViewItem] = useState(null); // {_id: ...}
  const base = import.meta.env.VITE_BACKEND_URL;

  // Fetch list with search/pagination
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (page) params.set("page", String(page));
        if (pageSize) params.set("page_size", String(pageSize));
        const url = `${base}${endpoint}?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (!active) return;
        if (Array.isArray(data)) {
          setItems(data);
          setTotal(data.length);
        } else if (data && Array.isArray(data.items)) {
          setItems(data.items);
          setTotal(Number(data.total ?? data.items.length));
        } else {
          setItems([]);
          setTotal(0);
        }
      } catch (e) {
        if (!active) return;
        setError(String(e));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [endpoint, q, page, pageSize]);

  // Debounced search input handler
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQ(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      const res = await fetch(`${base}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Create failed");
      setForm({});
      // Refresh list
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("page", String(page));
      params.set("page_size", String(pageSize));
      const listRes = await fetch(`${base}${endpoint}?${params.toString()}`);
      const listData = await listRes.json();
      if (Array.isArray(listData)) {
        setItems(listData);
        setTotal(listData.length);
      } else {
        setItems(listData.items || []);
        setTotal(Number(listData.total || 0));
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setCreating(false);
    }
  };

  const openDetail = async (id) => {
    try {
      setError(null);
      const res = await fetch(`${base}${endpoint}/${id}`);
      if (!res.ok) throw new Error("Failed to load details");
      const data = await res.json();
      setViewItem(data);
    } catch (e) {
      setError(String(e));
    }
  };

  const updateItem = async (id, patch) => {
    try {
      const res = await fetch(`${base}${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Update failed");
      await openDetail(id);
    } catch (e) {
      setError(String(e));
    }
  };

  const deleteItem = async (id) => {
    if (!confirm("Delete this record?")) return;
    try {
      const res = await fetch(`${base}${endpoint}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setViewItem(null);
      // refresh list
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("page", String(page));
      params.set("page_size", String(pageSize));
      const listRes = await fetch(`${base}${endpoint}?${params.toString()}`);
      const listData = await listRes.json();
      if (Array.isArray(listData)) {
        setItems(listData);
        setTotal(listData.length);
      } else {
        setItems(listData.items || []);
        setTotal(Number(listData.total || 0));
      }
    } catch (e) {
      setError(String(e));
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-xl font-semibold">{title}</div>
        <div className="flex gap-2 items-center">
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          {createFields.length > 0 && (
            <button
              onClick={() => setViewItem({ __create__: true })}
              className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm"
            >
              New
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-blue-200">Loading {title}…</div>
      ) : error ? (
        <div className="text-red-300">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-blue-200">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="px-3 py-2 text-left font-medium">{c.label}</th>
                ))}
                <th className="px-3 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-blue-100">
              {items.map((item, idx) => (
                <tr key={item._id || idx} className="hover:bg-white/5">
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-2">{String(item[c.key] ?? "-")}</td>
                  ))}
                  <td className="px-3 py-2">
                    {item._id && (
                      <button
                        onClick={() => openDetail(item._id)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-blue-300" colSpan={columns.length + 1}>No records yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center gap-3 justify-between">
        <div className="text-sm text-blue-200">{total} total</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 rounded bg-white/5 disabled:opacity-50">Prev</button>
          <div className="text-sm">Page {page} / {totalPages}</div>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-2 py-1 rounded bg-white/5 disabled:opacity-50">Next</button>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm">
            {[10,20,50].map(n => <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>

      {/* Create / Detail Drawer */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/50 z-40 flex" onClick={() => setViewItem(null)}>
          <div className="ml-auto h-full w-full max-w-md bg-slate-900 border-l border-white/10 p-4" onClick={(e) => e.stopPropagation()}>
            {viewItem.__create__ ? (
              <div className="space-y-4">
                <div className="text-lg font-semibold">New {title.slice(0, -1)}</div>
                <form onSubmit={onCreate} className="space-y-3">
                  {createFields.map((f) => (
                    <div key={f.name} className="space-y-1">
                      <label className="text-sm text-blue-200">{f.label}</label>
                      <input
                        type={f.type || "text"}
                        required={f.required}
                        value={form[f.name] ?? ""}
                        onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setViewItem(null)} className="px-3 py-2 rounded bg-white/5">Cancel</button>
                    <button type="submit" disabled={creating} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white">{creating ? "Creating..." : "Create"}</button>
                  </div>
                </form>
              </div>
            ) : (
              <DetailEditor item={viewItem} columns={columns} onClose={() => setViewItem(null)} onSave={updateItem} onDelete={deleteItem} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailEditor({ item, columns, onClose, onSave, onDelete }) {
  const [edit, setEdit] = useState({});
  useEffect(() => {
    setEdit(item);
  }, [item]);

  const updatableKeys = useMemo(() => columns.map(c => c.key), [columns]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Details</div>
        <button onClick={onClose} className="text-blue-300">Close</button>
      </div>
      <div className="space-y-3">
        {updatableKeys.map((k) => (
          <div key={k} className="space-y-1">
            <label className="text-sm text-blue-200">{k}</label>
            <input
              value={edit?.[k] ?? ""}
              onChange={(e) => setEdit((s) => ({ ...s, [k]: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(item._id, updatableKeys.reduce((acc,k)=>{acc[k]=edit[k];return acc;},{}))} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white">Save</button>
        <button onClick={() => onDelete(item._id)} className="px-3 py-2 rounded bg-red-600 hover:bg-red-500 text-white">Delete</button>
      </div>
    </div>
  );
}
