import {getMigrations} from 'better-auth/db/migration';
import {readFile,readdir} from 'node:fs/promises';
import {transaction} from './db.mjs';
export async function migrate(pool,auth){
  const migrations=await getMigrations(auth.options);
  await migrations.runMigrations();
  await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations(version text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())');
  for(const name of (await readdir(new URL('../migrations/',import.meta.url))).filter(n=>n.endsWith('.sql')).sort()){
    await transaction(pool,async db=>{
      await db.query("SELECT pg_advisory_xact_lock(428813)");
      if((await db.query('SELECT version FROM schema_migrations WHERE version=$1',[name])).rowCount)return;
      await db.query(await readFile(new URL('../migrations/'+name,import.meta.url),'utf8'));
      await db.query('INSERT INTO schema_migrations(version) VALUES($1)',[name]);
    });
  }
}
