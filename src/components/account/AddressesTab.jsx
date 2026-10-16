import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Plus, Pencil, Trash2, X, Loader2, Check } from "lucide-react";

const EMPTY = {
  label: "",
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
  is_default: false,
  purpose: "shipping",
};

const inputCls =
  "w-full bg-background border border-border px-3 py-2 font-body text-sm text-parchment placeholder:text-muted-foreground/60 focus:border-copper outline-none transition-colors";

export default function AddressesTab() {
  const [addresses, setAddresses] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setLoadError(false);
    api.entities.Address
      .filter({}, { sort: "-is_default", limit: 50 })
      .then((r) => setAddresses(r.items))
      .catch(() => { setAddresses([]); setLoadError(true); })
      .finally(() => setLoading(false));
  };
  useEffect(() => load(), []);

  const set = (k) => (e) =>
    setEditing((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const startNew = () => setEditing({ ...EMPTY });
  const startEdit = (a) => setEditing({ ...a });

  const save = async () => {
    if (!editing.name || !editing.line1 || !editing.city || !editing.state || !editing.zip) {
      alert("Please fill in name, street, city, state, and ZIP.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        purpose: editing.purpose || "shipping",
        label: editing.label || "",
        name: editing.name,
        line1: editing.line1,
        line2: editing.line2 || "",
        city: editing.city,
        state: editing.state.toUpperCase(),
        zip: editing.zip,
        country: editing.country || "US",
        is_default: !!editing.is_default,
      };
      if (editing.id) {
        await api.entities.Address.update(editing.id, payload);
      } else {
        await api.entities.Address.create(payload);
      }
      setEditing(null);
      load();
    } catch (err) {
      alert("Save failed: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a) => {
    if (!confirm("Delete this address?")) return;
    try {
      await api.entities.Address.delete(a.id);
      load();
    } catch (err) {
      alert("Delete failed: " + (err.message || err));
    }
  };

  const makeDefault = async (a) => {
    try {
      await api.entities.Address.update(a.id, { is_default: true });
      load();
    } catch (err) {
      alert("Update failed: " + (err.message || err));
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <p className="font-label text-xs text-copper">
            {addresses.length} saved {addresses.length === 1 ? "address" : "addresses"}
          </p>
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-copper text-background font-label text-[11px] tracking-widest uppercase hover:bg-copper/90 transition-colors"
          >
            <Plus size={14} /> Add address
          </button>
        </div>

        {loadError && <p role="alert">Could not load addresses. <button onClick={load} className="underline">Retry</button></p>}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-copper" size={22} />
          </div>
        ) : addresses.length === 0 ? (
          <p className="font-body text-muted-foreground py-8 text-center">
            No saved addresses yet. Add one for faster checkout.
          </p>
        ) : (
          <div className="space-y-3">
            {addresses.map((a) => (
              <div key={a.id} className="border border-border bg-card/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {a.label && (
                        <span className="font-label text-[10px] text-copper tracking-widest uppercase">
                          {a.label}
                        </span>
                      )}
                      {a.is_default && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-copper/15 text-copper font-label text-[9px] tracking-widest uppercase">
                          <Check size={11} /> Default
                        </span>
                      )}
                    </div>
                    <p className="font-display text-lg text-parchment">{a.name}</p>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}
                      <br />
                      {a.city}, {a.state} {a.zip}
                      <br />
                      {a.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(a)}
                      className="p-2 text-parchment/70 hover:text-copper transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => remove(a)}
                      className="p-2 text-parchment/70 hover:text-destructive transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {!a.is_default && (
                  <button
                    onClick={() => makeDefault(a)}
                    className="mt-3 font-label text-[10px] text-muted-foreground hover:text-copper tracking-widest uppercase"
                  >
                    Set as default
                  </button>
                )}
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
                {editing.id ? "Edit address" : "New address"}
              </p>
              <button
                onClick={() => setEditing(null)}
                className="text-muted-foreground hover:text-parchment transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <label htmlFor="address-purpose" className="block">Address type</label><select id="address-purpose" value={editing.purpose || "shipping"} onChange={set("purpose")} className={inputCls}><option value="shipping">Shipping</option><option value="billing">Billing</option><option value="both">Shipping and billing</option></select>
              <div>
                <label htmlFor="field-label" className="font-label text-[10px] text-copper block mb-1.5">
                  Label (optional)
                </label><input id="field-label"
                  className={inputCls}
                  value={editing.label}
                  onChange={set("label")}
                  placeholder="Home, Tasting room, etc."
                />
              </div>
              <div>
                <label htmlFor="field-name" className="font-label text-[10px] text-copper block mb-1.5">
                  Recipient name
                </label><input id="field-name"
                  className={inputCls}
                  value={editing.name}
                  onChange={set("name")}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label htmlFor="field-line1" className="font-label text-[10px] text-copper block mb-1.5">
                  Street address
                </label><input id="field-line1"
                  className={inputCls}
                  value={editing.line1}
                  onChange={set("line1")}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <label htmlFor="field-line2" className="font-label text-[10px] text-copper block mb-1.5">
                  Apt / Suite (optional)
                </label>
                <input id="field-line2"
                  className={inputCls}
                  value={editing.line2}
                  onChange={set("line2")}
                  placeholder="Apt 4"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="field-city" className="font-label text-[10px] text-copper block mb-1.5">
                    City
                  </label>
                  <input id="field-city"
                    className={inputCls}
                    value={editing.city}
                    onChange={set("city")}
                  />
                </div>
                <div>
                  <label htmlFor="field-state" className="font-label text-[10px] text-copper block mb-1.5">
                    State
                  </label><input id="field-state"
                    className={inputCls}
                    value={editing.state}
                    onChange={set("state")}
                  />
                </div>
                <div>
                  <label htmlFor="field-zip" className="font-label text-[10px] text-copper block mb-1.5">
                    ZIP
                  </label><input id="field-zip"
                    className={inputCls}
                    value={editing.zip}
                    onChange={set("zip")}
                  />
                </div>
                <div>
                  <label htmlFor="field-country" className="font-label text-[10px] text-copper block mb-1.5">
                    Country
                  </label><input id="field-country"
                    className={inputCls}
                    value={editing.country}
                    onChange={set("country")}
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editing.is_default}
                  onChange={set("is_default")}
                  className="w-4 h-4 accent-copper"
                />
                <span className="font-body text-sm text-parchment">
                  Use as my default address
                </span>
              </label>
            </div>
            <button
              onClick={save}
              disabled={saving}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-copper text-background font-label text-xs tracking-widest uppercase hover:bg-copper/90 disabled:opacity-50 transition-colors"
            >
              {saving && <Loader2 className="animate-spin" size={16} />}
              {editing.id ? "Save changes" : "Save address"}
            </button>
          </div>
        ) : (
          <div className="border border-border border-dashed p-10 text-center">
            <p className="font-body text-muted-foreground">
              Add or select an address to edit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}