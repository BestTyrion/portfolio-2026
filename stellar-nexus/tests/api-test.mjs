import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
let localHandler;
if(!process.env.TEST_URL){
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(fs.readFileSync('drizzle/0000_thick_yellow_claw.sql','utf8'));
 const adapter={prepare(sql){return {bind(...values){return {async first(){return sqlite.prepare(sql).get(...values)||null},async all(){return {results:sqlite.prepare(sql).all(...values)}},async run(){const result=sqlite.prepare(sql).run(...values);return {meta:{changes:Number(result.changes)}}},sql,values}},async first(){return sqlite.prepare(sql).get()||null},async all(){return {results:sqlite.prepare(sql).all()}},sql,values:[]}},async batch(statements){sqlite.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sqlite.exec('COMMIT');return out}catch(e){sqlite.exec('ROLLBACK');throw e}}};
 globalThis.__stellarTestEnv={DB:adapter};
 const source=fs.readFileSync('app/api/[...path]/route.ts','utf8').replace("import {env} from 'cloudflare:workers';","const env = globalThis.__stellarTestEnv;");
 const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 localHandler=(await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'))).GET;
}

const base=process.env.TEST_URL||'http://terminal.local:4173';
function client(){let cookie='';return async(path,data)=>{const options={method:data?'POST':'GET',headers:{...(data?{'Content-Type':'application/json'}:{}),...(cookie?{cookie}:{})},body:data?JSON.stringify(data):undefined};const r=localHandler?await localHandler(new Request(base+'/api/'+path,options)):await fetch(base+'/api/'+path,options);if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()}}}
const guest=client(),teacher=client(),learner=client(),admin=client(),third=client(),fourth=client();const checks=[];function check(label,fn){fn();checks.push({check:label,result:'PASS'})}
const newbie=client();let r=await newbie('auth',{action:'register',email:'underage@demo.test',password:'TestPass2026!',adult:false});check('Adult confirmation required for signup',()=>assert.equal(r.status,400));r=await newbie('auth',{action:'register',email:'fixture@demo.test',password:'TestPass2026!',name:'測試新成員',adult:true});check('Real signup persists new user and session',()=>assert.equal(r.status,200));r=await newbie('bootstrap');check('Signed-in identity survives next request',()=>assert.equal(r.data.me.name,'測試新成員'));r=await guest('bootstrap');check('Database seed and anonymous read',()=>assert.equal(r.status,200));
r=await guest('request',{title:'unauthorized'});check('Anonymous writes rejected',()=>assert.equal(r.status,401));
for(const [c,email] of [[teacher,'lin'],[learner,'wang'],[admin,'admin'],[third,'chen'],[fourth,'zhao']]){r=await c('auth',{action:'login',email:email+'@demo.test',password:'Stellar2026!'});assert.equal(r.status,200,JSON.stringify(r));}
r=await learner('review-skill',{id:'no',status:'approved'});check('Learner cannot use admin endpoint',()=>assert.equal(r.status,403));
r=await teacher('profile',{skills:[{id:'s-ai',role:'both',level:'熟練'},{id:'custom-test',name:'測試知識修復-'+Date.now(),custom:true,category_id:'digital',description:'API integration fixture',role:'learn',level:'入門'}],city:'福州',mode:'均可',time:'週末'});check('Interests and custom skill persist',()=>assert.equal(r.status,200));
let d=(await teacher('bootstrap')).data;const custom=d.skills.find(s=>s.owner_id==='demo-lin'&&s.status==='pending');assert.ok(custom);check('Custom skill private before review',()=>assert.ok(custom));
const publicBefore=(await guest('bootstrap')).data;check('Unreviewed custom skill hidden from guests',()=>assert.ok(!publicBefore.skills.some(s=>s.id===custom.id)));
d=(await admin('bootstrap')).data;let sub=d.submissions.find(s=>s.skill_id===custom.id);r=await admin('review-skill',{id:sub.id,status:'approved'});assert.equal(r.status,200);check('Review makes skill publicly discoverable',()=>assert.equal(r.status,200));assert.ok((await guest('bootstrap')).data.skills.some(s=>s.id===custom.id));
r=await teacher('course',{skill_id:'s-ai',title:'API驗證活動 · AI 筆記練習',description:'僅用於本地測試的虛構小組活動',capacity:2,date:'2026-12-20',slot:'09:00–10:00',city:'福州',mode:'線上',equipment:'筆記本電腦'});check('Teacher creates course and pending event',()=>assert.equal(r.status,200));const eid=r.data.id;
r=await teacher('course',{skill_id:'s-ai',title:'重疊活動',description:'測試',capacity:2,date:'2026-12-20',slot:'09:30–10:30',city:'福州',mode:'線上',equipment:'電腦'});assert.equal(r.status,200);const overlapId=r.data.id;
r=await learner('event',{event_id:eid,action:'confirm',venue_id:'v-online',confirmed:true});check('Non-organizer cannot confirm venue',()=>assert.equal(r.status,403));
r=await teacher('event',{event_id:eid,action:'confirm',venue_id:'v-private',confirmed:true});check('Private residence excluded from public grouping',()=>assert.equal(r.status,400));
r=await teacher('event',{event_id:eid,action:'confirm',venue_id:'v-online',confirmed:true});check('Organizer confirms suitable venue',()=>assert.equal(r.status,200));r=await teacher('event',{event_id:overlapId,action:'confirm',venue_id:'v-online',confirmed:true});check('Overlapping time interval conflicts rejected',()=>assert.equal(r.status,400));
for(const c of [learner,third,fourth]){r=await c('register',{event_id:eid});assert.equal(r.status,200)}
d=(await teacher('bootstrap')).data;const e=d.events.find(x=>x.id===eid);check('Capacity enforced and overflow waitlisted',()=>{assert.equal(e.enrolled,2);assert.equal(e.waitlist,1);assert.equal(e.status,'full')});
r=await learner('register',{event_id:eid});check('Duplicate registration rejected',()=>assert.equal(r.status,400));
r=await fourth('checkin',{event_id:eid,code:e.code});check('Waitlisted participant cannot check in',()=>assert.equal(r.status,400));
r=await learner('cancel-registration',{event_id:eid});assert.equal(r.status,200);d=(await fourth('bootstrap')).data;check('Cancellation promotes waitlist atomically',()=>assert.equal(d.registrations.find(x=>x.event_id===eid).status,'registered'));
r=await fourth('checkin',{event_id:eid,code:'WRONG'});check('Incorrect event code rejected',()=>assert.equal(r.status,400));
r=await fourth('checkin',{event_id:eid,code:e.code});check('Confirmed participant can check in',()=>assert.equal(r.status,200));
r=await teacher('event',{event_id:eid,status:'ended'});check('Organizer completes event',()=>assert.equal(r.status,200));
r=await fourth('feedback',{event_id:eid,rating:5,content:'虛構測試回饋'});check('Checked-in participant feedback persists',()=>assert.equal(r.status,200));
r=await teacher('knowledge',{action:'create',event_id:eid,title:'AI 筆記練習 · 可追溯知識',source:'1. 列出目標。\n2. 提出問題。\n3. 對照來源核對答案。'});check('Activity teacher creates source-linked draft',()=>assert.equal(r.status,200));const kid=r.data.id;
const card={id:kid,title:'AI 筆記練習 · 可追溯知識',content:'1. 列出目標。\n2. 提出問題。\n3. 對照來源核對答案。',conditions:'成年人使用，有獨立核對資料的能力。',cautions:'不提交私人資料；重要答案核對原始來源。'};
r=await teacher('knowledge',{...card,action:'submit',confirmed:true,consent:false});check('No public submission without explicit consent',()=>assert.equal(r.status,400));
r=await teacher('knowledge',{...card,action:'submit',confirmed:true,consent:true});assert.equal(r.status,200);
d=(await guest('bootstrap')).data;check('Unreviewed knowledge hidden from public',()=>assert.ok(!d.cards.some(x=>x.id===kid)));
r=await admin('knowledge',{action:'review',id:kid});check('Admin publishes confirmed and authorized card',()=>assert.equal(r.status,200));
d=(await guest('bootstrap')).data;check('Published card joins public knowledge graph',()=>assert.ok(d.cards.some(x=>x.id===kid)));
r=await teacher('knowledge',{action:'withdraw',id:kid});assert.equal(r.status,200);d=(await guest('bootstrap')).data;check('Consent withdrawal removes public visibility',()=>assert.ok(!d.cards.some(x=>x.id===kid)));
r=await learner('knowledge',{...card,action:'save'});check('Other users cannot edit author card',()=>assert.equal(r.status,403));
// Leave an editable draft for UI screenshot, not a falsely published AI result.
await teacher('knowledge',{...card,action:'save',confirmed:false,consent:false});
const report={date:'2026-10-31',environment:localHandler?'actual API handler + in-memory SQLite D1 adapter; isolated fictional fixtures':'HTTP endpoint; fictional fixtures',checks,summary:`${checks.length} passed`,event_id:eid,card_id:kid};fs.writeFileSync('docs/test-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
