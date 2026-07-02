import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function NewsletterManager() {
  const [subs, setSubs] = useState([]);
  useEffect(() => { api.get("/newsletter").then((r) => setSubs(r.data)).catch(() => {}); }, []);

  const exportCsv = () => {
    const rows = ["email,name,date", ...subs.map((s) => `${s.email},${s.name || ""},${new Date(s.created_at).toLocaleDateString()}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sineann-subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div data-testid="newsletter-manager">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading text-2xl text-[#F5F5F0]">Newsletter <span className="text-secondary text-base">({subs.length})</span></h2>
        {subs.length > 0 && <button onClick={exportCsv} className="border border-white/20 hover:border-white/50 text-[#A8A39D] hover:text-[#F5F5F0] px-5 py-2.5 text-[0.75rem] tracking-[0.14em] uppercase" data-testid="export-csv-btn">Export CSV</button>}
      </div>
      <div className="border border-white/10 divide-y divide-white/10">
        {subs.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-4" data-testid={`subscriber-${s.id}`}>
            <span className="text-[#F5F5F0] text-sm">{s.email}</span>
            <span className="text-secondary text-xs">{new Date(s.created_at).toLocaleDateString()}</span>
          </div>
        ))}
        {subs.length === 0 && <p className="text-secondary p-4">No subscribers yet.</p>}
      </div>
    </div>
  );
}
