import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, User as UserIcon, MapPin, CreditCard, Loader2, Check, LogOut, Shield } from "lucide-react";
import { api } from "@/api/client";
import PageHero from "@/components/PageHero";
import { distillery } from "@/data/spirits";
import { useAuth } from "@/lib/AuthContext";
import { isAdult } from "@/lib/commerce.mjs";
import SecurityTab from "@/components/account/SecurityTab";
import AddressesTab from "@/components/account/AddressesTab";
import PaymentMethodsTab from "@/components/account/PaymentMethodsTab";

const inputCls =
  "w-full bg-background border border-border px-3 py-2 font-body text-sm text-parchment focus:border-copper outline-none transition-colors";

export default function Account() {
  const { logout, checkUserAuth, user: currentUser } = useAuth();
  const [loadError, setLoadError] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({ full_name: "", phone: "", dob: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      api.auth.me().catch(() => null),
      api.entities.Order
        .filter({ $or: [{ user_id: currentUser.id }, { created_by_id: currentUser.id }] }, { sort: "-created_date", limit: 50 })
        .then((r) => r.items)
        .catch(() => { setLoadError(true); return []; }),
    ]).then(([u, o]) => {
      setUser(u);
      setOrders(o);
      setProfile({ full_name: u?.full_name || "", phone: u?.phone || "", dob: u?.dob || "" });
    }).finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    if (!profile.full_name.trim()) { alert("Please enter your name."); return; }
    if (profile.dob && !isAdult(profile.dob)) { alert("Enter a valid date of birth for an adult aged 21 or older."); return; }
    setSavingProfile(true);
    try {
      const updated = await api.auth.updateMe({ full_name: profile.full_name.trim(), phone: profile.phone.trim(), dob: profile.dob });
      setUser(updated);
      await checkUserAuth();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      alert("Could not save: " + (err.message || err));
    } finally {
      setSavingProfile(false);
    }
  };

  const tabs = [
    { k: "profile", label: "Profile", icon: UserIcon },
    { k: "addresses", label: "Addresses", icon: MapPin },
    { k: "payment", label: "Payment", icon: CreditCard },
    { k: "orders", label: "Orders", icon: Package },
    { k: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="bg-background">
      <PageHero
        label="Your Account"
        title="The captain's log"
        subtitle="Your profile, saved addresses, payment options, and every bottle you've brought aboard."
        image={distillery.pourImage}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="mb-10">
            <button onClick={logout} className="mb-5 inline-flex items-center gap-2 border border-copper px-5 py-3 text-parchment hover:bg-copper/15"><LogOut size={18} /> Log out</button>
            <p className="font-label text-xs text-copper mb-2">Signed in as</p>
            <p className="font-display text-2xl text-parchment">
              {user?.email || "Crew member"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-10 border-b border-border">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className={`inline-flex items-center gap-2 px-5 py-3 font-label text-xs tracking-widest uppercase border-b-2 -mb-px transition-colors ${
                    tab === t.k
                      ? "border-copper text-copper"
                      : "border-transparent text-muted-foreground hover:text-parchment"
                  }`}
                >
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-copper" size={24} />
            </div>
          ) : (
            <>
              {tab === "profile" && (
                <div className="max-w-xl">
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="field-full_name" className="font-label text-[10px] text-copper block mb-1.5">
                        Name
                      </label><input id="field-full_name"
                        aria-label="Full name"
                        autoComplete="name"
                        className={inputCls}
                        value={profile.full_name}
                        maxLength={100}
                        onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                      />
                      <p className="font-body text-[11px] text-muted-foreground mt-1">
                        Edit your display name here. Email changes require a verified identity-provider flow.
                      </p>
                    </div>
                    <div>
                      <label htmlFor="field-email" className="font-label text-[10px] text-copper block mb-1.5">
                        Email
                      </label><input id="field-email"
                        className={inputCls + " opacity-60 cursor-not-allowed"}
                        value={user?.email || ""}
                        readOnly
                      />
                    </div>
                    <div>
                      <label htmlFor="field-phone" className="font-label text-[10px] text-copper block mb-1.5">
                        Phone
                      </label>
                      <input id="field-phone" type="tel" autoComplete="tel"
                        className={inputCls}
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, phone: e.target.value }))
                        }
                        placeholder="(406) 555-0100"
                      />
                    </div>
                    <div>
                      <label htmlFor="field-dob" className="font-label text-[10px] text-copper block mb-1.5">
                        Date of birth
                      </label><input id="field-dob"
                        type="date"
                        className={inputCls}
                        value={profile.dob}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, dob: e.target.value }))
                        }
                      />
                      <p className="font-body text-[11px] text-muted-foreground mt-1">
                        Self-reported date of birth does not verify identity or authorize alcohol purchases.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={saveProfile}
                        disabled={savingProfile}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-background font-label text-xs tracking-widest uppercase hover:bg-copper/90 disabled:opacity-50 transition-colors"
                      >
                        {savingProfile && <Loader2 className="animate-spin" size={14} />}
                        Save profile
                      </button>
                      {profileSaved && (
                        <span className="inline-flex items-center gap-1.5 text-copper font-label text-[11px] tracking-widest uppercase">
                          <Check size={14} /> Saved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {tab === "addresses" && <AddressesTab />}
              {tab === "payment" && <PaymentMethodsTab />}
              {tab === "security" && <SecurityTab />}

              {tab === "orders" && (
                <div className="max-w-3xl">
                  {loadError && <p role="alert">Orders could not be loaded. <button className="underline" onClick={() => window.location.reload()}>Retry</button></p>}
                  {orders.length === 0 ? (
                    <div className="border border-border bg-card p-12 text-center">
                      <Package size={32} className="mx-auto text-muted-foreground mb-4" />
                      <p className="font-body text-lg text-muted-foreground mb-6">
                        No orders yet. The hold is waiting.
                      </p>
                      <Link
                        to="/spirits"
                        className="inline-block px-10 py-3.5 bg-copper text-background font-label text-sm tracking-widest uppercase hover:bg-copper/90"
                      >
                        Browse the Spirits
                      </Link>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {orders.map((o) => (
                        <li key={o.id}>
                          <Link
                            to={`/order/${o.id}`}
                            className="block border border-border bg-card p-5 hover:border-copper transition-colors"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-display text-lg text-parchment">
                                  #{o.id.slice(-8).toUpperCase()}
                                </p>
                                <p className="font-label text-[10px] text-muted-foreground">
                                  {new Date(o.created_date).toLocaleDateString()} ·{" "}
                                  {o.items?.length || 0} item
                                  {(o.items?.length || 0) === 1 ? "" : "s"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-display text-xl text-parchment">
                                  ${(o.total || 0).toFixed(2)}
                                </p>
                                <p className="font-label text-[10px] text-copper capitalize">
                                  {o.is_demo ? "Demo · " + o.status : o.status}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}