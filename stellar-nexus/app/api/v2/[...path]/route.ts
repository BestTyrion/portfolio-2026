import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
const uid=()=>crypto.randomUUID();const now=()=>new Date().toISOString();const str=(v:any,n=6000)=>String(v??'').trim().slice(0,n);
class E extends Error{constructor(public status:number,message:string){super(message)}}
function need(v:any,msg:string,status=400){if(!v)throw new E(status,msg)}
const response=(d:any,status=200)=>Response.json(d,{status,headers:{'Cache-Control':'no-store'}});
async function handler(req:Request){try{const db:any=env.DB;need(db,'資料庫未連接',503);const all=async(sql:string,...p:any[])=>(await db.prepare(sql).bind(...p).all()).results;const path=new URL(req.url).pathname.split('/').filter(Boolean).slice(2).join('/');
 const token=req.headers.get('cookie')?.match(/stellar_session=([^;]+)/)?.[1];const me:any=token?await db.prepare('SELECT u.id,u.name,u.role,u.demo,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>?').bind(token,Date.now()).first():null;
 const auth=()=>{need(me,'請先登入',401);return me};const admin=()=>need(auth().role==='admin','只有管理員可以審核',403);
 const log=(kind:string,title:string,target:string|null=null)=>db.prepare('INSERT INTO learning_timeline_entries(id,user_id,kind,title,target_id,created) VALUES(?,?,?,?,?,?)').bind(uid(),me.id,kind,title,target,now());
 if(req.method==='GET'&&path==='bootstrap'){
 // Fixtures are labelled Demo, created only once by fixed IDs; never write migrations here.
 if(!await db.prepare("SELECT user_id FROM mentor_profiles WHERE user_id='demo-chen'").first()&&await db.prepare("SELECT id FROM users WHERE id='demo-chen'").first()){
 const q:any[]=[];for(const [id,bio,sp,status] of [['demo-chen','以光線和構圖為起點，帶領小組比較自己的拍攝練習。虛構人物介紹。','手機攝影、共同評圖','featured'],['demo-lin','分享筆記整理與資料核對的方法，同時持續向其他成員學習攝影。虛構人物介紹。','AI工具、數字筆記','featured'],['demo-zhao','與其他分享者共同帶領低壓小物維修，重視條件核對與動手練習。虛構人物介紹。','低壓小物維修','published']])q.push(db.prepare('INSERT OR IGNORE INTO mentor_profiles(user_id,bio,specialty,city,consent,status,rationale,updated) VALUES(?,?,?,\'福州\',1,?,\'Demo：共同帶領與知識貢獻示例，非真實認證\',?)').bind(id,bio,sp,status,now()));
 for(const [id,cat,name,desc] of [['s-pottery','craft','陶藝手作','用手理解材料與形狀'],['s-light','photo','光線與曝光','比較自然光與曝光'],['s-compose','photo','畫面構圖','練習主體與留白']])q.push(db.prepare("INSERT OR IGNORE INTO skills(id,category_id,name,description,status) VALUES(?,?,?,?,'approved')").bind(id,cat,name,desc));
 for(const [id,sk,title,content,conditions,cautions,author] of [
 ['k-ai','s-ai','把一份筆記整理成可核對的清單','1. 列出原始資料與來源。\n2. 按任務分成三個主題。\n3. 逐條核對摘要，保留不確定的問題。','有可使用的原始筆記','不輸入他人私人資料；輸出仍需核對','demo-lin'],
 ['k-clay','s-pottery','手捏小碗：從泥團到均勻碗壁','1. 將泥團揉成球。\n2. 拇指向內按出凹槽。\n3. 旋轉並輕捏，保持碗壁均勻。','合適陶土、工作枱與教師帶領','燒製由合適工作室處理','demo-zhao'],
 ['k-coffee','s-coffee','手沖記錄：一次只改一個條件','1. 記錄咖啡用量、研磨和水量。\n2. 保持其他條件，調整一項變量。\n3. 比較味道，留下自己的描述。','成人日常沖煮','注意熱水，依個人狀況選擇飲品','demo-wang'],
 ['k-walk','s-hike','用三張照片記錄一條街','1. 拍空間全景。\n2. 找一個日常使用的細節。\n3. 記錄同一位置的光影與時間。','允許拍攝的公共空間','尊重路人，未經同意不公開可辨識人像','demo-chen'],
 ['k-repair','s-repair','低壓小燈：先記錄，再檢查','1. 斷開電源並確認低壓規格。\n2. 記錄接線與外觀。\n3. 在有經驗帶領者協助下排查。','專業工作室內的成人小組','不處理市電；不熟悉設備時停止操作','demo-zhao']]){q.push(db.prepare("INSERT OR IGNORE INTO knowledge_cards(id,skill_id,author_id,title,content,conditions,cautions,status,consent,confirmed,method) VALUES(?,?,?,?,?,?,?,'published',1,1,'human_demo')").bind(id,sk,author,title,content,conditions,cautions));q.push(db.prepare('INSERT OR IGNORE INTO knowledge_sources(id,card_id,citation) VALUES(?,?,?)').bind('src-'+id,id,'編輯撰寫的虛構教學示例，非實際活動研究記錄'));}
 for(const [cid,eid,sk,title,desc,teacher,venue,date] of [['c-clay','e-clay','s-pottery','陶藝手作：一起捏一只小碗','四人一組，練習碗壁厚度，再比較彼此的方法。','demo-zhao','v-studio','2026-11-22'],['c-coffee','e-coffee','s-coffee','手沖咖啡：記錄你的第一份風味筆記','從一次只改一個條件開始，互相描述觀察。','demo-wang','v-library','2026-11-28'],['c-walk','e-walk','s-hike','城市步行：用影像整理地方記憶','觀察一條街，交流你注意到的生活細節。','demo-chen','v-library','2026-11-29']]){q.push(db.prepare('INSERT OR IGNORE INTO courses(id,owner_id,skill_id,title,description,equipment) VALUES(?,?,?,?,?,?)').bind(cid,teacher,sk,title,desc,'請查看活動準備清單'));q.push(db.prepare("INSERT OR IGNORE INTO events(id,course_id,organizer_id,venue_id,date,slot,city,mode,capacity,status,code,venue_confirmed) VALUES(?,?,'demo-organizer',?,?,'14:00–16:00','福州','線下',6,'recruiting',?,1)").bind(eid,cid,venue,date,'STAR-'+eid));q.push(db.prepare('INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)').bind('t-'+eid,eid,teacher));q.push(db.prepare("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,'teach','有些經驗')").bind('us-'+eid,teacher,sk));}
 for(const [id,title] of [['c-photo','手機攝影入門：窗邊人像與曝光練習'],['c-ai','AI工具入門：整理筆記與核對來源'],['c-repair','低壓小燈維修：接線檢查與故障排查']])q.push(db.prepare('UPDATE courses SET title=? WHERE id=?').bind(title,id));
 for(const [a,b,r] of [['s-photo','s-light','主題分支'],['s-photo','s-compose','主題分支'],['s-photo','s-ai','影像整理與資料核對'],['s-repair','s-device','設備原理與操作'],['s-wood','s-repair','工具與結構'],['s-coffee','s-photo','日常記錄'],['s-hike','s-photo','地方觀察與攝影'],['s-career','s-ai','工作經驗整理']])q.push(db.prepare("INSERT OR IGNORE INTO graph_edges(id,from_skill_id,to_skill_id,relation,source) VALUES(?,?,?,?, '示例主題編輯：關聯實踐')").bind('edge-'+a+b,a,b,r));await db.batch(q);}
 await seedV3(db);
 return response({mentors:await all("SELECT m.*,u.name,u.demo,(SELECT COUNT(*) FROM knowledge_cards k WHERE k.author_id=u.id AND k.status='published' AND k.consent=1) cards,(SELECT COUNT(*) FROM event_teachers t WHERE t.user_id=u.id) activities FROM mentor_profiles m JOIN users u ON u.id=m.user_id WHERE m.consent=1 AND m.status IN ('published','featured')"),mentorQueue:me?.role==='admin'?await all("SELECT m.*,u.name FROM mentor_profiles m JOIN users u ON u.id=m.user_id WHERE m.status='pending' AND m.consent=1"):[],edges:await all("SELECT * FROM graph_edges WHERE status='confirmed'"),privateItems:me?await all('SELECT * FROM private_knowledge_items WHERE owner_id=? ORDER BY updated DESC',me.id):[],saved:me?await all("SELECT sk.*,k.status source_status,k.consent source_consent,CASE WHEN k.status='published' AND k.consent=1 THEN k.content ELSE NULL END content,k.skill_id FROM saved_knowledge sk LEFT JOIN knowledge_cards k ON k.id=sk.card_id WHERE sk.user_id=? ORDER BY sk.created DESC",me.id):[],reviews:me?await all('SELECT r.*,p.title source_title FROM review_cards r JOIN private_knowledge_items p ON p.id=r.item_id WHERE r.owner_id=? ORDER BY r.due',me.id):[],timeline:me?await all('SELECT * FROM learning_timeline_entries WHERE user_id=? ORDER BY created DESC',me.id):[],jobs:me?await all('SELECT * FROM ai_jobs WHERE owner_id=? ORDER BY created DESC',me.id):[],preferences:me?await db.prepare('SELECT * FROM user_preferences WHERE user_id=?').bind(me.id).first():null,myMentor:me?await db.prepare('SELECT * FROM mentor_profiles WHERE user_id=?').bind(me.id).first():null,invitations:me?await all('SELECT i.*,u.name inviter,v.name invitee,c.title FROM teacher_invitations i JOIN users u ON u.id=i.inviter_id JOIN users v ON v.id=i.invitee_id JOIN events e ON e.id=i.event_id JOIN courses c ON c.id=e.course_id WHERE i.invitee_id=? OR i.inviter_id=?',me.id,me.id):[],collections:me?await all('SELECT c.*,(SELECT COUNT(*) FROM collection_items ci WHERE ci.collection_id=c.id) count FROM knowledge_collections c WHERE c.owner_id=?',me.id):[],collectionItems:me?await all('SELECT ci.* FROM collection_items ci JOIN knowledge_collections c ON c.id=ci.collection_id WHERE c.owner_id=?',me.id):[],mode:'template_demo'});}
 if(req.method!=='POST')throw new E(404,'找不到此操作');if(req.headers.get('origin'))need(new URL(req.headers.get('origin')!).host===new URL(req.url).host,'跨來源寫入被拒絕',403);const b:any=await req.json();const u=auth();
 const item=async(id:string)=>{const p:any=await db.prepare('SELECT * FROM private_knowledge_items WHERE id=? AND owner_id=?').bind(id,u.id).first();need(p,'無權存取此私人資料',403);return p};
 if(path==='note'){
 if(b.action==='delete'){await item(b.id);const jobs=await all('SELECT id,source_ids FROM ai_jobs WHERE owner_id=?',u.id);const related=jobs.filter((j:any)=>JSON.parse(j.source_ids).includes(b.id));await db.batch([db.prepare('DELETE FROM collection_items WHERE item_id=?').bind(b.id),db.prepare('DELETE FROM review_cards WHERE item_id=? AND owner_id=?').bind(b.id,u.id),db.prepare('DELETE FROM private_knowledge_items WHERE id=? AND owner_id=?').bind(b.id,u.id),...related.map((j:any)=>db.prepare('DELETE FROM ai_jobs WHERE id=? AND owner_id=?').bind(j.id,u.id)),log('delete','刪除私人筆記及相關整理草稿')]);return response({success:true});}
 need(str(b.title,100)&&str(b.content),'請填寫標題與內容');const id=b.id?str(b.id):uid();if(b.id)await item(id);
 if(b.id)await db.batch([db.prepare('UPDATE private_knowledge_items SET title=?,content=?,topic=?,source=?,ai_allowed=?,updated=? WHERE id=? AND owner_id=?').bind(str(b.title,100),str(b.content),str(b.topic,60)||'未分類',str(b.source,1000),b.ai_allowed?1:0,now(),id,u.id),log('note','更新筆記：'+str(b.title,100),id)]);
 else await db.batch([db.prepare('INSERT INTO private_knowledge_items(id,owner_id,title,content,topic,source,kind,ai_allowed,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id,u.id,str(b.title,100),str(b.content),str(b.topic,60)||'未分類',str(b.source,1000),'note',b.ai_allowed?1:0,now(),now()),log('note','新增筆記：'+str(b.title,100),id)]);return response({success:true,id});}
 if(path==='save-public'){const k:any=await db.prepare("SELECT * FROM knowledge_cards WHERE id=? AND status='published' AND consent=1").bind(b.id).first();need(k,'此知識已撤回或尚未公開');await db.batch([db.prepare('INSERT OR IGNORE INTO saved_knowledge(id,user_id,card_id,source_title,created) VALUES(?,?,?,?,?)').bind(uid(),u.id,k.id,k.title,now()),log('save','收藏公開知識：'+k.title,k.id)]);return response({success:true});}
 if(path==='unsave'){await db.prepare('DELETE FROM saved_knowledge WHERE id=? AND user_id=?').bind(b.id,u.id).run();return response({success:true});}
 if(path==='ai'){
 const ids=Array.isArray(b.ids)?[...new Set(b.ids)].slice(0,12):[];need(ids.length,'請先選擇筆記');const notes=[];for(const id of ids){const p=await item(String(id));need(p.ai_allowed,'請先允許所選筆記用於整理：'+p.title);notes.push(p)}
 need(['organize','review'].includes(b.type),'任務類型無效');let output='';
 if(b.type==='organize'){const topics=[...new Set(notes.map((p:any)=>p.topic))];output='【範本整理草稿｜未呼叫真實LLM】\n主題：'+topics.join('、')+'\n\n'+notes.map((p:any,i:number)=>`[來源 ${i+1}] ${p.title}\n${p.content}\n原始出處：${p.source||'個人筆記'}`).join('\n\n')+'\n\n待你確認：\n• 哪些步驟重複？\n• 不同來源是否有矛盾？\n• 哪個問題需要下一次共同練習？';}
 else{output='【復習範本｜請自行核對答案】';}
 const job=uid();const q=[db.prepare('INSERT INTO ai_jobs(id,owner_id,type,source_ids,output,created) VALUES(?,?,?,?,?,?)').bind(job,u.id,b.type,JSON.stringify(ids),output,now())];
 if(b.type==='review')for(const p of notes)q.push(db.prepare('INSERT INTO review_cards(id,owner_id,item_id,question,answer,due,created) VALUES(?,?,?,?,?,?,?)').bind(uid(),u.id,p.id,'不用看筆記，你會怎樣解釋「'+p.title+'」的主要步驟？',p.content,new Date().toISOString().slice(0,10),now()));q.push(log(b.type==='review'?'review':'ai',b.type==='review'?'建立 '+notes.length+' 張來源復習卡':'整理 '+notes.length+' 份筆記的範本草稿',job));await db.batch(q);return response({success:true,id:job,output,mode:'template_demo'});}
 if(path==='confirm-job'){const j:any=await db.prepare('SELECT * FROM ai_jobs WHERE id=? AND owner_id=?').bind(b.id,u.id).first();need(j,'無權存取此草稿',403);need(str(b.output),'草稿內容不可為空');await db.batch([db.prepare("UPDATE ai_jobs SET output=?,status='confirmed' WHERE id=? AND owner_id=?").bind(str(b.output,15000),j.id,u.id),log('confirm','確認整理草稿',j.id)]);return response({success:true});}
 if(path==='review'){need(['mastered','uncertain','practice'].includes(b.state),'請選擇復習狀態');const r:any=await db.prepare('SELECT * FROM review_cards WHERE id=? AND owner_id=?').bind(b.id,u.id).first();need(r,'無權存取此復習卡',403);const due=new Date(Date.now()+(b.state==='mastered'?7:1)*86400000).toISOString().slice(0,10);await db.batch([db.prepare('UPDATE review_cards SET state=?,due=? WHERE id=? AND owner_id=?').bind(b.state,due,r.id,u.id),log('review',({'mastered':'已掌握','uncertain':'仍不確定','practice':'需要再練'} as any)[b.state]+'：復習紀錄',r.item_id)]);return response({success:true});}
 if(path==='share'){
 const p=await item(b.id);need(b.confirmed&&b.consent,'請核對內容並同意公開');const sk:any=await db.prepare("SELECT id FROM skills WHERE id=? AND status='approved'").bind(b.skill_id).first();need(sk,'請選擇公共技能主題');const id=uid();await db.batch([db.prepare("INSERT INTO knowledge_cards(id,skill_id,author_id,title,content,conditions,cautions,status,consent,confirmed,method) VALUES(?,?,?,?,?,?,?,'pending',1,1,'personal_contribution')").bind(id,b.skill_id,u.id,p.title,p.content,str(b.conditions,1000)||'請對照具體任務使用',str(b.cautions,1000)||'請核對來源與適用條件'),db.prepare('INSERT INTO knowledge_sources(id,card_id,citation) VALUES(?,?,?)').bind(uid(),id,'作者選擇分享的私人筆記摘錄；原始出處：'+(p.source||'個人記錄')),db.prepare('INSERT INTO contributions(id,card_id,user_id,type) VALUES(?,?,?,?)').bind(uid(),id,u.id,'author'),db.prepare('INSERT INTO consent_records(id,user_id,target_id,scope,status,created) VALUES(?,?,?,?,?,?)').bind(uid(),u.id,id,'public','granted',now()),log('share','送審公開分享：'+p.title,id)]);return response({success:true,id});}
 if(path==='mentor'){
 if(b.action==='withdraw'){await db.prepare("UPDATE mentor_profiles SET consent=0,status='withdrawn',updated=? WHERE user_id=?").bind(now(),u.id).run();return response({success:true});}
 if(b.action==='review'){admin();need(['featured','published','rejected'].includes(b.status),'審核狀態無效');const m:any=await db.prepare('SELECT * FROM mentor_profiles WHERE user_id=? AND consent=1').bind(b.user_id).first();need(m,'本人尚未同意公開');await db.prepare('UPDATE mentor_profiles SET status=?,rationale=?,updated=? WHERE user_id=?').bind(b.status,str(b.rationale,1000),now(),b.user_id).run();return response({success:true});}
 need(b.consent,'請同意公開所填的介紹');need(str(b.bio)&&str(b.specialty,100),'請填寫經驗與技能');await db.batch([db.prepare("INSERT INTO mentor_profiles(user_id,bio,specialty,city,consent,status,updated) VALUES(?,?,?,?,1,'pending',?) ON CONFLICT(user_id) DO UPDATE SET bio=excluded.bio,specialty=excluded.specialty,city=excluded.city,consent=1,status='pending',updated=excluded.updated").bind(u.id,str(b.bio,2000),str(b.specialty,100),str(b.city,30)||'福州',now()),log('mentor','提交分享者檔案，等待人工核對')]);return response({success:true});}
 if(path==='password'){
 need(!u.demo,'共享演示帳號不能更改密碼',403);need(str(b.password,150).length>=8,'新密碼至少8位');
 const user:any=await db.prepare('SELECT password FROM users WHERE id=?').bind(u.id).first();const [salt,old]=user.password.split(':');
 const hash=async(p:string,s:string)=>{const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(p),'PBKDF2',false,['deriveBits']);const result=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(s),iterations:100000,hash:'SHA-256'},k,256);return Array.from(new Uint8Array(result)).map(x=>x.toString(16).padStart(2,'0')).join('')};
 need(await hash(str(b.current,150),salt)===old,'目前密碼不正確',403);const next=uid();await db.batch([db.prepare('UPDATE users SET password=? WHERE id=?').bind(next+':'+await hash(str(b.password,150),next),u.id),db.prepare('DELETE FROM sessions WHERE user_id=? AND token<>?').bind(u.id,token)]);return response({success:true});}
 if(path==='settings'){
 need(['normal','large'].includes(b.font_size),'字號無效');await db.batch([db.prepare('INSERT INTO user_preferences(user_id,notifications,ai_default,reduced_motion,font_size,graph_view) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET notifications=excluded.notifications,ai_default=excluded.ai_default,reduced_motion=excluded.reduced_motion,font_size=excluded.font_size,graph_view=excluded.graph_view').bind(u.id,b.notifications?1:0,b.ai_default?1:0,b.reduced_motion?1:0,b.font_size,b.graph_view==='list'?'list':'map'),db.prepare('UPDATE users SET name=? WHERE id=?').bind(str(b.name,50)||u.name,u.id),db.prepare('UPDATE profiles SET city=? WHERE user_id=?').bind(str(b.city,30)||'福州',u.id)]);return response({success:true});}
 if(path==='export'){return response({exported_at:now(),user:{name:u.name,email:u.email},notes:await all('SELECT * FROM private_knowledge_items WHERE owner_id=?',u.id),reviews:await all('SELECT * FROM review_cards WHERE owner_id=?',u.id),timeline:await all('SELECT * FROM learning_timeline_entries WHERE user_id=?',u.id),saved:await all('SELECT * FROM saved_knowledge WHERE user_id=?',u.id),jobs:await all('SELECT * FROM ai_jobs WHERE owner_id=?',u.id)});}
 if(path==='invite'){
 if(b.action==='respond'){const i:any=await db.prepare("SELECT * FROM teacher_invitations WHERE id=? AND invitee_id=? AND status='pending'").bind(b.id,u.id).first();need(i,'沒有待處理的邀請',403);need(['accepted','declined'].includes(b.status),'狀態無效');const q=[db.prepare('UPDATE teacher_invitations SET status=? WHERE id=?').bind(b.status,i.id)];if(b.status==='accepted')q.push(db.prepare('INSERT INTO event_teachers(id,event_id,user_id) SELECT ?,?,? WHERE NOT EXISTS(SELECT 1 FROM event_teachers WHERE event_id=? AND user_id=?)').bind(uid(),i.event_id,u.id,i.event_id,u.id));await db.batch(q);return response({success:true});}
 const e:any=await db.prepare('SELECT * FROM events WHERE id=?').bind(b.event_id).first();need(e&&(e.organizer_id===u.id||['organizer','admin'].includes(u.role)),'只有活動組織者可邀請',403);need(b.user_id!==u.id,'不能邀請自己');need(await db.prepare("SELECT id FROM user_skills WHERE user_id=? AND role IN ('teach','both')").bind(b.user_id).first(),'候選者未公開可教技能');need(!await db.prepare('SELECT id FROM event_teachers WHERE event_id=? AND user_id=?').bind(e.id,b.user_id).first(),'對方已是本場分享者');await db.prepare("INSERT INTO teacher_invitations(id,event_id,inviter_id,invitee_id,status) VALUES(?,?,?,?,'pending') ON CONFLICT(event_id,invitee_id) DO UPDATE SET status='pending'").bind(uid(),e.id,u.id,b.user_id).run();return response({success:true});}
 if(path==='group-note'){
 const e:any=await db.prepare('SELECT * FROM events WHERE id=?').bind(b.event_id).first();need(e,'活動不存在');const member=await db.prepare("SELECT id FROM registrations WHERE event_id=? AND user_id=? AND status='registered' UNION SELECT id FROM event_teachers WHERE event_id=? AND user_id=?").bind(e.id,u.id,e.id,u.id).first();need(member||e.organizer_id===u.id||['organizer','admin'].includes(u.role),'僅本活動成員可讀寫共同筆記',403);
 if(b.action==='read')return response({notes:await all('SELECT n.*,u.name author FROM group_notes n JOIN users u ON u.id=n.user_id WHERE n.event_id=? ORDER BY n.created',e.id)});
 need(str(b.content),'請填寫筆記');await db.batch([db.prepare('INSERT INTO group_notes(id,event_id,user_id,content,public_consent,created) VALUES(?,?,?,?,?,?)').bind(uid(),e.id,u.id,str(b.content),b.public_consent?1:0,now()),log('group','在活動中補充共同筆記',e.id)]);return response({success:true});}
 if(path==='collection'){
 if(b.action==='add'){await item(b.item_id);need(await db.prepare('SELECT id FROM knowledge_collections WHERE id=? AND owner_id=?').bind(b.id,u.id).first(),'無權存取此合集',403);await db.prepare('INSERT OR IGNORE INTO collection_items(id,collection_id,item_id) VALUES(?,?,?)').bind(uid(),b.id,b.item_id).run();}
 else{need(str(b.name,80),'請填寫合集名稱');await db.prepare("INSERT INTO knowledge_collections(id,owner_id,name,visibility) VALUES(?,?,?,'private')").bind(uid(),u.id,str(b.name,80)).run()}return response({success:true});}
 throw new E(404,'找不到此操作');
 }catch(e:any){return response({error:e instanceof E?e.message:'操作未完成，請稍後再試'},e instanceof E?e.status:500)}}
export const GET=handler;export const POST=handler;

async function seedV3(db:any){if(await db.prepare("SELECT id FROM knowledge_sources WHERE id='v3-seed-complete'").first())return;const q:any[]=[];const add=(s:string,...p:any[])=>q.push(db.prepare(s).bind(...p));const demo:any=await db.prepare("SELECT password FROM users WHERE id='demo-lin'").first();if(!demo)return;
add("INSERT OR IGNORE INTO skills(id,category_id,name,description,status) VALUES(?,?,?,?,'approved')","s-cyanotype","photo","藍曬與影像","以紙張、遮片和光線比較藍曬的層次。");
add("INSERT OR IGNORE INTO skills(id,category_id,name,description,status) VALUES(?,?,?,?,'approved')","s-print","craft","版畫拓印","用刻紋與拓印，記錄地方日常的形狀。");
add("INSERT OR IGNORE INTO skills(id,category_id,name,description,status) VALUES(?,?,?,?,'approved')","s-garden","life","陽台種植","從盆土、採光到澆水，觀察植物的改變。");
add("INSERT OR IGNORE INTO skills(id,category_id,name,description,status) VALUES(?,?,?,?,'approved')","s-language","career","生活英語","用生活情境練習表達與彼此回饋。");
add("INSERT OR IGNORE INTO skills(id,category_id,name,description,status) VALUES(?,?,?,?,'approved')","s-story","outdoor","口述故事","以提問和授權記錄，保存不同世代的地方記憶。");
add("INSERT OR IGNORE INTO skills(id,category_id,name,description,status) VALUES(?,?,?,?,'approved')","s-design","digital","資訊設計","把一份混亂的活動資訊整理成清楚的圖表。");
add("INSERT OR IGNORE INTO skills(id,category_id,name,description,status) VALUES(?,?,?,?,'approved')","s-sewing","craft","衣物修補","從一個鬆掉的鈕扣，練習延長衣物壽命。");
add("INSERT OR IGNORE INTO skills(id,category_id,name,description,status) VALUES(?,?,?,?,'approved')","s-tea","life","地方茶文化","比較沖泡條件，交流日常飲茶的記憶。");
add("INSERT OR IGNORE INTO skills(id,category_id,name,description,status) VALUES(?,?,?,?,'approved')","s-audio","digital","聲音採集","用手機採集環境聲，練習命名與整理。");
add("INSERT OR IGNORE INTO skills(id,category_id,name,description,status) VALUES(?,?,?,?,'approved')","s-access","digital","無障礙數字工具","調整字號、字幕與語音操作，讓設備更易使用。");
add("INSERT OR IGNORE INTO skills(id,category_id,name,description,status) VALUES(?,?,?,?,'approved')","s-map","outdoor","社區地圖","一起把常用資源和可達路線放上地圖。");
add("INSERT OR IGNORE INTO skills(id,category_id,name,description,status) VALUES(?,?,?,?,'approved')","s-budget","life","生活記帳","整理消費分類，理解自己的生活節奏。");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'teacher',1)","demo-v3-mei","demo-v3-mei@demo.test","許梅 · 手作分享者",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,'福州','均可','週末',1)","demo-v3-mei");
add("INSERT OR IGNORE INTO mentor_profiles(user_id,bio,specialty,city,consent,status,rationale,updated) VALUES(?,?,?,'福州',1,'published','虛構Demo：用於展示作品與共同帶領的成長方式',?)","demo-v3-mei","願意把修補和拓印的日常方法拆成小步驟，和小組一起練習。虛構人物介紹。","衣物修補、版畫拓印","2026-10-31T00:00:00Z");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'teacher',1)","demo-v3-li","demo-v3-li@demo.test","李青 · 地方記錄者",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,'福州','均可','週末',1)","demo-v3-li");
add("INSERT OR IGNORE INTO mentor_profiles(user_id,bio,specialty,city,consent,status,rationale,updated) VALUES(?,?,?,'福州',1,'published','虛構Demo：用於展示作品與共同帶領的成長方式',?)","demo-v3-li","以街道走訪與自願口述為起點，協助大家保留有授權的地方故事。虛構人物介紹。","地方記憶、聲音採集","2026-10-31T00:00:00Z");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'teacher',1)","demo-v3-zhou","demo-v3-zhou@demo.test","周安 · 生活分享者",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,'福州','均可','週末',1)","demo-v3-zhou");
add("INSERT OR IGNORE INTO mentor_profiles(user_id,bio,specialty,city,consent,status,rationale,updated) VALUES(?,?,?,'福州',1,'published','虛構Demo：用於展示作品與共同帶領的成長方式',?)","demo-v3-zhou","從自己的種植與飲茶記錄開始，邀請成員比較條件和觀察。虛構人物介紹。","陽台種植、地方茶文化","2026-10-31T00:00:00Z");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'teacher',1)","demo-v3-yan","demo-v3-yan@demo.test","林妍 · 數字工具分享者",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,'福州','均可','週末',1)","demo-v3-yan");
add("INSERT OR IGNORE INTO mentor_profiles(user_id,bio,specialty,city,consent,status,rationale,updated) VALUES(?,?,?,'福州',1,'published','虛構Demo：用於展示作品與共同帶領的成長方式',?)","demo-v3-yan","和成員一起整理資訊、調整設備，讓工具更容易被不同的人使用。虛構人物介紹。","資訊設計、無障礙數字工具","2026-10-31T00:00:00Z");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-01","demo-v3-member-01@demo.test","\u6f14\u793a\u6210\u54e1 01",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-01","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-01-s0","demo-v3-member-01","s-cyanotype","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-01-s1","demo-v3-member-01","s-design","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-02","demo-v3-member-02@demo.test","\u6f14\u793a\u6210\u54e1 02",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-02","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-02-s0","demo-v3-member-02","s-print","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-02-s1","demo-v3-member-02","s-sewing","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-03","demo-v3-member-03@demo.test","\u6f14\u793a\u6210\u54e1 03",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-03","廈門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-03-s0","demo-v3-member-03","s-garden","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-03-s1","demo-v3-member-03","s-tea","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-04","demo-v3-member-04@demo.test","\u6f14\u793a\u6210\u54e1 04",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-04","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-04-s0","demo-v3-member-04","s-language","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-04-s1","demo-v3-member-04","s-audio","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-05","demo-v3-member-05@demo.test","\u6f14\u793a\u6210\u54e1 05",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-05","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-05-s0","demo-v3-member-05","s-story","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-05-s1","demo-v3-member-05","s-access","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-06","demo-v3-member-06@demo.test","\u6f14\u793a\u6210\u54e1 06",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-06","廈門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-06-s0","demo-v3-member-06","s-design","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-06-s1","demo-v3-member-06","s-map","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-07","demo-v3-member-07@demo.test","\u6f14\u793a\u6210\u54e1 07",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-07","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-07-s0","demo-v3-member-07","s-sewing","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-07-s1","demo-v3-member-07","s-budget","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-08","demo-v3-member-08@demo.test","\u6f14\u793a\u6210\u54e1 08",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-08","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-08-s0","demo-v3-member-08","s-tea","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-08-s1","demo-v3-member-08","s-cyanotype","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-09","demo-v3-member-09@demo.test","\u6f14\u793a\u6210\u54e1 09",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-09","廈門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-09-s0","demo-v3-member-09","s-audio","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-09-s1","demo-v3-member-09","s-print","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-10","demo-v3-member-10@demo.test","\u6f14\u793a\u6210\u54e1 10",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-10","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-10-s0","demo-v3-member-10","s-access","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-10-s1","demo-v3-member-10","s-garden","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-11","demo-v3-member-11@demo.test","\u6f14\u793a\u6210\u54e1 11",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-11","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-11-s0","demo-v3-member-11","s-map","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-11-s1","demo-v3-member-11","s-language","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-12","demo-v3-member-12@demo.test","\u6f14\u793a\u6210\u54e1 12",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-12","廈門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-12-s0","demo-v3-member-12","s-budget","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-12-s1","demo-v3-member-12","s-story","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-13","demo-v3-member-13@demo.test","\u6f14\u793a\u6210\u54e1 13",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-13","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-13-s0","demo-v3-member-13","s-cyanotype","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-13-s1","demo-v3-member-13","s-design","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-14","demo-v3-member-14@demo.test","\u6f14\u793a\u6210\u54e1 14",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-14","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-14-s0","demo-v3-member-14","s-print","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-14-s1","demo-v3-member-14","s-sewing","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-15","demo-v3-member-15@demo.test","\u6f14\u793a\u6210\u54e1 15",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-15","廈門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-15-s0","demo-v3-member-15","s-garden","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-15-s1","demo-v3-member-15","s-tea","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-16","demo-v3-member-16@demo.test","\u6f14\u793a\u6210\u54e1 16",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-16","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-16-s0","demo-v3-member-16","s-language","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-16-s1","demo-v3-member-16","s-audio","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-17","demo-v3-member-17@demo.test","\u6f14\u793a\u6210\u54e1 17",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-17","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-17-s0","demo-v3-member-17","s-story","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-17-s1","demo-v3-member-17","s-access","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-18","demo-v3-member-18@demo.test","\u6f14\u793a\u6210\u54e1 18",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-18","廈門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-18-s0","demo-v3-member-18","s-design","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-18-s1","demo-v3-member-18","s-map","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-19","demo-v3-member-19@demo.test","\u6f14\u793a\u6210\u54e1 19",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-19","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-19-s0","demo-v3-member-19","s-sewing","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-19-s1","demo-v3-member-19","s-budget","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-20","demo-v3-member-20@demo.test","\u6f14\u793a\u6210\u54e1 20",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-20","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-20-s0","demo-v3-member-20","s-tea","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-20-s1","demo-v3-member-20","s-cyanotype","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-21","demo-v3-member-21@demo.test","\u6f14\u793a\u6210\u54e1 21",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-21","廈門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-21-s0","demo-v3-member-21","s-audio","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-21-s1","demo-v3-member-21","s-print","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-22","demo-v3-member-22@demo.test","\u6f14\u793a\u6210\u54e1 22",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-22","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-22-s0","demo-v3-member-22","s-access","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-22-s1","demo-v3-member-22","s-garden","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-23","demo-v3-member-23@demo.test","\u6f14\u793a\u6210\u54e1 23",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-23","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-23-s0","demo-v3-member-23","s-map","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-23-s1","demo-v3-member-23","s-language","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-24","demo-v3-member-24@demo.test","\u6f14\u793a\u6210\u54e1 24",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-24","廈門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-24-s0","demo-v3-member-24","s-budget","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-24-s1","demo-v3-member-24","s-story","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-25","demo-v3-member-25@demo.test","\u6f14\u793a\u6210\u54e1 25",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-25","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-25-s0","demo-v3-member-25","s-cyanotype","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-25-s1","demo-v3-member-25","s-design","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-26","demo-v3-member-26@demo.test","\u6f14\u793a\u6210\u54e1 26",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-26","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-26-s0","demo-v3-member-26","s-print","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-26-s1","demo-v3-member-26","s-sewing","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-27","demo-v3-member-27@demo.test","\u6f14\u793a\u6210\u54e1 27",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-27","廈門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-27-s0","demo-v3-member-27","s-garden","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-27-s1","demo-v3-member-27","s-tea","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-28","demo-v3-member-28@demo.test","\u6f14\u793a\u6210\u54e1 28",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-28","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-28-s0","demo-v3-member-28","s-language","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-28-s1","demo-v3-member-28","s-audio","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-29","demo-v3-member-29@demo.test","\u6f14\u793a\u6210\u54e1 29",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-29","福州");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-29-s0","demo-v3-member-29","s-story","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-29-s1","demo-v3-member-29","s-access","learn","入門");
add("INSERT OR IGNORE INTO users(id,email,name,password,role,demo) VALUES(?,?,?,?,'user',1)","demo-v3-member-30","demo-v3-member-30@demo.test","\u6f14\u793a\u6210\u54e1 30",demo.password);
add("INSERT OR IGNORE INTO profiles(user_id,city,mode,time,adult) VALUES(?,?,'均可','週末',1)","demo-v3-member-30","廈門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-30-s0","demo-v3-member-30","s-design","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,?,?)","demo-v3-member-30-s1","demo-v3-member-30","s-map","learn","入門");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,'teach','有些經驗')","v3-teach-cyanotype","demo-chen","s-cyanotype");
add("INSERT OR IGNORE INTO courses(id,owner_id,skill_id,title,description,equipment) VALUES(?,?,?,?,?,?)","c-v3-cyanotype","demo-chen","s-cyanotype","一張葉子的藍：藍曬明信片","每人帶一片落葉；小組比較遮片、曝光與圖案，帶走一張紙本作品。","紙張、遮片與帶領者提供的材料");
add("INSERT OR IGNORE INTO events(id,course_id,organizer_id,venue_id,date,slot,city,mode,capacity,status,code,venue_confirmed) VALUES(?,?,'demo-organizer',?,?,'14:00–16:00',?,?,?,'recruiting',?,1)","e-v3-cyanotype","c-v3-cyanotype","v-studio","2026-12-05","福州","線下",8,"STAR-V3-1");
add("INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)","v3-t-cyanotype","e-v3-cyanotype","demo-chen");
add("INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)","v3-t2-cyanotype","e-v3-cyanotype","demo-v3-yan");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-cyanotype0","e-v3-cyanotype","demo-v3-member-01");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-cyanotype1","e-v3-cyanotype","demo-v3-member-02");
add("INSERT OR IGNORE INTO knowledge_cards(id,skill_id,author_id,title,content,conditions,cautions,status,consent,confirmed,method) VALUES(?,?,?,?,?,?,?,'published',1,1,'human_demo')","k-v3-cyanotype","s-cyanotype","demo-chen","一張葉子的藍：藍曬明信片：共同練習清單","1. 把落葉與紙上遮片排成三種構圖，先拍照記錄。\n2. 依材料說明與帶領者安排比較曝光；把時間與條件寫在紙背。\n3. 小組對照藍色層次與輪廓，選一張做成明信片。","成人共同學習；依具體活動條件使用","編輯撰寫的虛構任務示例，請核對適用條件");
add("INSERT OR IGNORE INTO knowledge_sources(id,card_id,citation) VALUES(?,?,?)","v3-src-cyanotype","k-v3-cyanotype","虛構Demo教學清單；不代表已完成的真實活動或調研");
add("INSERT OR IGNORE INTO learning_requests(id,user_id,skill_id,title,city,mode,time) VALUES(?,?,?,?,?,'均可','週末下午')","r-v3-cyanotype","demo-v3-member-01","s-cyanotype","想找同伴練習：藍曬與影像","福州");
add("INSERT OR IGNORE INTO graph_edges(id,from_skill_id,to_skill_id,relation,source) VALUES(?,?,?,?,?)","v3-edge-cyanotype","s-cyanotype","s-photo","共同實踐的延伸主題","虛構Demo：編輯確認的跨主題練習關聯");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,'teach','有些經驗')","v3-teach-print","demo-v3-mei","s-print");
add("INSERT OR IGNORE INTO courses(id,owner_id,skill_id,title,description,equipment) VALUES(?,?,?,?,?,?)","c-v3-print","demo-v3-mei","s-print","把街角紋理，拓進一本小冊","兩人一組找紋理、做紙上拓印，再交換各自讀到的街道故事。","紙張、蠟筆與已獲准採樣的素材");
add("INSERT OR IGNORE INTO events(id,course_id,organizer_id,venue_id,date,slot,city,mode,capacity,status,code,venue_confirmed) VALUES(?,?,'demo-organizer',?,?,'14:00–16:00',?,?,?,'recruiting',?,1)","e-v3-print","c-v3-print","v-library","2026-12-06","福州","線下",8,"STAR-V3-2");
add("INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)","v3-t-print","e-v3-print","demo-v3-mei");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-print0","e-v3-print","demo-v3-member-03");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-print1","e-v3-print","demo-v3-member-04");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-print2","e-v3-print","demo-v3-member-05");
add("INSERT OR IGNORE INTO knowledge_cards(id,skill_id,author_id,title,content,conditions,cautions,status,consent,confirmed,method) VALUES(?,?,?,?,?,?,?,'published',1,1,'human_demo')","k-v3-print","s-print","demo-v3-mei","把街角紋理，拓進一本小冊：共同練習清單","1. 選取已獲准採樣的紙板、布料或表面紋理，避免損傷物件。\n2. 同一材料用不同壓力拓印，並排比較清晰度。\n3. 把三個圖案排成一頁小冊，附上素材位置與自己的描述。","成人共同學習；依具體活動條件使用","編輯撰寫的虛構任務示例，請核對適用條件");
add("INSERT OR IGNORE INTO knowledge_sources(id,card_id,citation) VALUES(?,?,?)","v3-src-print","k-v3-print","虛構Demo教學清單；不代表已完成的真實活動或調研");
add("INSERT OR IGNORE INTO learning_requests(id,user_id,skill_id,title,city,mode,time) VALUES(?,?,?,?,?,'均可','週末下午')","r-v3-print","demo-v3-member-02","s-print","想找同伴練習：版畫拓印","福州");
add("INSERT OR IGNORE INTO graph_edges(id,from_skill_id,to_skill_id,relation,source) VALUES(?,?,?,?,?)","v3-edge-print","s-print","s-repair","共同實踐的延伸主題","虛構Demo：編輯確認的跨主題練習關聯");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,'teach','有些經驗')","v3-teach-garden","demo-v3-zhou","s-garden");
add("INSERT OR IGNORE INTO courses(id,owner_id,skill_id,title,description,equipment) VALUES(?,?,?,?,?,?)","c-v3-garden","demo-v3-zhou","s-garden","陽台小菜園：一起配一盆土","對照採光與澆水記錄，四人共同配土，約定一週後交流觀察。","小花盆、土壤與手套");
add("INSERT OR IGNORE INTO events(id,course_id,organizer_id,venue_id,date,slot,city,mode,capacity,status,code,venue_confirmed) VALUES(?,?,'demo-organizer',?,?,'14:00–16:00',?,?,?,'recruiting',?,1)","e-v3-garden","c-v3-garden","v-studio","2026-12-12","福州","線下",6,"STAR-V3-3");
add("INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)","v3-t-garden","e-v3-garden","demo-v3-zhou");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-garden0","e-v3-garden","demo-v3-member-05");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-garden1","e-v3-garden","demo-v3-member-06");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-garden2","e-v3-garden","demo-v3-member-07");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-garden3","e-v3-garden","demo-v3-member-08");
add("INSERT OR IGNORE INTO knowledge_cards(id,skill_id,author_id,title,content,conditions,cautions,status,consent,confirmed,method) VALUES(?,?,?,?,?,?,?,'published',1,1,'human_demo')","k-v3-garden","s-garden","demo-v3-zhou","陽台小菜園：一起配一盆土：共同練習清單","1. 記錄陽台每天可觀察到的日照時段，選擇合適的植物。\n2. 比較兩種土壤的排水與保水，按帶領者示範完成一盆配土。\n3. 留下澆水與葉片觀察表，一週後用同一角度拍照比較。","成人共同學習；依具體活動條件使用","編輯撰寫的虛構任務示例，請核對適用條件");
add("INSERT OR IGNORE INTO knowledge_sources(id,card_id,citation) VALUES(?,?,?)","v3-src-garden","k-v3-garden","虛構Demo教學清單；不代表已完成的真實活動或調研");
add("INSERT OR IGNORE INTO learning_requests(id,user_id,skill_id,title,city,mode,time) VALUES(?,?,?,?,?,'均可','週末下午')","r-v3-garden","demo-v3-member-03","s-garden","想找同伴練習：陽台種植","廈門");
add("INSERT OR IGNORE INTO graph_edges(id,from_skill_id,to_skill_id,relation,source) VALUES(?,?,?,?,?)","v3-edge-garden","s-garden","s-coffee","共同實踐的延伸主題","虛構Demo：編輯確認的跨主題練習關聯");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,'teach','有些經驗')","v3-teach-language","demo-lin","s-language");
add("INSERT OR IGNORE INTO courses(id,owner_id,skill_id,title,description,equipment) VALUES(?,?,?,?,?,?)","c-v3-language","demo-lin","s-language","把一個生活故事，說成三分鐘英語","用買菜、問路與介紹興趣的情境練習，輪流當說話者與回饋者。","可用麥克風與耳機");
add("INSERT OR IGNORE INTO events(id,course_id,organizer_id,venue_id,date,slot,city,mode,capacity,status,code,venue_confirmed) VALUES(?,?,'demo-organizer',?,?,'14:00–16:00',?,?,?,'recruiting',?,1)","e-v3-language","c-v3-language","v-online","2026-12-13","不限","線上",10,"STAR-V3-4");
add("INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)","v3-t-language","e-v3-language","demo-lin");
add("INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)","v3-t2-language","e-v3-language","demo-v3-yan");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-language0","e-v3-language","demo-v3-member-07");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-language1","e-v3-language","demo-v3-member-08");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-language2","e-v3-language","demo-v3-member-09");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-language3","e-v3-language","demo-v3-member-10");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-language4","e-v3-language","demo-v3-member-11");
add("INSERT OR IGNORE INTO knowledge_cards(id,skill_id,author_id,title,content,conditions,cautions,status,consent,confirmed,method) VALUES(?,?,?,?,?,?,?,'published',1,1,'human_demo')","k-v3-language","s-language","demo-lin","把一個生活故事，說成三分鐘英語：共同練習清單","1. 選擇一次買菜、問路或介紹興趣的生活情境，寫三個關鍵詞。\n2. 兩人輪流說三分鐘，聽者只記錄聽懂與需要澄清的地方。\n3. 交換回饋後再說一次，保留一個下次想練習的表達。","成人共同學習；依具體活動條件使用","編輯撰寫的虛構任務示例，請核對適用條件");
add("INSERT OR IGNORE INTO knowledge_sources(id,card_id,citation) VALUES(?,?,?)","v3-src-language","k-v3-language","虛構Demo教學清單；不代表已完成的真實活動或調研");
add("INSERT OR IGNORE INTO learning_requests(id,user_id,skill_id,title,city,mode,time) VALUES(?,?,?,?,?,'均可','週末下午')","r-v3-language","demo-v3-member-04","s-language","想找同伴練習：生活英語","福州");
add("INSERT OR IGNORE INTO graph_edges(id,from_skill_id,to_skill_id,relation,source) VALUES(?,?,?,?,?)","v3-edge-language","s-language","s-career","共同實踐的延伸主題","虛構Demo：編輯確認的跨主題練習關聯");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,'teach','有些經驗')","v3-teach-story","demo-v3-li","s-story");
add("INSERT OR IGNORE INTO courses(id,owner_id,skill_id,title,description,equipment) VALUES(?,?,?,?,?,?)","c-v3-story","demo-v3-li","s-story","一條街的記憶：學會問一個好問題","先練習開放式提問，再用自願分享的故事製作有授權的文字摘錄。","筆記工具；錄音與拍攝另行同意");
add("INSERT OR IGNORE INTO events(id,course_id,organizer_id,venue_id,date,slot,city,mode,capacity,status,code,venue_confirmed) VALUES(?,?,'demo-organizer',?,?,'14:00–16:00',?,?,?,'recruiting',?,1)","e-v3-story","c-v3-story","v-library","2026-12-19","福州","線下",8,"STAR-V3-5");
add("INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)","v3-t-story","e-v3-story","demo-v3-li");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-story0","e-v3-story","demo-v3-member-09");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-story1","e-v3-story","demo-v3-member-10");
add("INSERT OR IGNORE INTO knowledge_cards(id,skill_id,author_id,title,content,conditions,cautions,status,consent,confirmed,method) VALUES(?,?,?,?,?,?,?,'published',1,1,'human_demo')","k-v3-story","s-story","demo-v3-li","一條街的記憶：學會問一個好問題：共同練習清單","1. 先說明訪談用途與公開範圍，允許對方不回答或中途停止。\n2. 用一個開放式問題開始；區分原話、自己的摘要與尚未核對的記憶。\n3. 讓分享者核對摘錄，只保留獲准分享的內容與來源說明。","成人共同學習；依具體活動條件使用","編輯撰寫的虛構任務示例，請核對適用條件");
add("INSERT OR IGNORE INTO knowledge_sources(id,card_id,citation) VALUES(?,?,?)","v3-src-story","k-v3-story","虛構Demo教學清單；不代表已完成的真實活動或調研");
add("INSERT OR IGNORE INTO learning_requests(id,user_id,skill_id,title,city,mode,time) VALUES(?,?,?,?,?,'均可','週末下午')","r-v3-story","demo-v3-member-05","s-story","想找同伴練習：口述故事","福州");
add("INSERT OR IGNORE INTO graph_edges(id,from_skill_id,to_skill_id,relation,source) VALUES(?,?,?,?,?)","v3-edge-story","s-story","s-hike","共同實踐的延伸主題","虛構Demo：編輯確認的跨主題練習關聯");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,'teach','有些經驗')","v3-teach-design","demo-v3-yan","s-design");
add("INSERT OR IGNORE INTO courses(id,owner_id,skill_id,title,description,equipment) VALUES(?,?,?,?,?,?)","c-v3-design","demo-v3-yan","s-design","把活動資訊，整理成一張讀得懂的海報","把時間、地點、準備清單與報名方式重新編排，交換可讀性回饋。","電腦或平板、任意排版工具");
add("INSERT OR IGNORE INTO events(id,course_id,organizer_id,venue_id,date,slot,city,mode,capacity,status,code,venue_confirmed) VALUES(?,?,'demo-organizer',?,?,'14:00–16:00',?,?,?,'recruiting',?,1)","e-v3-design","c-v3-design","v-online","2026-12-20","不限","線上",10,"STAR-V3-6");
add("INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)","v3-t-design","e-v3-design","demo-v3-yan");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-design0","e-v3-design","demo-v3-member-11");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-design1","e-v3-design","demo-v3-member-12");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-design2","e-v3-design","demo-v3-member-13");
add("INSERT OR IGNORE INTO knowledge_cards(id,skill_id,author_id,title,content,conditions,cautions,status,consent,confirmed,method) VALUES(?,?,?,?,?,?,?,'published',1,1,'human_demo')","k-v3-design","s-design","demo-v3-yan","把活動資訊，整理成一張讀得懂的海報：共同練習清單","1. 列出活動的目標、時間、地點、設備與報名方式，找出遺漏欄位。\n2. 先讓讀者看見學習目標與主要行動，再安排條件和補充資訊。\n3. 請同伴在十秒內找出時間與報名方式，按觀察調整層級。","成人共同學習；依具體活動條件使用","編輯撰寫的虛構任務示例，請核對適用條件");
add("INSERT OR IGNORE INTO knowledge_sources(id,card_id,citation) VALUES(?,?,?)","v3-src-design","k-v3-design","虛構Demo教學清單；不代表已完成的真實活動或調研");
add("INSERT OR IGNORE INTO learning_requests(id,user_id,skill_id,title,city,mode,time) VALUES(?,?,?,?,?,'均可','週末下午')","r-v3-design","demo-v3-member-06","s-design","想找同伴練習：資訊設計","廈門");
add("INSERT OR IGNORE INTO graph_edges(id,from_skill_id,to_skill_id,relation,source) VALUES(?,?,?,?,?)","v3-edge-design","s-design","s-ai","共同實踐的延伸主題","虛構Demo：編輯確認的跨主題練習關聯");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,'teach','有些經驗')","v3-teach-sewing","demo-v3-mei","s-sewing");
add("INSERT OR IGNORE INTO courses(id,owner_id,skill_id,title,description,equipment) VALUES(?,?,?,?,?,?)","c-v3-sewing","demo-v3-mei","s-sewing","一起修好一件捨不得丟的衣服","從鈕扣與簡單破口開始，輪流示範並記下適合不同布料的方法。","待修補衣物、針線與帶領者協助");
add("INSERT OR IGNORE INTO events(id,course_id,organizer_id,venue_id,date,slot,city,mode,capacity,status,code,venue_confirmed) VALUES(?,?,'demo-organizer',?,?,'14:00–16:00',?,?,?,'recruiting',?,1)","e-v3-sewing","c-v3-sewing","v-library","2026-12-26","福州","線下",6,"STAR-V3-7");
add("INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)","v3-t-sewing","e-v3-sewing","demo-v3-mei");
add("INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)","v3-t2-sewing","e-v3-sewing","demo-v3-yan");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-sewing0","e-v3-sewing","demo-v3-member-13");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-sewing1","e-v3-sewing","demo-v3-member-14");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-sewing2","e-v3-sewing","demo-v3-member-15");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-sewing3","e-v3-sewing","demo-v3-member-16");
add("INSERT OR IGNORE INTO knowledge_cards(id,skill_id,author_id,title,content,conditions,cautions,status,consent,confirmed,method) VALUES(?,?,?,?,?,?,?,'published',1,1,'human_demo')","k-v3-sewing","s-sewing","demo-v3-mei","一起修好一件捨不得丟的衣服：共同練習清單","1. 辨認布料與破口，先在練習布上比較針距和拉力。\n2. 在帶領者協助下縫回鈕扣或修補小破口，確認結尾固定。\n3. 記下針線與布料條件，拍攝修補前後供自己比較。","成人共同學習；依具體活動條件使用","編輯撰寫的虛構任務示例，請核對適用條件");
add("INSERT OR IGNORE INTO knowledge_sources(id,card_id,citation) VALUES(?,?,?)","v3-src-sewing","k-v3-sewing","虛構Demo教學清單；不代表已完成的真實活動或調研");
add("INSERT OR IGNORE INTO learning_requests(id,user_id,skill_id,title,city,mode,time) VALUES(?,?,?,?,?,'均可','週末下午')","r-v3-sewing","demo-v3-member-07","s-sewing","想找同伴練習：衣物修補","福州");
add("INSERT OR IGNORE INTO graph_edges(id,from_skill_id,to_skill_id,relation,source) VALUES(?,?,?,?,?)","v3-edge-sewing","s-sewing","s-repair","共同實踐的延伸主題","虛構Demo：編輯確認的跨主題練習關聯");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,'teach','有些經驗')","v3-teach-tea","demo-v3-zhou","s-tea");
add("INSERT OR IGNORE INTO courses(id,owner_id,skill_id,title,description,equipment) VALUES(?,?,?,?,?,?)","c-v3-tea","demo-v3-zhou","s-tea","同一款茶，為什麼喝起來不同？","小組分工記錄時間、水量與感官描述，不給口味好壞排名。","茶具、熱水與低咖啡因替代飲品");
add("INSERT OR IGNORE INTO events(id,course_id,organizer_id,venue_id,date,slot,city,mode,capacity,status,code,venue_confirmed) VALUES(?,?,'demo-organizer',?,?,'14:00–16:00',?,?,?,'recruiting',?,1)","e-v3-tea","c-v3-tea","v-library","2026-12-27","福州","線下",8,"STAR-V3-8");
add("INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)","v3-t-tea","e-v3-tea","demo-v3-zhou");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-tea0","e-v3-tea","demo-v3-member-15");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-tea1","e-v3-tea","demo-v3-member-16");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-tea2","e-v3-tea","demo-v3-member-17");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-tea3","e-v3-tea","demo-v3-member-18");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-tea4","e-v3-tea","demo-v3-member-19");
add("INSERT OR IGNORE INTO knowledge_cards(id,skill_id,author_id,title,content,conditions,cautions,status,consent,confirmed,method) VALUES(?,?,?,?,?,?,?,'published',1,1,'human_demo')","k-v3-tea","s-tea","demo-v3-zhou","同一款茶，為什麼喝起來不同？：共同練習清單","1. 先記下茶葉、水量與沖泡時間，提供不含茶葉的替代飲品。\n2. 同一款茶只改一個條件，小組分工沖泡與記錄。\n3. 各自描述香氣與口感，保留不同偏好，不把個人喜好當成標準答案。","成人共同學習；依具體活動條件使用","編輯撰寫的虛構任務示例，請核對適用條件");
add("INSERT OR IGNORE INTO knowledge_sources(id,card_id,citation) VALUES(?,?,?)","v3-src-tea","k-v3-tea","虛構Demo教學清單；不代表已完成的真實活動或調研");
add("INSERT OR IGNORE INTO learning_requests(id,user_id,skill_id,title,city,mode,time) VALUES(?,?,?,?,?,'均可','週末下午')","r-v3-tea","demo-v3-member-08","s-tea","想找同伴練習：地方茶文化","福州");
add("INSERT OR IGNORE INTO graph_edges(id,from_skill_id,to_skill_id,relation,source) VALUES(?,?,?,?,?)","v3-edge-tea","s-tea","s-coffee","共同實踐的延伸主題","虛構Demo：編輯確認的跨主題練習關聯");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,'teach','有些經驗')","v3-teach-audio","demo-v3-li","s-audio");
add("INSERT OR IGNORE INTO courses(id,owner_id,skill_id,title,description,equipment) VALUES(?,?,?,?,?,?)","c-v3-audio","demo-v3-li","s-audio","聽見日常：製作一張聲音明信片","採集三段不含可辨識談話的環境聲，互相命名、整理成一分鐘作品。","手機錄音與耳機");
add("INSERT OR IGNORE INTO events(id,course_id,organizer_id,venue_id,date,slot,city,mode,capacity,status,code,venue_confirmed) VALUES(?,?,'demo-organizer',?,?,'14:00–16:00',?,?,?,'recruiting',?,1)","e-v3-audio","c-v3-audio","v-online","2027-01-09","不限","線上",8,"STAR-V3-9");
add("INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)","v3-t-audio","e-v3-audio","demo-v3-li");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-audio0","e-v3-audio","demo-v3-member-17");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-audio1","e-v3-audio","demo-v3-member-18");
add("INSERT OR IGNORE INTO knowledge_cards(id,skill_id,author_id,title,content,conditions,cautions,status,consent,confirmed,method) VALUES(?,?,?,?,?,?,?,'published',1,1,'human_demo')","k-v3-audio","s-audio","demo-v3-li","聽見日常：製作一張聲音明信片：共同練習清單","1. 選三種不含可辨識談話的環境聲，確認場地允許錄製。\n2. 每段錄製時保持手機位置穩定，記錄地點、時間與噪聲條件。\n3. 用耳機比較並剪成一分鐘作品；命名檔案，保留來源與授權狀態。","成人共同學習；依具體活動條件使用","編輯撰寫的虛構任務示例，請核對適用條件");
add("INSERT OR IGNORE INTO knowledge_sources(id,card_id,citation) VALUES(?,?,?)","v3-src-audio","k-v3-audio","虛構Demo教學清單；不代表已完成的真實活動或調研");
add("INSERT OR IGNORE INTO learning_requests(id,user_id,skill_id,title,city,mode,time) VALUES(?,?,?,?,?,'均可','週末下午')","r-v3-audio","demo-v3-member-09","s-audio","想找同伴練習：聲音採集","廈門");
add("INSERT OR IGNORE INTO graph_edges(id,from_skill_id,to_skill_id,relation,source) VALUES(?,?,?,?,?)","v3-edge-audio","s-audio","s-hike","共同實踐的延伸主題","虛構Demo：編輯確認的跨主題練習關聯");
add("INSERT OR IGNORE INTO user_skills(id,user_id,skill_id,role,level) VALUES(?,?,?,'teach','有些經驗')","v3-teach-map","demo-v3-yan","s-map");
add("INSERT OR IGNORE INTO courses(id,owner_id,skill_id,title,description,equipment) VALUES(?,?,?,?,?,?)","c-v3-map","demo-v3-yan","s-map","畫一張能讓新朋友用上的社區地圖","整理飲水、休息、交通與無障礙資源，注明來源和待核對的路線。","可編輯地圖、筆記與公開資源資料");
add("INSERT OR IGNORE INTO events(id,course_id,organizer_id,venue_id,date,slot,city,mode,capacity,status,code,venue_confirmed) VALUES(?,?,'demo-organizer',?,?,'14:00–16:00',?,?,?,'recruiting',?,1)","e-v3-map","c-v3-map","v-library","2027-01-10","福州","線下",10,"STAR-V3-10");
add("INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)","v3-t-map","e-v3-map","demo-v3-yan");
add("INSERT OR IGNORE INTO event_teachers(id,event_id,user_id) VALUES(?,?,?)","v3-t2-map","e-v3-map","demo-lin");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-map0","e-v3-map","demo-v3-member-19");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-map1","e-v3-map","demo-v3-member-20");
add("INSERT OR IGNORE INTO registrations(id,event_id,user_id,status) VALUES(?,?,?,'registered')","v3-r-map2","e-v3-map","demo-v3-member-21");
add("INSERT OR IGNORE INTO knowledge_cards(id,skill_id,author_id,title,content,conditions,cautions,status,consent,confirmed,method) VALUES(?,?,?,?,?,?,?,'published',1,1,'human_demo')","k-v3-map","s-map","demo-v3-yan","畫一張能讓新朋友用上的社區地圖：共同練習清單","1. 從公開來源整理飲水、休息、交通與無障礙資源，注明資料日期。\n2. 小組分工核對路線；未實地確認的條目清楚標為待核對。\n3. 請一位不熟悉地區的同伴試讀地圖，把找不到的資訊補回去。","成人共同學習；依具體活動條件使用","編輯撰寫的虛構任務示例，請核對適用條件");
add("INSERT OR IGNORE INTO knowledge_sources(id,card_id,citation) VALUES(?,?,?)","v3-src-map","k-v3-map","虛構Demo教學清單；不代表已完成的真實活動或調研");
add("INSERT OR IGNORE INTO learning_requests(id,user_id,skill_id,title,city,mode,time) VALUES(?,?,?,?,?,'均可','週末下午')","r-v3-map","demo-v3-member-10","s-map","想找同伴練習：社區地圖","福州");
add("INSERT OR IGNORE INTO graph_edges(id,from_skill_id,to_skill_id,relation,source) VALUES(?,?,?,?,?)","v3-edge-map","s-map","s-photo","共同實踐的延伸主題","虛構Demo：編輯確認的跨主題練習關聯");
add("INSERT OR IGNORE INTO knowledge_sources(id,card_id,citation) VALUES(?,?,?)","v3-seed-complete","k-v3-cyanotype","V3 richer synthetic examples, created once; no private learning records are fabricated.");
await db.batch(q);}
