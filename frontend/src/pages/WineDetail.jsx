import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { CelticDivider } from "@/components/CelticDivider";
import InquiryForm from "@/components/InquiryForm";

export default function WineDetail() {
  const { slug } = useParams();
  const [wine, setWine] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setWine(null);
    setNotFound(false);
    api.get(`/wines/${slug}`).then((r) => setWine(r.data)).catch(() => setNotFound(true));
  }, [slug]);

  if (notFound)
    return (
      <div className="pt-40 pb-40 text-center" data-testid="wine-not-found">
        <p className="text-secondary mb-6">This wine could not be found.</p>
        <Link to="/wines" className="text-wine link-underline uppercase text-sm tracking-[0.16em]">Back to Wines</Link>
      </div>
    );

  if (!wine) return <div className="pt-40 pb-40 text-center text-secondary">Loading…</div>;

  return (
    <div className="pt-32" data-testid="wine-detail-page">
      <div className="max-w-[1300px] mx-auto px-6 py-12">
        <Link to="/wines" className="text-secondary text-xs tracking-[0.16em] uppercase hover:text-[#F5F5F0] transition-colors">← Our Wines</Link>
        <div className="grid lg:grid-cols-2 gap-16 mt-10 items-start">
          <div className="lg:sticky lg:top-28">
            <div className="bg-black border border-white/10 aspect-[3/4] flex items-center justify-center overflow-hidden">
              <img src={wine.image_url} alt={wine.name} className="h-full w-full object-cover" data-testid="wine-detail-image" />
            </div>
          </div>
          <div>
            {wine.series === "Train Graffiti" && <p className="overline text-wine mb-3">Train Graffiti Art Series</p>}
            <p className="overline mb-3">{wine.varietal} {wine.vintage && `· ${wine.vintage}`}</p>
            <h1 className="font-heading text-4xl sm:text-5xl font-light text-[#F5F5F0] mb-5 leading-tight" data-testid="wine-detail-name">{wine.name}</h1>
            <div className="flex items-center gap-5 mb-8">
              <span className="text-2xl font-heading text-[#F5F5F0]">{wine.price}</span>
              <span className={`text-[0.7rem] tracking-[0.16em] uppercase px-3 py-1 border ${wine.availability === "Available" ? "border-white/20 text-[#A8A39D]" : "border-wine text-wine"}`}>
                {wine.availability}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-y-5 gap-x-6 border-y border-white/10 py-7 mb-8">
              <Detail label="Vineyard" value={wine.vineyard} />
              <Detail label="Appellation" value={wine.appellation} />
              <Detail label="Varietal" value={wine.varietal} />
              <Detail label="Vintage" value={wine.vintage} />
            </dl>

            {wine.tasting_notes && (
              <div className="mb-7">
                <p className="overline mb-3">Tasting Notes</p>
                <p className="text-secondary leading-relaxed">{wine.tasting_notes}</p>
              </div>
            )}
            {wine.production_notes && (
              <div className="mb-9">
                <p className="overline mb-3">Production</p>
                <p className="text-secondary leading-relaxed">{wine.production_notes}</p>
              </div>
            )}

            {wine.label_image_url && (
              <div className="mb-9">
                <p className="overline mb-3">Label Detail</p>
                <div className="border border-white/10 overflow-hidden aspect-[16/9]">
                  <img src={wine.label_image_url} alt={`${wine.name} label`} className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <a href="#inquire" className="bg-wine hover:bg-wine-hover text-[#F5F5F0] px-9 py-4 text-[0.8rem] tracking-[0.16em] uppercase transition-colors inline-block" data-testid="wine-inquire-btn">
              Inquire to Purchase
            </a>
          </div>
        </div>
      </div>

      <section id="inquire" className="celtic-weave border-t border-white/10 py-24 px-6 mt-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <CelticDivider className="mb-8" />
            <p className="overline mb-4">Direct Purchase</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-light text-[#F5F5F0]">Inquire about {wine.name}</h2>
          </div>
          <InquiryForm defaultType="purchase" subject={`${wine.name} ${wine.vintage || ""}`.trim()} />
        </div>
      </section>
    </div>
  );
}

const Detail = ({ label, value }) =>
  value ? (
    <div>
      <dt className="overline mb-1">{label}</dt>
      <dd className="text-[#F5F5F0] text-sm font-light">{value}</dd>
    </div>
  ) : null;
