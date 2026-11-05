import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const file=process.env.MEDMIND_DB || path.resolve('data/medmind.sqlite');
fs.mkdirSync(path.dirname(file),{recursive:true});
export const db=new DatabaseSync(file);
db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
const schema=fs.readFileSync(new URL('./schema.sql',import.meta.url),'utf8'); db.exec(schema);
export const now=()=>new Date().toISOString();
export const day=(offset=0)=>{const d=new Date();d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10)};
export const hash=(s,salt=randomBytes(16).toString('hex'))=>`${salt}:${scryptSync(s,salt,64).toString('hex')}`;
export const verify=(s,stored)=>{const [salt,hex]=stored.split(':');return timingSafeEqual(scryptSync(s,salt,64),Buffer.from(hex,'hex'))};
export const q=(sql,...args)=>db.prepare(sql).all(...args);
export const one=(sql,...args)=>db.prepare(sql).get(...args);
export const run=(sql,...args)=>db.prepare(sql).run(...args);
export function tx(fn){db.exec('BEGIN IMMEDIATE');try{const x=fn();db.exec('COMMIT');return x}catch(e){db.exec('ROLLBACK');throw e}}
export function ensureEvents(patientId){
 const plans=q('SELECT * FROM plans WHERE patient_id=? AND active=1',patientId);
 const insert=db.prepare('INSERT OR IGNORE INTO events(plan_id,patient_id,scheduled_at,status,review_status) VALUES(?,?,?,\'UNKNOWN\',\'PENDING\')');
 for(const p of plans){for(let i=-13;i<=7;i++){const date=day(i);if(date>=p.start_date)insert.run(p.id,patientId,`${date}T${p.time}:00.000Z`)}}
}
export function seed(){if(one('SELECT COUNT(*) AS n FROM users').n)return;
 tx(()=>{
  const users=[['Jason Wong','patient',25,'jason@medmind.demo','jason-demo'],['Mrs. Chan','patient',68,'chan@medmind.demo','chan-demo'],['Dr. Lee','doctor',42,'lee@medmind.demo','lee-demo']];
  for(const [name,role,age,email,password] of users)run('INSERT INTO users(name,role,age,email,password_hash) VALUES(?,?,?,?,?)',name,role,age,email,hash(password));
  run('INSERT INTO plans(patient_id,name,dosage_label,time,start_date,created_at) VALUES(1,?,?,?,?,?)','Daily medication','As prescribed','08:00',day(-13),now());
  run('INSERT INTO plans(patient_id,name,dosage_label,time,start_date,created_at) VALUES(2,?,?,?,?,?)','Daily medication','As prescribed','09:00',day(-13),now());
  ensureEvents(1);ensureEvents(2);
  function report(patient,offset,status,reason=null,revision=false){const e=one('SELECT id FROM events WHERE patient_id=? AND substr(scheduled_at,1,10)=?',patient,day(offset));const stamp=new Date(Date.now()+offset*86400000+14*3600000).toISOString();run('INSERT INTO revisions(event_id,status,reason,source,recorded_at,note) VALUES(?,?,?,\'PATIENT\',?,NULL)',e.id,status,reason,stamp);run('UPDATE events SET status=?,reason=?,review_status=?,recorded_at=?,source=\'PATIENT\' WHERE id=?',status,reason,status==='UNKNOWN'?'NEEDS_REVIEW':'RECORDED',stamp,e.id);if(revision){run('INSERT INTO revisions(event_id,status,reason,source,recorded_at,note) VALUES(?,\'TAKEN\',NULL,\'PATIENT\',?,\'Corrected previous report\')',e.id,now());run('UPDATE events SET status=\'TAKEN\',reason=NULL,review_status=\'RECORDED\',recorded_at=? WHERE id=?',now(),e.id)}}
  for(const [o,s,r,c] of [[-13,'TAKEN',null,false],[-12,'TAKEN',null,false],[-11,'UNKNOWN',null,true],[-10,'TAKEN',null,false],[-9,'TAKEN',null,false],[-7,'UNKNOWN',null,false],[-6,'TAKEN',null,false],[-4,'TAKEN',null,false],[-3,'UNKNOWN',null,false],[-1,'TAKEN',null,false]])report(1,o,s,r,c);
  for(const [o,s,r] of [[-13,'TAKEN',null],[-12,'NOT_TAKEN','Worried About Side Effects'],[-11,'TAKEN',null],[-10,'NOT_TAKEN','Felt Unnecessary'],[-8,'TAKEN',null],[-7,'NOT_TAKEN','Experienced Discomfort'],[-6,'TAKEN',null],[-5,'NOT_TAKEN','Worried About Side Effects'],[-3,'TAKEN',null],[-1,'NOT_TAKEN','Felt Unnecessary']])report(2,o,s,r);
  run('INSERT INTO shares(patient_id,doctor_id,scope,active,granted_at) VALUES(1,3,\'ALL\',1,?)',now());
 });
}
seed();
