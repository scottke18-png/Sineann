import { useState } from "react";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TYPES = [
  { value: "purchase", label: "Wine Purchase Inquiry" },
  { value: "wineclub", label: "Wine Club Interest" },
  { value: "visit", label: "Visit Request" },
  { value: "general", label: "General Inquiry" },
];

export default function InquiryForm({ defaultType = "general", subject = "" }) {
  const [form, setForm] = useState({ type: defaultType, name: "", email: "", phone: "", subject, club_preference: "", message: "" });
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.type === "wineclub" && !form.club_preference) {
      toast.error("Please choose which club you're interested in.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/submissions", form);
      toast.success("Thank you — your inquiry has been received. We'll be in touch shortly.");
      setForm({ type: defaultType, name: "", email: "", phone: "", subject, club_preference: "", message: "" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-[#F5F5F0] placeholder:text-[#6b6560] focus:outline-none focus:border-wine transition-colors";

  return (
    <form onSubmit={submit} className="space-y-5" data-testid="inquiry-form">
      <div>
        <label className="overline block mb-2">Inquiry Type</label>
        <Select value={form.type} onValueChange={(v) => update("type", v)}>
          <SelectTrigger data-testid="inquiry-type-select" className="bg-transparent border-white/20 text-[#F5F5F0] rounded-none h-12 focus:ring-wine">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#141414] border-white/10 text-[#F5F5F0]">
            {TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value} data-testid={`inquiry-type-${t.value}`}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {form.type === "wineclub" && (
        <div data-testid="club-preference-field">
          <label className="overline block mb-2">Which Club?</label>
          <Select value={form.club_preference} onValueChange={(v) => update("club_preference", v)}>
            <SelectTrigger data-testid="club-preference-select" className="bg-transparent border-white/20 text-[#F5F5F0] rounded-none h-12 focus:ring-wine">
              <SelectValue placeholder="Select a club" />
            </SelectTrigger>
            <SelectContent className="bg-[#141414] border-white/10 text-[#F5F5F0]">
              <SelectItem value="Reds Only" data-testid="club-option-reds">Reds Only</SelectItem>
              <SelectItem value="All Wines" data-testid="club-option-all">All Wines</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="overline block mb-2">Name</label>
          <input required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} placeholder="Your name" data-testid="inquiry-name" />
        </div>
        <div>
          <label className="overline block mb-2">Email</label>
          <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} placeholder="you@email.com" data-testid="inquiry-email" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="overline block mb-2">Phone (optional)</label>
          <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputCls} placeholder="Phone" data-testid="inquiry-phone" />
        </div>
        <div>
          <label className="overline block mb-2">Subject (optional)</label>
          <input value={form.subject} onChange={(e) => update("subject", e.target.value)} className={inputCls} placeholder="Subject" data-testid="inquiry-subject" />
        </div>
      </div>
      <div>
        <label className="overline block mb-2">Message</label>
        <textarea required rows={5} value={form.message} onChange={(e) => update("message", e.target.value)} className={inputCls} placeholder="How can we help?" data-testid="inquiry-message" />
      </div>
      <button type="submit" disabled={loading} data-testid="inquiry-submit-button" className="bg-wine hover:bg-wine-hover text-[#F5F5F0] px-9 py-4 text-[0.8rem] tracking-[0.16em] uppercase transition-colors disabled:opacity-60 w-full sm:w-auto">
        {loading ? "Sending..." : "Send Inquiry"}
      </button>
    </form>
  );
}
