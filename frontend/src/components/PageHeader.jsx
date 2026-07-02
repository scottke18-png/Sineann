import { CelticDivider } from "@/components/CelticDivider";

export const PageHeader = ({ overline, title, subtitle, image }) => (
  <section className="relative pt-40 pb-16 overflow-hidden" data-testid="page-header">
    {image && (
      <>
        <div className="absolute inset-0">
          <img src={image} alt="" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-[#0A0A0A]" />
      </>
    )}
    <div className="relative max-w-[1000px] mx-auto px-6 text-center">
      {overline && <p className="overline mb-5 animate-fade-in">{overline}</p>}
      <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#F5F5F0] mb-6 animate-fade-up">
        {title}
      </h1>
      {subtitle && (
        <p className="text-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-light">
          {subtitle}
        </p>
      )}
      <CelticDivider className="mt-10" />
    </div>
  </section>
);
