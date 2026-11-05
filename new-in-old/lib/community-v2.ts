export type Tab = 'here'|'together'|'days'|'mine';
export const places=[
 {id:'lane',name:'每天经过的街口',x:24,y:29,photo:'/media/fuzhou-street.webp',note:'街巷场景参考'},
 {id:'table',name:'一起做东西的桌子',x:66,y:47,photo:'/media/hands.webp',note:'活动空间概念'},
 {id:'court',name:'周末的小庭院',x:37,y:76,photo:'/media/fuzhou-lane.webp',note:'庭院位置示意'}
];
export const activities=[
 {id:'walk',title:'第一次，一起走走',tag:'认识日常',place:'lane',date:'2026-11-07',time:'15:00—16:00',capacity:8,photo:'/media/fuzhou-street.webp',body:'沿着日常会经过的路，认识取件、买菜和歇脚的地方。可以安静跟着走，不必自我介绍。',material:'路线折页、记录卡',fee:'免费',role:'带路 / 拍照 / 安静同行'},
 {id:'zine',title:'把这一页，留给这条街',tag:'居民共创',place:'table',date:'2026-11-14',time:'14:30—16:30',capacity:6,photo:'/media/scrapbook-craft.webp',body:'听一段老街坊的故事，整理一张照片，或画下你记得的街角。一起做一期社区小志，发布前逐一确认署名与许可。',material:'纸张、画笔、照片扫描工具',fee:'材料费 ¥15（模拟）',role:'讲故事 / 编辑 / 插画 / 整理照片'},
 {id:'swap',title:'旧东西，又有了新日子',tag:'旧物分享',place:'court',date:'2026-11-21',time:'10:00—12:00',capacity:4,photo:'/media/fuzhou-lane.webp',body:'带一件愿意交换的小物，写下它的使用故事。也欢迎空手来看看，没有必须交换的要求。',material:'旧物故事卡',fee:'免费',role:'带一件旧物 / 帮忙布置 / 随便看看'}
];
export const resources=[
 {title:'刚搬来，可以先问这三件事',body:'取件点在哪里、垃圾怎样投放、公共空间由谁负责。正式上线前由社区负责方逐条核实；这里暂不提供真实办事地址。',source:'设计情境 · 待现场核验'},
 {title:'按自己的方式参加',body:'可以独自来、只听、不合影。报名时写下安排需求，组织者在活动前确认。',source:'本原型参与规则'},
 {title:'有件小事，想找人问问',body:'把与社区服务有关的问题留给协调员。可在“一起 → 我的安排”查看答复。演示中需要自行切换组织者角色回复。',source:'服务概念 · 非正式社区渠道'}
];
export type Memory={id:string,title:string,body:string,place:string,photo:string,date:string};
export type Work={id:string,title:string,body:string,author:string,place:string,version:number,archive:boolean,display:boolean,product:boolean,status:string};
export type Development={id:string,kind:'place'|'activity'|'work',target:string,title:string,body:string,before?:string,after?:string,date:string,source:string,confirmed:boolean,workVersion?:number,parent?:string,successor?:string,successorConsent:boolean};
export type Capsule={id:string,title:string,letter:string,opens:string,created:string,opened:boolean,snapshot:{name:string,memories:Memory[],works:Work[],places:string[],activities:string[]},tracking:{places:string[],activities:string[],works:string[]}};
export type ArrivalBatch={number:number,code:string,label:string};
export type Keepsake={personalCode?:string,memory:Memory,meaning:string,style:string,inscription:string,batch:ArrivalBatch,created:string,status:"brief_saved",aiConsent:boolean};
export const demoArrivalBatch=():ArrivalBatch=>({number:1,code:"DEMO-B01",label:"第01演示批次"});
export type State={arrivalBatch?:ArrivalBatch,keepsake?:Keepsake,saved?:string[],following?:string[],name:string,stage:string,theme:string,role:string,joined:string[],arrangements?:Record<string,{photo:boolean,needs:string}>,photoConsent:boolean,needs:string,memories:Memory[],works:Work[],groups:{id:string,title:string,activity:string,capacity:number,members:string[],owner:string,invite:string}[],capsules:Capsule[],developments:Development[],questions:{id:string,title:string,reply:string,status:string}[],handovers:{id:string,work:string,successor:string,status:string,consent:boolean}[],settings:{replay:string,nextReplay:string,font:string,motion:boolean,quiet:boolean},log:{action:string,date:string}[]};
const short=(v:unknown,n=2000)=>String(v??'').trim().slice(0,n);
const required=(v:unknown,n=2000)=>{const s=short(v,n);if(!s)throw Error('请把必填内容补充完整');return s};
const validPlace=(v:unknown)=>{if(!places.some(p=>p.id===v))throw Error('请选择一个地图地点');return String(v)};
const validActivity=(v:unknown)=>{if(!activities.some(p=>p.id===v))throw Error('活动不存在');return String(v)};
const date=(v:unknown)=>{const s=short(v,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error('日期无效');return s};
const photo=(v:unknown)=>['','/media/fuzhou-street.webp','/media/fuzhou-lane.webp','/media/hands.webp'].includes(String(v))?String(v):'';
export function initialState(name:string,theme:string):State{return {arrivalBatch:demoArrivalBatch(),name:required(name,24),stage:'arriving',theme:theme==='rose'?'rose':'teal',role:'resident',joined:[],arrangements:{},photoConsent:false,needs:'',memories:[],works:[],groups:[],capsules:[],developments:[],questions:[],handovers:[],settings:{replay:'off',nextReplay:'',font:'normal',motion:true,quiet:true},log:[]}}
export function applyAction(previous:State,b:any,stamp=new Date().toISOString()):State{
 const s=structuredClone(previous),a=b.action,id=()=>crypto.randomUUID(),today=stamp.slice(0,10);
 const item=<T extends {id:string}>(list:T[])=>{const x=list.find(x=>x.id===b.id);if(!x)throw Error('记录不存在，请刷新后再试');return x};
 const adminActions=['review_work','development','publish_development','reply','handover_propose'];
 if(adminActions.includes(a)&&s.role!=='organizer')throw Error('请在“我的”切换到组织者演示');
 if(!adminActions.includes(a)&&!['role'].includes(a)&&s.role==='organizer')throw Error('私人操作请切回成员角色');
 if(a==='bookmark'||a==='follow'){const key=required(b.key,150);const [kind,target]=key.split(':');if(!((kind==='activity'&&activities.some(x=>x.id===target))||(kind==='capsule'&&s.capsules.some(x=>x.id===target))))throw Error('请选择有效的活动或自己的时间胶囊');const field=a==='bookmark'?'saved':'following';const values=s[field]||[];s[field]=values.includes(key)?values.filter(x=>x!==key):[...values,key];}
 else if(a==='tracking'){const c=item(s.capsules);c.tracking={places:(Array.isArray(b.places)?b.places:[]).filter((x:string)=>c.snapshot.places.includes(x)),activities:(Array.isArray(b.activities)?b.activities:[]).filter((x:string)=>c.snapshot.activities.includes(x)),works:(Array.isArray(b.works)?b.works:[]).filter((x:string)=>c.snapshot.works.some(w=>w.id===x))};}
 else if(a==='role')s.role=b.role==='organizer'?'organizer':'resident';
 else if(a==='join'){if(s.stage==='left')throw Error('你已结束居住，可以先在“我的”选择再次回来');const target=validActivity(b.activity);if(s.joined.includes(target))throw Error('你已报名');s.joined.push(target);s.photoConsent=!!b.photoConsent;s.needs=short(b.needs,300);(s.arrangements||={})[target]={photo:!!b.photoConsent,needs:s.needs};s.stage='settled';}
 else if(a==='cancel_join')s.joined=s.joined.filter(x=>x!==b.activity);
 else if(a==='group'){const capacity=Number(b.capacity);if(!Number.isInteger(capacity)||capacity<2||capacity>8)throw Error('小组人数为 2—8 人');s.groups.push({id:id(),title:required(b.title,50),activity:validActivity(b.activity),capacity,members:[s.name],owner:s.name,invite:crypto.randomUUID().slice(0,8).toUpperCase()});}
 else if(a==='group_join'){const g=item(s.groups);if(g.members.includes(s.name))throw Error('你已经在组内');if(g.members.length>=g.capacity)throw Error('小组已满');g.members.push(s.name);}
 else if(a==='group_exit'){const g=item(s.groups);g.members=g.members.filter(x=>x!==s.name);if(g.owner===s.name)s.groups=s.groups.filter(x=>x.id!==g.id);}
 else if(a==='memory'){if(s.memories.length>=100)throw Error('演示最多保存100条记录');s.memories.push({id:id(),title:required(b.title,60),body:required(b.body),place:validPlace(b.place),photo:photo(b.photo),date:date(b.date)});}
 else if(a==='keepsake'){
  const memory=s.memories.find(m=>m.id===b.memory);if(!memory)throw Error('请选择自己时间线里的一段记录');
  if(b.aiConsent!==true)throw Error('请先阅读并确认 AI 转绘说明');
  if(!['line','flat'].includes(b.style))throw Error('请选择转绘风格');
  s.keepsake={personalCode:s.keepsake?.personalCode||`${(s.arrivalBatch||demoArrivalBatch()).code}-${id().slice(0,6).toUpperCase()}`,memory:structuredClone(memory),meaning:required(b.meaning,300),style:b.style,inscription:short(b.inscription,16),batch:structuredClone(s.arrivalBatch||demoArrivalBatch()),created:stamp,status:'brief_saved',aiConsent:true};
 }
 else if(a==='memory_delete'){const m=item(s.memories);s.memories=s.memories.filter(x=>x.id!==m.id);}
 else if(a==='work'){s.works.push({id:id(),title:required(b.title,60),body:required(b.body),author:s.name,place:validPlace(b.place),version:1,archive:!!b.archive,display:!!b.display,product:!!b.product,status:'submitted'});if(!b.archive&&!b.display&&!b.product)throw Error('私人内容请保存为日子；共创稿件至少需要一种许可');}
 else if(a==='consent'){const w=item(s.works);w.archive=!!b.archive;w.display=!!b.display;w.product=!!b.product;w.status='submitted';w.version++;}
 else if(a==='review_work'){const w=item(s.works);if(w.version!==Number(b.version)||w.status!=='submitted')throw Error('稿件或许可已变更，请刷新后重新审核');if(!w.archive&&!w.display&&!w.product)throw Error('作者已撤回所有许可');w.status=b.approve?'published':'returned';}
 else if(a==='question')s.questions.push({id:id(),title:required(b.title,300),reply:'',status:'waiting'});
 else if(a==='reply'){const q=item(s.questions);q.reply=required(b.reply,1000);q.status='replied';}
 else if(a==='settings'){if(!['teal','rose'].includes(b.theme)||!['off','monthly','quarterly','yearly'].includes(b.replay))throw Error('设置无效');s.theme=b.theme;s.settings={replay:b.replay,nextReplay:b.replay==='off'?'':new Date(Date.parse(stamp)+({monthly:30,quarterly:90,yearly:365}[b.replay as 'monthly']||30)*864e5).toISOString().slice(0,10),font:b.font==='large'?'large':'normal',motion:!!b.motion,quiet:!!b.quiet};}
 else if(a==='replay'){if(s.settings.replay==='off')throw Error('尚未开启回看');s.settings.nextReplay=new Date(Date.parse(stamp)+({monthly:30,quarterly:90,yearly:365}[s.settings.replay as 'monthly']||30)*864e5).toISOString().slice(0,10);}
 else if(a==='seal'){
  if(s.capsules.length>=10)throw Error('演示最多保存10个时间胶囊');const selected=s.memories.filter(m=>Array.isArray(b.memories)&&b.memories.includes(m.id));if(!selected.length)throw Error('先选择至少一段想留下的日子');const opens=date(b.opens);if(opens<=today)throw Error('请选择未来的一天');
  const selectedPlaces=[...new Set(selected.map(m=>m.place))];const works=s.works.filter(w=>Array.isArray(b.works)&&b.works.includes(w.id));
  s.capsules.push({id:id(),title:required(b.title,60),letter:short(b.letter),opens,created:stamp,opened:false,snapshot:{name:s.name,memories:structuredClone(selected),works:structuredClone(works),places:selectedPlaces,activities:[...s.joined]},tracking:{places:selectedPlaces,activities:[...s.joined],works:works.map(w=>w.id)}});
 }
 else if(a==='open_capsule'){const c=item(s.capsules);if(today<c.opens&&!b.early)throw Error('还没到约定的日子；也可以选择提前打开');c.opened=true;}
 else if(a==='delete_capsule'){item(s.capsules);s.capsules=s.capsules.filter(x=>x.id!==b.id);s.saved=(s.saved||[]).filter(x=>x!=='capsule:'+b.id);s.following=(s.following||[]).filter(x=>x!=='capsule:'+b.id);}
 else if(a==='development'){
  if(!['place','activity','work'].includes(b.kind))throw Error('变化类型无效');const target=b.kind==='place'?validPlace(b.target):b.kind==='activity'?validActivity(b.target):required(b.target,100);
  const w=s.works.find(w=>w.id===target);if(b.kind==='work'&&(!w||w.status!=='published'||!w.archive))throw Error('需要已获准归档并审核的作品');
  const parent=b.parent?s.developments.find(d=>d.id===b.parent&&d.target===target&&d.confirmed):undefined;if(b.parent&&!parent)throw Error('前序记录必须已发布且属于同一个对象');
  const successor=short(b.successor,40);if(successor&&!b.successorConsent)throw Error('接续者确认后才能显示其署名');
  s.developments.push({id:id(),kind:b.kind,target,title:required(b.title,80),body:required(b.body,1500),before:short(b.before,200),after:short(b.after,200),date:date(b.date),source:required(b.source,300),confirmed:false,workVersion:w?.version,parent:parent?.id,successor,successorConsent:!!b.successorConsent});
 }
 else if(a==='publish_development'){const d=item(s.developments);if(d.kind==='work'){const w=s.works.find(w=>w.id===d.target);if(!w||!w.archive||w.status!=='published'||w.version!==d.workVersion)throw Error('作品版本或许可已变更，请重新提交这条记录');}if(d.date>today)throw Error('未来的计划不能作为已发生的变化发布');d.confirmed=true;}
 else if(a==='handover'){const w=s.works.find(w=>w.id===b.work);if(!w)throw Error('请先提交一件作品');s.handovers.push({id:id(),work:w.id,successor:'',status:'pending',consent:false});}
 else if(a==='handover_propose'){const h=item(s.handovers);if(h.status!=='pending')throw Error('交接状态已变更');if(!b.consent)throw Error('请先确认接续者同意署名与接手');h.successor=required(b.successor,40);h.consent=true;h.status='proposed';}
 else if(a==='handover_confirm'){const h=item(s.handovers);if(h.status!=='proposed'||!h.consent)throw Error('请等待接续安排');h.status='confirmed';}
 else if(a==='handover_stop'){const h=item(s.handovers);h.status='stopped';}
 else if(a==='leave'){if(s.handovers.some(h=>['pending','proposed'].includes(h.status)))throw Error('还有未完成的交接，请先确认安排或中止任务');s.stage='left';s.joined=[];}
 else if(a==='return')s.stage='settled';
 else throw Error('不支持的操作');
 s.log.push({action:a,date:stamp});s.log=s.log.slice(-150);return s;
}
export function capsuleUpdates(s:State,c:Capsule){return s.developments.filter(d=>d.confirmed&&d.date>=c.created.slice(0,10)&&c.tracking[d.kind==='place'?'places':d.kind==='activity'?'activities':'works'].includes(d.target)&& (d.kind!=='work'||s.works.some(w=>w.id===d.target&&w.archive&&w.status==='published'))).sort((a,b)=>b.date.localeCompare(a.date))}
export function publicState(s:State){if(s.role!=='organizer')return s;return {...s,keepsake:undefined,memories:[],capsules:[],settings:{...s.settings,nextReplay:''},works:s.works.filter(w=>w.archive||w.display||w.product)};}
