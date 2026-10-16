import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/spirits/${product.slug}`}
      className="group block border border-border bg-card hover:border-copper/60 transition-colors"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fittingType="fill"
            className="w-full h-full"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        {product.color && (
          <span
            className="absolute top-4 right-4 w-6 h-6 rounded-full border border-parchment/30"
            style={{ backgroundColor: product.color }}
          />
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-label text-[10px] text-copper mb-1">{product.tagline}</p>
          <h3 className="font-display text-2xl text-parchment leading-tight">
            {product.name}
          </h3>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          {product.abv && (
            <span className="font-label text-[10px] text-muted-foreground">
              {product.abv}
            </span>
          )}
          {product.volume_ml && (
            <span className="font-label text-[10px] text-muted-foreground">
              {product.volume_ml}ml
            </span>
          )}
        </div>
        <p className="font-display text-xl text-copper">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}