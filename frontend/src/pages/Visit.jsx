import { ASSETS } from "@/lib/assets";
import { usePageContent } from "@/lib/usePageContent";
import { PageHeader } from "@/components/PageHeader";
import InquiryForm from "@/components/InquiryForm";
import { MapPin, Clock, Phone } from "lucide-react";

const DEFAULT_ADDRESS = "8400 Champoeg Rd.\nSt Paul, OR 97137";
const DEFAULT_PHONE = "(503) 341-2698";

export default function Visit() {
  const c = usePageContent("visit");
  const address = c.address || DEFAULT_ADDRESS;
  const phone = c.phone || DEFAULT_PHONE;
  const mapQuery = encodeURIComponent(address.replace(/\n/g, ", "));
  const mapSrc = `https://www.google.com/maps?q=${mapQuery}&z=14&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

  return (
    <div data-testid="visit-page">
      <PageHeader overline={c.overline || "Visit"} title={c.title || "Sit with us a while"} subtitle={c.body} image={c.hero_image || ASSETS.heroVineyard} />
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
                <p className="text-[#F5F5F0] whitespace-pre-line leading-relaxed text-sm" data-testid="visit-address">{address}</p>
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer" data-testid="visit-directions-link" className="inline-block mt-3 link-underline text-[0.7rem] tracking-[0.16em] uppercase text-wine">
                  Get Directions →
                </a>
              </div>
            </div>
            <div className="bg-[#141414] border border-white/10 p-8 flex gap-5">
              <Phone className="text-wine shrink-0 mt-1" size={22} />
              <div>
                <p className="overline mb-2">Phone</p>
                <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="text-[#F5F5F0] leading-relaxed text-sm hover:text-wine transition-colors" data-testid="visit-phone">{phone}</a>
              </div>
            </div>
            <div className="border border-white/10 overflow-hidden celtic-weave p-2">
              <iframe
                title="Sineann Winery location map"
                data-testid="visit-map"
                src={mapSrc}
                className="w-full aspect-[16/10] border-0 grayscale-[0.2] contrast-[1.05]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
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
