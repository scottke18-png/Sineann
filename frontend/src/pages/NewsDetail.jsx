import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { CelticDivider } from "@/components/CelticDivider";

export default function NewsDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setPost(null);
    setNotFound(false);
    api.get(`/posts/${slug}`).then((r) => setPost(r.data)).catch(() => setNotFound(true));
  }, [slug]);

  if (notFound)
    return (
      <div className="pt-40 pb-40 text-center" data-testid="post-not-found">
        <p className="text-secondary mb-6">This post could not be found.</p>
        <Link to="/news" className="text-wine link-underline uppercase text-sm tracking-[0.16em]">Back to News</Link>
      </div>
    );
  if (!post) return <div className="pt-40 pb-40 text-center text-secondary">Loading…</div>;

  return (
    <article className="pt-32 pb-28" data-testid="news-detail-page">
      <div className="max-w-[820px] mx-auto px-6">
        <Link to="/news" className="text-secondary text-xs tracking-[0.16em] uppercase hover:text-[#F5F5F0] transition-colors">← All News</Link>
        <p className="overline mt-10 mb-4">{new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.author}</p>
        <h1 className="font-heading text-4xl sm:text-5xl font-light text-[#F5F5F0] leading-tight mb-8" data-testid="post-title">{post.title}</h1>
      </div>
      {post.cover_image && (
        <div className="max-w-[980px] mx-auto px-6 mb-12">
          <div className="aspect-[16/9] overflow-hidden border border-white/10">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}
      <div className="max-w-[720px] mx-auto px-6">
        {(post.body || "").split("\n\n").map((p, i) => (
          <p key={i} className="text-secondary text-lg leading-relaxed mb-6 font-light">{p}</p>
        ))}
        <CelticDivider className="mt-14" />
      </div>
    </article>
  );
}
