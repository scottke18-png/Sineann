import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Trash2, Mail, Check } from "lucide-react";

const TYPE_LABEL = { purchase: "Purchase", wineclub: "Wine Club", visit: "Visit", general: "General" };

export default function SubmissionsManager() {
  const [subs, setSubs] = useState([]);

  const load = useCallback(() => {
    api.get("/submissions").then((r) => setSubs(r.data)).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const markRead = async (s) => { await api.patch(`/submissions/${s.id}/read`); load(); };
  const remove = async (s) => {
    if (!window.confirm("Delete this inquiry?")) return;
    await api.delete(`/submissions/${s.id}`);
    toast.success("Deleted.");
    load();
  };

  return (
    <div data-testid="submissions-manager">
      <h2 className="font-heading text-2xl text-[#F5F5F0] mb-6">Inquiries <span className="text-secondary text-base">({subs.length})</span></h2>
      <div className="space-y-4">
        {subs.map((s) => (
          <div key={s.id} className={`border p-5 ${s.read ? "border-white/10 bg-transparent" : "border-wine/40 bg-wine/[0.06]"}`} data-testid={`submission-${s.id}`}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-[0.65rem] tracking-[0.16em] uppercase bg-white/10 px-2.5 py-1 text-[#F5F5F0]">{TYPE_LABEL[s.type] || s.type}</span>
                <p className="text-[#F5F5F0] mt-2 font-medium">{s.name} · <a href={`mailto:${s.email}`} className="text-wine hover:underline">{s.email}</a></p>
                {s.phone && <p className="text-secondary text-xs">{s.phone}</p>}
                <p className="text-secondary text-xs">{new Date(s.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!s.read && <button onClick={() => markRead(s)} className="text-[#A8A39D] hover:text-green-400 p-2" title="Mark read" data-testid={`sub-read-${s.id}`}><Check size={16} /></button>}
                <a href={`mailto:${s.email}`} className="text-[#A8A39D] hover:text-[#F5F5F0] p-2" title="Reply"><Mail size={16} /></a>
                <button onClick={() => remove(s)} className="text-[#A8A39D] hover:text-red-400 p-2" data-testid={`sub-delete-${s.id}`}><Trash2 size={16} /></button>
              </div>
            </div>
            {s.subject && <p className="text-secondary text-sm mb-1"><span className="overline">Subject:</span> {s.subject}</p>}
            {s.club_preference && <p className="text-secondary text-sm mb-1"><span className="overline">Club:</span> {s.club_preference}</p>}
            {s.wine_interest && <p className="text-secondary text-sm mb-1"><span className="overline">Wine:</span> {s.wine_interest}</p>}
            {s.quantity && <p className="text-secondary text-sm mb-1"><span className="overline">Quantity:</span> {s.quantity}</p>}
            <p className="text-[#F5F5F0] text-sm leading-relaxed whitespace-pre-line">{s.message}</p>
          </div>
        ))}
        {subs.length === 0 && <p className="text-secondary">No inquiries yet.</p>}
      </div>
    </div>
  );
}
