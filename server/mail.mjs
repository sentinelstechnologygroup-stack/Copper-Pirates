import {randomUUID,timingSafeEqual} from 'node:crypto';
import {one,transaction} from './db.mjs';
export function createMailer(pool,env=process.env){return async(message)=>{
  await pool.query('INSERT INTO email_outbox(id,recipient,subject,body) VALUES($1,$2,$3,$4)',[randomUUID(),message.to,message.subject,message.text]);
  if(env.RESEND_API_KEY && env.EMAIL_FROM)await flushMail(pool,env);
};}
export function authorizedCron(header,secret){
  if(!secret)return false;
  const a=Buffer.from(header || ''),b=Buffer.from(`Bearer ${secret}`);
  return a.length===b.length && timingSafeEqual(a,b);
}
export async function flushMail(pool,env=process.env){
  if(!env.RESEND_API_KEY || !env.EMAIL_FROM) return {configured:false,sent:0};
  return transaction(pool,async db=>{
    const {rows}=await db.query("SELECT * FROM email_outbox WHERE status='queued' AND next_attempt_at<=now() AND attempts<8 ORDER BY created_at LIMIT 20 FOR UPDATE SKIP LOCKED");
    let sent=0;
    for(const mail of rows){
      const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':mail.id},body:JSON.stringify({from:env.EMAIL_FROM,to:[mail.recipient],subject:mail.subject,text:mail.body}),signal:AbortSignal.timeout(10000)}).catch(()=>null);
      if(response?.ok){await db.query("UPDATE email_outbox SET status='sent',body='',sent_at=now(),attempts=attempts+1 WHERE id=$1",[mail.id]);sent++;}
      else await db.query("UPDATE email_outbox SET attempts=attempts+1,next_attempt_at=now()+interval '15 minutes' WHERE id=$1",[mail.id]);
    }
    await db.query("DELETE FROM rate_buckets WHERE expires_at<now()-interval '1 day'");
    await db.query("DELETE FROM email_outbox WHERE created_at<now()-interval '2 days'");
    return {configured:true,sent};
  });
}
