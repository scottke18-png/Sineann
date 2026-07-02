import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ASSETS } from "@/lib/assets";
import { PageHeader } from "@/components/PageHeader";
import { WineCard } from "@/components/WineCard";

export default function Wines() {
  const [wines, setWines] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    api.get("/wines").then((r) => setWines(r.data)).catch(() => {});
  }, []);

  const filters = ["All", ...Array.from(new Set(wines.map((w) => w.series).filter(Boolean)))];
  const shown = filter === "All" ? wines : wines.filter((w) => w.series === filter);

  return (
    <div data-testid="wines-page">
      <PageHeader
        overline="The Collection"
        title="Our Wines"
        subtitle="Estate-grown expressions and current featured releases — each a chapter in the Sineann story."
        image={ASSETS.heroAlt}
      />
      <section className="px-6 pb-28">
        <div className="max-w-[1300px] mx-auto">
          <div className="flex justify-center gap-3 mb-14 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                data-testid={`wine-filter-${f.replace(/\s+/g, "-")}`}
                className={`px-6 py-2.5 text-[0.75rem] tracking-[0.16em] uppercase border transition-all ${
                  filter === f ? "bg-wine border-wine text-[#F5F5F0]" : "border-white/20 text-[#A8A39D] hover:text-[#F5F5F0] hover:border-white/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {shown.map((w) => <WineCard key={w.id} wine={w} />)}
          </div>
          {shown.length === 0 && <p className="text-center text-secondary py-20">No wines in this collection yet.</p>}
        </div>
      </section>
    </div>
  );
}
