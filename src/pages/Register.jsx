import {useState} from 'react';
import {Link} from 'react-router-dom';
import {api} from '@/api/client';
import AuthLayout from '@/components/AuthLayout';
import {UserPlus,Mail} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
export default function Register(){
 const [form,setForm]=useState({name:'',email:'',password:'',confirm:''});
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[sent,setSent]=useState(false),[message,setMessage]=useState('');
 const submit=async e=>{e.preventDefault();setError('');if(form.password!==form.confirm){setError('Passwords do not match.');return;}setBusy(true);
  try{await api.auth.register(form);setSent(true);}catch(e){setError(e.message);}finally{setBusy(false);}};
 const resend=async()=>{setBusy(true);try{await api.auth.resendVerification(form.email);setMessage('If your account needs verification, a new email has been queued.');}catch(e){setError(e.message);}finally{setBusy(false);}};
 if(sent)return <AuthLayout icon={Mail} title="Check your email" subtitle="Verify your email to finish creating your account"><p>A verification link has been queued for {form.email}. Open it to activate your account. Email delivery must be configured for this model.</p>{message&&<p role="status">{message}</p>}{error&&<p role="alert">{error}</p>}<Button disabled={busy} className="mt-5" onClick={resend}>Resend verification</Button><Link className="block underline mt-5" to="/login">Return to login</Link></AuthLayout>;
 return <AuthLayout icon={UserPlus} title="Join the crew" subtitle="Create your Copper Pirates account" footer={<Link className="underline" to="/login">Already have an account? Log in</Link>}>
 <form onSubmit={submit} className="space-y-5">{[['name','Full name','text','name'],['email','Email','email','email'],['password','Password (12+ characters)','password','new-password'],['confirm','Confirm password','password','new-password']].map(([k,label,type,autoComplete])=><div key={k}><Label htmlFor={k}>{label}</Label><Input id={k} type={type} autoComplete={autoComplete} required minLength={type==='password'?12:1} maxLength={type==='password'?128:150} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>)}
 <p className="text-sm">For adults aged 21 and older. By creating an account you agree to our <Link className="underline" to="/policies/terms">terms</Link> and <Link className="underline" to="/policies/privacy">privacy policy</Link>.</p>{error&&<p role="alert">{error}</p>}<Button disabled={busy} className="w-full">{busy?'Creating account…':'Create account'}</Button></form></AuthLayout>;
}
