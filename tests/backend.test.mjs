import {test,before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {PGLiteSocketServer} from '@electric-sql/pglite-socket';
import pg from 'pg';
import {randomUUID,randomBytes} from 'node:crypto';
import {createAuth} from '../server/auth.mjs';
import {createApp} from '../server/app.mjs';
import {migrate} from '../server/migrate.mjs';
import {seed} from '../scripts/seed.mjs';
let db,wire,pool,auth,server,base,alice,bob,admin;
const mails=[];
const password='Copper-Pirates-Test-Password-47';
const env={BETTER_AUTH_URL:'http://127.0.0.1:5173',BETTER_AUTH_SECRET:randomBytes(32).toString('hex')};
const origin=env.BETTER_AUTH_URL;
async function call(path,{method='GET',body,cookie,requestOrigin=origin}={}){
 const response=await fetch(base+path,{method,headers:{Origin:requestOrigin,...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await response.json().catch(()=>null);return {response,data,status:response.status};
}
async function customer(name){
 const email=name+'@example.com';
 const signup=await call('/api/auth/sign-up/email',{method:'POST',body:{name,email,password}});assert.equal(signup.status,200,JSON.stringify(signup.data));
 const mail=mails.find(m=>m.to===email);assert.ok(mail);
 const link=mail.text.split('\n').find(v=>v.startsWith('http'));
 const verify=await fetch(base+new URL(link).pathname+new URL(link).search,{redirect:'manual'});assert.ok([200,302].includes(verify.status));
 const login=await call('/api/auth/sign-in/email',{method:'POST',body:{email,password}});assert.equal(login.status,200,JSON.stringify(login.data));
 const cookie=login.response.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
 return {id:login.data.user.id,email,cookie};
}
before(async()=>{
 if(process.env.TEST_DATABASE_URL)pool=new pg.Pool({connectionString:process.env.TEST_DATABASE_URL,max:5});
 else {db=await PGlite.create();wire=new PGLiteSocketServer({db,port:0,host:'127.0.0.1'});await wire.start();pool=new pg.Pool({connectionString:`postgresql://postgres:postgres@${wire.getServerConn()}/postgres`,max:1});}
 auth=createAuth(pool,{...env,DB_MIGRATION:"true"},async m=>mails.push(m));await migrate(pool,auth);await seed(pool);auth=createAuth(pool,env,async m=>mails.push(m));
 const app=createApp({pool,auth,env});server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base='http://127.0.0.1:'+server.address().port;
 alice=await customer('alice');bob=await customer('bob');admin=await customer('owner');
 await pool.query('UPDATE "user" SET role=\'admin\' WHERE id=$1',[admin.id]);
}, {timeout:60000});
after(async()=>{if(server)await new Promise(r=>server.close(r));if(pool)await pool.end();if(wire)await wire.stop();if(db)await db.close();});
beforeEach(async()=>{await pool.query('TRUNCATE TABLE "rateLimit"');});
test('real authentication enforces verification, rejects spoofed role, and logs out',async()=>{
 const signup=await call('/api/auth/sign-up/email',{method:'POST',body:{name:'Unverified',email:'unverified@example.com',password,role:'admin'}});assert.equal(signup.status,200);
 const signin=await call('/api/auth/sign-in/email',{method:'POST',body:{email:'unverified@example.com',password}});assert.equal(signin.status,403);
 const role=(await pool.query('SELECT role FROM "user" WHERE email=$1',['unverified@example.com'])).rows[0].role;assert.equal(role,'customer');
 const temp=await customer('logout');assert.equal((await call('/api/me',{cookie:temp.cookie})).status,200);
 assert.equal((await call('/api/auth/sign-out',{method:'POST',body:{},cookie:temp.cookie})).status,200);
 assert.equal((await call('/api/me',{cookie:temp.cookie})).status,401);
});
test('public catalog has eight products; product mutation and inactive access are admin-only',async()=>{
 const r=await call('/api/products');assert.equal(r.data.items.length,8);
 const p=r.data.items[0];assert.equal((await call('/api/products/'+p.id,{method:'PATCH',cookie:alice.cookie,body:{price:1}})).status,403);
 assert.equal((await call('/api/products/'+p.id,{method:'PATCH',cookie:admin.cookie,body:{in_stock:false}})).status,200);
 assert.equal((await call('/api/products?slug='+p.slug)).data.items.length,0);
 await call('/api/products/'+p.id,{method:'PATCH',cookie:admin.cookie,body:{in_stock:true}});
});
test('profile validation, role protection, owner-only addresses and atomic defaults',async()=>{
 assert.equal((await call('/api/me',{method:'PATCH',cookie:alice.cookie,body:{full_name:'Alice',role:'admin'}})).status,400);
 assert.equal((await call('/api/me',{method:'PATCH',cookie:alice.cookie,body:{full_name:'Alice',dob:'2020-01-01'}})).status,400);
 assert.equal((await call('/api/me',{method:'PATCH',cookie:alice.cookie,body:{full_name:'Alice',phone:'406 555 0100',dob:'1990-01-01'}})).status,200);
 const input={name:'Alice',line1:'123 Example Lane',city:'Kalispell',state:'MT',zip:'59901',is_default:true,purpose:'both'};
 const a=await call('/api/addresses',{method:'POST',cookie:alice.cookie,body:input});assert.equal(a.status,201);
 const b=await call('/api/addresses',{method:'POST',cookie:alice.cookie,body:{...input,label:'Second'}});assert.equal(b.status,201);
 assert.equal((await call('/api/addresses',{cookie:alice.cookie})).data.items.filter(a=>a.is_default).length,1);
 assert.equal((await call('/api/addresses/'+a.data.id,{method:'PATCH',cookie:bob.cookie,body:{is_default:true}})).status,404);
 assert.equal((await call('/api/addresses/'+a.data.id,{method:'DELETE',cookie:bob.cookie})).status,404);
 assert.deepEqual((await call('/api/addresses',{cookie:bob.cookie})).data.items,[]);
});
test('saved methods persist, never reveal provider references, and cannot cross accounts',async()=>{
 const a=await call('/api/payment-methods/demo',{method:'POST',cookie:alice.cookie,body:{}});assert.equal(a.status,201);assert.equal(a.data.provider_reference,undefined);
 assert.equal((await call('/api/payment-methods',{cookie:alice.cookie})).data.items.length,1);
 assert.equal((await call('/api/payment-methods/'+a.data.id,{method:'DELETE',cookie:bob.cookie})).status,404);
 assert.equal((await call('/api/payment-methods/'+a.data.id,{method:'PATCH',cookie:alice.cookie,body:{last4:'1234'}})).status,400);
});
test('orders reprice on server, enforce age, ownership, idempotency, and archived availability',async()=>{
 const p=(await call('/api/products')).data.items[0];
 const input={request_id:randomUUID(),fulfillment:'pickup',age_confirmed:true,customer_name:'Alice',items:[{product_id:p.id,quantity:2}]};
 assert.equal((await call('/api/orders',{method:'POST',cookie:alice.cookie,body:{...input,age_confirmed:false}})).status,400);
 assert.equal((await call('/api/orders',{method:'POST',cookie:alice.cookie,body:{...input,total:1}})).status,400);
 const [r,concurrent]=await Promise.all([call('/api/orders',{method:'POST',cookie:alice.cookie,body:input}),call('/api/orders',{method:'POST',cookie:alice.cookie,body:input})]);assert.equal(concurrent.data.order_id,r.data.order_id);assert.equal(r.status,201,JSON.stringify(r.data));assert.equal(r.data.order.total,p.price*2);assert.equal(r.data.order.is_demo,true);
 const again=await call('/api/orders',{method:'POST',cookie:alice.cookie,body:input});assert.equal(again.data.order_id,r.data.order_id);
 assert.equal((await call('/api/orders',{method:'POST',cookie:alice.cookie,body:{...input,customer_name:'Changed'}})).status,409);
 assert.equal((await call('/api/orders/'+r.data.order_id,{cookie:bob.cookie})).status,404);
 assert.equal((await call('/api/orders/'+r.data.order_id,{cookie:alice.cookie})).status,200);
 assert.equal((await call('/api/admin/orders',{cookie:alice.cookie})).status,403);
 const ownerOrders=await call('/api/admin/orders',{cookie:admin.cookie});assert.equal(ownerOrders.data.items.length,1);
 await call('/api/products/'+p.id,{method:'PATCH',cookie:admin.cookie,body:{in_stock:false}});
 assert.equal((await call('/api/orders',{method:'POST',cookie:alice.cookie,body:{...input,request_id:randomUUID()}})).status,409);
 await call('/api/products/'+p.id,{method:'PATCH',cookie:admin.cookie,body:{in_stock:true}});
 assert.equal((await call('/api/orders/'+r.data.order_id+'/cancel',{method:'POST',cookie:alice.cookie,body:{}})).data.status,'cancelled');
});
test('public reviews are pending until an admin approves; public cannot impersonate external sources',async()=>{
 const r=await call('/api/reviews/submit',{method:'POST',body:{name:'Visitor',rating:5,body:'A lovely visit.',status:'approved',source:'google'}});assert.equal(r.status,201);
 assert.equal((await call('/api/reviews?status=approved')).data.items.length,0);
 assert.equal((await call('/api/reviews',{cookie:alice.cookie})).status,403);
 const list=await call('/api/reviews',{cookie:admin.cookie}),v=list.data.items[0];assert.equal(v.source,'website');assert.equal(v.status,'pending');
 await call('/api/reviews/'+v.id,{method:'PATCH',cookie:admin.cookie,body:{status:'approved',featured:true}});
 assert.equal((await call('/api/reviews?status=approved')).data.items.length,1);
});
test('inquiries persist for admins; cross-origin mutations and unauthenticated uploads are rejected',async()=>{
 const body={name:'Visitor',email:'visitor@example.com',subject:'General',message:'When can we visit?'};
 assert.equal((await call('/api/inquiries',{method:'POST',body,requestOrigin:'https://evil.example'})).status,403);
 assert.equal((await call('/api/inquiries',{method:'POST',body})).status,201);
 assert.equal((await call('/api/admin/inquiries',{cookie:bob.cookie})).status,403);
 const list=await call('/api/admin/inquiries',{cookie:admin.cookie});assert.equal(list.data.items.length,1);
 assert.equal((await call('/api/admin/inquiries/'+list.data.items[0].id,{method:'PATCH',cookie:admin.cookie,body:{status:'resolved'}})).status,200);
 assert.equal((await call('/api/uploads',{method:'POST',body:{}})).status,401);
 assert.equal((await call('/api/cron/mail')).status,401);
});
test('password reset uses actual verification token and invalidates existing sessions',async()=>{
 const temp=await customer('reset');
 assert.equal((await call('/api/auth/request-password-reset',{method:'POST',body:{email:temp.email,redirectTo:origin+'/reset-password'}})).status,200);
 const mail=mails.filter(m=>m.to===temp.email).at(-1);const link=mail.text.split('\n').find(v=>v.startsWith('http'));const url=new URL(link);
 const redirect=await fetch(base+url.pathname+url.search,{redirect:'manual'});const token=new URL(redirect.headers.get('location'),origin).searchParams.get('token');assert.ok(token);
 const result=await call('/api/auth/reset-password',{method:'POST',body:{token,newPassword:password+'New'}});assert.equal(result.status,200,JSON.stringify(result.data));
 assert.equal((await call('/api/me',{cookie:temp.cookie})).status,401);
 assert.equal((await call('/api/auth/sign-in/email',{method:'POST',body:{email:temp.email,password}})).status,401);
});
test('account deletion removes saved information and anonymizes retained demo orders',async()=>{
 const temp=await customer('delete');const p=(await call('/api/products')).data.items[0];
 const r=await call('/api/orders',{method:'POST',cookie:temp.cookie,body:{request_id:randomUUID(),fulfillment:'pickup',age_confirmed:true,customer_name:'Delete Me',items:[{product_id:p.id,quantity:1}]}});
 assert.equal(r.status,201);
 const deleted=await call('/api/auth/delete-user',{method:'POST',cookie:temp.cookie,body:{password}});assert.equal(deleted.status,200,JSON.stringify(deleted.data));
 assert.equal((await call('/api/me',{cookie:temp.cookie})).status,401);
 const record=(await pool.query('SELECT * FROM orders WHERE id=$1',[r.data.order_id])).rows[0];assert.equal(record.user_id,null);assert.equal(record.data.customer_email,undefined);
});

test('session revocation, native profile role protection and verified email changes work',async()=>{
 const temp=await customer('security');
 const login=await call('/api/auth/sign-in/email',{method:'POST',body:{email:temp.email,password}});
 const cookie=login.response.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
 assert.ok((await call('/api/auth/list-sessions',{cookie})).data.length>=2);
 assert.equal((await call('/api/auth/revoke-other-sessions',{method:'POST',body:{},cookie})).status,200);
 assert.equal((await call('/api/me',{cookie:temp.cookie})).status,401);
 await call('/api/auth/update-user',{method:'POST',body:{name:'Security Captain',role:'admin'},cookie});
 assert.equal((await call('/api/me',{cookie})).data.role,'customer');
 const changed=await call('/api/auth/change-email',{method:'POST',body:{newEmail:'changed@example.com',callbackURL:origin+'/account'},cookie});assert.equal(changed.status,200,JSON.stringify(changed.data));
 assert.equal((await call('/api/me',{cookie})).data.email,temp.email);
 const mail=mails.find(m=>m.to==='changed@example.com');assert.ok(mail);
 const link=mail.text.split('\n').find(v=>v.startsWith('http')),url=new URL(link);
 const verify=await fetch(base+url.pathname+url.search,{redirect:'manual'});assert.equal(verify.status,302);
 assert.equal((await call('/api/me',{cookie})).data.email,'changed@example.com');
 const change=await call('/api/auth/change-password',{method:'POST',body:{currentPassword:password,newPassword:password+'changed',revokeOtherSessions:true},cookie});assert.equal(change.status,200,JSON.stringify(change.data));
});
test('public form rate limits use persistent SQL buckets',async()=>{
 const body={name:'Rate Test',rating:5,body:'Testing moderation queue.'};
 // A prior public review already consumed one slot in this isolated database.
 for(let i=0;i<4;i++)assert.equal((await call('/api/reviews/submit',{method:'POST',body})).status,201);
 assert.equal((await call('/api/reviews/submit',{method:'POST',body})).status,429);
});
