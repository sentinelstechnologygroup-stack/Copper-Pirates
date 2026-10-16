import {chromium} from 'playwright';
import {PGlite} from '@electric-sql/pglite';
import {PGLiteSocketServer} from '@electric-sql/pglite-socket';
import pg from 'pg';
import {createServer} from 'vite';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {createAuth} from '../server/auth.mjs';
import {createApp} from '../server/app.mjs';
import {migrate} from '../server/migrate.mjs';
import {seed} from '../scripts/seed.mjs';
const db=await PGlite.create(),wire=new PGLiteSocketServer({db,port:0,host:'127.0.0.1',maxConnections:5});
let pool,api,vite,browser;
const env={COMMERCE_ENABLED:'true',BETTER_AUTH_URL:'http://localhost:5173',BETTER_AUTH_SECRET:randomBytes(32).toString('hex')};
const mail=[];
try{
 await wire.start();pool=new pg.Pool({connectionString:`postgresql://postgres:postgres@${wire.getServerConn()}/postgres`,max:2});
 let auth=createAuth(pool,{...env,DB_MIGRATION:'true'},async m=>mail.push(m));await migrate(pool,auth);await seed(pool);
 auth=createAuth(pool,env,async m=>mail.push(m));
 api=createApp({pool,auth,env}).listen(3001,'127.0.0.1');await new Promise(r=>api.once('listening',r));
 vite=await createServer({server:{port:5173,strictPort:true,host:'127.0.0.1'}});await vite.listen();
 browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || chromium.executablePath(),headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:"reduce"});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://localhost:5173';
 await page.goto(base);await page.getByRole('button',{name:"Aye, I'm 21+"}).click();
 await page.getByRole('heading',{name:/Converting Cowboys|Turning Cowboys/i}).waitFor();
 await mkdir('test-artifacts',{recursive:true});await page.screenshot({path:'test-artifacts/home-desktop.png'});
 await page.goto(base+'/spirits');await page.getByRole('heading',{name:'Copper Pirates Montana Rum'}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Add to Hold'}).count(),0);
 assert.equal(await page.getByRole('button',{name:'Open cart'}).count(),0);
 for(const path of ['/checkout','/account','/register','/spirits/highline-spiced']){await page.goto(base+path);await page.waitForURL(path.startsWith('/spirits/')?'**/spirits':'**/distribution');}
 await page.goto(base+'/distribution');
 await page.getByRole('textbox',{name:'Contact name',exact:true}).fill('Trade Captain');await page.getByRole('textbox',{name:'Work email',exact:true}).fill('trade@example.com');await page.getByRole('textbox',{name:'Company',exact:true}).fill('Example Distribution');await page.getByRole('textbox',{name:'States or territory of interest',exact:true}).fill('Montana');await page.getByRole('textbox',{name:'Tell us about your market',exact:true}).fill('Please provide product details for our distribution team.');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Send trade inquiry'}).click();await page.getByText('Your trade inquiry has been recorded.').waitFor();
 const inquiry=(await pool.query("SELECT * FROM inquiries WHERE data->>'inquiry_type'='distribution'")).rows[0];assert.equal(inquiry.data.company,'Example Distribution');
 const pdf=await page.request.get(base+'/downloads/copper-pirates-trade-preview.pdf');assert.equal(pdf.status(),200);assert.ok((await pdf.body()).subarray(0,4).toString()==='%PDF');
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/spirits');await page.getByRole('button',{name:'Open navigation'}).click();await page.locator('#mobile-navigation').getByRole('link',{name:'Distribution',exact:true}).waitFor();await page.screenshot({path:'test-artifacts/menu-mobile.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
 assert.deepEqual(errors,[]);console.log('Browser relaunch flow passed: flagship, suppressed shopping URLs, distributor submission through SQL, PDF download, mobile navigation.');
}finally{
 if(browser)await browser.close();if(vite)await vite.close();if(api)await new Promise(r=>api.close(r));if(pool)await pool.end();await wire.stop();await db.close();
}
