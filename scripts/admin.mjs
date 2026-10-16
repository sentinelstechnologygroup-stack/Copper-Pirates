import {createPool} from '../server/db.mjs';
const email=process.argv[2];if(!email)throw new Error('Usage: npm run admin:grant -- owner@example.com');
const pool=createPool();try{
 const r=await pool.query('UPDATE "user" SET role=\'admin\' WHERE lower(email)=lower($1) AND "emailVerified"=true RETURNING id',[email]);
 if(!r.rowCount)throw new Error('No verified account with that email. Register and verify it first.');
 await pool.query('DELETE FROM session WHERE "userId"=$1',[r.rows[0].id]);
 await pool.query('INSERT INTO audit_events(actor_id,action,resource_id) VALUES($1,$2,$1)',[r.rows[0].id,'admin.granted_by_cli']);
 console.log('Admin granted; sign in again.');
}finally{await pool.end();}
