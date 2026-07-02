// Shared styling helpers for admin CMS
export const adminInput =
  "w-full bg-[#0A0A0A] border border-white/20 px-4 py-2.5 text-sm text-[#F5F5F0] placeholder:text-[#6b6560] focus:outline-none focus:border-wine transition-colors rounded-none";

export const adminBtn =
  "bg-wine hover:bg-wine-hover text-[#F5F5F0] px-5 py-2.5 text-[0.75rem] tracking-[0.14em] uppercase transition-colors disabled:opacity-60";

export const adminBtnGhost =
  "border border-white/20 hover:border-white/50 text-[#A8A39D] hover:text-[#F5F5F0] px-5 py-2.5 text-[0.75rem] tracking-[0.14em] uppercase transition-colors";

export const Field = ({ label, children }) => (
  <div>
    <label className="overline block mb-1.5">{label}</label>
    {children}
  </div>
);
