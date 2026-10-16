import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import OperationsManager from "@/components/admin/OperationsManager";
import ProductManager from "@/components/admin/ProductManager";
import ReviewManager from "@/components/admin/ReviewManager";
import { Loader2, ShieldAlert } from "lucide-react";

export default function Admin() {
  const { user, isLoadingAuth } = useAuth();
  const [tab, setTab] = useState("products");

  if (isLoadingAuth) {
    return (
      <div className="flex justify-center py-40">
        <Loader2 className="animate-spin text-copper" size={24} />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <ShieldAlert className="text-copper mx-auto mb-6" size={32} />
        <p className="font-display text-3xl text-parchment mb-3">
          Admin access only
        </p>
        <p className="font-body text-muted-foreground">
          You need an admin account to manage products and reviews.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-10">
          <p className="font-label text-xs text-copper mb-3">Crew Quarters</p>
          <h1 className="font-display text-4xl md:text-5xl text-parchment">
            Manage the distillery
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-10 border-b border-border">
          {[
            { k: "products", label: "Products" },
            { k: "reviews", label: "Reviews" },
            { k: "orders", label: "Orders" },
            { k: "inquiries", label: "Inquiries" },
            { k: "audit", label: "Audit" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-5 py-3 font-label text-xs tracking-widest uppercase border-b-2 -mb-px transition-colors ${
                tab === t.k
                  ? "border-copper text-copper"
                  : "border-transparent text-muted-foreground hover:text-parchment"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "products" ? <ProductManager /> : tab === "reviews" ? <ReviewManager /> : <OperationsManager key={tab} resource={tab} />}
      </div>
    </div>
  );
}