import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
fs.mkdirSync('.sites-runtime',{recursive:true});
fs.writeFileSync('.sites-runtime/execution-profile.json',JSON.stringify({executionProfile:'portable'}));
function run(args){const r=spawnSync(process.execPath,args,{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}
run(['node_modules/vinext/dist/cli.js','build']);
const config=JSON.parse(fs.readFileSync('dist/server/wrangler.json','utf8'));
const marker='.sites-runtime/local-migrations.json';let done=[];try{done=JSON.parse(fs.readFileSync(marker,'utf8'))}catch{}
for(const file of fs.readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort()){if(done.includes(file))continue;run(['--import','./scripts/sites-env.mjs','node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--file','drizzle/'+file]);done.push(file);fs.writeFileSync(marker,JSON.stringify(done))}
console.log('Ready. Run: npm run dev');
