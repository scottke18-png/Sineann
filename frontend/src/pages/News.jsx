import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { ASSETS } from "@/lib/assets";
import { PageHeader } from "@/components/PageHeader";

export default function News() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    api.get("/posts").then((r) => setPosts(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="news-page">
      <PageHeader overline="Newsletter & News" title="From the Cellar" subtitle="Winemaker updates, seasonal releases, and stories behind the labels." image={ASSETS.cellar} />
      <section className="px-6 pb-28">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-10">
          {posts.map((p) => (
            <Link key={p.id} to={`/news/${p.slug}`} data-testid={`news-card-${p.slug}`} className="group block bg-[#141414] border border-white/10 hover:border-wine/50 transition-all duration-500 hover:-translate-y-1">
              <div className="aspect-[16/9] overflow-hidden">
                <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8">
                <p className="overline mb-3">{new Date(p.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {p.author}</p>
                <h3 className="font-heading text-2xl sm:text-3xl font-light text-[#F5F5F0] mb-3 leading-snug group-hover:text-white transition-colors">{p.title}</h3>
                <p className="text-secondary text-sm leading-relaxed mb-4">{p.excerpt}</p>
                <span className="text-[0.75rem] tracking-[0.16em] uppercase text-wine">Read More →</span>
              </div>
            </Link>
          ))}
        </div>
        {posts.length === 0 && <p className="text-center text-secondary py-20">No posts yet.</p>}
      </section>
    </div>
  );
}
