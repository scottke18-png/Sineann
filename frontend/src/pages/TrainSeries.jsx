import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { ASSETS } from "@/lib/assets";
import { usePageContent } from "@/lib/usePageContent";
import { CelticDivider } from "@/components/CelticDivider";
import { WineCard } from "@/components/WineCard";

export default function TrainSeries() {
  const c = usePageContent("train");
  const [wines, setWines] = useState([]);

  useEffect(() => {
    api.get("/wines", { params: { series: "Train Graffiti" } }).then((r) => setWines(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="train-series-page">
      {/* HERO */}
      <section className="relative h-[70vh] min-h-[520px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={ASSETS.graffiti} alt="Train Graffiti Art Series" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative text-center px-6 max-w-3xl">
          <p className="overline mb-5 text-wine">{c.overline || "Current Feature"}</p>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-light text-[#F5F5F0] mb-6 leading-[1.05]">
            {c.title || "The Train Graffiti Art Series"}
          </h1>
          <p className="text-secondary text-lg font-light">{c.subtitle || "Railway street art meets estate winemaking"}</p>
        </div>
      </section>

      {/* STORY */}
      <section className="py-24 px-6 celtic-bg">
        <div className="max-w-[900px] mx-auto text-center">
          <CelticDivider className="mb-10" />
          {(c.body || "").split("\n\n").map((p, i) => (
            <p key={i} className="text-secondary text-lg leading-relaxed mb-6 font-light">{p}</p>
          ))}
        </div>
      </section>

      {/* SERIES WINES */}
      <section className="py-20 px-6 bg-[#080808]">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-center mb-14">
            <p className="overline mb-4">The Releases</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-light text-[#F5F5F0]">Artist Series Bottlings</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {wines.map((w) => <WineCard key={w.id} wine={w} />)}
          </div>
          {wines.length === 0 && <p className="text-center text-secondary">Releases coming soon.</p>}
        </div>
      </section>

      <section className="py-24 px-6 text-center celtic-weave border-t border-white/10">
        <div className="max-w-xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl font-light text-[#F5F5F0] mb-6">Reserve an Artist Series bottle</h2>
          <Link to="/contact" className="bg-wine hover:bg-wine-hover text-[#F5F5F0] px-9 py-4 text-[0.8rem] tracking-[0.16em] uppercase transition-colors inline-block">
            Make an Inquiry
          </Link>
        </div>
      </section>
    </div>
  );
}
