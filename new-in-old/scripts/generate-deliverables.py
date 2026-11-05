from pathlib import Path
import html,re
out=Path('public/deliverables');out.mkdir(exist_ok=True)
style='''*{box-sizing:border-box}body{background:#edece1;color:#2b5141;margin:0;font:15px/1.95 Georgia,"Noto Serif SC","Songti SC",serif}.toolbar{padding:15px 25px;background:#f8f7ee;position:sticky;top:0;text-align:right}button,a.btn{background:#345c49;color:white;padding:10px 17px;border:0;border-radius:6px;text-decoration:none;cursor:pointer}.sheet{background:#fcf7e9;max-width:750px;min-height:900px;padding:65px;margin:35px auto;box-shadow:0 5px 25px #0001;break-after:page}h1{font-size:46px;line-height:1.5;font-weight:500}h2{font-size:26px;font-weight:500;margin-top:25px}h3{font-size:19px}small{font:10px/1.8 sans-serif;color:#899075;letter-spacing:1.5px}.line{border-top:1px solid #b7c3aa;margin:30px 0}.note{background:#e9eddb;padding:18px;margin:25px 0;font-size:12px}.route{padding:25px;border:1px dashed #93a583}.route p{border-bottom:1px solid #d3dbc5;padding-bottom:14px}.envelope{background:#bcc5a5}.cards{display:grid;grid-template-columns:1fr 1fr;gap:20px}.card{border:1px solid #a6b197;padding:25px;min-height:230px}.card h2{font-size:23px}table{border-collapse:collapse;font-size:12px;width:100%}th,td{border:1px solid #d9dfce;text-align:left;padding:10px;vertical-align:top}th{background:#e9eddc}pre{white-space:pre-wrap;font:13px/1.9 sans-serif}a{color:#38604b;overflow-wrap:anywhere}@media(max-width:700px){.sheet{margin:15px;padding:30px;min-height:700px}h1{font-size:33px}.cards{grid-template-columns:1fr}}@media print{@page{size:A5;margin:10mm}body{background:white}.toolbar{display:none}.sheet{margin:0;padding:12mm;box-shadow:none;max-width:none;min-height:180mm}.sheet:last-child{break-after:auto}h1{font-size:34px}h2{font-size:23px}table{font-size:9px}.cards{grid-template-columns:1fr 1fr}.card{min-height:180px}}
'''
def write(name,title,sections):
 text='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>'+style+'</style><div class="toolbar"><button onclick="window.print()">打印 / 保存为 PDF</button></div>'+''.join('<section class="sheet '+('envelope' if i==len(sections)-1 and name=='memory-kit.html' else '')+'">'+s+'</section>' for i,s in enumerate(sections))+'</html>'
 (out/name).write_text(text)
svg='<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg"><circle cx="490" cy="60" r="38" fill="#edc782"/><path d="M30 185h540M60 185V100h160v85m-180-85 25-35h150l25 35m50 85V90h220v95m-240-95 30-40h200l35 40" fill="none" stroke="#42634a" stroke-width="4"/><path d="M90 185v-50h40v50m30-65h40v35h-40m165 30v-55h45v55m40-65h45v35h-45" fill="#c6d0ac" stroke="#42634a" stroke-width="2"/></svg>'
write('memory-kit.html','林予安｜个人纪念套装样稿',[
'<small>NEW IN OLD · 新邻旧里 / 虚构成员样稿</small><h1>住过的日子，<br>都在这里。</h1>'+svg+'<p>林予安的个人居住小册</p><div class="line"></div><p>有些路，后来不再每天经过。<br>那时记下的一句话，仍然能让你想起，<br>自己曾怎样在这里生活。</p><small>设计样稿。以下经历均为虚构，非现场或访谈证据。</small>',
'<small>01 / 我想记住的日常</small><h2>第一次，不用看导航。</h2><p>刚搬来的时候，我总是走过了那个转角，又折回来。那次跟大家走了一遍街巷，记住了一扇绿门。</p><p>后来下班走到那里，我就知道，快到了。</p><div class="line"></div><h2>一起完成的一页</h2><p>小志里有我写的一段话。校对的时候，大家把一个地点名称又确认了一次。最后留下的文字，比我一个人写时更准确。</p><div class="note">示例个人内容。是否公开、收入社区小志或制作产品，由本人分别决定。</div>',
'<small>02 / 折页地图 · 概念底稿</small><h1>我走过的街巷</h1>'+svg+'<div class="route"><p>① 第一次集合的地方：________________</p><p>② 我愿意停一会儿的位置：____________</p><p>③ 常走的一小段路：__________________</p><p>④ 想再看一眼的地方：________________</p></div><p>由本人标记与补充。图形为示意，不作真实导航。</p>',
'<small>03 / 留给后来的一天</small><h2>现在的你，过得怎么样？</h2><p>那时想做的事，后来开始了吗？<br>不必急着回答。空白也可以留着。</p><div class="line"></div><p>后来，我还记得：____________________</p><p>想告诉那时的自己：__________________</p><div class="note">程序中可选择每月、每季度或每年站内回看；默认关闭，可随时暂停。近况记录仅自己可见。</div>',
'<small>折页封套 · 视觉样稿，正式印制前需补刀模与尺寸校样</small><h1>我的<br>这段日子</h1><div class="line"></div><p>林予安 / 新邻旧里</p><p>留下什么，带走什么，<br>都由自己决定。</p>' ])
write('community-zine.html','我们住过的这条街｜社区共创试刊',[
'<small>NEW IN OLD / 01 / 共创试刊样稿</small><h1>我们住过的<br>这条街</h1>'+svg+'<p>生活地图 · 街巷片段 · 共同创作</p><div class="note">所有内容为虚构排版样稿，不是居民原话。实际出版需共同选题、作者确认和用途许可。</div>',
'<small>同一条路，不同的生活</small><h2>我认得了回家的路。</h2><p>示例作者：林予安（新住户）</p><p>从需要导航，到认得转角的绿门，熟悉是从很小的事情开始的。</p><div class="line"></div><h2>这里的一天，还在继续。</h2><p>共同采集留白：长期居民、商户与青年都可以提出自己的选题，决定是否参与和怎样署名。</p><p>图片：____________________________</p><p>文字：____________________________</p><p>作者确认 / 日期 / 版本：____________</p>',
'<small>共同生活地图 / 可补充的底稿</small><h2>后来的人，也可以加上一页。</h2>'+svg+'<p>生活地点与信息：需实际核实来源和更新时间。</p><p>个人故事与观察：经本人确认后公开。</p><div class="note">这份公共成果不包含私人日记。允许展示不等于允许商品化；制作明信片等产品前另行确认。</div>'])
write('participation-tools.html','新邻旧里｜线下参与工具',[
'<small>欢迎卡 / 使用示例</small><h1>欢迎来到这里。</h1>'+svg+'<p>先弄明白日常，<br>再按自己的步调认识街坊。</p><p>青年端：<a href="https://new-in-old-community.p-tyrionchow.chatgpt.site">打开新邻旧里</a></p><div class="note">正式服务二维码、实际联系人员和服务时间须核实后添加。本页为设计提案。</div>',
'<small>活动中使用 / 与纪念套装分开</small><div class="cards"><div class="card"><h2>活动说明</h2><p>名称：________<br>时间/地点：________<br>人数/费用：________<br>负责人：________</p><p>可以只听、不合影；退出联系：________</p></div><div class="card"><h2>我想一起做</h2><p>□选题 □文字<br>□摄影 □插画<br>□编辑 □只看看</p><p>愿意承担的事：________<br>可投入时间：________</p></div><div class="card"><h2>内容确认</h2><p>作者/版本：________<br>□归档 □展示<br>□文化产品</p><p>每项自愿选择。撤回联系：________</p></div><div class="card"><h2>组织者清单</h2><p>□确认场地与物料<br>□说明参与和退出<br>□尊重拍照选择<br>□核对作者及许可<br>□通知变化与交接</p></div></div>'])
# SVG standalone cultural product sample, independently labelled
(out/'postcard.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#f4ebd5"/><rect x="35" y="35" width="830" height="530" fill="none" stroke="#385f49"/><text x="80" y="110" font-size="17" fill="#385f49">NEW IN OLD / 新邻旧里 · 文化产品视觉样稿</text><path d="M100 340h650M150 340V230h190v110m-210-110 25-45h175l30 45m60 110V210h220v130m-240-130 30-45h200l35 45" fill="none" stroke="#385f49" stroke-width="5"/><text x="80" y="425" font-size="38" fill="#385f49">走过的路，留下的一页。</text><text x="80" y="485" font-size="17" fill="#385f49">共创成果可制作明信片；正式生产前确认作者、用途与收益安排。</text><text x="80" y="530" font-size="13" fill="#385f49">原创概念矢量插画 · 非社区现场记录</text></svg>')
def md(text):
 lines=text.splitlines();out=[];table=False
 for l in lines:
  if l.startswith('|'):
   if set(l.replace('|','').replace('-','').replace(':','').strip())==set():continue
   if not table:out.append('<table>');table=True
   out.append('<tr>'+''.join('<td>'+html.escape(x.strip())+'</td>' for x in l.strip('|').split('|'))+'</tr>');continue
  if table:out.append('</table>');table=False
  if l.startswith('#'):n=len(l)-len(l.lstrip('#'));out.append(f'<h{min(n,3)}>'+html.escape(l[n:].strip())+f'</h{min(n,3)}>')
  elif l.strip():out.append('<p>'+html.escape(l)+'</p>')
 if table:out.append('</table>')
 return ''.join(out)
write('handbook.html','新邻旧里｜项目、研究与系统手册',[md(p.read_text()) for p in sorted(Path('docs').glob('*.md'))])
links=[('memory-kit.html','个人纪念套装样稿','个人小册、折页地图、封套与未来留言'),('community-zine.html','社区共创小志样稿','一期共同出版物的内容与确认方式'),('participation-tools.html','线下参与工具','欢迎卡、活动说明、共创与内容确认卡'),('postcard.svg','文化产品样稿','可下载的矢量明信片'),('handbook.html','项目与系统手册','研究边界、服务蓝图、信息管理与验证记录')]
write('index.html','新邻旧里｜具体产出',["<small>NEW IN OLD / 具体产出</small><h1>这一段生活，<br>可以留下什么。</h1><p>以下是可打开、打印与继续修改的设计样稿。程序内可按本人选择生成实际内容版本。</p>"+''.join(f'<div class="line"></div><h2><a href="{u}">{t} ↗</a></h2><p>{d}</p>' for u,t,d in links)])
print('Generated',len(list(out.iterdir())),'deliverables')
