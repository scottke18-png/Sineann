import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api, formatApiErrorDetail } from "@/lib/api";
import { ASSETS } from "@/lib/assets";
import { CelticDivider } from "@/components/CelticDivider";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { data } = await api.post("/newsletter", { email });
      toast.success(data.status === "already_subscribed" ? "You're already on the list." : "Welcome to the table. You're subscribed.");
      setEmail("");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative bg-[#080808] border-t border-white/10 celtic-weave" data-testid="site-footer">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20">
        <div className="max-w-xl mx-auto text-center mb-16">
          <p className="overline mb-4">The Newsletter</p>
          <h3 className="font-heading text-3xl sm:text-4xl font-light text-[#F5F5F0] mb-5">
            Notes from the cellar
          </h3>
          <p className="text-secondary text-sm mb-7">
            Seasonal releases, winemaker updates, and stories behind the labels.
          </p>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" data-testid="footer-newsletter-form">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              data-testid="footer-newsletter-input"
              className="flex-1 bg-transparent border border-white/20 px-4 py-3 text-sm text-[#F5F5F0] placeholder:text-[#6b6560] focus:outline-none focus:border-wine transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              data-testid="footer-newsletter-submit"
              className="bg-wine hover:bg-wine-hover text-[#F5F5F0] px-7 py-3 text-[0.8rem] tracking-[0.14em] uppercase transition-colors disabled:opacity-60"
            >
              {loading ? "..." : "Subscribe"}
            </button>
          </form>
        </div>

        <CelticDivider className="mb-16" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={ASSETS.logo} alt="Sineann" className="h-10 w-10 object-contain" />
              <span className="font-heading text-xl tracking-[0.25em] text-[#F5F5F0]">SINEANN</span>
            </div>
            <p className="text-secondary text-sm leading-relaxed">
              Estate-grown wines woven from heritage and craft. Established 1878.
            </p>
          </div>
          <FooterCol title="Explore" links={[["Our Wines", "/wines"], ["Our Story", "/story"], ["Art Series", "/train-series"], ["News", "/news"]]} />
          <FooterCol title="Visit & Buy" links={[["Visit Us", "/visit"], ["Wine Club", "/wine-club"], ["How to Buy", "/how-to-buy"], ["Contact", "/contact"]]} />
          <div>
            <p className="overline mb-4">Tasting Room</p>
            <p className="text-secondary text-sm leading-relaxed">
              12 Vineyard Lane<br />Willamette Valley, OR<br /><br />
              Fri–Sun · 11am–5pm<br />(503) 555-0178
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#6b6560] text-xs tracking-wide">© {new Date().getFullYear()} Sineann Winery. All rights reserved.</p>
          <Link to="/admin/login" data-testid="footer-admin-link" className="text-[#6b6560] text-xs tracking-wide hover:text-[#A8A39D] transition-colors">
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  );
};

const FooterCol = ({ title, links }) => (
  <div>
    <p className="overline mb-4">{title}</p>
    <ul className="space-y-2.5">
      {links.map(([label, to]) => (
        <li key={to}>
          <Link to={to} className="text-secondary text-sm hover:text-[#F5F5F0] transition-colors">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);
