import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { distillery } from "@/data/spirits";
import PageHero from "@/components/PageHero";
import LicensePlaceholder from "@/components/LicensePlaceholder";
import ProductCard from "@/components/ProductCard";

export default function Spirits() {
  const [products, setProducts] = useState([]);
  const [error,setError]=useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.entities.Product
      .filter({ in_stock: true }, { sort: "sort_order", limit: 50 })
      .then((r) => setProducts(r.items))
      .catch(()=>setError("The catalog could not be loaded. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-background">
      <PageHero
        label="The Manifest"
        title="A rum for whiskey country"
        subtitle="Eight expressions, each pot-distilled in copper and proofed with mountain snowmelt. No shortcuts, no imitation. Just frontier rum."
        image={distillery.pourImage}
      />

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {error ? <p role="alert">{error} <button className="underline" onClick={()=>window.location.reload()}>Retry</button></p> : loading ? (
            <div className="flex justify-center py-32">
              <div className="w-8 h-8 border-4 border-border border-t-copper rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32">
              <p className="font-body text-lg text-muted-foreground">
                The manifest is being restocked. Check back soon.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <p className="font-label text-xs text-copper mb-3">The Full Line</p>
                  <h2 className="font-display text-3xl md:text-4xl text-parchment">
                    Eight expressions
                  </h2>
                </div>
                <p className="font-body text-muted-foreground max-w-xs md:text-right">
                  Tap any bottle for the full tasting notes, specs, and story.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              <div className="mt-16 pt-8 border-t border-border">
                <LicensePlaceholder label="Retail / Off-Premise License #" />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}