import {createPool} from '../server/db.mjs';
import {createAuth} from '../server/auth.mjs';
import {migrate} from '../server/migrate.mjs';
const pool=createPool();const auth=createAuth(pool,{...process.env,DB_MIGRATION:'true'},async()=>{});
try{await migrate(pool,auth);console.log('Authentication and commerce migrations applied.');}finally{await pool.end();}
