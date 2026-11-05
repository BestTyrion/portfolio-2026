import React,{useSyncExternalStore} from 'react';
import chinese from './zh-CN.json';
type Language='en'|'zh';
let language:Language='en';
const listeners=new Set<()=>void>();
const subscribe=(fn:()=>void)=>{listeners.add(fn);return ()=>{listeners.delete(fn)}};
export const useLanguage=()=>useSyncExternalStore(subscribe,()=>language,()=> 'en' as Language);
export const activeLocale=()=>language==='zh'?'zh-CN':'en-US';
export function setLanguage(next:Language){language=next;document.documentElement.lang=next==='zh'?'zh-CN':'en';listeners.forEach(fn=>fn());}
const dictionary:Record<string,string>=chinese;
export function translate<T>(value:T):T|string {
 if(language==='en'||typeof value!=='string')return value;
 const trimmed=value.trim(),exact=dictionary[trimmed];
 if(exact)return value.replace(trimmed,exact);
 const patterns:[RegExp,(...m:string[])=>string][]=[
 [/^Good to see you, (.+)\. Record what you know, when you know it\.$/,(_,name)=>`很高兴见到你，${name}。根据掌握的情况，随时记录。`],
 [/^(\d+) waiting for a report · Pending is not Not Taken$/,(_,n)=>`${n} 项待报告 · 待报告不等于未服药`],
 [/^(\d+) of (\d+) scheduled events reported$/,(_,a,b)=>`${b} 项计划事件中已有 ${a} 项报告`],
 [/^(\d+) \/ (\d+) scheduled events$/,(_,a,b)=>`${a}／${b} 项计划事件`],
 [/^Recorded (.+) · Patient source$/,(_,date)=>`记录于 ${date} · 来源：患者`],
 [/^(\d+) patient(s?) sharing information$/,(_,n)=>`${n} 位患者正在共享信息`],
 ];
 for(const [re,fn]of patterns)if(re.test(trimmed))return value.replace(trimmed,trimmed.replace(re,fn));
 return value;
}
export function LanguageSwitch(){const lang=useLanguage();return <div className="language-switch" role="group" aria-label={lang==='en'?'Interface language':'界面语言'}><button type="button" lang="en" aria-pressed={lang==='en'} onClick={()=>setLanguage('en')}>English</button><button type="button" lang="zh-CN" aria-pressed={lang==='zh'} onClick={()=>setLanguage('zh')}>中文</button></div>}
