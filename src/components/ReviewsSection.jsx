import { useState, useEffect } from "react";
import { api, submitReview } from "@/api/client";
import { Star, Loader2, Send, MessageSquarePlus } from "lucide-react";

function Stars({ n, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(n)
              ? "fill-copper text-copper"
              : "text-muted-foreground/40"
          }
        />
      ))}
    </div>
  );
}

const inputCls =
  "w-full bg-transparent border-b border-border py-3 font-body text-lg text-parchment focus:border-copper outline-none transition-colors";

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    rating: 5,
    title: "",
    body: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const controller=new AbortController();
    api.entities.Review
      .filter({ status: "approved" }, { sort: "-featured", limit: 12, signal:controller.signal })
      .then((r) => setReviews([...r.items].sort((a, b) =>
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      )))
      .catch((error) => {
        if(controller.signal.aborted)return;
        console.error("Could not load reviews:", error);
        setReviews([]);
      })
      .finally(() => setLoading(false));
    return ()=>controller.abort();
  }, []);

  const set = (k) => (e) => {
    const v = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitReview(form);
      if (res.data?.ok) {
        setSent(true);
        setForm({ name: "", location: "", rating: 5, title: "", body: "" });
      } else {
        alert(res.data?.error || "Could not submit your review.");
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Could not submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="border-t border-border py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="font-label text-xs text-copper mb-5">
            Word from the deck
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-parchment leading-tight">
            What our crew &amp; visitors are saying
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-copper" size={22} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-body text-lg text-muted-foreground mb-6">
              No reviews yet. Be the first to leave a mark.
            </p>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 px-6 py-3 border border-parchment/30 text-parchment font-label text-xs tracking-widest uppercase hover:border-copper hover:text-copper transition-colors"
            >
              <MessageSquarePlus size={15} /> Leave a review
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="border border-border bg-card/40 p-7 flex flex-col"
                >
                  <Stars n={r.rating} />
                  {r.title && (
                    <p className="font-display text-xl text-parchment mt-4 mb-2">
                      {r.title}
                    </p>
                  )}
                  <p className="font-body text-muted-foreground leading-relaxed flex-1">
                    "{r.body}"
                  </p>
                  <div className="mt-5 pt-4 border-t border-border">
                    <p className="font-label text-[11px] text-copper tracking-widest">
                      {r.name}
                    </p>
                    {r.location && (
                      <p className="font-body text-sm text-muted-foreground">
                        {r.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => setShowForm((v) => !v)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-parchment/30 text-parchment font-label text-xs tracking-widest uppercase hover:border-copper hover:text-copper transition-colors"
              >
                <MessageSquarePlus size={15} />
                {showForm ? "Close" : "Leave a review"}
              </button>
            </div>
          </>
        )}

        {showForm && (
          <div className="max-w-2xl mx-auto mt-12 border border-border bg-card/40 p-8 md:p-10">
            {sent ? (
              <div className="text-center py-6">
                <p className="font-display text-3xl text-parchment mb-3">
                  Thank you.
                </p>
                <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
                  Your review has been received. It will appear here once our
                  crew approves it.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setShowForm(false);
                  }}
                  className="font-label text-xs tracking-widest text-copper hover:underline"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6">
                <p className="font-display text-2xl text-parchment mb-2">
                  Share your experience
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="font-label text-[10px] text-copper block mb-2">
                      Your name
                    </label>
                    <input
                      required
                      maxLength={80}
                      className={inputCls}
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="font-label text-[10px] text-copper block mb-2">
                      Location (optional)
                    </label>
                    <input
                      className={inputCls}
                      value={form.location}
                      onChange={set("location")}
                      placeholder="Kalispell, MT"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label text-[10px] text-copper block mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, rating: n }))}
                        aria-label={`${n} stars`}
                      >
                        <Star
                          size={26}
                          className={
                            n <= form.rating
                              ? "fill-copper text-copper"
                              : "text-muted-foreground/40 hover:text-copper"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-label text-[10px] text-copper block mb-2">
                    Title (optional)
                  </label>
                  <input
                    className={inputCls}
                    value={form.title}
                    onChange={set("title")}
                    placeholder="A short headline"
                  />
                </div>

                <div>
                  <label className="font-label text-[10px] text-copper block mb-2">
                    Your review
                  </label>
                  <textarea
                    required
                    maxLength={1200}
                    rows={4}
                    className={inputCls + " resize-none"}
                    value={form.body}
                    onChange={set("body")}
                    placeholder="What did you think of the rum, the room, the crew?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-copper text-background font-label text-sm tracking-widest uppercase hover:bg-copper/90 disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                  Submit review
                </button>
                <p className="font-body text-sm text-muted-foreground">
                  Submissions are reviewed by our crew before they appear on
                  the site.
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}