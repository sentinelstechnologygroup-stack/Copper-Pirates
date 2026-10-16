import {getRuntime} from '../server/runtime.mjs';
export default function handler(req,res){
  try{return getRuntime().app(req,res);}
  catch{res.statusCode=503;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'Backend configuration is incomplete.'}));}
}
