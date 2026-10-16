import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/api/client";
import { distillery } from "@/data/spirits";
import { Image } from "@/components/ui/image";
import { setMeta } from "@/components/Seo";
import LicensePlaceholder from "@/components/LicensePlaceholder";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.entities.Product
      .filter({ slug }, { limit: 1 })
      .then((r) => setProduct(r.items[0] || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if(!product)return;
    document.title=product.name+" | Copper Pirates Distillery";
    setMeta("description",String(product.description || "").slice(0,160));
    setMeta("og:title",document.title,true);
    setMeta("og:description",String(product.description || "").slice(0,160),true);
  },[product]);

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <div className="w-8 h-8 border-4 border-border border-t-copper rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="font-display text-3xl text-parchment mb-4">
          Bottle not found
        </p>
        <Link
          to="/spirits"
          className="font-label text-xs text-copper tracking-widest"
        >
          ← Back to the manifest
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Link
          to="/spirits"
          className="inline-flex items-center gap-2 font-label text-[11px] text-muted-foreground hover:text-copper tracking-widest mb-10"
        >
          <ArrowLeft size={14} /> The Manifest
        </Link>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          <div className="aspect-[4/5] overflow-hidden border border-border bg-muted relative">
            {product.image && (
              <Image
                src={product.image}
                alt={product.name}
                fittingType="fill"
                className="w-full h-full"
              />
            )}
            {product.color && (
              <div
                className="absolute top-5 right-5 w-10 h-10 rounded-full border border-parchment/30"
                style={{ backgroundColor: product.color }}
              />
            )}
          </div>

          <div>
            <p className="font-label text-xs text-copper mb-3">{product.tagline}</p>
            <h1 className="font-display text-4xl md:text-5xl text-parchment leading-tight mb-3">
              {product.name}
            </h1>
            <p className="font-display text-2xl text-copper mb-6">
              ${product.price.toFixed(2)}
              {product.volume_ml && (
                <span className="font-body text-base text-muted-foreground ml-2">
                  · {product.volume_ml}ml
                </span>
              )}
            </p>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {product.abv && (
                <div>
                  <p className="font-label text-[10px] text-muted-foreground mb-1">
                    Strength
                  </p>
                  <p className="font-display text-xl text-parchment">{product.abv}</p>
                </div>
              )}
              {product.age && (
                <div>
                  <p className="font-label text-[10px] text-muted-foreground mb-1">
                    Maturation
                  </p>
                  <p className="font-display text-xl text-parchment">{product.age}</p>
                </div>
              )}
              {product.elevation && (
                <div>
                  <p className="font-label text-[10px] text-muted-foreground mb-1">
                    Distilled at
                  </p>
                  <p className="font-display text-xl text-parchment">
                    {product.elevation}
                  </p>
                </div>
              )}
              <div>
                <p className="font-label text-[10px] text-muted-foreground mb-1">
                  Origin
                </p>
                <p className="font-display text-xl text-parchment">
                  {distillery.city}, {distillery.state}
                </p>
              </div>
            </div>

            {product.notes?.length > 0 && (
              <div className="mb-8">
                <p className="font-label text-[10px] text-copper mb-3">
                  Tasting Notes
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.notes.map((n) => (
                    <span
                      key={n}
                      className="px-4 py-2 border border-border font-body text-sm text-parchment/85"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <AddToCartButton product={product} disabled={!product.in_stock} />
            </div>

            <LicensePlaceholder label="Retail / Off-Premise License #" />
          </div>
        </div>
      </div>
    </div>
  );
}