import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { adminInput, adminBtn, adminBtnGhost, Field } from "@/pages/admin/adminUi";
import { Pencil, Trash2, Plus } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

const EMPTY = {
  name: "", vintage: "", varietal: "", appellation: "", vineyard: "",
  tasting_notes: "", production_notes: "", price: "", availability: "Available",
  image_url: "", label_image_url: "", series: "Estate", featured: false, order: 0,
};

export default function WinesManager() {
  const [wines, setWines] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.get("/wines").then((r) => setWines(r.data)).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const seriesOptions = Array.from(new Set(["Estate", "Train Graffiti", ...wines.map((w) => w.series).filter(Boolean)]));

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (w) => { setEditing(w); setForm({ ...EMPTY, ...w }); setOpen(true); };
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editing) await api.put(`/wines/${editing.id}`, payload);
      else await api.post("/wines", payload);
      toast.success(editing ? "Wine updated." : "Wine created.");
      setOpen(false);
      load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (w) => {
    if (!window.confirm(`Delete "${w.name}"?`)) return;
    await api.delete(`/wines/${w.id}`);
    toast.success("Wine deleted.");
    load();
  };

  return (
    <div data-testid="wines-manager">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading text-2xl text-[#F5F5F0]">Wines <span className="text-secondary text-base">({wines.length})</span></h2>
        <button onClick={openNew} className={adminBtn + " flex items-center gap-2"} data-testid="add-wine-btn"><Plus size={16} /> Add Wine</button>
      </div>

      <div className="border border-white/10 divide-y divide-white/10">
        {wines.map((w) => (
          <div key={w.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02]" data-testid={`wine-row-${w.slug}`}>
            <div className="w-12 h-16 bg-black shrink-0 overflow-hidden">
              {w.image_url && <img src={w.image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#F5F5F0] truncate">{w.name} {w.featured && <span className="text-wine text-xs ml-1">★</span>}</p>
              <p className="text-secondary text-xs">{w.vintage} · {w.varietal} · {w.series} · {w.availability}</p>
            </div>
            <button onClick={() => openEdit(w)} className="text-[#A8A39D] hover:text-[#F5F5F0] p-2" data-testid={`edit-wine-${w.slug}`}><Pencil size={16} /></button>
            <button onClick={() => remove(w)} className="text-[#A8A39D] hover:text-red-400 p-2" data-testid={`delete-wine-${w.slug}`}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#141414] border-white/10 text-[#F5F5F0] max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-light">{editing ? "Edit Wine" : "New Wine"}</DialogTitle>
            <DialogDescription className="text-secondary text-sm">Manage wine details shown across the site.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4 mt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name"><input required className={adminInput} value={form.name} onChange={(e) => update("name", e.target.value)} data-testid="wine-form-name" /></Field>
              <Field label="Vintage"><input className={adminInput} value={form.vintage} onChange={(e) => update("vintage", e.target.value)} /></Field>
              <Field label="Varietal"><input className={adminInput} value={form.varietal} onChange={(e) => update("varietal", e.target.value)} /></Field>
              <Field label="Appellation"><input className={adminInput} value={form.appellation} onChange={(e) => update("appellation", e.target.value)} /></Field>
              <Field label="Vineyard"><input className={adminInput} value={form.vineyard} onChange={(e) => update("vineyard", e.target.value)} /></Field>
              <Field label="Price"><input className={adminInput} value={form.price} onChange={(e) => update("price", e.target.value)} /></Field>
              <Field label="Availability">
                <select className={adminInput} value={form.availability} onChange={(e) => update("availability", e.target.value)}>
                  <option>Available</option><option>Limited</option><option>Sold Out</option><option>Coming Soon</option>
                </select>
              </Field>
              <Field label="Series">
                <input list="wine-series-options" className={adminInput} value={form.series} onChange={(e) => update("series", e.target.value)} placeholder="e.g. Estate, Train Graffiti" data-testid="wine-form-series" />
                <datalist id="wine-series-options">
                  {seriesOptions.map((s) => <option key={s} value={s} />)}
                </datalist>
                <p className="text-[#5a544f] text-[0.65rem] mt-1">Set this to a feature page's "Series Filter" (e.g. Train Graffiti) to show this bottle on the Art Series page.</p>
              </Field>
              <Field label="Order"><input type="number" className={adminInput} value={form.order} onChange={(e) => update("order", e.target.value)} /></Field>
              <Field label="Featured">
                <label className="flex items-center gap-2 mt-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="accent-wine w-4 h-4" data-testid="wine-form-featured" /> Show on homepage
                </label>
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 border-y border-white/10 py-5">
              <ImageUploader label="Bottle Image (3:4)" testId="wine-bottle" aspect={3 / 4} value={form.image_url} onChange={(url) => update("image_url", url)} />
              <ImageUploader label="Label Close-up (16:9, optional)" testId="wine-label" aspect={16 / 9} value={form.label_image_url} onChange={(url) => update("label_image_url", url)} />
            </div>
            <Field label="Tasting Notes"><textarea rows={3} className={adminInput} value={form.tasting_notes} onChange={(e) => update("tasting_notes", e.target.value)} /></Field>
            <Field label="Production Notes"><textarea rows={2} className={adminInput} value={form.production_notes} onChange={(e) => update("production_notes", e.target.value)} /></Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className={adminBtn} data-testid="wine-form-save">{saving ? "Saving..." : "Save Wine"}</button>
              <button type="button" onClick={() => setOpen(false)} className={adminBtnGhost}>Cancel</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
