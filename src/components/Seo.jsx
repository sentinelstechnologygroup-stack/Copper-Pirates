import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const brand="Copper Pirates Montana Rum";
const routes={
 "/distribution":["Montana Rum Distribution Inquiries","Explore Copper Pirates Montana Rum and discuss potential Montana, regional and national distribution partnerships. Territory availability and launch details are confirmed directly."],
 "/cocktails":["Signature Rum Cocktails","Explore serving concepts for the Copper Pirates flagship rum. Final recipes and product details await approval."],
 "/":["Montana Rum Distillery in Kalispell", "Discover a family-owned Montana rum distillery. Explore the rum collection, our craft and the story behind Converting Cowboys to Pirates. Everyday."],
 "/spirits":["Our Flagship Rum","Meet the Copper Pirates Montana Rum relaunch, proposed packaging, product story, and distributor inquiry information."],
 "/craft":["Our Distilling Craft","Explore the inspiration and craft behind our Montana rum."],
 "/about":["Our Family Story","Meet the family-owned distillery building a distinctive rum brand in Kalispell, Montana."],
 "/contact":["Contact the Distillery","Contact Copper Pirates Distillery about rum, distribution and business inquiries."],
 "/account":["My Account","Manage your customer profile, addresses and orders."],
 "/checkout":["Checkout","Review your demonstration order."],
 "/login":["Log In","Log in to your customer account."],
 "/register":["Create an Account","Create a customer account."],
 "/forgot-password":["Reset Your Password","Request a secure password reset."],
 "/reset-password":["Choose a New Password","Reset your account password."]
};
export function setMeta(name,content,property=false) {
  const attr=property?"property":"name";
  let el=document.head.querySelector('meta['+attr+'="'+name+'"]');
  if(!el){el=document.createElement("meta");el.setAttribute(attr,name);document.head.append(el);}
  el.setAttribute("content",content);
}
export default function Seo() {
 const {pathname}=useLocation();
 useEffect(()=>{
  const route=routes[pathname] || (pathname.startsWith("/spirits/")?["Rum Details","Explore this rum and its tasting notes."]:pathname.startsWith("/policies/")?["Customer Information","Customer policies and responsible consumption information."]:["Page","Copper Pirates Distillery"]);
  const title=route[0]+" | "+brand;
  document.title=title;setMeta("description",route[1]);
  setMeta("og:title",title,true);setMeta("og:description",route[1],true);setMeta("og:type","website",true);
  setMeta("og:site_name",brand,true);setMeta("twitter:card","summary");
  const publicRoute=["/","/spirits","/craft","/about","/contact","/cocktails","/distribution"].includes(pathname)||pathname.startsWith("/spirits/");
  const raw=import.meta.env.VITE_SITE_URL;
  let origin="";
  try{const u=new URL(raw);if(u.protocol==="https:")origin=u.origin;}catch { /* awaiting final domain */ }
  const index=import.meta.env.VITE_INDEXING_ENABLED==="true" && !!origin && publicRoute;
  setMeta("robots",index?"index,follow":"noindex,nofollow");
  document.head.querySelector('link[rel="canonical"]')?.remove();
  document.head.querySelector('meta[property="og:url"]')?.remove();
  if(origin){
    const el=document.createElement("link");el.rel="canonical";el.href=origin+pathname;document.head.append(el);
    setMeta("og:url",origin+pathname,true);
  }
 },[pathname]);
 return null;
}
