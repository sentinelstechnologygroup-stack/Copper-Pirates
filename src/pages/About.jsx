import { distillery } from "@/data/spirits";
import PageHero from "@/components/PageHero";

export default function About() {
  return (
    <div className="bg-background">
      <PageHero
        label="Our Story"
        title="The cowboy who turned pirate"
        subtitle="A frontier rum, born in whiskey country — and the stubborn idea that Montana could make something the Caribbean would respect."
        image={distillery.heroImage}
      />

      {/* Split narrative */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            <div className="border border-border p-8 md:p-10 bg-card/40">
              <p className="font-label text-xs text-copper mb-5">The Cowboy</p>
              <p className="font-display text-2xl md:text-3xl text-parchment leading-snug mb-5">
                Boots worn thin on Montana trail.
              </p>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                This is big sky country. Whiskey country. Where a long day
                ends with a neat pour and a longer silence. We grew up here,
                learned to drink here, and never quite fit the mold the
                whiskey set for us.
              </p>
            </div>
            <div className="border border-border p-8 md:p-10 bg-card/40">
              <p className="font-label text-xs text-copper mb-5">The Pirate</p>
              <p className="font-display text-2xl md:text-3xl text-parchment leading-snug mb-5">
                A compass pointed at the Caribbean.
              </p>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Somewhere south there was a spirit built on molasses and spice,
                on heat and adventure. We chased it. We studied it. Then we
                brought it home and made it answer to the mountain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Long story */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="mx-auto max-w-3xl px-6 lg:px-10 space-y-8">
          <p className="font-display text-3xl md:text-4xl text-parchment leading-snug">
            We didn't set out to make rum. We set out to make something that
            didn't exist here yet.
          </p>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Copper Pirates Distillery was born from a simple stubbornness: that
            the Rocky Mountains could produce a rum as honest and distinctive
            as any whiskey. We built our stills by hand, sourced molasses like
            we were provisioning a ship, and pointed our compass toward a flavor
            profile nobody in these parts had tasted before.
          </p>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            What came out of the copper was a rum that doesn't apologize for
            where it's from. It's spiced like the trade winds and finished like
            a mountain evening — warm, slow, and a little bit wild. We call it
            turning cowboys into pirates, and every bottle is an invitation to
            come along.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid md:grid-cols-3 gap-10">
          {[
            {
              t: "Molasses, not grain",
              b: "We chose the harder path. Real molasses, real fermentation, real rum — not a whiskey dressed up in spice.",
            },
            {
              t: "Hand-formed copper",
              b: "Our stills are built and tended by hand. Copper does the chemistry; we do the watching.",
            },
            {
              t: "Mountain to glass",
              b: "Snowmelt proof, high-altitude distillation, and a bottle that travels from Kalispell to wherever you pour it.",
            },
          ].map((v) => (
            <div key={v.t}>
              <p className="font-label text-xs text-copper mb-4">{v.t}</p>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                {v.b}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}