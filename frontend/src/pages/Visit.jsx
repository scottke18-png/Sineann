import { ASSETS } from "@/lib/assets";
import { usePageContent } from "@/lib/usePageContent";
import { PageHeader } from "@/components/PageHeader";
import InquiryForm from "@/components/InquiryForm";
import { MapPin, Clock } from "lucide-react";

export default function Visit() {
  const c = usePageContent("visit");
  return (
    <div data-testid="visit-page">
      <PageHeader overline={c.overline || "Visit"} title={c.title || "Sit with us a while"} subtitle={c.body} image={ASSETS.heroVineyard} />
      <section className="px-6 pb-28">
        <div className="max-w-[1100px] mx-auto grid lg:grid-cols-2 gap-14">
          <div className="space-y-8">
            <div className="bg-[#141414] border border-white/10 p-8 flex gap-5">
              <Clock className="text-wine shrink-0 mt-1" size={22} />
              <div>
                <p className="overline mb-2">Hours</p>
                <p className="text-[#F5F5F0] whitespace-pre-line leading-relaxed text-sm">{c.hours || "Fri – Sun · 11am – 5pm"}</p>
              </div>
            </div>
            <div className="bg-[#141414] border border-white/10 p-8 flex gap-5">
              <MapPin className="text-wine shrink-0 mt-1" size={22} />
              <div>
                <p className="overline mb-2">Address</p>
                <p className="text-[#F5F5F0] leading-relaxed text-sm">{c.address || "12 Vineyard Lane, Willamette Valley, OR"}</p>
              </div>
            </div>
            <div className="border border-white/10 overflow-hidden aspect-[16/10] celtic-weave p-2">
              <img src={ASSETS.cellar} alt="Tasting room" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="bg-[#141414] border border-white/10 p-10">
            <p className="overline mb-3">Request an Appointment</p>
            <h2 className="font-heading text-3xl font-light text-[#F5F5F0] mb-8">Plan your visit</h2>
            <InquiryForm defaultType="visit" subject="Visit request" />
          </div>
        </div>
      </section>
    </div>
  );
}
