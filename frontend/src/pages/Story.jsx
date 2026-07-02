import { Link } from "react-router-dom";
import { ASSETS } from "@/lib/assets";
import { usePageContent } from "@/lib/usePageContent";
import { PageHeader } from "@/components/PageHeader";
import { CelticDivider } from "@/components/CelticDivider";

export default function Story() {
  const c = usePageContent("story");
  return (
    <div data-testid="story-page">
      <PageHeader overline={c.overline || "Our Story"} title={c.title || "A continuous thread"} image={ASSETS.cellar} />
      <section className="px-6 pb-24">
        <div className="max-w-[1100px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            {(c.body || "").split("\n\n").map((p, i) => (
              <p key={i} className="text-secondary leading-relaxed mb-5 text-base">{p}</p>
            ))}
          </div>
          <div className="order-1 lg:order-2 relative celtic-weave p-3 border border-white/10">
            <img src={ASSETS.winemaker} alt="Sineann winemaker" className="w-full aspect-[4/5] object-cover object-top" />
          </div>
        </div>
      </section>

      <section className="celtic-weave border-y border-white/10 py-24 px-6">
        <div className="max-w-[1000px] mx-auto text-center">
          <CelticDivider className="mb-10" />
          <p className="overline mb-4">Heritage</p>
          <h2 className="font-heading text-3xl sm:text-4xl font-light text-[#F5F5F0] mb-6">{c.label_history_title || "A light-touch label history"}</h2>
          <p className="text-secondary leading-relaxed max-w-2xl mx-auto mb-8">{c.label_history_body}</p>
          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            {[ASSETS.label, ASSETS.wineDetail, ASSETS.graffiti].map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden border border-white/10">
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            ))}
          </div>
          <Link to="/train-series" className="inline-block mt-12 link-underline text-[0.8rem] tracking-[0.16em] uppercase text-[#F5F5F0]">
            See the Train Graffiti Art Series →
          </Link>
        </div>
      </section>
    </div>
  );
}
