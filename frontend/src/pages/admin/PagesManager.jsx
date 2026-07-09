import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "@/lib/api";
import { adminInput, adminBtn, Field } from "@/pages/admin/adminUi";
import ImageUploader from "@/components/admin/ImageUploader";

const LABELS = {
  home: "Homepage", story: "Our Story", visit: "Visit", wineclub: "Wine Club",
  howtobuy: "How to Buy", train: "Art Series Page", contact: "Contact",
};

// Default images per page/field so staff can restore the original at any time.
const IMAGE_DEFAULTS = {
  home: {
    hero_image: "https://images.pexels.com/photos/18248851/pexels-photo-18248851.jpeg",
    intro_image: "https://images.unsplash.com/photo-1724082111671-eb2a4c01d40d",
  },
  story: { hero_image: "https://images.unsplash.com/photo-1724082111671-eb2a4c01d40d" },
  visit: { hero_image: "https://images.pexels.com/photos/18248851/pexels-photo-18248851.jpeg" },
  wineclub: { hero_image: "https://images.unsplash.com/photo-1561461056-77634126673a" },
  train: { hero_image: "https://images.unsplash.com/photo-1648154008739-bd1b8cbb9074" },
};

const HERO_HINT =
  "Recommended for background/hero images: landscape orientation, at least 1920 × 1080 px (ideally 2400 × 1350) for a crisp full-screen look. Accepted formats: JPG, PNG or WebP. Keep the file under ~5 MB. Uploaded images are automatically cropped to a 16:9 widescreen shape.";
const PORTRAIT_HINT =
  "Recommended: portrait orientation, at least 1000 × 1250 px. Accepted formats: JPG, PNG or WebP. Cropped to a 3:4 portrait shape.";

export default function PagesManager() {
  const [pages, setPages] = useState([]);
  const [active, setActive] = useState(null);
  const [content, setContent] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.get("/pages").then((r) => {
      setPages(r.data);
      setActive((prev) => prev || (r.data[0]?.key ?? null));
      setContent((prev) => (Object.keys(prev).length ? prev : (r.data[0]?.content ? { ...r.data[0].content } : {})));
    }).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

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
              {k.endsWith("image") ? (
                <ImageUploader
                  testId={`page-${k}`}
                  aspect={k === "intro_image" ? 4 / 5 : 16 / 9}
                  value={content[k]}
                  onChange={(url) => update(k, url)}
                  defaultUrl={IMAGE_DEFAULTS[active]?.[k] || ""}
                  hint={k === "intro_image" ? PORTRAIT_HINT : HERO_HINT}
                />
              ) : /body|benefits|hours|address|notes/.test(k) ? (
                <textarea rows={3} className={adminInput} value={content[k]} onChange={(e) => update(k, e.target.value)} data-testid={`page-field-${k}`} />
              ) : (
                <input className={adminInput} value={content[k]} onChange={(e) => update(k, e.target.value)} data-testid={`page-field-${k}`} />
              )}
              {k.endsWith("_filter") && (
                <p className="text-[#5a544f] text-[0.65rem] mt-1">Wines are shown here when their "Series" (set in the Wines tab) matches this exact value.</p>
              )}
              {k === "nav_label" && (
                <p className="text-[#5a544f] text-[0.65rem] mt-1">The text shown for this page in the top navigation menu.</p>
              )}
            </Field>
          ))}
          {active && <button onClick={save} disabled={saving} className={adminBtn} data-testid="page-save-btn">{saving ? "Saving..." : "Save Changes"}</button>}
        </div>
      </div>
    </div>
  );
}
