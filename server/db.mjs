import pg from 'pg';
export function createPool(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('DATABASE_URL is required');
  return new pg.Pool({connectionString:url,max:5,idleTimeoutMillis:10000,connectionTimeoutMillis:10000});
}
export async function transaction(pool, action) {
  const client=await pool.connect();
  try {await client.query('BEGIN');const result=await action(client);await client.query('COMMIT');return result;}
  catch(error){await client.query('ROLLBACK');throw error;}
  finally{client.release();}
}
export const one=async(db,sql,args=[]) => (await db.query(sql,args)).rows[0];
export function problem(status,message){return Object.assign(new Error(message),{status});}
