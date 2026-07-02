import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Trash2, Copy, Upload } from "lucide-react";

export default function MediaManager() {
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = () => api.get("/media").then((r) => setMedia(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Uploaded.");
      load();
    } catch (err) {
      toast.error("Upload failed.");
    } finally { setUploading(false); e.target.value = ""; }
  };

  const copyUrl = (url) => { navigator.clipboard.writeText(url); toast.success("URL copied."); };
  const remove = async (m) => {
    if (!window.confirm("Delete this image?")) return;
    await api.delete(`/media/${m.id}`);
    toast.success("Deleted.");
    load();
  };

  return (
    <div data-testid="media-manager">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading text-2xl text-[#F5F5F0]">Media <span className="text-secondary text-base">({media.length})</span></h2>
        <label className="bg-wine hover:bg-wine-hover text-[#F5F5F0] px-5 py-2.5 text-[0.75rem] tracking-[0.14em] uppercase cursor-pointer flex items-center gap-2" data-testid="upload-media-label">
          <Upload size={16} /> {uploading ? "Uploading..." : "Upload"}
          <input type="file" accept="image/*" onChange={onUpload} className="hidden" data-testid="media-file-input" disabled={uploading} />
        </label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((m) => (
          <div key={m.id} className="border border-white/10 group relative" data-testid={`media-${m.id}`}>
            <div className="aspect-square bg-black overflow-hidden">
              <img src={m.url} alt={m.original_filename} className="w-full h-full object-cover" />
            </div>
            <div className="p-2 flex items-center justify-between">
              <p className="text-secondary text-[0.65rem] truncate flex-1">{m.original_filename}</p>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => copyUrl(m.url)} className="text-[#A8A39D] hover:text-[#F5F5F0] p-1" title="Copy URL" data-testid={`copy-media-${m.id}`}><Copy size={14} /></button>
                <button onClick={() => remove(m)} className="text-[#A8A39D] hover:text-red-400 p-1"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {media.length === 0 && <p className="text-secondary col-span-full">No media uploaded yet. Upload logos, bottle photos and label art here, then copy the URL into a wine or post.</p>}
      </div>
    </div>
  );
}
