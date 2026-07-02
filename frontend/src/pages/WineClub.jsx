import { ASSETS } from "@/lib/assets";
import { usePageContent } from "@/lib/usePageContent";
import { PageHeader } from "@/components/PageHeader";
import InquiryForm from "@/components/InquiryForm";
import { Check } from "lucide-react";

export default function WineClub() {
  const c = usePageContent("wineclub");
  const benefits = (c.benefits || "").split("\n").filter(Boolean);
  return (
    <div data-testid="wineclub-page">
      <PageHeader overline={c.overline || "Wine Club"} title={c.title || "Join the table"} subtitle={c.body} image={ASSETS.wineDetail} />

      <section className="px-6 pb-20">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-[#141414] border border-white/10 p-10 celtic-weave">
            <p className="overline mb-3 text-wine">Membership</p>
            <h3 className="font-heading text-3xl font-light text-[#F5F5F0] mb-4">{c.reds_title || "Reds Only"}</h3>
            <p className="text-secondary leading-relaxed">{c.reds_body}</p>
          </div>
          <div className="bg-[#141414] border border-white/10 p-10 celtic-weave">
            <p className="overline mb-3 text-wine">Membership</p>
            <h3 className="font-heading text-3xl font-light text-[#F5F5F0] mb-4">{c.all_title || "All Wines"}</h3>
            <p className="text-secondary leading-relaxed">{c.all_body}</p>
          </div>
        </div>
      </section>

      {benefits.length > 0 && (
        <section className="px-6 pb-20">
          <div className="max-w-[900px] mx-auto text-center">
            <p className="overline mb-8">Member Benefits</p>
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3 border border-white/10 px-5 py-4">
                  <Check className="text-wine shrink-0" size={18} />
                  <span className="text-[#F5F5F0] text-sm">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="celtic-weave border-t border-white/10 py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="overline mb-4">Express Interest</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-light text-[#F5F5F0]">Tell us you're interested</h2>
          </div>
          <InquiryForm defaultType="wineclub" subject="Wine Club interest" />
        </div>
      </section>
    </div>
  );
}
