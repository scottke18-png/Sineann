import { Link } from "react-router-dom";

export const WineCard = ({ wine }) => (
  <Link
    to={`/wines/${wine.slug}`}
    data-testid={`wine-card-${wine.slug}`}
    className="group block bg-[#141414] border border-white/10 hover:border-wine/60 transition-all duration-500 hover:-translate-y-1"
  >
    <div className="relative aspect-[3/4] overflow-hidden bg-black flex items-center justify-center">
      {wine.image_url ? (
        <img
          src={wine.image_url}
          alt={wine.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <span className="text-secondary text-sm">No image</span>
      )}
      {wine.series === "Train Graffiti" && (
        <span className="absolute top-3 left-3 bg-wine text-[#F5F5F0] text-[0.6rem] tracking-[0.18em] uppercase px-3 py-1">
          Art Series
        </span>
      )}
      {wine.availability && wine.availability !== "Available" && (
        <span className="absolute top-3 right-3 bg-black/70 border border-white/20 text-[#F5F5F0] text-[0.6rem] tracking-[0.16em] uppercase px-3 py-1">
          {wine.availability}
        </span>
      )}
    </div>
    <div className="p-6">
      <p className="overline mb-2">{wine.varietal} {wine.vintage && `· ${wine.vintage}`}</p>
      <h3 className="font-heading text-2xl font-light text-[#F5F5F0] leading-snug mb-2 group-hover:text-white transition-colors">
        {wine.name}
      </h3>
      <p className="text-secondary text-sm mb-4">{wine.appellation}</p>
      <div className="flex items-center justify-between">
        <span className="text-[#F5F5F0] text-sm">{wine.price}</span>
        <span className="text-[0.7rem] tracking-[0.16em] uppercase text-wine group-hover:translate-x-1 transition-transform">
          View →
        </span>
      </div>
    </div>
  </Link>
);
