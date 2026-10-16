import { Link, useParams } from "react-router-dom";
const data={
 privacy:["Privacy","This model uses authentication, customer profile/address data, cart storage, and submitted reviews. No advertising tags have been enabled by this hardening pass. XXXX — Confirm data controller, service providers, retention periods, rights requests and privacy contact before launch."],
 terms:["Terms","Demonstration only: checkout does not create an enforceable sale, collect payment or reserve stock. XXXX — Confirm legal seller, customer terms and approved purchase conditions."],
 shipping:["Shipping & Pickup","All ordering is currently a demonstration. No destination is approved for shipping and no pickup reservation is made. XXXX — Confirm shipping eligibility, carrier, adult signature, pickup address, hours, quantity limits, taxes and charges."],
 returns:["Returns & Support","XXXX — Approve cancellation, damaged-shipment, refund and return policies and the customer support contact. No refund promises are made by this model."],
 responsible:["Responsible Consumption","For adults 21 and older. Please drink responsibly. An entrance confirmation or self-reported birth date does not verify identity. Actual sales require the approved age and fulfillment verification process."]
};
export default function Policy(){
 const {section}=useParams();const item=data[section];
 return <main className="max-w-3xl mx-auto px-6 pt-32 pb-24 space-y-6"><h1 className="font-display text-4xl">{item?.[0]||"Page not found"}</h1><p className="leading-relaxed">{item?.[1]||"This information page does not exist."}</p><p className="bg-yellow-200 text-black p-4">Review model — business policies require owner approval before public launch.</p><Link to="/contact" className="underline">Contact information</Link></main>;
}
