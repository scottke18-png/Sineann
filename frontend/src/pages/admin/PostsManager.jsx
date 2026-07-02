import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { adminInput, adminBtn, adminBtnGhost, Field } from "@/pages/admin/adminUi";
import { Pencil, Trash2, Plus } from "lucide-react";

const EMPTY = { title: "", excerpt: "", body: "", cover_image: "", author: "Sineann", published: true };

export default function PostsManager() {
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/posts", { params: { all: true } }).then((r) => setPosts(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...EMPTY, ...p }); setOpen(true); };
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/posts/${editing.id}`, form);
      else await api.post("/posts", form);
      toast.success(editing ? "Post updated." : "Post created.");
      setOpen(false);
      load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally { setSaving(false); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    await api.delete(`/posts/${p.id}`);
    toast.success("Post deleted.");
    load();
  };

  return (
    <div data-testid="posts-manager">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading text-2xl text-[#F5F5F0]">News Posts <span className="text-secondary text-base">({posts.length})</span></h2>
        <button onClick={openNew} className={adminBtn + " flex items-center gap-2"} data-testid="add-post-btn"><Plus size={16} /> Add Post</button>
      </div>

      <div className="border border-white/10 divide-y divide-white/10">
        {posts.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02]" data-testid={`post-row-${p.slug}`}>
            <div className="w-16 h-11 bg-black shrink-0 overflow-hidden">{p.cover_image && <img src={p.cover_image} alt="" className="w-full h-full object-cover" />}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[#F5F5F0] truncate">{p.title} {!p.published && <span className="text-secondary text-xs">(draft)</span>}</p>
              <p className="text-secondary text-xs">{new Date(p.published_at).toLocaleDateString()} · {p.author}</p>
            </div>
            <button onClick={() => openEdit(p)} className="text-[#A8A39D] hover:text-[#F5F5F0] p-2" data-testid={`edit-post-${p.slug}`}><Pencil size={16} /></button>
            <button onClick={() => remove(p)} className="text-[#A8A39D] hover:text-red-400 p-2" data-testid={`delete-post-${p.slug}`}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#141414] border-white/10 text-[#F5F5F0] max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-light">{editing ? "Edit Post" : "New Post"}</DialogTitle>
            <DialogDescription className="text-secondary text-sm">Write and manage newsletter / news posts.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4 mt-2">
            <Field label="Title"><input required className={adminInput} value={form.title} onChange={(e) => update("title", e.target.value)} data-testid="post-form-title" /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Author"><input className={adminInput} value={form.author} onChange={(e) => update("author", e.target.value)} /></Field>
              <Field label="Cover Image URL"><input className={adminInput} value={form.cover_image} onChange={(e) => update("cover_image", e.target.value)} /></Field>
            </div>
            <Field label="Excerpt"><textarea rows={2} className={adminInput} value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} /></Field>
            <Field label="Body (use blank lines between paragraphs)"><textarea rows={8} className={adminInput} value={form.body} onChange={(e) => update("body", e.target.value)} data-testid="post-form-body" /></Field>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="accent-wine w-4 h-4" /> Published
            </label>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className={adminBtn} data-testid="post-form-save">{saving ? "Saving..." : "Save Post"}</button>
              <button type="button" onClick={() => setOpen(false)} className={adminBtnGhost}>Cancel</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
