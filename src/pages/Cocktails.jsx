import { useState } from "react";
import { Link } from "react-router-dom";
import { Wine, ArrowRight } from "lucide-react";
import cocktails from "@/data/cocktails.json";

export default function Cocktails(){
 const [filter,setFilter]=useState("All");
 const choices=["All","White Rum","Orange-Clove Rum","Huckleberry Reserve Rum"];
 const shown=cocktails.filter((c)=>filter==="All" || c.rum.includes(filter));
 return <div className="bg-background pt-32 pb-24">
  <header className="max-w-7xl mx-auto px-6 lg:px-10 mb-14">
   <p className="font-label text-xs text-copper mb-5">Copper Pirates · Signature Cocktails</p>
   <h1 className="font-display text-5xl md:text-7xl text-parchment mb-6">Rum with a little frontier spirit.</h1>
   <p className="font-body text-xl text-muted-foreground max-w-2xl">Explore fourteen cocktails from the supplied menu, featuring white rum, orange-clove rum, and huckleberry reserve rum.</p>
   <p className="font-display text-2xl text-copper mt-6">Converting Cowboys to Pirates. Everyday.</p>
  </header>
  <section className="max-w-7xl mx-auto px-6 lg:px-10" aria-label="Cocktail collection">
   <div className="flex flex-wrap gap-3 mb-10" aria-label="Filter by rum">
    {choices.map((v)=><button key={v} aria-pressed={filter===v} onClick={()=>setFilter(v)} className={"min-h-11 px-5 py-3 border font-label text-sm "+(filter===v?"border-copper bg-copper text-background":"border-border text-parchment hover:border-copper")}>{v}</button>)}
   </div>
   <p className="sr-only" role="status">{shown.length} cocktails shown</p>
   <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {shown.map((c)=><article key={c.name} className="border border-border bg-card p-7 flex flex-col">
     <div className="flex items-center gap-3 mb-5 text-copper"><Wine size={28} aria-hidden="true"/><span className="font-label text-xs">{c.rum}</span></div>
     <h2 className="font-display text-3xl text-parchment mb-5">{c.name}</h2>
     <h3 className="font-label text-xs text-copper mb-3">Ingredients from the menu</h3>
     <ul className="list-disc pl-5 space-y-2 font-body text-muted-foreground mb-5">{c.ingredients.map((i)=><li key={i}>{i}</li>)}</ul>
     {c.note && <p className="font-body text-copper mb-4">{c.note}</p>}
     <p className="mt-auto bg-yellow-200 text-black text-sm p-3">XXXX — Approved photo, measurements and preparation instructions to follow.</p>
    </article>)}
   </div>
   <div className="mt-12 border-t border-border pt-8 flex flex-col sm:flex-row gap-6 justify-between">
    <p className="font-body text-muted-foreground max-w-lg">Ingredient lists are transcribed from the supplied menu. Availability and final recipes await confirmation. Please enjoy responsibly · 21+.</p>
    <Link to="/spirits" className="inline-flex items-center gap-3 text-copper font-label self-start min-h-11">Explore the rum collection <ArrowRight size={18}/></Link>
   </div>
  </section>
 </div>;
}
