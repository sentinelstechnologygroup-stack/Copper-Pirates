import {useEffect,useState} from 'react';
import {request} from '@/api/client';
export default function PaymentMethodsTab(){
 const [methods,setMethods]=useState([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=async()=>setMethods((await request('/payment-methods')).items);
 useEffect(()=>{load().catch(e=>setError(e.message));},[]);
 const action=async(path,method,body)=>{setBusy(true);setError('');try{await request(path,{method,...(body?{body:JSON.stringify(body)}:{})});await load();}catch(e){setError(e.message);}finally{setBusy(false);}};
 return <div className="max-w-2xl space-y-5"><h2 className="font-display text-2xl">Saved payment methods</h2><p className="border border-copper bg-copper/10 p-4">Demo only. No provider is connected and no charges can be made. Never enter real card details here.</p>{error&&<p role="alert">{error}</p>}<button disabled={busy} className="border border-copper px-5 py-3" onClick={()=>action('/payment-methods/demo','POST')}>Save demo payment method</button>{!methods.length&&<p>No saved methods.</p>}{methods.map(m=><div key={m.id} className="border border-border p-5 space-y-3"><p>{m.brand} •••• {m.last4} {m.is_default?'· Default':''} {m.is_demo?'· Demo':''}</p>{!m.is_default&&<button disabled={busy} className="underline mr-5" onClick={()=>action('/payment-methods/'+m.id,'PATCH',{is_default:true})}>Make default</button>}<button disabled={busy} className="underline" onClick={()=>action('/payment-methods/'+m.id,'DELETE')}>Remove</button></div>)}<p>Saved methods belong to your account and remain available when you sign in again. Real methods will use the approved provider’s hosted form and tokens.</p></div>;
}
