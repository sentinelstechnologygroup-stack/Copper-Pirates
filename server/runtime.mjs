import {createPool} from './db.mjs';
import {createAuth} from './auth.mjs';
import {createApp} from './app.mjs';
import {createMailer} from './mail.mjs';
let runtime;
export function getRuntime(){
  if(!runtime){const pool=createPool();const sendMail=createMailer(pool);const auth=createAuth(pool,process.env,sendMail);runtime={pool,auth,app:createApp({pool,auth,sendMail})};}
  return runtime;
}
