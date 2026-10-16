import {spawn} from 'node:child_process';
const children=[spawn(process.execPath,['--env-file-if-exists=.env','--watch','server/local.mjs'],{stdio:'inherit'}),spawn('npx',['vite'],{stdio:'inherit'})];
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>children.forEach(p=>p.kill(signal)));
for(const p of children)p.on('exit',code=>{if(code)children.forEach(c=>c.kill());});
