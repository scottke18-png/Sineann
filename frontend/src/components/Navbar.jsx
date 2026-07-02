import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { api } from "@/lib/api";

const NAV = [
  { to: "/wines", label: "Our Wines" },
  { to: "/story", label: "Our Story" },
  { to: "/train-series", label: "Art Series" },
  { to: "/wine-club", label: "Wine Club" },
  { to: "/visit", label: "Visit" },
  { to: "/news", label: "News" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navLabels, setNavLabels] = useState({});
  const location = useLocation();

  useEffect(() => {
    api.get("/pages/train").then((r) => {
      const label = r.data?.content?.nav_label;
      if (label) setNavLabels((n) => ({ ...n, "/train-series": label }));
    }).catch(() => {});
  }, []);

  const labelFor = (item) => navLabels[item.to] || item.label;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      data-testid="site-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "backdrop-blur-xl bg-black/70 border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-3 group">
          <img src={ASSETS.logo} alt="Sineann" className="h-11 w-11 object-contain" />
          <span className="hidden sm:block font-heading text-2xl tracking-[0.25em] text-[#F5F5F0]">
            SINEANN
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={`nav-${item.to.replace("/", "")}`}
              className={({ isActive }) =>
                `link-underline text-[0.8rem] tracking-[0.14em] uppercase transition-colors ${
                  isActive ? "text-[#F5F5F0]" : "text-[#A8A39D] hover:text-[#F5F5F0]"
                }`
              }
            >
              {labelFor(item)}
            </NavLink>
          ))}
          <Link
            to="/contact"
            data-testid="nav-contact-cta"
            className="border border-white/25 text-[0.8rem] tracking-[0.14em] uppercase px-5 py-2.5 text-[#F5F5F0] hover:bg-wine hover:border-wine transition-all duration-300"
          >
            Contact
          </Link>
        </nav>

        <button
          data-testid="mobile-menu-toggle"
          className="lg:hidden text-[#F5F5F0]"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/10" data-testid="mobile-menu">
          <nav className="flex flex-col px-6 py-6 gap-5">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[#A8A39D] hover:text-[#F5F5F0] text-sm tracking-[0.14em] uppercase"
              >
                {labelFor(item)}
              </Link>
            ))}
            <Link to="/contact" className="text-wine hover:text-wine-hover text-sm tracking-[0.14em] uppercase">
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
