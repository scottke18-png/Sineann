import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { ASSETS } from "@/lib/assets";
import { CelticDivider } from "@/components/CelticDivider";
import { WineCard } from "@/components/WineCard";

export default function Home() {
  const [content, setContent] = useState({});
  const [wines, setWines] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get("/pages/home").then((r) => setContent(r.data.content || {})).catch(() => {});
    api.get("/wines", { params: { featured: true } }).then((r) => setWines(r.data.slice(0, 3))).catch(() => {});
    api.get("/posts").then((r) => setPosts(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative h-[100svh] min-h-[640px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={ASSETS.heroVineyard} alt="Sineann vineyard" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-fade" />
        </div>
        <div className="relative text-center px-6 max-w-4xl">
          <img
            src={ASSETS.logoFull}
            alt="Sineann"
            data-testid="hero-logo"
            className="w-40 sm:w-52 lg:w-60 mx-auto mb-8 animate-fade-in drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)]"
          />
          <p className="overline mb-6 animate-fade-in">{content.hero_overline || "Established 1878 · Estate Grown"}</p>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-[#F5F5F0] leading-[1.05] mb-7 animate-fade-up">
            {content.hero_title || "Wines woven from heritage & craft"}
          </h1>
          <p className="text-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10 font-light">
            {content.hero_subtitle || "Vineyard-driven winemaking meant to be shared around the table."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/wines" data-testid="hero-wines-btn" className="bg-wine hover:bg-wine-hover text-[#F5F5F0] px-9 py-4 text-[0.8rem] tracking-[0.16em] uppercase transition-colors">
              Explore Our Wines
            </Link>
            <Link to="/visit" data-testid="hero-visit-btn" className="border border-white/30 hover:border-white/70 text-[#F5F5F0] px-9 py-4 text-[0.8rem] tracking-[0.16em] uppercase transition-colors">
              Plan a Visit
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-secondary text-xs tracking-[0.2em] uppercase animate-pulse">
          Scroll
        </div>
      </section>

      {/* INTRO / STORY */}
      <section className="celtic-bg py-28 px-6" data-testid="home-intro">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img src={ASSETS.cellar} alt="Our cellar" className="w-full aspect-[4/5] object-cover border border-white/10" />
            <div className="absolute -bottom-6 -right-6 hidden md:block bg-[#141414] border border-white/10 px-8 py-6">
              <p className="font-heading text-4xl text-[#F5F5F0]">1878</p>
              <p className="overline mt-1">Since</p>
            </div>
          </div>
          <div>
            <p className="overline mb-5">{content.intro_overline || "Our Approach"}</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-light text-[#F5F5F0] mb-7 leading-tight">
              {content.intro_title || "Patient winemaking, honest fruit"}
            </h2>
            <p className="text-secondary text-base leading-relaxed mb-8">
              {content.intro_body || "Exceptional wine begins in the vineyard and is finished with restraint."}
            </p>
            <Link to="/story" className="link-underline text-[0.8rem] tracking-[0.16em] uppercase text-[#F5F5F0]">
              Read Our Story →
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED WINES */}
      <section className="py-24 px-6 bg-[#080808]" data-testid="home-featured-wines">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-center mb-16">
            <p className="overline mb-4">Current Releases</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-light text-[#F5F5F0]">Featured Wines</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {wines.map((w) => <WineCard key={w.id} wine={w} />)}
          </div>
          <div className="text-center mt-14">
            <Link to="/wines" className="border border-white/25 hover:bg-wine hover:border-wine text-[#F5F5F0] px-9 py-4 text-[0.8rem] tracking-[0.16em] uppercase transition-all inline-block">
              View All Wines
            </Link>
          </div>
        </div>
      </section>

      {/* TRAIN GRAFFITI FEATURE */}
      <section className="relative py-32 px-6 overflow-hidden" data-testid="home-train-feature">
        <div className="absolute inset-0">
          <img src={ASSETS.graffiti} alt="Train Graffiti Art Series" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 to-transparent" />
        </div>
        <div className="relative max-w-[1300px] mx-auto">
          <div className="max-w-xl">
            <p className="overline mb-5 text-wine">Current Feature</p>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light text-[#F5F5F0] mb-6 leading-tight">
              The Train Graffiti Art Series
            </h2>
            <p className="text-secondary text-base leading-relaxed mb-9">
              A current, expressive line within the broader Sineann story. Bold original label art — created under signed artist permission — paired with generous wines made to be shared.
            </p>
            <Link to="/train-series" data-testid="home-train-cta" className="bg-wine hover:bg-wine-hover text-[#F5F5F0] px-9 py-4 text-[0.8rem] tracking-[0.16em] uppercase transition-colors inline-block">
              Discover the Series
            </Link>
          </div>
        </div>
      </section>

      {/* VISIT + WINE CLUB */}
      <section className="py-24 px-6 celtic-bg" data-testid="home-visit-club">
        <div className="max-w-[1300px] mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-[#141414] border border-white/10 p-12 flex flex-col">
            <p className="overline mb-4">Visit</p>
            <h3 className="font-heading text-3xl font-light text-[#F5F5F0] mb-4">Sit with us a while</h3>
            <p className="text-secondary text-sm leading-relaxed mb-8 flex-1">
              Taste current releases, walk the estate, and hear the stories behind the labels. Open weekends and by appointment.
            </p>
            <Link to="/visit" className="link-underline text-[0.8rem] tracking-[0.16em] uppercase text-[#F5F5F0] self-start">
              Plan Your Visit →
            </Link>
          </div>
          <div className="bg-[#141414] border border-white/10 p-12 flex flex-col celtic-weave">
            <p className="overline mb-4">Wine Club</p>
            <h3 className="font-heading text-3xl font-light text-[#F5F5F0] mb-4">Join the table</h3>
            <p className="text-secondary text-sm leading-relaxed mb-8 flex-1">
              First access to new releases, member pricing, and event invitations. Choose Reds Only or All Wines.
            </p>
            <Link to="/wine-club" className="link-underline text-[0.8rem] tracking-[0.16em] uppercase text-[#F5F5F0] self-start">
              Explore Membership →
            </Link>
          </div>
        </div>
      </section>

      {/* LATEST NEWS */}
      {posts.length > 0 && (
        <section className="py-24 px-6 bg-[#080808]" data-testid="home-news">
          <div className="max-w-[1300px] mx-auto">
            <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
              <div>
                <p className="overline mb-4">From the Cellar</p>
                <h2 className="font-heading text-4xl sm:text-5xl font-light text-[#F5F5F0]">Latest News</h2>
              </div>
              <Link to="/news" className="link-underline text-[0.8rem] tracking-[0.16em] uppercase text-[#A8A39D] hover:text-[#F5F5F0]">
                All Posts →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {posts.map((p) => (
                <Link key={p.id} to={`/news/${p.slug}`} data-testid={`home-post-${p.slug}`} className="group block">
                  <div className="aspect-[16/10] overflow-hidden border border-white/10 mb-5">
                    <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <p className="overline mb-2">{new Date(p.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                  <h3 className="font-heading text-2xl font-light text-[#F5F5F0] group-hover:text-white transition-colors leading-snug">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT CTA */}
      <section className="py-28 px-6 text-center celtic-weave border-t border-white/10" data-testid="home-contact-cta">
        <div className="max-w-2xl mx-auto">
          <CelticDivider className="mb-10" />
          <h2 className="font-heading text-4xl sm:text-5xl font-light text-[#F5F5F0] mb-6">Bring Sineann to your table</h2>
          <p className="text-secondary text-base mb-9 leading-relaxed">
            We sell directly through personal inquiry. Tell us what you're after and we'll be in touch.
          </p>
          <Link to="/contact" className="bg-wine hover:bg-wine-hover text-[#F5F5F0] px-10 py-4 text-[0.8rem] tracking-[0.16em] uppercase transition-colors inline-block">
            Make an Inquiry
          </Link>
        </div>
      </section>
    </div>
  );
}
