import {fundSummary} from './planning.mjs';
import {funding,product,priceFor} from './domain.mjs';
export function demonstration(){
 const facts=[['name','示例商品','Aster One 通勤耳机'],['purpose','实际困难','旧耳机通勤时偶尔断连，希望连接稳定。'],['existing','已有物品','已有一副仍可使用的耳机，可以先测试或维修。'],['budget','本次预算','HK$600，不占用旅行预留。'],['price','示例到手价','HK$499，未核实实时价格。'],['emotion','期待的体验','希望通勤更安静，也喜欢它的外观。'],['social','他人的影响','朋友推荐让我注意到它，但不想只因推荐就买。']].map(([id,label,value])=>({id,label,value,source:'example'}));
 return {input:{scope:'direction',facts},result:{summary:'演示：示例报价在预算内，但先验证连接与佩戴，再决定购买或继续观察。',perspectives:[{key:'use',quote:'我最在意它能否解决断连。旧耳机还能用，我会先测试新型号的连接表现。',evidenceIds:['purpose','existing'],unknown:'新型号实际连接稳定性与维修可能性。',nextAction:'核对同版本连接评价，试用或确认退换条件。'},{key:'price',quote:'我看到示例到手价 HK$499，在 HK$600 的预算内，余 HK$101；我仍不想动用旅行预留。',evidenceIds:['budget','price'],unknown:'实际报价、运费与保修条件尚未核实。',nextAction:'确认完整到手价，核对是否会重复占用资金。'},{key:'emotion',quote:'我确实期待安静通勤，也喜欢它的外观。我想确认这种体验能持续，而不只是开箱时开心。',evidenceIds:['emotion'],unknown:'实际舒适度与降噪体验。',nextAction:'试戴后记录是否符合自己的期待。'},{key:'social',quote:'朋友的推荐让我关注它，但我希望按自己的使用场景做决定。',evidenceIds:['social'],unknown:'朋友的使用条件是否与我的通勤相同。',nextAction:'把推荐理由与自己的实际用途对照。'}],suggestions:[{title:'先验证连接表现，再决定是否购买',reason:'旧耳机仍能使用，关键问题是断连，示例价格并非唯一理由。',nextAction:'检查同版本评价与退换条件，必要时先试戴。',evidenceIds:['purpose','existing','price']}]}};
}
export function savedAnalysisOptions(state){return [...state.goals.map(g=>({id:'goal/'+g.id,title:g.title,kind:g.status==='archived'?'已归档目标':'长期目标'})),...state.experience.needs.map(n=>({id:'need/'+n.id,title:n.title,kind:'已保存需求'}))];}
export function planAnalysisInput(state,selection){
 const slash=selection.indexOf('/'),type=selection.slice(0,slash),id=selection.slice(slash+1);
 const g=type==='goal'?state.goals.find(g=>g.id===id):type==='need'?state.experience.needs.find(n=>n.id===id):null;if(!g)return null;
 const isInitial=!g.confirmedAt&&(type==='goal'?g.id==='goal-gpu':['need-earbud','need-gpu'].includes(g.id));
 const source=isInitial?'example':'user_confirmed',facts=[],add=(id,label,value,origin=source)=>{if(value!=null&&String(value).trim())facts.push({id,label,value:String(value),source:origin});};
 add('name','选中的'+(type==='goal'?'长期目标':'需求'),g.title);add('purpose','保存的用途与困难',g.purpose||g.problem);add('requirements','最低条件',g.requirements);add('existing','原有替代办法',g.alternative);
 add('budget',type==='goal'?'目标金额 HK$（不是商品报价）':'本次计划金额 HK$',type==='goal'?g.target:g.amount);add('time','预计需要时间（月）',g.months);add('priority','原计划优先级',g.priority);
 if(type==='goal'){add('reserved','当前已预留 HK$',g.reserved);add('monthly','未来每月计划投入 HK$（不算当前资金）',g.monthly);const f=g.target==null?{gap:null,months:null}:funding(g);add('plan_gap','代码计算：准备差额与所需月数',JSON.stringify({gap:f.gap,months:f.months}),'calculated');}
 const notes=state.experience.analysisNotes?.[selection]||{};for(const [key,label] of [['existing','补充的现有办法'],['emotion','这项计划的体验期待'],['social','这项计划的他人影响'],['priority','这次重评最重要的取舍']]){if(notes[key]?.trim()){const old=facts.findIndex(f=>f.id===key);if(old>=0)facts.splice(old,1);add(key,label,notes[key],'user_confirmed');}}
 const sum=fundSummary(state);add('plan_funds','当前资金安排摘要（非银行余额）',JSON.stringify({pool:sum.pool,allocated:sum.allocated,unallocated:sum.unallocated,valid:sum.valid}),'calculated');
 if(g.productId){const p=product(state,g.productId);if(p){add('candidate','原计划关联候选',p.name,state.customProducts?.[p.id]?'user_confirmed':'example');add('price','候选当前记录到手价 HK$（非实时行情）',priceFor(state,p),state.customProducts?.[p.id]?'user_confirmed':'example');}}
 return {scope:'plan',facts};
}
