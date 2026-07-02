import { ASSETS } from "@/lib/assets";
import { usePageContent } from "@/lib/usePageContent";
import { PageHeader } from "@/components/PageHeader";
import InquiryForm from "@/components/InquiryForm";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const c = usePageContent("contact");
  return (
    <div data-testid="contact-page">
      <PageHeader overline={c.overline || "Contact"} title={c.title || "Start a conversation"} subtitle={c.body} image={ASSETS.heroAlt} />
      <section className="px-6 pb-28">
        <div className="max-w-[1100px] mx-auto grid lg:grid-cols-5 gap-14">
          <div className="lg:col-span-2 space-y-6">
            <ContactRow icon={Mail} label="Email" value={c.email || "hello@sineann.com"} />
            <ContactRow icon={Phone} label="Phone" value={c.phone || "(503) 341-2698"} />
            <ContactRow icon={MapPin} label="Tasting Room" value={"8400 Champoeg Rd.\nSt Paul, OR 97137"} />
            <div className="border border-white/10 overflow-hidden aspect-[4/3] celtic-weave p-2">
              <img src={ASSETS.heroVineyard} alt="Estate" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-3 bg-[#141414] border border-white/10 p-10">
            <p className="overline mb-3">Send a Message</p>
            <h2 className="font-heading text-3xl font-light text-[#F5F5F0] mb-8">How can we help?</h2>
            <InquiryForm defaultType="general" />
          </div>
        </div>
      </section>
    </div>
  );
}

const ContactRow = ({ icon: Icon, label, value }) => (
  <div className="flex gap-4 bg-[#141414] border border-white/10 p-6">
    <Icon className="text-wine shrink-0 mt-1" size={20} />
    <div>
      <p className="overline mb-1">{label}</p>
      <p className="text-[#F5F5F0] text-sm whitespace-pre-line leading-relaxed">{value}</p>
    </div>
  </div>
);
