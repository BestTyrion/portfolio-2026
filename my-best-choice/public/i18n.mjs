import {english} from './locale-en.mjs';
import {seedStrings} from './locale-seeds.mjs';
const localeStorageKey='mbc-interface-language';
let selectedLanguage='en';try{if(typeof localStorage!=='undefined'&&localStorage.getItem(localeStorageKey)==='zh-CN')selectedLanguage='zh-CN';}catch{}
export function getLanguage(){return selectedLanguage;}
export function setLanguage(value){selectedLanguage=value==='zh-CN'?'zh-CN':'en';try{if(typeof localStorage!=='undefined')localStorage.setItem(localeStorageKey,selectedLanguage);}catch{}return selectedLanguage;}
const hanUI=/[\u4e00-\u9fff][\u4e00-\u9fff\u3000-\u303f\uff00-\uffef“”‘’·—、：；？！。，（）]*/g;
const localeSeedSet=new Set(seedStrings);
export function translateText(value,language=getLanguage()){const text=String(value??'');if(language==='zh-CN')return text;return text.replace(hanUI,part=>english[part]??part);}
export function htmlEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
// Encode user data before translating static markup. HTML restores the original text.
export function protectUserText(value){return htmlEscape(value).replace(/[\u3400-\u9fff]/g,c=>'&#'+c.codePointAt(0)+';');}
export function escapeDisplay(value){return localeSeedSet.has(String(value??''))?htmlEscape(value):protectUserText(value);}
export function displayPlain(value,language=getLanguage()){return localeSeedSet.has(String(value??''))?translateText(value,language):String(value??'');}
export function localizeMarkup(value,language=getLanguage()){
 let html=String(value??'');
 // Preserve implicit select values so changing displayed language never changes enums.
 html=html.replace(/<option(?![^>]*\bvalue\s*=)([^>]*)>([^<]*)<\/option>/gi,(all,attrs,label)=>`<option value="${htmlEscape(label)}"${attrs}>${label}</option>`);
 if(language==='zh-CN')return html;
 return html.replace(/<[^>]*>|[^<]+/g,token=>{
  if(token.startsWith('<'))return token.replace(/(\s(?:aria-label|aria-valuetext|title|placeholder|alt)\s*=\s*)(["'])(.*?)\2/gi,(all,prefix,quote,text)=>prefix+quote+text.replace(hanUI,part=>htmlEscape(english[part]??part))+quote);
  return token.replace(hanUI,part=>htmlEscape(english[part]??part));
 });
}
