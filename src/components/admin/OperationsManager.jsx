import {useEffect,useState} from 'react';
import {request} from '@/api/client';
export default function OperationsManager({resource}){
 const [items,setItems]=useState([]),[error,setError]=useState('');
 const load=async()=>setItems((await request('/admin/'+resource)).items);
 useEffect(()=>{setItems([]);setError('');load().catch(e=>setError(e.message));},[resource]);
 const update=async(id,status)=>{try{await request('/admin/'+resource+'/'+id,{method:'PATCH',body:JSON.stringify({status})});await load();}catch(e){setError(e.message);}};
 return <div className="space-y-5">{error&&<p role="alert">{error}</p>}{!items.length&&<p>No {resource} yet.</p>}{items.map((i)=><article className="border border-border p-5 space-y-3" key={i.id}>
 {resource==='orders'?<><h2 className="text-xl">Demo order #{i.id.slice(-8)}</h2><p>{i.customer_name} · {i.customer_email} · {i.fulfillment} · {i.status}</p><p>Sample total ${i.total.toFixed(2)} · No payment or fulfillment</p><ul>{i.items.map(p=><li key={p.product_id}>{p.name} × {p.quantity}</li>)}</ul>{i.status!=='cancelled'&&<button className="underline" onClick={()=>update(i.id,'cancelled')}>Cancel demo order</button>}</>:resource==='inquiries'?<><h2 className="text-xl">{i.subject} · {i.name}</h2><p>{i.email}</p><p className="whitespace-pre-wrap">{i.message}</p><p>{i.status}</p><button className="underline" onClick={()=>update(i.id,i.status==='resolved'?'new':'resolved')}>{i.status==='resolved'?'Reopen':'Mark resolved'}</button></>:<><p>{i.action} · {i.resource_id}</p><p>{new Date(i.created_at).toLocaleString()}</p></>}
 </article>)}</div>;
}
