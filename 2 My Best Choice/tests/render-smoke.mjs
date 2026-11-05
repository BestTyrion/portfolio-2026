import vm from 'node:vm';
import fs from 'node:fs';
import * as domain from '../public/domain.mjs';
import * as planning from '../public/planning.mjs';
import * as evidence from '../public/evidence.mjs';
import * as cases from '../public/analysis-cases.mjs';
import * as commerceTools from '../public/commerce.mjs';
import * as locale from '../public/i18n.mjs';
locale.setLanguage('zh-CN');
const src=fs.readFileSync('public/app.js','utf8').replace(/^import[^\n]+\n/gm,'');
function storage(){const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};}
const nodes=new Map();const node=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',style:{},textContent:'',focus(){},querySelector(){return null;}});return nodes.get(k);};
const loc={pathname:'/',search:'',hash:''};const ss=storage(),ls=storage();const handlers={};
const ctx={...domain,...planning,...evidence,...cases,...commerceTools,...locale,console,sessionStorage:ss,localStorage:ls,location:loc,document:{querySelector:node,addEventListener:(k,fn)=>{(handlers[k]||=[]).push(fn);},getElementById:()=>null,body:{style:{}},activeElement:null,title:''},window:{scrollTo(){},scrollY:0,addEventListener(){},history:{replaceState(a,b,url){const u=new URL(url,'https://example.test');Object.assign(loc,{pathname:u.pathname,search:u.search,hash:u.hash});},pushState(a,b,url){this.replaceState(a,b,url);}}},URL,URLSearchParams,Blob,setTimeout,clearTimeout,requestAnimationFrame:()=>{},FormData:class {constructor(f){this.x=f.values||{};}get(k){return this.x[k]??null;}has(k){return k in this.x;}getAll(k){return Array.isArray(this.x[k])?this.x[k]:this.has(k)?[this.x[k]]:[];}},Date,Math};
vm.createContext(ctx);vm.runInContext(src,ctx);function run(s){return vm.runInContext(s,ctx);}run("currentUser='creator-b';state=upgradeState(freshState(currentUser));state.setup=true;");
let count=0;for(const path of ['/','/login','/signup','/recover','/setup','/home','/needs','/proposals','/needs/goal-gpu','/plans','/products/new','/products/earbud-aster','/products/stand-mini','/products/gpu-5090','/watchlist','/decisions','/settings','/missing']){loc.pathname=path;run('render()');if(!node('#app').innerHTML)throw Error('Empty route '+path);count++;}
for(const tab of ['profile','notifications','data','connected']){loc.pathname='/settings';loc.search='?tab='+tab;run('render()');count++;}loc.search='';
run("applyDecision(state,product(state,'earbud-aster'),'WAIT','需核实');render();");loc.pathname='/watchlist';run('render()');
const did=run("applyDecision(state,product(state,'earbud-aster'),'BUY','用途已确认').id");loc.pathname='/decisions/'+did;run('render()');run(`state.decisions.find(d=>d.id==='${did}').purchased=true`);const cid=run(`triggerDrop(state,'${did}').id`);loc.pathname='/changes/'+cid;run('render()');
for(const expr of ["productEdit('earbud-aster')","goalForm('goal-gpu')","confirmProduct('earbud-aster')","watchForm('earbud-aster')","decideForm('earbud-aster','WAIT')","sourceDrawer('review','calls')","sourceDrawer('point','a',{date:'2026-10-14',price:499})",`purchaseForm('${did}')`,`alternativeForm('${did}')`,"manualProduct('商品')"]){run(expr);count++;}
console.log('Rendered '+count+' routes/drawers and archived decision/new-finding states without runtime errors.');

for(const filter of ['all','direction','purchase','order']){run(`ui.proposalFilter='${filter}';proposals()`);count++;}
run('loadPlanExample(state);plans();');
run("planPreview=previewPurchase(state,{productId:'earbud-aster',price:499,source:'earmark'});plans();");
for(const expr of ["helpDrawer()","helpDrawer('use')","basisForm()","needForm()","needDetail('need-earbud')","orderDrawer()","taskForm()","addArea()"]){run(expr);count++;}
console.log('New experience routes, chart preview, proposal filters and explanation drawers rendered.');
// Exercise delegated UI controls and form wiring without claiming a browser test.
import assert from 'node:assert/strict';
function click(action,data={}){const el={dataset:{action,...data},disabled:false,getAttribute:()=>null};const target={classList:{contains:()=>false},hasAttribute:()=>false,closest:q=>q==='[data-action]'||q==='[data-action^="v2-"]'?el:null};for(const handler of handlers.click||[])handler({target,preventDefault(){}});}
function submit(id,values,dataset={}){const target={id,values,dataset,querySelector:()=>null};for(const handler of handlers.submit||[])handler({target,preventDefault(){}});}
node('#toast').classList={add(){},remove(){}};
run("state=upgradeState(freshState('creator-b'));state.setup=true;currentUser='creator-b';");loc.pathname='/plans';
click('v2-load-plan');assert.equal(run('fundSummary(state).pool'),10000);
const before=run('JSON.stringify(state.experience.funds)');submit('v2-impact-form',{productId:'earbud-aster',source:'earmark'});assert.equal(run('planPreview.ok'),true);assert.equal(run('JSON.stringify(state.experience.funds)'),before);
click('v2-impact-cancel');assert.equal(run('planPreview'),null);assert.equal(run('JSON.stringify(state.experience.funds)'),before);
submit('v2-impact-form',{productId:'earbud-aster',source:'earmark'});click('v2-impact-confirm');assert.equal(run('state.experience.funds.earmarks["earbud-aster"]'),101);
const oldOrder=run('state.experience.needs.map(n=>n.id).join()');submit('v2-task-form',{task:'本地任务',readiness:'blocked',limitation:'显存限制'});assert.equal(run('state.experience.needs.map(n=>n.id).join()'),oldOrder);click('v2-order-confirm');assert.equal(run('state.experience.needs[0].id'),'need-gpu');
submit('v2-area-form',{name:'学习声音设计'});assert.equal(run('state.experience.areas.at(-1).name'),'学习声音设计');
submit('v2-view-form',{statement:'安静的创作体验'},{key:'emotion'});assert.match(run('proposalViews(state)[2].quote'),/安静/);
console.log('Delegated forms verified: preview/cancel/commit, task evidence, confirmed sorting, follow areas and viewpoint correction.');
// AI requests do not mutate plans; changed inputs and late/cancelled replies stay safe.
ctx.AbortController=AbortController;
const answer={summary:'<script>not HTML</script>',perspectives:['use','price','emotion','social'].map(key=>({key,quote:'我会先核对。',evidenceIds:['sample'],unknown:'待确认',nextAction:'检查资料'})),suggestions:[]};
let release;ctx.fetch=()=>new Promise(resolve=>{release=resolve;});
run("ai.key='sk-unit-test-not-real';aiPreview('direction','')");const moneyBefore=run('JSON.stringify(state.experience.funds)');
for(const p of answer.perspectives)p.evidenceIds=[run('ai.preview.input.facts[0].id')];
const aiWork=run('aiGenerate()');assert.equal(run('!!ai.pending'),true);
run("state.experience.emotion='想享受安静体验'");release({ok:true,json:async()=>({result:answer,model:'test-model',generatedAt:new Date().toISOString()})});await aiWork;
assert.equal(run('JSON.stringify(state.experience.funds)'),moneyBefore);assert.match(run("aiPanel('direction')"),/资料已变化/);assert.match(run("aiPanel('direction')"),/&lt;script&gt;/);assert.equal(run("aiPanel('direction')").includes('<script>not HTML</script>'),false);
run("aiPreview('direction','')");const late=run('aiGenerate()');run('aiClear()');release({ok:true,json:async()=>({result:answer,model:'test-model',generatedAt:new Date().toISOString()})});await late;assert.equal(run('ai.results.size'),0);assert.equal(run('ai.key'),'');
ctx.fetch=async()=>({ok:false,json:async()=>({error:'Poe 密钥无效，请重新填写。'})});run("ai.key='sk-unit-test-not-real';aiPreview('direction','')");await run('aiGenerate()');assert.match(run("aiPanel('direction')"),/密钥无效/);assert.equal(run('ai.results.size'),0);assert.equal(run("JSON.stringify(state).includes('sk-unit-test')"),false);
console.log('AI lifecycle verified: stale inputs, HTML escaping, cancellation, credentials clearing, errors and unchanged funds.');
run("aiClear();state=upgradeState(freshState('creator-b'));state.setup=true;");
submit('v2-basis-form',{tasks:'旧耳机通勤断连',equipment:'已有一副耳机',budget:'HK$600以内',time:'一个月内',priority:'稳定优先，不占旅行预留',emotion:'希望通勤更安静',social:'没有影响',occupation:'设计师',interests:'音频',skills:'剪辑',future:'旅行',digestFrequency:'仅手动查看'});
const inputFacts=run("aiFacts('direction').facts");for(const id of ['tasks','equipment','budget','time','priority','emotion','social'])assert.ok(inputFacts.some(f=>f.id===id&&f.source==='user_confirmed'));
assert.equal(run('state.experience.social'),'没有影响');assert.ok(!inputFacts.some(f=>f.id==='sample'));
run('basisForm()');assert.match(node('#overlay-root').innerHTML,/本次依据与我的想法/);assert.ok(node('#overlay-root').innerHTML.includes(locale.protectUserText('稳定优先')));
const savedFunds=run('JSON.stringify(state.experience.funds)');run("aiPreview('direction','')");assert.match(node('#overlay-root').innerHTML,/四个视角分别有什么依据/);assert.equal(run('JSON.stringify(state.experience.funds)'),savedFunds);
console.log('Unified basis form stores confirmed facts and thoughts, keeps explicit no influence and leaves funds unchanged.');
const originalCaseState=run('JSON.stringify(state)');ctx.fetch=()=>{throw Error('One-click demo must not call API');};click('ai-demo');assert.equal(run("ai.results.get('demo:').isDemo"),true);assert.equal(run('JSON.stringify(state)'),originalCaseState);assert.match(run('proposals()'),/预设演示脚本/);
click('ai-plan-select',{plan:'goal/goal-gpu'});assert.equal(run('ui.analysisMode'),'plan:goal/goal-gpu');assert.match(run('proposals()'),/正在重评/);assert.equal(run('JSON.stringify(state)'),originalCaseState);
submit('ai-plan-notes-form',{emotion:'只用于显卡的体验',social:'没有影响'},{id:'goal/goal-gpu'});assert.equal(run("aiFacts('plan','goal/goal-gpu').facts.find(f=>f.id==='emotion').value"),'只用于显卡的体验');assert.equal(run("aiFacts('plan','need/need-earbud').facts.some(f=>f.id==='emotion')"),false);
run("aiPreview('plan','goal/goal-gpu')");assert.equal(run('ai.preview.input.scope'),'plan');assert.match(node('#overlay-root').innerHTML,/代码计算/);
console.log('One-click demo requires no API and preserves state; selecting and supplementing a saved plan stays isolated.');
run("commerce.result={link:{platform:'jd',id:'100123456',url:'https://item.jd.com/100123456.html'},fields:{name:{value:'测试耳机 ZX1',evidenceIds:['user_text']},brand:{value:null,evidenceIds:[]},model:{value:'ZX1',evidenceIds:['user_text']},configuration:{value:'黑色',evidenceIds:['user_text']},price:{value:'499',evidenceIds:['user_text']},currency:{value:'CNY',evidenceIds:['user_text']},seller:{value:null,evidenceIds:[]}},facts:[{id:'user_text',label:'用户粘贴',value:'测试耳机 ZX1 黑色 CNY 499'}],notice:'AI 提取未核实',aiUsed:true,generatedAt:'2026-11-04T08:00:00Z'};commerce.user=currentUser;");run('commercePreview()');assert.match(node('#overlay-root').innerHTML,/CNY 499/);assert.match(node('#overlay-root').innerHTML,/name="priceHKD"[^>]*value=""/);
const planBeforeImport=run('JSON.stringify(state.experience.funds)');submit('commerce-confirm-form',{name:'测试耳机 ZX1',model:'ZX1',configuration:'黑色',priceHKD:'',confirmed:'on'});const imported=run('Object.values(state.customProducts).find(p=>p.importRecord)');assert.equal(imported.price,null);assert.equal(imported.importRecord.currency,'CNY');assert.equal(imported.importRecord.officialVerified,false);assert.equal(run('JSON.stringify(state.experience.funds)'),planBeforeImport);
console.log('AI import confirmation preserves original CNY price and does not treat it as HKD or change funds.');
