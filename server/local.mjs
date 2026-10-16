import {getRuntime} from './runtime.mjs';
const {app,pool}=getRuntime();
const server=app.listen(Number(process.env.API_PORT || 3001),'127.0.0.1',()=>console.log('Copper Pirates API on http://127.0.0.1:3001'));
process.on('SIGTERM',()=>server.close(async()=>{await pool.end();process.exit(0);}));
