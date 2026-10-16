import {useEffect,useState} from "react";
import {api} from "@/api/client";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { distillery } from "@/data/spirits";
import ReviewsSection from "@/components/ReviewsSection";

export default function Home() {
  const [spirits,setSpirits]=useState([]);
  useEffect(()=>{
    const controller=new AbortController();
    api.entities.Product.filter({in_stock:true},{signal:controller.signal})
      .then(r=>setSpirits(r.items.slice(0,3))).catch(()=>setSpirits([]));
    return ()=>controller.abort();
  },[]);
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative h-screen min-h-[640px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={distillery.heroImage}
            alt="Copper pot stills inside Copper Pirates Distillery"
            fittingType="fill"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 pb-20 md:pb-28 w-full">
          <div className="max-w-3xl">
            <p className="font-label text-xs text-copper mb-6 animate-rise">
              {distillery.city}, {distillery.state} · {distillery.coordinates}
            </p>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-parchment leading-[0.95] mb-8 animate-rise" style={{ animationDelay: "0.1s" }}>
              Converting Cowboys
              <br />
              to <span className="text-copper italic">Pirates</span>.
              <span className="block text-2xl md:text-3xl mt-4">Everyday.</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-parchment/85 leading-relaxed max-w-xl mb-10 animate-rise" style={{ animationDelay: "0.2s" }}>
              A distinct Caribbean-style rum, distilled high in the Rocky
              Mountains. This is whiskey country. We came to change that.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4 animate-rise" style={{ animationDelay: "0.3s" }}>
              <Link
                to="/spirits"
                className="inline-flex items-center gap-3 px-8 py-4 bg-copper text-background font-label text-sm tracking-widest uppercase hover:bg-copper/90 transition-colors"
              >
                Explore the Rum
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-3 px-8 py-4 border border-parchment/30 text-parchment font-label text-sm tracking-widest uppercase hover:border-copper hover:text-copper transition-colors"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro / Manifesto */}
      <section className="py-24 md:py-36">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 text-center">
          <p className="font-label text-xs text-copper mb-8">The Manifesto</p>
          <p className="font-display text-3xl md:text-4xl lg:text-5xl text-parchment leading-[1.2]">
            In a land where the whiskey flows and the boots are worn thin, we
            built a still and pointed it south — toward the Caribbean, toward
            the spice trade, toward the open sea. What came out is a rum unlike
            any other. <span className="text-copper italic">A frontier rum.</span>
          </p>
        </div>
      </section>

      {/* Featured Spirits */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <p className="font-label text-xs text-copper mb-4">The Manifest</p>
              <h2 className="font-display text-4xl md:text-5xl text-parchment leading-tight">
                Bottles from the hold
              </h2>
            </div>
            <Link
              to="/spirits"
              className="inline-flex items-center gap-2 font-label text-xs tracking-widest text-copper hover:gap-3 transition-all"
            >
              View all spirits <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {spirits.map((s) => (
              <Link to={`/spirits/${s.slug}`}
                key={s.id}
                className="group block border border-border bg-card/50 hover:border-copper/50 transition-colors"
              >
                <div className="aspect-[4/5] overflow-hidden bg-muted relative">
                  <Image
                    src={s.image}
                    alt={s.name}
                    fittingType="fill"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute top-4 right-4 w-8 h-8 rounded-full border border-parchment/30"
                    style={{ backgroundColor: s.color }}
                  />
                </div>
                <div className="p-7">
                  <p className="font-label text-[10px] text-copper mb-2">
                    {s.tagline}
                  </p>
                  <h3 className="font-display text-2xl text-parchment mb-3 leading-tight">
                    {s.name}
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-5">
                    {s.description}
                  </p>
                  <div className="flex items-center justify-between font-label text-[10px] text-muted-foreground">
                    <span>{s.abv}</span>
                    <span>{s.age}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Craft Teaser */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={distillery.craftImage}
            alt="Inside the distillation room"
            fittingType="fill"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/75" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-6 lg:px-10 text-center">
          <p className="font-label text-xs text-copper mb-8">The Craft</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-parchment leading-tight mb-8">
            Copper stills. Mountain water. A slow, deliberate fire.
          </h2>
          <p className="font-body text-xl text-parchment/85 leading-relaxed mb-10">
            Every bottle is pot-distilled in hand-formed copper, proofed with
            snowmelt from the Continental Divide, and watched over by people
            who treat rum like a frontier discipline.
          </p>
          <Link
            to="/craft"
            className="inline-flex items-center gap-3 px-8 py-4 border border-parchment/30 text-parchment font-label text-sm tracking-widest uppercase hover:border-copper hover:text-copper transition-colors"
          >
            See the process <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Story Teaser */}
      <section className="py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <p className="font-label text-xs text-copper mb-6">Our Story</p>
            <h2 className="font-display text-4xl md:text-5xl text-parchment leading-tight mb-6">
              How a cowboy found the spirit of the sea
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
              We didn't set out to make rum. We set out to make something that
              didn't exist in Montana — something that would turn heads in a
              room full of whiskey. What we found was a spirit with its own
              compass.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 font-label text-xs tracking-widest text-copper hover:gap-3 transition-all"
            >
              Read the full story <ArrowRight size={14} />
            </Link>
          </div>
          <div className="aspect-[4/3] overflow-hidden border border-border">
            <Image
              src={distillery.pourImage}
              alt="A pour of aged rum"
              fittingType="fill"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Reviews */}
      <ReviewsSection />

    </div>
  );
}