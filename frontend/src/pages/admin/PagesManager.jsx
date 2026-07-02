import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "@/lib/api";
import { adminInput, adminBtn, Field } from "@/pages/admin/adminUi";

const LABELS = {
  home: "Homepage", story: "Our Story", visit: "Visit", wineclub: "Wine Club",
  howtobuy: "How to Buy", train: "Train Graffiti Series", contact: "Contact",
};

export default function PagesManager() {
  const [pages, setPages] = useState([]);
  const [active, setActive] = useState(null);
  const [content, setContent] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/pages").then((r) => {
    setPages(r.data);
    if (r.data.length && !active) selectPage(r.data[0]);
  }).catch(() => {});
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const selectPage = (p) => { setActive(p.key); setContent({ ...p.content }); };
  const update = (k, v) => setContent((c) => ({ ...c, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/pages/${active}`, { content });
      toast.success("Page content saved.");
      load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally { setSaving(false); }
  };

  const fieldLabel = (k) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div data-testid="pages-manager">
      <h2 className="font-heading text-2xl text-[#F5F5F0] mb-6">Page Content</h2>
      <div className="grid md:grid-cols-4 gap-6">
        <div className="flex md:flex-col gap-2 flex-wrap">
          {pages.map((p) => (
            <button
              key={p.key}
              onClick={() => selectPage(p)}
              data-testid={`page-tab-${p.key}`}
              className={`text-left px-4 py-2.5 text-sm border transition-colors ${active === p.key ? "bg-wine border-wine text-[#F5F5F0]" : "border-white/10 text-[#A8A39D] hover:text-[#F5F5F0]"}`}
            >
              {LABELS[p.key] || p.key}
            </button>
          ))}
        </div>
        <div className="md:col-span-3 space-y-4">
          {active && Object.keys(content).map((k) => (
            <Field key={k} label={fieldLabel(k)}>
              {(content[k] || "").length > 60 || k.includes("body") || k.includes("benefits") || k.includes("hours") ? (
                <textarea rows={3} className={adminInput} value={content[k]} onChange={(e) => update(k, e.target.value)} data-testid={`page-field-${k}`} />
              ) : (
                <input className={adminInput} value={content[k]} onChange={(e) => update(k, e.target.value)} data-testid={`page-field-${k}`} />
              )}
            </Field>
          ))}
          {active && <button onClick={save} disabled={saving} className={adminBtn} data-testid="page-save-btn">{saving ? "Saving..." : "Save Changes"}</button>}
        </div>
      </div>
    </div>
  );
}
