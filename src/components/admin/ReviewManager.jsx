import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Star, Check, X, Trash2, Loader2, Plus, Award } from "lucide-react";

const inputCls =
  "w-full bg-background border border-border px-3 py-2 font-body text-sm text-parchment focus:border-copper outline-none transition-colors";

function Stars({ n }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={
            i <= n ? "fill-copper text-copper" : "text-muted-foreground/40"
          }
        />
      ))}
    </div>
  );
}

export default function ReviewManager() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    location: "",
    rating: 5,
    title: "",
    body: "",
    source: "admin",
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.entities.Review
      .filter({}, { sort: "-created_date", limit: 200 })
      .then((r) => setReviews(r.items))
      .finally(() => setLoading(false));
  };
  useEffect(() => load(), []);

  const set = (k) => (e) => {
    const v = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setDraft((d) => ({ ...d, [k]: v }));
  };

  const update = async (r, data) => {
    try {
      await api.entities.Review.update(r.id, data);
      load();
    } catch (err) {
      alert("Update failed: " + (err.message || err));
    }
  };

  const remove = async (r) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      await api.entities.Review.delete(r.id);
      load();
    } catch (err) {
      alert("Delete failed: " + (err.message || err));
    }
  };

  const addManual = async () => {
    if (!draft.name || !draft.body) {
      alert("Name and review text are required.");
      return;
    }
    setSaving(true);
    try {
      await api.entities.Review.create({
        name: draft.name,
        location: draft.location || null,
        rating: Number(draft.rating) || 5,
        title: draft.title || null,
        body: draft.body,
        source: draft.source || "admin",
        status: "approved",
        featured: false,
        product_id: null,
        sort_order: 0,
      });
      setDraft({ name: "", location: "", rating: 5, title: "", body: "", source: "admin" });
      setAdding(false);
      load();
    } catch (err) {
      alert("Save failed: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const shown = reviews.filter((r) =>
    filter === "all" ? true : r.status === filter
  );
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {[
            { k: "pending", label: `Pending${pendingCount ? ` (${pendingCount})` : ""}` },
            { k: "approved", label: "Approved" },
            { k: "all", label: "All" },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              className={`px-4 py-2 font-label text-[11px] tracking-widest uppercase border transition-colors ${
                filter === f.k
                  ? "border-copper text-copper"
                  : "border-border text-muted-foreground hover:text-parchment"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-copper text-background font-label text-[11px] tracking-widest uppercase hover:bg-copper/90 transition-colors"
        >
          <Plus size={14} /> Add review
        </button>
      </div>

      {adding && (
        <div className="border border-copper/40 bg-card/40 p-6 mb-6 space-y-4">
          <p className="font-display text-xl text-parchment">
            Add a review manually
          </p>
          <p className="font-body text-sm text-muted-foreground -mt-2">
            Manually entered reviews are published immediately as trust points
            (e.g. a quote you want to feature, or one copied from Google/Yelp).
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-label text-[10px] text-copper block mb-1.5">
                Reviewer name
              </label>
              <input
                className={inputCls}
                value={draft.name}
                onChange={set("name")}
                placeholder="Joseph W."
              />
            </div>
            <div>
              <label className="font-label text-[10px] text-copper block mb-1.5">
                Location
              </label>
              <input
                className={inputCls}
                value={draft.location}
                onChange={set("location")}
                placeholder="Kalispell, MT"
              />
            </div>
            <div>
              <label className="font-label text-[10px] text-copper block mb-1.5">
                Title (optional)
              </label>
              <input
                className={inputCls}
                value={draft.title}
                onChange={set("title")}
                placeholder="Love this place"
              />
            </div>
            <div>
              <label className="font-label text-[10px] text-copper block mb-1.5">
                Source
              </label>
              <select className={inputCls} value={draft.source} onChange={set("source")}>
                <option value="admin">Added by staff</option>
                <option value="google">Google</option>
                <option value="yelp">Yelp</option>
                <option value="facebook">Facebook</option>
                <option value="website">Website submission</option>
              </select>
            </div>
          </div>
          <div>
            <label className="font-label text-[10px] text-copper block mb-1.5">
              Rating
            </label>
            <select className={inputCls + " w-24"} value={draft.rating} onChange={set("rating")}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-label text-[10px] text-copper block mb-1.5">
              Review
            </label>
            <textarea
              className={inputCls + " resize-none"}
              rows={3}
              value={draft.body}
              onChange={set("body")}
              placeholder="What they said…"
            />
          </div>
          <button
            onClick={addManual}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-copper text-background font-label text-xs tracking-widest uppercase hover:bg-copper/90 disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 className="animate-spin" size={14} />}
            Publish review
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-copper" size={22} />
        </div>
      ) : shown.length === 0 ? (
        <p className="font-body text-muted-foreground py-10 text-center">
          Nothing here.
        </p>
      ) : (
        <div className="space-y-3">
          {shown.map((r) => (
            <div
              key={r.id}
              className="border border-border bg-card/40 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-display text-lg text-parchment">
                      {r.name}
                    </p>
                    <Stars n={r.rating} />
                    {r.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-copper/15 text-copper font-label text-[9px] tracking-widest uppercase">
                        <Award size={11} /> Featured
                      </span>
                    )}
                  </div>
                  {r.location && (
                    <p className="font-label text-[10px] text-muted-foreground mb-2">
                      {r.location} · {r.source}
                    </p>
                  )}
                  {r.title && (
                    <p className="font-body text-parchment mb-1">{r.title}</p>
                  )}
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {r.body}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-1 font-label text-[9px] tracking-widest uppercase ${
                      r.status === "approved"
                        ? "bg-copper/15 text-copper"
                        : "bg-yellow-400/15 text-yellow-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                {r.status === "pending" ? (
                  <button
                    onClick={() => update(r, { status: "approved" })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border font-label text-[10px] text-parchment hover:border-copper hover:text-copper transition-colors"
                  >
                    <Check size={13} /> Approve
                  </button>
                ) : (
                  <button
                    onClick={() => update(r, { status: "pending" })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border font-label text-[10px] text-parchment hover:border-copper hover:text-copper transition-colors"
                  >
                    <X size={13} /> Unpublish
                  </button>
                )}
                <button
                  onClick={() => update(r, { featured: !r.featured })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border font-label text-[10px] transition-colors ${
                    r.featured
                      ? "border-copper text-copper"
                      : "border-border text-muted-foreground hover:text-copper hover:border-copper"
                  }`}
                >
                  <Award size={13} /> {r.featured ? "Unfeature" : "Feature"}
                </button>
                <button
                  onClick={() => remove(r)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border font-label text-[10px] text-parchment hover:text-destructive hover:border-destructive transition-colors ml-auto"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}