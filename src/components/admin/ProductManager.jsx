import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, X, Loader2, ImagePlus } from "lucide-react";

const EMPTY = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  price: "",
  abv: "",
  age: "",
  elevation: "2,956 ft",
  color: "#9a5a1f",
  notes: "",
  image: "",
  volume_ml: "750",
  in_stock: true,
  sort_order: "0",
};

const inputCls =
  "w-full bg-background border border-border px-3 py-2 font-body text-sm text-parchment focus:border-copper outline-none transition-colors";

function Field({ label, children, hint = null }) {
  return (
    <div>
      <label className="font-label text-[10px] text-copper block mb-1.5">
        {label}
      </label>
      {children}
      {hint && (
        <p className="font-body text-[11px] text-muted-foreground mt-1">{hint}</p>
      )}
    </div>
  );
}

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    api.entities.Product
      .filter({}, { sort: "sort_order", limit: 100 })
      .then((r) => setProducts(r.items))
      .finally(() => setLoading(false));
  };
  useEffect(() => load(), []);

  const startNew = () => setEditing({ ...EMPTY });
  const startEdit = (p) =>
    setEditing({
      ...p,
      notes: (p.notes || []).join(", "),
      price: String(p.price ?? ""),
      volume_ml: String(p.volume_ml ?? ""),
      sort_order: String(p.sort_order ?? ""),
    });

  const onField = (k) => (e) => setEditing((f) => ({ ...f, [k]: e.target.value }));
  const onCheck = (e) => setEditing((f) => ({ ...f, in_stock: e.target.checked }));

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({
        file,
      });
      setEditing((f) => ({ ...f, image: file_url }));
    } catch (err) {
      alert("Upload failed: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  const slugify = (s) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const save = async () => {
    if (!editing.name || !editing.price) {
      alert("Name and price are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: editing.name,
        slug: editing.slug || slugify(editing.name),
        tagline: editing.tagline || "",
        description: editing.description || "",
        price: Number(editing.price) || 0,
        abv: editing.abv || "",
        age: editing.age || "",
        elevation: editing.elevation || "",
        color: editing.color || "",
        notes: (editing.notes || "")
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean),
        image: editing.image || "",
        volume_ml: Number(editing.volume_ml) || 750,
        in_stock: editing.in_stock !== false,
        sort_order: Number(editing.sort_order) || 0,
      };
      if (editing.id) {
        await api.entities.Product.update(editing.id, payload);
      } else {
        await api.entities.Product.create(payload);
      }
      setEditing(null);
      load();
    } catch (err) {
      alert("Save failed: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!confirm(`Archive "${p.name}"? It will be removed from the storefront; order snapshots remain.`)) return;
    try {
      await api.entities.Product.update(p.id, { in_stock: false });
      load();
    } catch (err) {
      alert("Delete failed: " + (err.message || err));
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <p className="font-label text-xs text-copper">
            {products.length} products
          </p>
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-copper text-background font-label text-[11px] tracking-widest uppercase hover:bg-copper/90 transition-colors"
          >
            <Plus size={14} /> Add product
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-copper" size={22} />
          </div>
        ) : products.length === 0 ? (
          <p className="font-body text-muted-foreground py-10 text-center">
            No products yet. Add your first bottle.
          </p>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 border border-border bg-card/40 p-3"
              >
                <div className="w-14 h-14 shrink-0 bg-muted overflow-hidden">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-lg text-parchment truncate">
                    {p.name}
                  </p>
                  <p className="font-label text-[10px] text-muted-foreground">
                    ${p.price?.toFixed(2)} · {p.volume_ml}ml ·{" "}
                    {p.in_stock ? "In stock" : "Sold out"} · order #{p.sort_order}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(p)}
                    className="p-2 text-parchment/70 hover:text-copper transition-colors"
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="p-2 text-parchment/70 hover:text-destructive transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        {editing ? (
          <div className="border border-border bg-card/40 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <p className="font-display text-2xl text-parchment">
                {editing.id ? "Edit product" : "New product"}
              </p>
              <button
                onClick={() => setEditing(null)}
                className="text-muted-foreground hover:text-parchment transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 max-h-[58vh] overflow-y-auto pr-1">
              <Field label="Name">
                <input
                  className={inputCls}
                  value={editing.name}
                  onChange={onField("name")}
                  placeholder="Highline Spiced Rum"
                />
              </Field>
              <Field label="Slug" hint="Leave blank to auto-generate from name.">
                <input
                  className={inputCls}
                  value={editing.slug}
                  onChange={onField("slug")}
                  placeholder="highline-spiced-rum"
                />
              </Field>
              <Field label="Tagline">
                <input
                  className={inputCls}
                  value={editing.tagline}
                  onChange={onField("tagline")}
                  placeholder="The frontier bottle"
                />
              </Field>
              <Field label="Description">
                <textarea
                  className={inputCls + " resize-none"}
                  rows={4}
                  value={editing.description}
                  onChange={onField("description")}
                  placeholder="Tasting notes and story…"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (USD)">
                  <input
                    className={inputCls}
                    type="number"
                    step="0.01"
                    value={editing.price}
                    onChange={onField("price")}
                    placeholder="48"
                  />
                </Field>
                <Field label="Volume (ml)">
                  <input
                    className={inputCls}
                    type="number"
                    value={editing.volume_ml}
                    onChange={onField("volume_ml")}
                    placeholder="750"
                  />
                </Field>
                <Field label="ABV">
                  <input
                    className={inputCls}
                    value={editing.abv}
                    onChange={onField("abv")}
                    placeholder="42% ABV"
                  />
                </Field>
                <Field label="Maturation">
                  <input
                    className={inputCls}
                    value={editing.age}
                    onChange={onField("age")}
                    placeholder="Aged 3 years"
                  />
                </Field>
                <Field label="Elevation">
                  <input
                    className={inputCls}
                    value={editing.elevation}
                    onChange={onField("elevation")}
                    placeholder="2,956 ft"
                  />
                </Field>
                <Field label="Sort order">
                  <input
                    className={inputCls}
                    type="number"
                    value={editing.sort_order}
                    onChange={onField("sort_order")}
                    placeholder="1"
                  />
                </Field>
              </div>

              <Field label="Tasting notes" hint="Comma-separated.">
                <input
                  className={inputCls}
                  value={editing.notes}
                  onChange={onField("notes")}
                  placeholder="Cinnamon, Toasted Oak, Huckleberry"
                />
              </Field>

              <Field label="Bottle color">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editing.color || "#9a5a1f"}
                    onChange={onField("color")}
                    className="w-10 h-10 bg-transparent border border-border cursor-pointer"
                  />
                  <input
                    className={inputCls}
                    value={editing.color}
                    onChange={onField("color")}
                    placeholder="#9a5a1f"
                  />
                </div>
              </Field>

              <Field label="Bottle photo" hint="Upload or paste an image URL.">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-3 py-2 border border-border font-label text-[10px] text-parchment hover:border-copper cursor-pointer transition-colors">
                    {uploading ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <ImagePlus size={14} />
                    )}
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onUpload}
                      disabled={uploading}
                    />
                  </label>
                  <input
                    className={inputCls}
                    value={editing.image}
                    onChange={onField("image")}
                    placeholder="https://…"
                  />
                </div>
                {editing.image && (
                  <div className="mt-3 w-24 h-32 bg-muted overflow-hidden border border-border">
                    <img
                      src={editing.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </Field>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.in_stock}
                  onChange={onCheck}
                  className="w-4 h-4 accent-copper"
                />
                <span className="font-body text-sm text-parchment">
                  In stock (purchasable)
                </span>
              </label>
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-copper text-background font-label text-xs tracking-widest uppercase hover:bg-copper/90 disabled:opacity-50 transition-colors"
            >
              {saving && <Loader2 className="animate-spin" size={16} />}
              {editing.id ? "Save changes" : "Create product"}
            </button>
          </div>
        ) : (
          <div className="border border-border border-dashed p-10 text-center">
            <p className="font-body text-muted-foreground">
              Select a product to edit, or add a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}