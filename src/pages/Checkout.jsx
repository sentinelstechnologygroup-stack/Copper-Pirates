import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/cart";
import { api,request } from "@/api/client";
import { createDemoOrder } from "@/lib/customerApi";
const EMPTY = { name:"",phone:"",line1:"",line2:"",city:"",state:"",zip:"",notes:"" };
export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [form,setForm] = useState(EMPTY);
  const [fulfillment,setFulfillment] = useState("pickup");
  const [addresses,setAddresses] = useState([]);
  const [methods,setMethods]=useState([]),[methodId,setMethodId]=useState(""),[billingId,setBillingId]=useState("");
  const [age,setAge] = useState(false);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const requestId = useRef(crypto.randomUUID());
  const busy = useRef(false);
  const set = (k) => (e) => setForm((f) => ({...f,[k]:e.target.value}));
  useEffect(() => {
    setForm((f) => ({...f,name:user?.full_name || "",phone:user?.phone || ""}));
    request("/payment-methods").then(r=>{setMethods(r.items);setMethodId(r.items.find(m=>m.is_default)?.id || "");}).catch(()=>setMethods([]));
    api.entities.Address.filter({created_by_id:user.id},{sort:"-is_default",limit:50})
      .then((r) => setAddresses(r.items)).catch(() => setAddresses([]));
  },[user.id,user.full_name,user.phone]);
  const selectAddress = (id) => {
    const a=addresses.find((v)=>v.id===id);
    if(a) setForm((f)=>({...f,...Object.fromEntries(["name","line1","line2","city","state","zip"].map((k)=>[k,a[k] || ""]))}));
  };
  const submit = async (e) => {
    e.preventDefault();
    if (busy.current || !items.length) return;
    busy.current=true;setLoading(true);setError("");
    try {
      const r=await createDemoOrder({
        request_id:requestId.current, fulfillment, age_confirmed:age,
        items:items.map((i)=>({product_id:i.id,quantity:i.quantity})),
        customer_name:form.name,phone:form.phone,notes:form.notes,
        ...(methodId?{payment_method_id:methodId}:{}),...(billingId?{billing_address_id:billingId}:{}),
        shipping_address:{line1:form.line1,line2:form.line2,city:form.city,state:form.state.toUpperCase(),zip:form.zip,country:"US"}
      });
      clear();navigate("/order/"+r.order_id);
    } catch {setError("The demo order could not be completed. Your cart is saved. Please try again.");}
    finally {busy.current=false;setLoading(false);}
  };
  const input="w-full border border-border bg-background text-parchment p-3 rounded-sm";
  const field=(k,label,props={})=><label className="block space-y-2" key={k}><span>{label}</span><input className={input} value={form[k]} onChange={set(k)} maxLength={k==="notes"?1000:150} {...props}/></label>;
  if(!items.length)return <section className="max-w-xl mx-auto px-6 pt-32 pb-20"><h1 className="font-display text-4xl mb-6">Your cart is empty</h1><Link to="/spirits" className="underline">Browse spirits</Link></section>;
  return <section className="max-w-6xl mx-auto px-6 pt-32 pb-20">
    <h1 className="font-display text-4xl mb-6">Checkout</h1>
    <p className="border border-copper bg-copper/10 p-4 mb-8">Demo ordering only. No payment, shipment, pickup reservation, or customer email will be sent. Prices are sample values; shipping eligibility and taxes are not configured.</p>
    <form onSubmit={submit} className="grid lg:grid-cols-2 gap-10">
      <div className="space-y-6">
        <fieldset className="space-y-3"><legend className="font-display text-2xl mb-4">Fulfillment</legend>
          {["pickup","shipping"].map((v)=><label key={v} className="flex gap-3 min-h-11 items-center"><input type="radio" name="fulfillment" checked={fulfillment===v} onChange={()=>setFulfillment(v)}/>{v==="pickup"?"Local pickup demo":"Shipping demo"}</label>)}
        </fieldset>
        {fulfillment==="pickup" && <p className="bg-yellow-200 text-black p-4">XXXX — Confirm pickup address, hours, availability and ID-check procedure.</p>}
        <h2 className="font-display text-2xl">Contact</h2>
        {field("name","Full name",{required:true,autoComplete:"name"})}
        <p>Account email: {user.email}</p>
        {field("phone","Phone (optional)",{type:"tel",autoComplete:"tel"})}
        {fulfillment==="shipping" && <fieldset className="space-y-4"><legend className="font-display text-2xl mb-4">Shipping address</legend>
          {!!addresses.length && <label className="block">Saved address<select className={input} defaultValue="" onChange={(e)=>selectAddress(e.target.value)}><option value="" disabled>Select an address</option>{addresses.map((a)=><option key={a.id} value={a.id}>{a.label || a.name} — {a.line1}</option>)}</select></label>}
          {field("line1","Street address",{required:true,autoComplete:"shipping address-line1"})}
          {field("line2","Apartment or suite (optional)",{autoComplete:"shipping address-line2"})}
          {field("city","City",{required:true,autoComplete:"shipping address-level2"})}
          {field("state","State (two letters)",{required:true,pattern:"[A-Za-z]{2}",maxLength:2,autoComplete:"shipping address-level1"})}
          {field("zip","ZIP code",{required:true,pattern:"[0-9]{5}(-[0-9]{4})?",autoComplete:"shipping postal-code"})}
          <p>US address for demonstration only. No destination is approved for actual shipping.</p>
        </fieldset>}
        <label className="block space-y-2"><span>Order notes (optional)</span><textarea className={input} value={form.notes} onChange={set("notes")} maxLength={1000}/></label>
        <h2 className="font-display text-2xl">Payment</h2>
        <p>Demo payment — no charge. Choose a saved demo method below, or continue without one. Real payments require the approved provider.</p>
        {!!methods.length && <label className="block">Saved payment method<select className={input} value={methodId} onChange={e=>setMethodId(e.target.value)}><option value="">No method (demo — no charge)</option>{methods.map(m=><option key={m.id} value={m.id}>{m.brand} •••• {m.last4}</option>)}</select></label>}
        {!!addresses.filter(a=>a.purpose!=='shipping').length && <label className="block">Saved billing address<select className={input} value={billingId} onChange={e=>setBillingId(e.target.value)}><option value="">No billing address (demo)</option>{addresses.filter(a=>a.purpose!=='shipping').map(a=><option key={a.id} value={a.id}>{a.label || a.name} — {a.line1}</option>)}</select></label>}
        <Link to="/account" className="underline">Manage addresses and payment options</Link>
        <label className="flex items-start gap-3"><input type="checkbox" required checked={age} onChange={(e)=>setAge(e.target.checked)}/><span>I am 21 or older. I understand this creates only a demo order.</span></label>
      </div>
      <div className="border border-border bg-card p-6 space-y-5 self-start lg:sticky lg:top-28">
        <h2 className="font-display text-2xl">Review your order</h2>
        {items.map((i)=><div key={i.id} className="flex justify-between gap-4"><span>{i.name} × {i.quantity}</span><span>${(i.price*i.quantity).toFixed(2)}</span></div>)}
        <p>Sample subtotal: ${subtotal.toFixed(2)}</p>
        <p>Shipping and taxes: XXXX — not calculated or charged.</p>
        <p>Final prices are rechecked against the catalog on the server.</p>
        {error && <p role="alert" className="text-red-300">{error}</p>}
        <button disabled={loading} className="w-full p-4 bg-copper text-background disabled:opacity-50">{loading?"Creating demo order…":"Create demo order — no charge"}</button>
        <Link className="block underline" to="/spirits">Continue shopping</Link>
        <Link className="block underline" to="/policies/shipping">Shipping and pickup information</Link>
      </div>
    </form>
  </section>;
}
