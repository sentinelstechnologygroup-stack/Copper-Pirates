import {createPool} from '../server/db.mjs';
import {flushMail} from '../server/mail.mjs';
const pool=createPool();try{
 if(process.argv.includes('--local-preview')){
  if(process.env.VERCEL || process.env.NODE_ENV==='production')throw new Error('Email previews are local development only');
  const host=new URL(process.env.DATABASE_URL).hostname;if(!['localhost','127.0.0.1','::1','[::1]'].includes(host))throw new Error('Email previews require a loopback development database');
  const {rows}=await pool.query("SELECT recipient,subject,body FROM email_outbox WHERE status='queued' ORDER BY created_at DESC LIMIT 10");
  for(const m of rows)console.log(`To: ${m.recipient}\n${m.subject}\n${m.body}\n`);
 }else console.log(await flushMail(pool));
}finally{await pool.end();}
