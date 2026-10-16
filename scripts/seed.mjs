import {readFile} from 'node:fs/promises';
import {createPool,transaction} from '../server/db.mjs';
export async function seed(pool){
 const data=JSON.parse(await readFile(new URL('../src/data/catalog.json',import.meta.url),'utf8'));
 await transaction(pool,async db=>{for(const p of data)await db.query('INSERT INTO products(id,slug,data,price_cents,active,sort_order) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO NOTHING',[p.id,p.slug,p,Math.round(p.price*100),p.in_stock,p.sort_order]);});
}
if(process.argv[1]?.endsWith('/scripts/seed.mjs')){const pool=createPool();try{await seed(pool);console.log('Sample catalog seeded; existing products preserved.');}finally{await pool.end();}}
