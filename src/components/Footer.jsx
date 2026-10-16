import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { distillery } from "@/data/spirits";
import BrandMark from "@/components/BrandMark";
import LicensePlaceholder from "@/components/LicensePlaceholder";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-2xl text-parchment mb-3">
              <BrandMark />
            </p>
            <p className="font-body text-muted-foreground leading-relaxed max-w-sm">
              Converting Cowboys to Pirates. Everyday. A family-owned Montana rum brand beginning a focused relaunch.
            </p>
          </div>

          <div>
            <p className="font-label text-[11px] text-copper mb-5">Explore</p>
            <ul className="space-y-3">
              {[
                { label: "Our Rum", path: "/spirits" },
                { label: "Cocktails", path: "/cocktails" },
  { label: "The Craft", path: "/craft" },
                { label: "Our Story", path: "/about" },
                { label: "Distribution", path: "/distribution" },
                { label: "Contact", path: "/contact" },
              ].map((l) => (
                <li key={l.path}>
                  <Link
                    to={l.path}
                    className="font-body text-muted-foreground hover:text-copper transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-label text-[11px] text-copper mb-5">Home Port</p>
            <p className="font-body text-muted-foreground leading-relaxed mb-4 flex items-start gap-2">
              <MapPin size={16} className="mt-1 shrink-0 text-copper/70" />
              {distillery.city}, {distillery.state} {distillery.zip}
            </p>
            <p className="bg-yellow-200 text-black p-2 text-sm">XXXX — Official social profile links</p>
          </div>
        </div>

        <nav aria-label="Customer information" className="flex flex-wrap gap-x-6 gap-y-4 mt-10">
          {[["privacy","Privacy"],["terms","Terms"],["responsible","Responsible Consumption"]].map(([slug,label])=><Link className="underline" key={slug} to={"/policies/"+slug}>{label}</Link>)}
        </nav>
        <div className="hairline my-10" />

        <div className="flex flex-col gap-4">
          <LicensePlaceholder label="Legal producer name, attribution, licensing authority and disclosures" />
        </div>
        <div className="hairline my-6" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-label text-[10px] text-muted-foreground/70 tracking-widest">
            © {new Date().getFullYear()} Copper Pirates Montana Rum · All rights reserved
          </p>
          <p className="font-label text-[10px] text-muted-foreground/70 tracking-widest text-center">
            Please drink responsibly · 21+ only
          </p>
        </div>
      </div>
    </footer>
  );
}