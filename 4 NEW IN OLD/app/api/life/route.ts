import {env} from 'cloudflare:workers';
import {applyAction,initialState,publicState, type State} from '../../../lib/community-v2';
export const sessionId=(req:Request)=>{const match=(req.headers.get('cookie')||'').match(/(?:^|;\s*)nio_session=([a-f0-9-]{36})(?:;|$)/);return match?.[1]||''};
export async function readSession(req:Request){if(!env.DB)throw Error('数据库连接不可用');const row=await env.DB.prepare('SELECT state,revision FROM demo_sessions WHERE id=?').bind(sessionId(req)).first<{state:string,revision:number}>();return row?{state:JSON.parse(row.state) as State,revision:row.revision}:null;}
const json=(body:any,status=200,headers:Record<string,string>={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});
export async function GET(req:Request){try{const row=await readSession(req);return json(row?{state:publicState(row.state),revision:row.revision}:{state:null});}catch{ return json({error:'暂时无法载入记录，请稍后再试'},503)}}
export async function POST(req:Request){try{
 if(!env.DB)throw Error('数据库连接不可用');const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return json({error:'请求来源不匹配'},403);
 const b:any=await req.json();if(JSON.stringify(b).length>20000)throw Error('内容过长，请分开保存');
 if(b.action==='register'){
  if(await readSession(req))throw Error('当前浏览器已有演示成员');const sid=crypto.randomUUID(),s=initialState(b.name,b.theme);
  await env.DB.prepare('INSERT INTO demo_sessions(id,state,revision,updated) VALUES(?,?,0,?)').bind(sid,JSON.stringify(s),new Date().toISOString()).run();
  return json({state:s,revision:0},200,{'Set-Cookie':`nio_session=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${new URL(req.url).protocol==='https:'?'; Secure':''}`});
 }
 const row=await readSession(req);if(!row)return json({error:'请先创建演示成员'},401);
 if(Number(b.revision)!==row.revision)return json({error:'记录刚刚发生变化，已为你刷新，请再操作一次'},409);
 const s=applyAction(row.state,b),result=await env.DB.prepare('UPDATE demo_sessions SET state=?,revision=revision+1,updated=? WHERE id=? AND revision=?').bind(JSON.stringify(s),new Date().toISOString(),sessionId(req),row.revision).run();
 if(!result.meta.changes)return json({error:'记录刚刚发生变化，请刷新后再试'},409);
 return json({state:publicState(s),revision:row.revision+1});
 }catch(e:any){return json({error:e.message||'保存失败，请再试一次'},400)}}
