import { distillery } from "@/data/spirits";
import PageHero from "@/components/PageHero";

const steps = [
  {
    no: "01",
    title: "The Mash",
    body: "We start with molasses and Montana-grown grain, fermented slow with a house yeast strain built for cold mountain nights. Patience is the first ingredient.",
  },
  {
    no: "02",
    title: "The Copper Pot",
    body: "Every spirit runs through hand-formed copper pot stills. Copper strips the sulfides and leaves only character. We distill twice, never more, never less.",
  },
  {
    no: "03",
    title: "The Cut",
    body: "Heads, hearts, tails. We take only the hearts — the narrow middle cut where the rum is cleanest and most alive. The rest goes back to the still.",
  },
  {
    no: "04",
    title: "The Oak",
    body: "Rest in charred American oak, sometimes used bourbon casks. Time does the work we can't. The wood gives color, tannin, and a long, warm finish.",
  },
  {
    no: "05",
    title: "The Proof",
    body: "Proofed down with snowmelt drawn from the Continental Divide. Soft, mineral-rich water that lets the rum breathe instead of fighting it.",
  },
];

export default function Craft() {
  return (
    <div className="bg-background">
      <PageHero
        label="The Craft"
        title="Copper, fire, and mountain water"
        subtitle="Rum is a discipline of patience. Here is how a bottle of Copper Pirates comes to life, from raw molasses to the pour in your glass."
        image={distillery.craftImage}
      />

      {/* Steps */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <div className="space-y-px">
            {steps.map((s) => (
              <div
                key={s.no}
                className="grid md:grid-cols-12 gap-6 md:gap-10 py-10 border-b border-border"
              >
                <div className="md:col-span-3">
                  <p className="font-display text-5xl md:text-6xl text-copper/80 leading-none">
                    {s.no}
                  </p>
                </div>
                <div className="md:col-span-9">
                  <h3 className="font-display text-3xl text-parchment mb-4">
                    {s.title}
                  </h3>
                  <p className="font-body text-lg text-muted-foreground leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid md:grid-cols-4 gap-10">
          {[
            { k: "Still Type", v: "Hand-formed copper pot" },
            { k: "Distillations", v: "Two, by hand" },
            { k: "Water Source", v: "Continental Divide snowmelt" },
            { k: "Coordinates", v: distillery.coordinates },
          ].map((spec) => (
            <div key={spec.k}>
              <p className="font-label text-[10px] text-copper mb-3">{spec.k}</p>
              <p className="font-display text-2xl text-parchment leading-tight">
                {spec.v}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}