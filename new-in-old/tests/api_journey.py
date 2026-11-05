"""Disposable local-preview acceptance run. Does not target the hosted site."""
import sys,json,datetime,urllib.request,urllib.error,http.cookiejar
class Response:
 def __init__(self,r):self.status_code=r.code;self.text=r.read().decode()
 def json(self):return json.loads(self.text)
 def raise_for_status(self):assert self.status_code==200,self.text
class Session:
 def __init__(self):self.opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
 def request(self,url,data=None):
  req=urllib.request.Request(url,data=None if data is None else json.dumps(data).encode(),headers={'Content-Type':'application/json'})
  try:r=self.opener.open(req,timeout=10)
  except urllib.error.HTTPError as e:r=e
  return Response(r)
 def get(self,url):return self.request(url)
 def post(self,url,json):return self.request(url,json)
class requests:Session=Session
base=sys.argv[1] if len(sys.argv)>1 else 'http://terminal.local:4173'
s=requests.Session();s.trust_env=False
results=[]
def post(action,expected=200,**body):
 r=s.post(base+'/api/community',json={'action':action,**body});assert r.status_code==expected,(action,r.status_code,r.text);return r.json()
def get():
 r=s.get(base+'/api/community');r.raise_for_status();return r.json()
def check(name,fn):
 fn();results.append({'test':name,'result':'PASS'});print('PASS',name)
def role(role,pin=''):
 r=s.post(base+'/api/session',json={'role':role,'pin':pin});assert r.status_code==200,r.text
role('resident');post('initialize')
check('1 Resident cannot publish an activity',lambda:post('create_activity',expected=403,title='x'))
check('2 Wrong demo PIN rejected',lambda:exec("r=s.post(base+'/api/session',json={'role':'admin','pin':'wrong'});assert r.status_code==403"))
post('entry',title='示例：第一次不用看导航',body='虚构旅程：走过转角时，我已经知道接下来往哪里走。',place='转角的绿门')
check('3 Private entry persists after reload',lambda:exec("assert any(x['title']=='示例：第一次不用看导航' for x in get()['entries'])"))
post('case',title='示例：可以不参加合影吗？',body='刚搬来，想参加导览，但不想拍照。')
case=get()['cases'][-1]
role('admin','246810')
check('4 Admin receives no private entries or replay preferences',lambda:exec("d=get();assert 'entries' not in d and 'replay' not in d['profile'] and 'next_replay' not in d['profile']"))
post('case_reply',id=case['id'],reply='可以。我们会在活动前说明合影选择，也欢迎安静跟随。',status='waiting')
post('create_activity',title='验收活动：街巷共创',kind='共创测试',date='2026-11-14 14:30',place='测试工作桌',capacity=1,body='演示用，不代表真实安排',intensity='可只提供素材',material='模拟免费')
a=get()['activities'][-1]
check('5 Invalid capacity rejected',lambda:post('create_activity',expected=400,title='x',date='x',place='x',body='x',capacity=0))
role('resident')
post('confirm_case',id=case['id'],resolved=True)
check('6 Resident confirms request solved',lambda:exec("assert next(x for x in get()['cases'] if x['id']==case['id'])['status']=='resolved'"))
post('register',id=a['id'],photo=False)
check('7 Duplicate registration blocked',lambda:post('register',expected=400,id=a['id']))
reg=next(x for x in get()['registrations'] if x['activity_id']==a['id'])
check('8 Photo consent remains independent',lambda:exec("assert reg['photo']==0"))
post('cancel',id=reg['id']);post('register',id=a['id'])
role('admin','246810');post('activity_status',id=a['id'],status='completed')
check('9 Terminal activity cannot reopen',lambda:post('activity_status',expected=400,id=a['id'],status='open'))
role('resident');d=get();reg=next(x for x in d['registrations'] if x['activity_id']==a['id'] and x['status']=='attendance_pending')
post('attendance',id=reg['id'])
check('10 Participation needs member confirmation',lambda:exec("assert next(x for x in get()['registrations'] if x['id']==reg['id'])['status']=='attended'"))
post('submit_asset',title='示例：雨停后，我认得了回家的路',body='刚来时一路看导航，后来记住了转角的一扇绿门。此段为虚构创作。',archive=True,display=True,commercial=False)
asset=get()['assets'][-1]
check('11 Unapproved content cannot be produced',lambda:post('order',expected=400,product='社区共创小志',assetId=asset['id']))
role('admin','246810');post('asset_review',id=asset['id'],version=1,status='published');role('resident')
check('12 Display consent does not imply commercial permission',lambda:post('order',expected=400,product='社区明信片',assetId=asset['id']))
post('order',product='社区共创小志',assetId=asset['id']);order=get()['orders'][-1]
post('consent',id=asset['id'],archive=True,display=False,commercial=False)
check('13 Withdrawal hides publication, increments version, pauses production',lambda:exec("d=get();x=next(x for x in d['assets'] if x['id']==asset['id']);o=next(x for x in d['orders'] if x['id']==order['id']);assert x['status']=='submitted' and x['display']==0 and x['version']==2 and o['status']=='paused'"))
role('admin','246810')
check('14 Stale review version rejected',lambda:post('asset_review',expected=400,id=asset['id'],version=1,status='published'))
check('15 Paused order cannot resume silently',lambda:post('order_status',expected=400,id=order['id'],status='making'))
role('resident');post('consent',id=asset['id'],archive=True,display=True,commercial=True)
role('admin','246810');post('asset_review',id=asset['id'],version=3,status='published');role('resident')
post('order',product='社区明信片',assetId=asset['id']);order2=get()['orders'][-1]
role('admin','246810');post('order_status',id=order2['id'],status='making');post('order_status',id=order2['id'],status='ready');post('order_status',id=order2['id'],status='collected');role('resident')
check('16 Production reaches collection',lambda:exec("assert next(x for x in get()['orders'] if x['id']==order2['id'])['status']=='collected'"))
post('handover_create',title='示例：小志材料整理');task=get()['handovers'][-1]
check('17 Unfinished handover blocks departure',lambda:post('leave',expected=400))
role('admin','246810');post('handover_assign',id=task['id'],assignee='示例组织者小陈');role('resident')
post('handover_confirm',id=task['id'],accept=True)
post('profile',stage='leaving',replay='quarterly');post('leave')
check('18 Departure recorded without deleting private memory',lambda:exec("d=get();assert d['profile']['stage']=='left' and len(d['entries'])>0"))
check('19 Opt-in replay has next date',lambda:exec("p=get()['profile'];assert p['replay']=='quarterly' and p['next_replay']"))
post('replay_check');post('profile',stage='left',replay='off')
check('20 Replay can be paused',lambda:exec("p=get()['profile'];assert p['replay']=='off' and p['next_replay'] is None"))
check('21 Empty private entry rejected',lambda:post('entry',expected=400,title='',body=''))
check('22 No browser localStorage used',lambda:exec("from pathlib import Path;assert 'localStorage' not in Path('app/page.tsx').read_text()"))
with open('docs/04_功能验收结果.json','w') as f:json.dump({'tested_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'environment':'local preview only','human_tests':False,'results':results},f,ensure_ascii=False,indent=2)
print('TOTAL',len(results),'PASS')
