// Direct evidence for each value perspective. Examples are never personal facts.
export const roleEvidence={use:['purpose','existing','tasks','equipment','skills','readiness','limitation','requirements'],price:['budget','price','fit','time','future','reserved','monthly','plan_gap','plan_funds'],emotion:['emotion'],social:['social']};
export function relatedEvidence(key,facts){return facts.filter(f=>(roleEvidence[key]||[]).includes(f.id));}
export function evidenceMessage(key,facts,ids=[]){
 if(ids.length)return '';
 const related=relatedEvidence(key,facts),confirmed=related.filter(f=>f.source==='user_confirmed');
 if(confirmed.length)return '你已填写相关资料，但这条意见没有引用具体条目，暂不能当作针对你的结论。请重新生成。';
 if(related.some(f=>f.source==='example'))return '目前只有相关示例，尚未确认属于你的实际情况。';
 return {use:'还需要你填写当前困难和现有替代办法。',price:'还需要你确认金额范围和时间安排。',emotion:'还需要你表达期待的体验；也可以明确填写“没有特别期待”。',social:'还需要你说明他人推荐是否有影响；也可以明确填写“没有影响”。'}[key]||'需要补充本次依据。';
}
