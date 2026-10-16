import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Check } from "lucide-react";
import { api,request } from "@/api/client";
import PageHero from "@/components/PageHero";
import { distillery } from "@/data/spirits";

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.entities.Order
      .get(id)
      .then(setOrder)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="bg-background min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-copper rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="bg-background min-h-[70vh] flex items-center">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h1 className="font-display text-4xl text-parchment mb-4">
            Order not found
          </h1>
          <p className="font-body text-lg text-muted-foreground mb-8">
            We couldn't locate that order. It may belong to another account.
          </p>
          <Link
            to="/account"
            className="inline-block px-10 py-3.5 bg-copper text-background font-label text-sm tracking-widest uppercase hover:bg-copper/90"
          >
            View Your Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <PageHero
        label={order.is_demo ? "Demo Order" : "Order Details"}
        title={order.is_demo ? "Demo order recorded" : "Your order"}
        subtitle={order.is_demo ? "No payment was collected. No shipment or pickup has been arranged." : "View your order details and status below."}
        image={distillery.pourImage}
      />

      <section className="py-20 md:py-24">
        {order.is_demo && <p className="max-w-3xl mx-auto mb-8 border border-copper p-4">DEMO ONLY · Not a paid order · Fulfillment: {order.fulfillment}</p>}
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-full bg-copper/15 border border-copper flex items-center justify-center">
              <Check className="text-copper" size={26} />
            </div>
            <div>
              <p className="font-label text-xs text-copper mb-1">Order Number</p>
              <p className="font-display text-2xl text-parchment">
                #{order.id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="border border-border bg-card p-6 md:p-8 mb-8">
            <p className="font-label text-xs text-copper mb-5">Items</p>
            <ul className="space-y-4">
              {(order.items || []).map((i, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="w-14 h-16 bg-muted border border-border overflow-hidden shrink-0">
                    {i.image && (
                      <img
                        src={i.image}
                        alt={i.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg text-parchment leading-tight">
                      {i.name}
                    </p>
                    <p className="font-label text-[10px] text-muted-foreground">
                      Qty {i.quantity} · ${i.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-body text-parchment">
                    ${(i.price * i.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="hairline my-6" />
            <div className="space-y-2">
              <div className="flex justify-between font-body text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>${(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body text-sm text-muted-foreground">
                <span>Shipping</span>
                <span>
                  {order.is_demo ? "Not calculated (demo)" : (order.shipping || 0) === 0
                    ? "Free"
                    : `$${order.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-3">
                <span className="font-label text-xs text-parchment tracking-widest">
                  Total
                </span>
                <span className="font-display text-2xl text-parchment">
                  ${(order.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            <div className="border border-border p-6">
              <p className="font-label text-xs text-copper mb-3">{order.fulfillment === "pickup" ? "Local pickup demo" : "Shipping demo"}</p>
              <p className="font-body text-parchment leading-relaxed">
                {order.customer_name}
                <br />
                {order.shipping_address?.line1}
                {order.shipping_address?.line2 && (
                  <>
                    <br />
                    {order.shipping_address.line2}
                  </>
                )}
                <br />
                {order.shipping_address?.city}, {order.shipping_address?.state}{" "}
                {order.shipping_address?.zip}
              </p>
            </div>
            <div className="border border-border p-6">
              <p className="font-label text-xs text-copper mb-3">Status</p>
              <p className="font-display text-xl text-parchment capitalize mb-1">
                {order.status}
              </p>
              <p className="font-body text-sm text-muted-foreground">
                No payment has been collected. No fulfillment has been arranged.
              </p>
            </div>
          </div>

          {order.is_demo && order.status !== 'cancelled' && <button className="mb-6 border border-copper px-5 py-3" onClick={async()=>{try{setOrder(await request('/orders/'+order.id+'/cancel',{method:'POST',body:'{}'}));}catch(e){alert(e.message);}}}>Cancel demo order</button>}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/account"
              className="px-10 py-3.5 bg-copper text-background font-label text-sm tracking-widest uppercase hover:bg-copper/90 text-center"
            >
              View Order History
            </Link>
            <Link
              to="/spirits"
              className="px-10 py-3.5 border border-border text-parchment font-label text-sm tracking-widest uppercase hover:border-copper hover:text-copper text-center"
            >
              Keep Browsing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}