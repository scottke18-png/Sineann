import { ASSETS } from "@/lib/assets";
import { usePageContent } from "@/lib/usePageContent";
import { PageHeader } from "@/components/PageHeader";
import InquiryForm from "@/components/InquiryForm";
import { Wine, Mail, Truck } from "lucide-react";

export default function HowToBuy() {
  const c = usePageContent("howtobuy");
  return (
    <div data-testid="howtobuy-page">
      <PageHeader overline={c.overline || "How to Buy"} title={c.title || "Direct, personal, by inquiry"} subtitle={c.body} image={ASSETS.wineDetail} />
      <section className="px-6 pb-16">
        <div className="max-w-[1000px] mx-auto grid sm:grid-cols-3 gap-6">
          {[
            { icon: Wine, title: "Choose your wines", body: "Browse the collection and note the bottles or cases you'd like." },
            { icon: Mail, title: "Send an inquiry", body: "Tell us what you're after using the form below or by email." },
            { icon: Truck, title: "We arrange it", body: "We'll confirm availability, pricing and delivery, and take care of the rest." },
          ].map((s, i) => (
            <div key={i} className="bg-[#141414] border border-white/10 p-8 text-center">
              <s.icon className="text-wine mx-auto mb-5" size={26} />
              <p className="overline mb-2">Step {i + 1}</p>
              <h3 className="font-heading text-xl text-[#F5F5F0] mb-3">{s.title}</h3>
              <p className="text-secondary text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="celtic-weave border-t border-white/10 py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="overline mb-4">Purchase Inquiry</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-light text-[#F5F5F0]">Request wine</h2>
          </div>
          <InquiryForm defaultType="purchase" subject="Purchase inquiry" />
        </div>
      </section>
    </div>
  );
}
