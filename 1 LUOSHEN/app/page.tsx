"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Activity, AlertTriangle, ArrowLeft, Bath, BellRing, Check, ChevronRight, CircleUserRound, Filter,
  Cloud, Database, Droplets, FileHeart, Gauge, HeartHandshake, Home, Info, Languages,
  LifeBuoy, MapPin, Menu, Network, Phone, Settings2, ShieldAlert, ShieldCheck,
  ShowerHead, Smartphone, Thermometer, Users, Waves, X, Zap,
} from "lucide-react";
import { copy, type Copy, type Language } from "./translations";
import { DeviceGuide, deviceGuideTypes, type RegisteredDevice } from "./device-guide";
import {
  apiConnections, careNetwork, careProfiles, dataMappings, deviceCatalog, devices, supportingCareRecords, householdInsights,
  members, records, sensors, timelineNodes, waterSystemNodes,
} from "./mock-data";

type AuthScreen = "welcome" | "login" | "app";
type MainView = "overview" | "people" | "monitor" | "records" | "member" | "alert" | "admin" | "api" | "regional" | "account";
type MemberTab = "overview" | "profile" | "health" | "planning" | "rules" | "devices" | "network" | "history";
type AlertState = "sent" | "acknowledged" | "handling" | "escalated" | "resolved";
type MonitorView = "timeline" | "system" | "flow";

const pick = <T extends { zh: string; en: string }>(value: T, lang: Language) => value[lang];

function StatusPill({ status, c }: { status: string; c: Copy }) {
  const label = (c.status as Record<string, string>)[status] || status;
  return <span className={`status-pill status-${status}`}><i />{label}</span>;
}

function IconButton({ label, onClick, children, tone = "plain" }: { label: string; onClick: () => void; children: React.ReactNode; tone?: "plain" | "sos" }) {
  return <button aria-label={label} title={label} className={`icon-btn ${tone}`} onClick={onClick}>{children}</button>;
}

function SectionTitle({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return <div className="section-title"><div><h2>{title}</h2>{hint && <p>{hint}</p>}</div>{action}</div>;
}

function MemberPortrait({ id, size = "regular" }: { id: string; size?: "small" | "regular" | "large" }) {
  if (id === "member-2") return <span className={`member-portrait portrait-${size}`}><Image src="/luoshen-manager-portrait.png" fill sizes="96px" alt="" /></span>;
  if (id === "member-3") return <span className={`member-portrait portrait-${size}`}><Image src="/luoshen-child-portrait.png" fill sizes="96px" alt="" /></span>;
  return <span className={`member-portrait portrait-${size}`}><Image src="/luoshen-elder-portrait.png" fill sizes="96px" alt="" /></span>;
}

function SplashScreen({ c, onSkip }: { c: Copy; onSkip: () => void }) {
  return <main className="splash-shell" aria-label={c.brand.name}>
    <button className="splash-skip" onClick={onSkip}>{c.common.skip}</button>
    <div className="splash-ripple" aria-hidden="true"><i /><i /><i /><span /></div>
    <div className="splash-brand"><Image src="/luoshen-logo.png" width={350} height={260} alt="LUOSHEN 洛神" /><strong>{c.brand.name}</strong><small>{c.brand.latin}</small></div>
    <p>{c.brand.line}</p>
  </main>;
}

function Welcome({ lang, setLang, setScreen }: { lang: Language; setLang: (l: Language) => void; setScreen: (s: AuthScreen) => void }) {
  const c = copy[lang];
  return <main className="welcome-shell">
    <button className="language-float" aria-label={lang === "zh" ? "Switch to English" : "切换至中文"} onClick={() => setLang(lang === "zh" ? "en" : "zh")}>{lang === "zh" ? "EN" : "中"}</button>
    <section className="welcome-panel">
      <div className="welcome-brand"><Image src="/luoshen-logo.png" width={350} height={260} alt="LuoShen 洛神 logo" priority /></div>
      <div className="welcome-copy"><h1>{c.welcome.title}</h1></div>
      <div className="welcome-visual" aria-label="Kitchen faucet and household water purifier">
        <Image className="welcome-reference-scene" src="/luoshen-cover-scene-v19.png" width={941} height={1672} alt="Kitchen faucet, under-sink purifier and water meter" priority />
      </div>
      <div className="welcome-actions"><button className="primary-btn" onClick={() => setScreen("login")}>{c.welcome.enter}</button></div>
    </section>
  </main>;
}

function Login({ lang, setLang, setScreen }: { lang: Language; setLang: (l: Language) => void; setScreen: (s: AuthScreen) => void }) {
  const c = copy[lang];
  return <main className="login-shell">
    <div className="login-art">
      <button className="login-back" type="button" onClick={() => setScreen("welcome")} aria-label={c.welcome.backWelcome}><ArrowLeft size={18} /></button>
      <button className="login-language" type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")} aria-label={lang === "zh" ? "Switch to English" : "切换至中文"}>{lang === "zh" ? "EN" : "中"}</button>
      <span className="login-art-curve" aria-hidden="true" />
      <div className="login-art-lockup"><Image src="/luoshen-logo.png" width={350} height={260} alt={c.brand.name} /><span>{c.brand.latin}</span></div>
    </div>
    <section className="login-content">
      <p className="login-kicker">LUOSHEN / 01</p>
      <h1>{c.welcome.signInTitle}</h1>
      <p className="login-description">{c.welcome.signInBody}</p>
      <form className="login-form" onSubmit={(event) => { event.preventDefault(); setScreen("app"); }}>
        <label htmlFor="login-email">{c.welcome.email}<input id="login-email" type="email" name="email" autoComplete="username" placeholder="name@example.com" required /></label>
        <label htmlFor="login-password">{c.welcome.password}<input id="login-password" type="password" name="password" autoComplete="current-password" minLength={1} required /></label>
        <button className="login-submit" type="submit">{c.welcome.login}<ChevronRight size={19} /></button>
      </form>
      <div className="login-waterline" aria-hidden="true"><span /><span /><span /></div>
    </section>
  </main>;
}

function AppHeader({ c, lang, setLang, setView, openSos }: { c: Copy; lang: Language; setLang: (l: Language) => void; setView: (v: MainView) => void; openSos: () => void }) {
  const [menu, setMenu] = useState(false);
  return <header className="app-header"><button className="mini-brand" onClick={() => setView("overview")}><Image src="/luoshen-logo.png" width={350} height={260} alt="" /><span><strong>{c.brand.name}</strong><small>{c.header.household}</small></span></button><div className="header-actions"><button className="lang-chip" onClick={() => setLang(lang === "zh" ? "en" : "zh")}>{lang === "zh" ? "EN" : "中"}</button><button className="api-quick" aria-label={lang === "zh" ? "API 连接" : "API connections"} title={lang === "zh" ? "API 连接" : "API connections"} onClick={() => setView("api")}><Network size={17} /><i /></button><button className="sos-quick" aria-label={c.sos.title} onClick={openSos}><Phone size={18} /><span>{c.header.sos}</span></button><IconButton label={c.header.account} onClick={() => setMenu(!menu)}><Menu size={21} /></IconButton></div>{menu && <div className="header-menu"><button onClick={() => { setView("admin"); setMenu(false); }}><Settings2 size={18} />{c.header.admin}</button><button onClick={() => { setView("account"); setMenu(false); }}><CircleUserRound size={18} />{c.header.account}</button></div>}</header>;
}

function BottomNav({ view, setView, c, frameWidth }: { view: MainView; setView: (v: MainView) => void; c: Copy; frameWidth?: number }) {
  const items = [["overview", c.nav.overview], ["people", c.nav.people], ["monitor", c.nav.monitor], ["records", c.nav.records]] as const;
  return <nav className="bottom-nav" aria-label="Primary" style={frameWidth ? { width: frameWidth - 16 } : undefined}><div>{items.map(([id, label]) => <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}><span className="nav-glyph"><NavGlyph id={id} /></span><span>{label}</span></button>)}</div></nav>;
}

function NavGlyph({ id }: { id: "overview" | "people" | "monitor" | "records" }) {
  if (id === "overview") return <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M5 12.5 14 5l9 7.5v9A2.5 2.5 0 0 1 20.5 24h-13A2.5 2.5 0 0 1 5 21.5Z"/><path d="M11 24v-7h6v7"/></svg>;
  if (id === "people") return <svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="11" cy="9" r="4"/><path d="M4.5 23c.4-5 2.7-7.5 6.5-7.5s6.1 2.5 6.5 7.5"/><circle cx="20.5" cy="10.5" r="2.7"/><path d="M19 16.5c3.3-.2 5 1.8 5.3 5"/></svg>;
  if (id === "monitor") return <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M3 15h5l2.2-7 4.1 13 2.7-9 2 3h6"/><circle cx="14" cy="14" r="11" opacity=".16"/></svg>;
  return <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M6.5 6.5h15v17h-15z"/><path d="M10 4v5M18 4v5M10 13h8M10 17h8M10 21h5"/></svg>;
}

function DeviceGlyph({ kind }: { kind: string }) {
  if (kind === "waterPoint" || kind === "kitchen") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 14h11v-3a3 3 0 0 1 3-3h2"/><path d="M7 14v4m4-4v4M17 5v3m-3-3h6M19 8v6"/><path d="M19 17c1 1.5 1.4 2.2 0 3-1.4-.8-1-1.5 0-3Z"/></svg>;
  if (kind === "temperature" || kind === "heater") return <Thermometer />;
  if (kind === "flow" || kind === "meter" || kind === "pressure") return <Gauge />;
  if (kind === "quality") return <Droplets />;
  if (kind === "filter") return <Filter />;
  if (kind === "leak") return <AlertTriangle />;
  if (kind === "shower") return <ShowerHead />;
  if (kind === "source") return <Waves />;
  return <Droplets />;
}

function FilterGlyph({ kind }: { kind: string }) {
  if (kind === "care") return <HeartHandshake />;
  if (kind === "device") return <Smartphone />;
  if (kind === "system") return <Activity />;
  if (kind === "regional") return <MapPin />;
  if (kind === "sos") return <LifeBuoy />;
  if (kind === "temperature") return <Thermometer />;
  if (kind === "usage") return <Gauge />;
  return <Droplets />;
}

function Overview({ c, lang, setView, selectMember, alertState, setPlanChoice, normalMode = false }: { c: Copy; lang: Language; setView: (v: MainView) => void; selectMember: (id: string) => void; alertState: AlertState; setPlanChoice: (v: string) => void; normalMode?: boolean }) {
  const [planOpen, setPlanOpen] = useState(false);
  const [responseOpen, setResponseOpen] = useState(false);
  return <div className="page-stack overview-page"><section className="page-intro"><div className="waterwordmark overview-wordmark"><Image src="/luoshen-waterwordmark-v11.png" width={2135} height={737} alt="LuoShen" /><span>we care for Your family</span></div><p className="eyebrow">{c.header.greeting}</p><h1>{c.overview.title}</h1><p>{c.overview.subtitle}</p></section><section className="overview-visual" aria-label={lang === "en" ? "Lin household visual overview" : "林家家庭概览"}><Image src="/luoshen-family-reference.png" fill sizes="430px" alt="" /><div className="overview-visual-shade" /><div className="overview-visual-top"><span><Waves size={15} /> {lang === "en" ? "THE LIN HOUSEHOLD" : "林家用水"}</span></div><div className="overview-visual-bottom"><strong>{lang === "en" ? "One home. Different needs." : "一家人，不同的用水需求。"}</strong><span>{lang === "en" ? "Water care across three generations" : "守护三代人的日常用水"}</span></div></section><section className="household-strip"><div className="water-mark"><Waves size={34} /></div><div><small>{c.overview.household}</small><strong>{normalMode ? c.status.stable : c.status.attention}</strong><span>{c.overview.lastCheck}</span></div><div className="house-water-visual" aria-hidden="true"><i><Gauge size={15} /></i><b /><i><Droplets size={15} /></i><b /><i className={normalMode ? "" : "attention-node"}><Thermometer size={15} /></i><b /><i><Home size={15} /></i></div><div className="household-stats"><span><Users size={17} />{c.overview.members}</span><span><BellRing size={17} />{normalMode ? c.member.actionNone : c.overview.attention}</span><span><Droplets size={17} />{c.overview.devices}</span></div></section>
    <section><SectionTitle title={c.overview.attentionTitle} hint={normalMode ? c.member.actionNone : c.overview.attentionHint} />{normalMode ? <div className="success-note all-clear"><ShieldCheck />{c.member.actionNone}</div> : <button className="alert-card compact-alert" onClick={() => setView("alert")}><div className="alert-avatar"><MemberPortrait id="member-1" /></div><div><span className="overline">{c.alerts.activeRisk} · {members[0].name[lang]}</span><strong>{c.alerts.highTempTitle}</strong><div className="alert-meta"><StatusPill status={alertState} c={c} /><span>20:54</span></div></div><ChevronRight size={20} /></button>}</section>
    <WaterInsights c={c} lang={lang} />
    <section><SectionTitle title={c.overview.allMembers} action={<button className="section-link" onClick={() => setView("people")}>{c.common.view}<ChevronRight size={16} /></button>} /><div className="member-scroll">{members.map((m) => <button className="member-card management-card" key={m.id} onClick={() => selectMember(m.id)}><div className="member-card-head"><MemberPortrait id={m.id} /><span><strong>{pick(m.name, lang)}</strong><small>{m.age} {c.member.years} · {pick(m.relation, lang)}</small></span><StatusPill status={m.status} c={c} /></div><div className="tag-row">{m.needs.map((n) => <span key={n.zh}>{pick(n, lang)}</span>)}</div><dl><div><dt>{c.member.currentTemp}</dt><dd>{m.temp}</dd></div><div><dt>{c.member.waterQuality}</dt><dd>{pick(m.quality, lang)}</dd></div><div><dt>{c.member.lastCheck}</dt><dd>{pick(m.lastCheck, lang)}</dd></div></dl><p className={`member-action action-${m.status}`}><HeartHandshake size={16} />{m.status === "attention" ? c.member.actionRequired : c.member.actionNone}</p></button>)}</div></section>
    <section><SectionTitle title={c.overview.quickSummary} /><div className="summary-stack"><button onClick={() => setPlanOpen(!planOpen)}><HeartHandshake /><span><strong>{c.overview.planCount}</strong><small>{c.overview.carePlanningHint}</small></span><ChevronRight className={planOpen ? "rotate" : ""} /></button>{planOpen && <CareSuggestion c={c} kind="night" compact onChoice={setPlanChoice} />}<button onClick={() => setResponseOpen(!responseOpen)}><BellRing /><span><strong>{c.overview.responseCount}</strong><small>{c.overview.response}</small></span><ChevronRight className={responseOpen ? "rotate" : ""} /></button>{responseOpen && <div className="response-row">{careNetwork.slice(0, 2).map((contact) => <div key={contact.id}><span className="avatar small">{pick(contact.name, lang).slice(0, 1)}</span><p><strong>{pick(contact.name, lang)}</strong><small>{(c.member as Record<string, string>)[contact.role]}</small></p><StatusPill status={contact.status} c={c} /></div>)}</div>}</div></section>
    <section className="summary-grid"><button onClick={() => setView("admin")}><div className="summary-icon amber"><Gauge /></div><span><small>{c.overview.systemSummary}</small><strong>{c.overview.systemHealth}</strong><p>{c.overview.systemBody}</p></span><ChevronRight /></button><button onClick={() => setView("regional")}><div className="summary-icon blue"><MapPin /></div><span><small>{c.overview.regional}</small><strong>{c.overview.regionalBody}</strong><p>{c.regional.notice}</p></span><ChevronRight /></button></section>
  </div>;
}

function WaterInsights({ c, lang }: { c: Copy; lang: Language }) {
  const [range, setRange] = useState<"today" | "yesterday" | "week">("today");
  const data = householdInsights.ranges[range];
  const width = 320; const height = 150; const padX = 16; const padTop = 14; const padBottom = 28;
  const min = Math.min(...data.water) * 0.82; const max = Math.max(...data.water) * 1.08;
  const points = data.water.map((value, index) => ({
    x: padX + index * ((width - padX * 2) / (data.water.length - 1)),
    y: padTop + (max - value) / (max - min) * (height - padTop - padBottom),
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padX},${height - padBottom} ${line} ${width - padX},${height - padBottom}`;
  return <section className="insight-card">
    <div className="insight-heading"><div><p>{c.overview.insightsEyebrow}</p><h2>{c.overview.insightsTitle}</h2></div><span className="energy-icon"><Zap size={22} /></span></div>
    <div className="insight-tabs">{(["today", "yesterday", "week"] as const).map((key) => <button className={range === key ? "active" : ""} key={key} onClick={() => setRange(key)}>{c.overview[key]}</button>)}</div>
    <div className="insight-metrics"><div><small>{c.overview.abnormalUses}</small><strong>{data.abnormalUses}{lang === "zh" ? "次" : ""}</strong></div><div><small>{c.overview.energyUse}</small><strong>{data.energyTotal}</strong></div><div><small>{c.overview.peakTime}</small><strong>{data.peak}</strong></div></div>
    <div className="chart-title"><div><strong>{c.overview.waterTrend}</strong><small>{c.overview.chartHint}</small></div><span>{c.common.updated} {householdInsights.updated}</span></div>
    <div className="water-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={c.overview.waterTrend}>
        <defs><linearGradient id="waterArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5d8fa8" stopOpacity=".20" /><stop offset="1" stopColor="#5d8fa8" stopOpacity="0" /></linearGradient><linearGradient id="waterLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8fb8ae" /><stop offset=".62" stopColor="#5d8fa8" /><stop offset="1" stopColor="#477f99" /></linearGradient></defs>
        {[34, 64, 94, 124].map((y) => <line key={y} x1="8" x2="312" y1={y} y2={y} className="chart-grid" />)}
        <polygon points={area} fill="url(#waterArea)" />
        <polyline points={line} fill="none" stroke="url(#waterLine)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => <g key={`${data.labels[index]}-${index}`}><circle cx={point.x} cy={point.y} r="4" fill="white" stroke="#5d8fa8" strokeWidth="2.5" /><text x={point.x} y="144" textAnchor="middle">{data.labels[index]}</text></g>)}
      </svg>
    </div>
    <div className="energy-analysis"><div className="energy-summary"><span><Zap size={18} /></span><div><small>{c.overview.energyAnalysis}</small><strong>{c.overview.energySaved} {data.change}</strong></div></div><div className="energy-bars">{householdInsights.energyBreakdown.map((item) => <div key={item.key}><span>{(c.overview as Record<string,string>)[item.key]}</span><i><b style={{ width: `${item.share}%`, background: item.color }} /></i><em>{item.share}%</em></div>)}</div><p>{c.overview.mockAnalysis}</p></div>
  </section>;
}

function People({ c, lang, selectMember }: { c: Copy; lang: Language; selectMember: (id: string) => void }) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [added, setAdded] = useState<RegisteredDevice[]>([]);
  useEffect(() => { try { setAdded(JSON.parse(window.localStorage.getItem("luoshen-added-devices") || "[]")); } catch { setAdded([]); } }, []);
  const saveDevice = (item: RegisteredDevice) => {
    const next = [item, ...added]; setAdded(next);
    try { window.localStorage.setItem("luoshen-added-devices", JSON.stringify(next)); } catch { /* Keep it in this session when storage is full. */ }
  };
  if (guideOpen) return <DeviceGuide lang={lang} onClose={() => setGuideOpen(false)} onSave={saveDevice} />;
  return <div className="page-stack people-page"><section className="page-intro"><p className="eyebrow">{c.header.household}</p><h1>{c.nav.people}</h1><p>{c.brand.principle}</p></section><section className="people-visual-banner"><div className="people-visual-copy"><small>{lang === "en" ? "HOUSEHOLD CARE" : "家庭关怀"}</small><strong>{lang === "en" ? "Care begins at home." : "从家里开始，照顾每一个人。"}</strong><span>{lang === "en" ? "3 members · 1 needs attention" : "3 位成员 · 1 项需要关注"}</span></div><div className="people-visual-portraits"><MemberPortrait id="member-1" size="large" /><MemberPortrait id="member-2" size="large" /><MemberPortrait id="member-3" size="large" /></div></section><section className="add-device-section"><div className="add-device-head"><span>{lang === "zh" ? "家中设备" : "Devices in this home"}</span><small>{lang === "zh" ? "从真实设备开始" : "Start with your own device"}</small></div><button className="add-device-entry" onClick={() => setGuideOpen(true)}><span className="add-device-entry-photo"><Image src="/devices/clean_Water_Purifier.jpg" fill sizes="100px" alt="" /></span><span className="add-device-entry-copy"><small>{lang === "zh" ? "手动或拍照" : "MANUAL OR PHOTO"}</small><strong>{lang === "zh" ? "添加用水设备" : "Add a water device"}</strong><em>{lang === "zh" ? "选择设备类型或拍照识别，再确认连接状态" : "Choose a type or use a photo, then confirm what’s connected."}</em></span><ChevronRight size={19} /></button>{added.length > 0 && <div className="added-device-list">{added.map(item => { const kind = deviceGuideTypes.find(t => t.id === item.type) || deviceGuideTypes[0]; return <div className="added-device" key={item.id}><span className="added-device-photo"><Image src={item.photo || kind.image} fill sizes="50px" alt="" /></span><span><strong>{kind[lang]}</strong><small>{item.connection === "pending" ? (lang === "zh" ? "等待授权连接" : "Awaiting connection approval") : (lang === "zh" ? "已添加 · 未连接" : "Added · not connected")}</small></span></div>; })}</div>}</section><div className="people-list">{members.map((m) => <button className={`family-tone family-tone-${m.status}`} key={m.id} onClick={() => selectMember(m.id)}><MemberPortrait id={m.id} size="large" /><div className="people-main"><div><strong>{pick(m.name, lang)}</strong><StatusPill status={m.status} c={c} /></div><p>{m.age} {c.member.years} · {pick(m.relation, lang)}</p><div className="tag-row">{m.needs.map((n) => <span key={n.zh}>{pick(n, lang)}</span>)}</div><dl><span>{c.member.currentTemp}<b>{m.temp}</b></span><span>{c.member.waterQuality}<b>{pick(m.quality, lang)}</b></span><span>{c.member.lastCheck}<b>{pick(m.lastCheck, lang)}</b></span></dl><small className="family-card-action"><HeartHandshake size={15} />{m.status === "attention" ? c.member.actionRequired : c.member.actionNone}</small></div><ChevronRight size={20} /></button>)}</div></div>;
}

function MemberDetail({ c, lang, id, goBack, openAlert, setPlanChoice, initialTab = "overview" }: { c: Copy; lang: Language; id: string; goBack: () => void; openAlert: () => void; setPlanChoice: (v: string) => void; initialTab?: MemberTab }) {
  const [tab, setTab] = useState<MemberTab>(initialTab); const member = members.find((m) => m.id === id) || members[0]; const profile = careProfiles["member-1"];
  const tabs: [MemberTab, string][] = [["overview", c.member.overview], ["profile", c.member.profile], ["health", c.member.health], ["planning", c.member.planning], ["rules", c.member.rules], ["devices", c.member.devices], ["network", c.member.careNetwork], ["history", c.member.history]];
  return <div className="page-stack detail-page"><button className="back-link" onClick={goBack}><ArrowLeft size={17} />{c.common.back}</button><section className="member-hero"><MemberPortrait id={member.id} size="large" /><div><p>{member.age} {c.member.years} · {pick(member.relation, lang)}</p><h1>{pick(member.name, lang)}</h1><div className="tag-row">{member.needs.map((n) => <span key={n.zh}>{pick(n, lang)}</span>)}</div></div><StatusPill status={member.status} c={c} /></section><div className="tab-scroller">{tabs.map(([key, label]) => <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{label}</button>)}</div>
    {tab === "overview" && <><div className="metric-grid"><Metric tone="temperature" icon={<Thermometer />} label={c.member.currentTemp} value={member.temp} /><Metric tone="quality" icon={<Droplets />} label={c.member.waterQuality} value={pick(member.quality, lang)} /><Metric tone="device" icon={<Smartphone />} label={c.member.device} value={pick(member.device, lang)} /><Metric tone="usage" icon={<Activity />} label={c.member.routine} value={pick(member.routine, lang)} /></div>{member.alerts > 0 && <button className="inline-alert" onClick={openAlert}><AlertTriangle /><span><strong>{c.member.activeAlerts}</strong><small>{c.alerts.highTempTitle}</small></span><ChevronRight /></button>}<InfoCard title={c.member.network} rows={[[c.member.primary, pick(careNetwork[0].name, lang)], [c.member.secondary, pick(careNetwork[1].name, lang)], [c.member.emergency, pick(careNetwork[2].name, lang)]]} /></>}
    {tab === "profile" && <><InfoCard title={c.member.info} rows={[[c.welcome.name, pick(member.name, lang)], [c.welcome.household, c.header.household], [c.member.careNeeds, member.needs.map((n) => pick(n, lang)).join(" · ")]]} /><InfoCard title={c.member.profile} rows={[[c.member.comfort, profile.comfort], [c.member.highTemp, profile.highTemp], [c.member.sensitivity, pick(profile.sensitivity, lang)], [c.member.typical, profile.typical], [c.member.night, profile.night ? c.common.enabled : c.common.disabled], [c.member.noUse, profile.noUse]]} /><InfoCard title={c.member.baseline} rows={[[c.member.baseline, profile.baseline], [c.member.confidence, profile.confidence]]} /></>}
    {tab === "health" && <><div className="record-cards">{supportingCareRecords.map((record) => <article key={record.id}><FileHeart /><div><small>{record.date} · {pick(record.source, lang)}</small><strong>{pick(record.title, lang)}</strong><p>{pick(record.note, lang)}</p></div></article>)}</div><p className="boundary-note"><ShieldCheck />{c.common.noDiagnosis}</p></>}
    {tab === "planning" && <><CareSuggestion c={c} kind="night" onChoice={setPlanChoice} /><CareSuggestion c={c} kind="temp" onChoice={setPlanChoice} /></>}
    {tab === "rules" && <div className="rule-cards"><ToggleRule c={c} title={c.planning.nightTitle} detail="20:00–08:00 · 25 min" defaultOn /><ToggleRule c={c} title={c.member.highTemp} detail={`≥ ${profile.highTemp} · 2 min`} defaultOn /><ToggleRule c={c} title={c.member.noUse} detail={profile.noUse} /></div>}
    {tab === "devices" && <div className="device-list">{devices.filter((d) => d.memberId === member.id).map((d) => <article key={d.id}><span className="device-list-icon"><DeviceGlyph kind={d.id === "dev-1" ? "heater" : d.id === "dev-2" ? "flow" : d.id === "dev-3" ? "quality" : d.id === "dev-4" ? "temperature" : "meter"} /></span><div><strong>{pick(d.name, lang)}</strong><small>{pick(d.room, lang)} · v{d.firmware}</small></div><StatusPill status={d.health} c={c} /></article>)}</div>}
    {tab === "network" && <CareNetwork c={c} lang={lang} />}
    {tab === "history" && <div className="record-timeline">{records.filter((record) => record.type === "care").map((record) => <article key={record.id}><span className="record-icon care"><HeartHandshake /></span><div><small>{record.time} · {c.records.care}</small><strong>{(c.records as Record<string, string>)[record.titleKey]}</strong><StatusPill status={record.status} c={c} /></div></article>)}</div>}
  </div>;
}

function Metric({ icon, label, value, tone = "quality" }: { icon: React.ReactNode; label: string; value: string; tone?: "temperature" | "quality" | "usage" | "device" }) {
  const match = value.match(/^([\d.]+)\s*(°C|ppm|L\/min|kWh)?$/);
  return <div className={`metric-card metric-${tone}`}><span>{icon}</span><small>{label}</small><strong>{match ? match[1] : value}{match?.[2] && <em>{match[2]}</em>}</strong><i aria-hidden="true" /></div>;
}
function InfoCard({ title, rows }: { title: string; rows: string[][] }) { return <section className="info-card"><h2>{title}</h2><dl>{rows.map(([a, b]) => <div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl></section>; }
function ToggleRule({ c, title, detail, defaultOn = false }: { c: Copy; title: string; detail: string; defaultOn?: boolean }) { const [on, setOn] = useState(defaultOn); return <button onClick={() => setOn(!on)}><span><strong>{title}</strong><small>{detail}</small></span><i className={`switch ${on ? "on" : ""}`}><b /></i><em>{on ? c.common.enabled : c.common.disabled}</em></button>; }
function CareNetwork({ c, lang }: { c: Copy; lang: Language }) { return <div className="network-list">{careNetwork.map((contact) => <article key={contact.id}><div className="network-rank">{contact.priority}</div><span className="avatar">{pick(contact.name, lang).slice(0, 1)}</span><div><strong>{pick(contact.name, lang)}</strong><small>{(c.member as Record<string, string>)[contact.role]}</small><p>{c.member.permissions}: {pick(contact.permissions, lang)}</p><p>{c.member.escalationDelay}: {contact.delay}</p></div><div><StatusPill status={contact.availability} c={c} /><StatusPill status={contact.status} c={c} /></div></article>)}</div>; }

function CareSuggestion({ c, kind, compact = false, onChoice }: { c: Copy; kind: "night" | "temp"; compact?: boolean; onChoice: (v: string) => void }) {
  const [choice, setChoice] = useState(""); const [adjusting, setAdjusting] = useState(false); const title = kind === "night" ? c.planning.nightTitle : c.planning.tempTitle; const body = kind === "night" ? c.planning.nightBody : c.planning.tempBody;
  const choose = (value: string) => { if (value === "adjusted") setAdjusting(true); else { setChoice(value); onChoice(value); } };
  return <article className={`care-card ${compact ? "compact" : ""}`}><div className="care-card-head"><span><HeartHandshake size={20} /></span><div><small>{c.planning.new}</small><strong>{title}</strong></div></div><p>{body}</p><p className="ai-advice-note"><Info size={14} />{c.admin.factBoundary}</p>{choice ? <div className="success-note"><Check size={17} />{(c.planning as Record<string, string>)[choice]}</div> : <div className="button-row"><button onClick={() => choose("accepted")}>{c.planning.accept}</button><button onClick={() => choose("adjusted")}>{c.planning.adjust}</button><button onClick={() => choose("deferred")}>{c.planning.notNow}</button></div>}{adjusting && <div className="adjust-box"><strong>{c.planning.adjustTitle}</strong><label>{c.planning.range}<select><option>20:00–08:00</option><option>22:00–07:00</option></select></label><label>{c.planning.recipients}<select><option>{c.member.primary} + {c.member.secondary}</option><option>{c.member.primary}</option></select></label><button onClick={() => { setAdjusting(false); setChoice("adjusted"); onChoice("adjusted"); }}>{c.planning.apply}</button></div>}</article>;
}

function AlertDetail({ c, lang, state, setState, goBack, notify }: { c: Copy; lang: Language; state: AlertState; setState: (s: AlertState) => void; goBack: () => void; notify: (s: string) => void }) {
  const steps = ["sent", state === "sent" ? "pending" : "viewed", ["acknowledged", "handling", "escalated", "resolved"].includes(state) ? "acknowledged" : "pending", state === "escalated" ? "escalated" : state === "resolved" ? "resolved" : "pending"]; const action = (s: AlertState, message: string) => { setState(s); notify(message); };
  return <div className="page-stack detail-page"><button className="back-link" onClick={goBack}><ArrowLeft />{c.common.back}</button><section className="alert-detail-hero"><MemberPortrait id="member-1" size="large" /><div><p>{c.alerts.activeRisk} · {members[0].name[lang]}</p><h1>{c.alerts.highTempTitle}</h1><StatusPill status={state} c={c} /></div><div className="alert-reading-visual"><div className="alert-reading-top"><span><Thermometer size={17} />{lang === "en" ? "BATHROOM · WATER TEMPERATURE" : "浴室 · 水温"}</span></div><div className="alert-reading-values"><span>41<small>°C</small></span><i>→</i><strong>49<small>°C</small></strong></div><div className="alert-reading-track"><i /></div><p>{lang === "en" ? "Sustained for 2 min · Local heater reading" : "持续 2 分钟 · 本地热水器读数"}</p></div></section><section className="alert-explain"><p>{c.alerts.highTempBody}</p><div><ShieldCheck />{c.alerts.verified}</div><dl><div><dt>{c.alerts.trigger}</dt><dd>{c.alerts.triggerValue}</dd></div><div><dt>{c.common.source}</dt><dd>{pick(devices[0].name, lang)} · {sensors[0].value}{sensors[0].unit}</dd></div></dl></section><section className="response-warning"><Info />{c.alerts.notHandling}</section><section><SectionTitle title={c.alerts.timeline} /><div className="event-steps">{steps.map((s, i) => <div key={i} className={s !== "pending" ? "done" : ""}><span>{s !== "pending" ? <Check /> : i + 1}</span><p><strong>{(c.status as Record<string, string>)[s]}</strong><small>{i === 0 ? "20:54" : i === 1 ? "20:55" : "—"}</small></p></div>)}</div></section><div className="sticky-actions">{state === "sent" && <button className="primary-btn" onClick={() => action("acknowledged", c.toast.acknowledged)}>{c.alerts.acknowledge}</button>}{state === "acknowledged" && <button className="primary-btn" onClick={() => setState("handling")}>{c.alerts.startHandling}</button>}{state !== "resolved" && <button className="secondary-btn danger-outline" onClick={() => action("escalated", c.toast.escalated)}>{c.alerts.escalate}</button>}{["handling", "escalated"].includes(state) && <button className="secondary-btn" onClick={() => action("resolved", c.toast.resolved)}>{c.alerts.markResolved}</button>}</div>{state === "escalated" && <div className="success-note"><BellRing />{c.alerts.escalationDone}</div>}<p className="boundary-note"><ShieldAlert />{c.alerts.escalationWarning}</p></div>;
}

function DrinkingWaterCheck({ c, lang, onOpen }: { c: Copy; lang: Language; onOpen: () => void }) {
  const tds = sensors.find((sensor) => sensor.id === "sensor-tds");
  return <button className="drinking-check" onClick={onOpen}>
    <span className="drinking-check-photo"><Image src="/scene-filter-v11.png" fill sizes="150px" alt="" /></span>
    <span className="drinking-check-copy">
      <small>{lang === "en" ? "KITCHEN · DRINKING WATER" : "厨房 · 饮用水"}</small>
      <strong>{lang === "en" ? "Water quality check" : "饮用水水质检查"}</strong>
      <span className="drinking-check-reading"><b>{tds?.value ?? "—"}</b><em>{tds?.unit ?? "ppm"} TDS</em><span><Check size={14} />{c.status.normal}</span></span>
      <span className="drinking-check-source">{lang === "en" ? "Filter sensor · checked 3 min ago" : "净水器传感器 · 3 分钟前检查"}</span>
    </span>
    <ChevronRight className="drinking-check-arrow" size={18} />
  </button>;
}

function Monitor({ c, lang, openAlert, initialView = "system" }: { c: Copy; lang: Language; openAlert: () => void; initialView?: MonitorView }) {
  const [view, setMonitorView] = useState<MonitorView>(initialView); const [openStep, setOpenStep] = useState<number | null>(null); const [filter, setFilter] = useState("all"); const [period, setPeriod] = useState("h24"); const [node, setNode] = useState<{ row: number; col: number; status: string } | null>(null); const [systemNode, setSystemNode] = useState<number | null>(null); const filters = Object.entries(c.monitor.filters); const periods = Object.entries(c.monitor.periods); const labels = period === "h24" ? ["00", "04", "08", "12", "16", "20"] : period === "d7" ? ["M", "T", "W", "T", "F", "S"] : ["1", "6", "12", "18", "24", "30"];
  const filteredNodes: string[][] = filter === "all" ? timelineNodes : filter === "temperature" ? timelineNodes.map((row, index) => row.map((_, col) => index === 0 && col === 5 ? "attention" : col === 2 ? "change" : "normal")) : filter === "quality" ? timelineNodes.map((row, index) => row.map((_, col) => index === 1 && col === 4 ? "change" : "normal")) : filter === "usage" ? timelineNodes.map((row, index) => row.map((_, col) => index === 0 && col === 5 ? "change" : "normal")) : timelineNodes.map((row, index) => row.map((_, col) => index === 2 && col === 1 ? "missing" : "normal"));
  const flowSteps = [c.monitor.externalSource, c.monitor.infrastructure, c.monitor.collection, c.monitor.personalRules, c.monitor.networkResponse];
  const nodeIcon = (icon: string) => icon === "bath" ? <Bath /> : <DeviceGlyph kind={icon} />;
  const flowIcon = (index: number) => index === 0 ? <Waves /> : index === 1 ? <Home /> : index === 2 ? <Gauge /> : index === 3 ? <CircleUserRound /> : index === 4 ? <ShieldAlert /> : index === 5 ? <BellRing /> : <Users />;
  return <div className="page-stack"><section className="page-intro"><p className="eyebrow">{c.nav.monitor}</p><h1>{lang === "zh" ? "总体信息记录" : "Household Information"}</h1><p>{c.monitor.subtitle}</p></section><div className="monitor-map-intro"><span><Waves size={18} />{lang === "en" ? "7 household checkpoints" : "7 个家庭监测点"}</span><strong>{lang === "en" ? "Explore the water system by room" : "按房间探索家庭水系统"}</strong></div><div className="monitor-tabs segmented"><button className={view === "timeline" ? "active" : ""} onClick={() => setMonitorView("timeline")}>{c.monitor.timelineView}</button><button className={view === "system" ? "active" : ""} onClick={() => setMonitorView("system")}>{c.monitor.systemView}</button><button className={view === "flow" ? "active" : ""} onClick={() => setMonitorView("flow")}>{c.monitor.flowView}</button></div>
    {view === "timeline" && <><div className="control-row"><div className="segmented period-segmented">{periods.map(([k, v]) => <button className={period === k ? "active" : ""} key={k} onClick={() => setPeriod(k)}>{v}</button>)}</div><div className="filter-scroll monitor-filter-scroll">{filters.map(([k, v]) => <button className={`filter-chip chip-${k} ${filter === k ? "active" : ""}`} key={k} onClick={() => { setFilter(k); setNode(null); }}><FilterGlyph kind={k} />{v}</button>)}</div></div><div className="quality-banner"><AlertTriangle /><span><strong>{c.status.reduced}</strong><small>{c.monitor.qualityReduced}</small></span></div><section className="matrix-card"><div className="matrix-head"><span />{labels.map((x, i) => <span key={`${x}-${i}`}>{x}</span>)}</div>{members.map((m, r) => <div className="matrix-row" key={m.id}><span className="matrix-person"><MemberPortrait id={m.id} size="small" /><small>{pick(m.name, lang)}</small></span>{filteredNodes[r].map((s, col) => <button aria-label={`${pick(m.name, lang)} ${labels[col]} ${(c.monitor as unknown as Record<string, string>)[s]}`} className={`node node-${s}`} onClick={() => setNode({ row: r, col, status: s })} key={`${r}-${col}`}><i /></button>)}</div>)}<div className="matrix-legend">{["normal", "change", "attention", "missing"].map((s) => <span key={s}><i className={`node-${s}`} />{(c.monitor as unknown as Record<string, string>)[s]}</span>)}</div></section><section className="conflict-card"><Database /><div><StatusPill status="conflict" c={c} /><strong>{c.monitor.conflictTitle}</strong><p>{c.monitor.conflictBody}</p></div></section></>}
    {view === "system" && <DrinkingWaterCheck c={c} lang={lang} onOpen={() => setSystemNode(2)} />}
    {view === "system" && <section className="water-map reference-system"><SectionTitle title={c.monitor.systemTitle} hint={c.monitor.systemHint} /><div className="plan-caption"><span>{c.monitor.roomMap}</span><b>{lang === "en" ? "3 shown · 7 total" : "展示 3 个 · 共 7 个"}</b></div><div className="household-plan reference-plan" aria-label={c.monitor.systemTitle}><Image src="/luoshen-system-reference-v11.jpeg" width={753} height={1389} alt={lang === "en" ? "Illustrative room plan with shower, kitchen filter and main inlet" : "示意户型图，展示花洒、厨房净水器和入户阀"} /><button className="reference-hotspot hotspot-shower" aria-label={lang === "en" ? "Inspect shower and heater reading" : "查看花洒和热水器读数"} onClick={() => setSystemNode(3)} /><button className="reference-hotspot hotspot-filter" aria-label={lang === "en" ? "Inspect kitchen filter" : "查看厨房净水器"} onClick={() => setSystemNode(2)} /><button className="reference-hotspot hotspot-inlet" aria-label={lang === "en" ? "Inspect main inlet" : "查看入户供水"} onClick={() => setSystemNode(0)} /></div><div className="reference-devices">{[{ id:3, photo:"shower", title:{en:"Shower",zh:"花洒"}, reading:"49°C", status:"attention" },{ id:2, photo:"filter", title:{en:"Kitchen filter",zh:"厨房净水"}, reading:"118 ppm", status:"healthy" },{ id:0, photo:"inlet", title:{en:"Main inlet",zh:"入户供水"}, reading:lang === "en" ? "Connected" : "已连接", status:"healthy" }].map((item) => <button key={item.photo} className={`reference-device-card scene-${item.photo}`} onClick={() => setSystemNode(item.id)}><span className={`reference-device-photo photo-${item.photo}`} aria-hidden="true"><span className={`reference-photo-badge ${item.status === "attention" ? "badge-attention" : "badge-normal"}`}>{item.status === "attention" ? <AlertTriangle size={14} /> : <Check size={14} />}</span></span><strong>{item.title[lang]}</strong><b>{item.reading}</b><span className="reference-device-status">{item.status === "attention" ? c.status.attention : c.status.normal}<ChevronRight size={16} /></span></button>)}</div><button className="reference-attention-member" onClick={openAlert}><MemberPortrait id="member-1" size="large" /><span><strong>{pick(members[0].name,lang)}</strong><small>{lang === "en" ? "Needs attention · Main bathroom" : "需要关注 · 主浴室"}</small></span><span className="attention-watermark"><HeartHandshake size={23} /></span><ChevronRight size={18} /></button></section>}
    {view === "flow" && <section className="care-flow"><SectionTitle title={c.monitor.flowTitle} hint={c.monitor.flowHint} /><div className="flow-track">{flowSteps.map((step, index) => <div className={`flow-entry flow-entry-${index}`} key={step}><button type="button" className="flow-item" aria-expanded={openStep === index} onClick={() => setOpenStep(openStep === index ? null : index)}><div className={`flow-visual flow-visual-${index}`}><span>{flowIcon(index)}</span></div><div><small>STEP {String(index + 1).padStart(2, "0")}</small><strong>{step}</strong><em>{c.monitor.flowTags[index]}</em></div><ChevronRight className={openStep === index ? "rotate" : ""} /></button>{openStep === index && <div className="flow-detail"><span>{lang === "zh" ? ["主进水阀 · 区域供水公告", "净水器 · 热水器 · 家庭管路", "水温 · TDS · 流量读数", "个人阈值 · 提醒时段", "提醒送达 · 确认 · 升级通知"][index] : ["Main inlet · regional supply notice", "Filter · heater · household pipes", "Temperature · TDS · flow readings", "Personal thresholds · alert hours", "Delivered · acknowledged · escalated"][index]}</span><small>{lang === "zh" ? ["查看水源与供水信息", "查看设备与水路", "查看测量时间与来源", "查看成员用水设置", "查看家人的响应状态"][index] : ["Inspect supply information", "Inspect devices and water path", "Inspect timestamps and sources", "Inspect member settings", "Inspect family response status"][index]}</small></div>}</div>)}</div></section>}
    {node && <div className="sheet-backdrop" onClick={() => setNode(null)}><article className="bottom-sheet" onClick={(e) => e.stopPropagation()}><button className="sheet-close" onClick={() => setNode(null)}><X /></button><div className={`node-large node-${node.status}`}><i /></div><p className="eyebrow">{c.monitor.node}</p><h2>{pick(members[node.row].name, lang)} · {labels[node.col]}</h2><StatusPill status={node.status === "attention" ? "attention" : node.status} c={c} /><InfoCard title={c.common.details} rows={[[c.monitor.value, node.status === "attention" ? "49°C" : node.status === "missing" ? "—" : "41°C"], [c.common.source, node.status === "missing" ? pick(devices[1].name, lang) : pick(devices[0].name, lang)], [c.monitor.rule, node.status === "attention" ? c.alerts.triggerValue : c.status.normal]]} />{node.status === "attention" && <button className="primary-btn" onClick={openAlert}>{c.monitor.related}<ChevronRight /></button>}</article></div>}{systemNode !== null && <div className="sheet-backdrop device-sheet-backdrop" onClick={() => setSystemNode(null)}><article className="bottom-sheet device-bottom-sheet" onClick={(e) => e.stopPropagation()}><button className="sheet-close" onClick={() => setSystemNode(null)}><X /></button><div className="device-sheet-handle" /><div className="device-sheet-photo">{[0,2,3].includes(systemNode) ? <span className={`reference-device-photo photo-${systemNode === 3 ? "shower" : systemNode === 2 ? "filter" : "inlet"}`} role="img" aria-label={pick(waterSystemNodes[systemNode].name, lang)} /> : <Image src={waterSystemNodes[systemNode].image} alt={pick(waterSystemNodes[systemNode].name, lang)} fill sizes="360px" />}</div><div className="device-sheet-head"><span className={`system-icon node-state-${waterSystemNodes[systemNode].status}`}>{nodeIcon(waterSystemNodes[systemNode].icon)}</span><div><p className="eyebrow">{c.deviceSheet.title}</p><h2>{pick(waterSystemNodes[systemNode].name, lang)}</h2><small>{pick(waterSystemNodes[systemNode].detail, lang)}</small></div><StatusPill status={waterSystemNodes[systemNode].status} c={c} /></div><div className="device-detail-grid"><div><small>{c.deviceSheet.room}</small><strong>{pick(waterSystemNodes[systemNode].room, lang)}</strong></div><div><small>{c.deviceSheet.current}</small><strong>{waterSystemNodes[systemNode].value === "Normal" ? c.status.normal : waterSystemNodes[systemNode].value}</strong></div><div><small>{c.deviceSheet.status}</small><strong>{(c.status as Record<string, string>)[waterSystemNodes[systemNode].status]}</strong></div><div><small>{c.deviceSheet.lastCheck}</small><strong>{lang === "zh" ? `${waterSystemNodes[systemNode].lastCheck} 分钟前` : `${waterSystemNodes[systemNode].lastCheck} min ago`}</strong></div></div><div className="device-source-row"><Database /><span><small>{c.deviceSheet.dataSource}</small><strong>{pick(waterSystemNodes[systemNode].source, lang)}</strong></span></div>{systemNode >= 3 && <div className="member-links"><small>{c.monitor.linkedMember}</small>{members.map((m) => <span key={m.id}><MemberPortrait id={m.id} size="small" />{pick(m.name, lang)}</span>)}</div>}</article></div>}</div>;
}

function Records({ c, lang }: { c: Copy; lang: Language }) {
  const [filter, setFilter] = useState("all");
  const types = ["all", "care", "quality", "device", "system", "regional", "sos"];
  const recordIcon = (type: string) => type === "care" ? <HeartHandshake /> : type === "quality" ? <Droplets /> : type === "device" ? <Filter /> : type === "regional" ? <MapPin /> : type === "sos" ? <LifeBuoy /> : <Activity />;
  return <div className="page-stack records-page">
    <section className="page-intro"><p className="eyebrow">LUOSHEN</p><h1>{c.nav.records}</h1></section>
    <div className="filter-scroll record-filter-scroll">{types.map((t) => <button className={`filter-chip chip-${t} ${filter === t ? "active" : ""}`} key={t} onClick={() => setFilter(t)}><FilterGlyph kind={t} />{t === "all" ? c.common.all : (c.records as Record<string, string>)[t]}</button>)}</div>
    <section className="record-stage">
      <div className="record-stage-head"><span><small>{lang === "en" ? "TODAY" : "今天"}</small><strong>{lang === "en" ? "Water & care" : "家庭用水与照护"}</strong></span><Image src="/luoshen-record-lotus-v20.png" width={96} height={96} alt="" /></div>
      <div className="record-timeline">{records.filter((r) => filter === "all" || r.type === filter).map((r) => <article className={`record-entry record-${r.type}`} key={r.id}>
        <time className="record-time">{r.time}</time><span className="record-bead" aria-hidden="true" />
        <div className="record-event-card"><span className="record-lotus" aria-hidden="true" /><span className="record-event-icon">{recordIcon(r.type)}</span><div className="record-event-copy"><small>{(c.records as Record<string, string>)[r.type]}</small><strong>{(c.records as Record<string, string>)[r.titleKey]}</strong><p>{pick(r.detail, lang)}</p><StatusPill status={r.status} c={c} /></div><span className="record-event-art"><Image src={r.art} fill sizes="100px" alt="" /></span></div>
      </article>)}</div>
    </section>
  </div>;
}

function Admin({ c, lang, goBack, initialTab = "data" }: { c: typeof copy.zh; lang: Language; goBack: () => void; initialTab?: string }) {
  const [tab, setTab] = useState(initialTab); const [advanced, setAdvanced] = useState<string | null>(null); const tabs = [["roles", c.admin.roles], ["data", c.admin.data], ["connections", c.admin.connections], ["privacy", c.admin.privacy]];
  return <div className="page-stack detail-page"><button className="back-link" onClick={goBack}><ArrowLeft />{c.common.back}</button><section className="page-intro"><p className="eyebrow">{c.header.admin}</p><h1>{c.admin.title}</h1><p>{c.admin.subtitle}</p></section><div className="tab-scroller">{tabs.map(([k, v]) => <button className={tab === k ? "active" : ""} key={k} onClick={() => setTab(k)}>{v}</button>)}</div>{tab === "roles" && <><InfoCard title={c.admin.household} rows={[[c.welcome.household, c.header.household], [c.member.primary, pick(careNetwork[0].name, lang)], [c.member.secondary, "1"], [c.member.emergency, "1"]]} /><CareNetwork c={c} lang={lang} /></>}{tab === "data" && <><SectionTitle title={c.admin.devices} /><div className="device-list">{devices.map((d) => <article key={d.id}><span className="device-list-icon"><DeviceGlyph kind={d.id === "dev-1" ? "heater" : d.id === "dev-2" ? "flow" : d.id === "dev-3" ? "quality" : d.id === "dev-4" ? "temperature" : "meter"} /></span><div><strong>{pick(d.name, lang)}</strong><small>{pick(d.room, lang)} · v{d.firmware}</small></div><StatusPill status={d.health} c={c} /></article>)}</div><SectionTitle title={c.admin.deviceCatalog} hint={c.admin.deviceCatalogHint} /><div className="device-catalog">{deviceCatalog.map((item) => <article key={item.id} className={`device-catalog-card device-tone-${item.icon}`}><div className="device-photo"><Image src={item.image} alt={pick(item.name, lang)} fill sizes="(max-width: 430px) 44vw, 180px" /></div><div className="device-catalog-copy"><span><DeviceGlyph kind={item.icon} /></span><div><strong>{pick(item.name, lang)}</strong><small>{pick(item.dataType, lang)}</small></div></div><StatusPill status={item.status} c={c} /></article>)}</div><SectionTitle title={c.admin.mappingTitle} /><div className="mapping-table"><div><b>{c.admin.signal}</b><b>{c.admin.mappedSource}</b><b>{c.admin.purpose}</b></div>{dataMappings.map((m) => <div key={m.signal.zh}><span>{pick(m.signal, lang)}</span><span>{pick(m.source, lang)}</span><span>{pick(m.purpose, lang)}</span></div>)}</div></>}{tab === "connections" && <><p className="boundary-note"><Network />{lang === "zh" ? "接口信息与连接状态；当前尚未接入外部服务。" : "Endpoint details and connection status; external services are not connected."}</p><div className="api-list">{apiConnections.map((api) => <article key={api.id}><div className="api-main"><Network /><span><strong>{(c.admin as Record<string, string>)[api.serviceKey]}</strong><small>{lang === "zh" ? "尚未接入" : "Not connected"}</small></span><StatusPill status={api.health} c={c} /></div><button className="section-link" onClick={() => setAdvanced(advanced === api.id ? null : api.id)}>{c.admin.advanced}<ChevronRight /></button>{advanced === api.id && <dl className="advanced-grid"><div><dt>{c.admin.endpoint}</dt><dd>{api.endpoint}</dd></div><div><dt>{c.admin.webhook}</dt><dd>{api.webhook}</dd></div><div><dt>{c.admin.lastResponse}</dt><dd>{api.lastResponse}</dd></div><div><dt>{c.admin.errorLog}</dt><dd>{api.error}</dd></div></dl>}</article>)}</div></>}{tab === "privacy" && <div className="rule-cards"><ToggleRule c={c} title={c.admin.notifications} detail="Medium+ · App" defaultOn /><ToggleRule c={c} title={c.admin.escalation} detail="5 min · Secondary" defaultOn /><ToggleRule c={c} title={c.admin.consent} detail={c.header.household} defaultOn /><ToggleRule c={c} title={c.admin.audit} detail={c.common.enabled} defaultOn /></div>}</div>;
}

function Regional({ c, safeMode, setSafeMode, goBack, notify }: { c: typeof copy.zh; safeMode: boolean; setSafeMode: (v: boolean) => void; goBack: () => void; notify: (s: string) => void }) { return <div className="page-stack detail-page"><button className="back-link" onClick={goBack}><ArrowLeft />{c.common.back}</button><section className="page-intro"><p className="eyebrow">{c.overview.regional}</p><h1>{c.regional.title}</h1><p>{c.regional.subtitle}</p></section><article className="regional-card"><div className="source-row"><span><MapPin />{c.regional.trusted}</span><small>{c.regional.published}</small></div><h2>{c.regional.notice}</h2><p>{c.regional.official}</p><dl><div><dt>{c.regional.area}</dt><dd>{c.regional.areaValue}</dd></div><div><dt>{c.regional.relevance}</dt><dd>{c.regional.relevanceValue}</dd></div><div><dt>{c.regional.local}</dt><dd>{c.regional.localValue}</dd></div></dl><div className="ai-note"><Info /><span><strong>{c.regional.aiSummary}</strong><p>{c.regional.aiBody}</p></span></div></article><article className={`safe-mode-card ${safeMode ? "active" : ""}`}><div><ShieldAlert /><span><strong>{c.regional.safeMode}</strong><p>{c.regional.safeBody}</p></span></div>{safeMode && <div className="safe-mode-state"><StatusPill status="handling" c={c} /><strong>{c.regional.active}</strong></div>}<button className={safeMode ? "secondary-btn" : "primary-btn"} onClick={() => { setSafeMode(!safeMode); notify(safeMode ? c.toast.safeOff : c.toast.safeOn); }}>{safeMode ? c.regional.disable : c.regional.enable}</button></article></div>; }

function Account({ c, lang, setLang, goBack, signOut }: { c: typeof copy.zh; lang: Language; setLang: (l: Language) => void; goBack: () => void; signOut: () => void }) {
  return <div className="page-stack detail-page">
    <button className="back-link" onClick={goBack}><ArrowLeft />{c.common.back}</button>
    <section className="page-intro"><p className="eyebrow">{c.header.account}</p><h1>{c.account.title}</h1></section>
    <section className="account-profile"><MemberPortrait id="member-2" size="large" /><div><strong>{lang === "zh" ? "林惠敏" : "Wai-man Lin"}</strong><small>{c.member.primary}</small></div></section>
    <section className="language-card"><div><Languages /><span><strong>{c.account.language}</strong><small>{lang === "zh" ? "中文" : "English"}</small></span></div><div className="segmented"><button className={lang === "zh" ? "active" : ""} onClick={() => setLang("zh")}>中文</button><button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>English</button></div></section>
    <button className="signout-btn" onClick={signOut}>{c.account.signOut}</button>
  </div>;
}

function SosModal({ c, onClose }: { c: typeof copy.zh; onClose: () => void }) {
  const [action, setAction] = useState<string | null>(null); const [sent, setSent] = useState(false);
  const choose = (value: string) => { setAction(value); setSent(false); };
  const confirm = () => { setSent(true); };
  return <div className="modal-backdrop"><section className="sos-modal contact-modal"><button className="sheet-close" onClick={onClose}><X /></button><div className="sos-title-row"><div className="sos-emblem"><LifeBuoy /></div><div><p className="eyebrow">SOS</p><h1>{c.sos.title}</h1><span>{c.sos.chooseAction}</span></div></div>{sent ? <><div className="sos-active"><Phone /><strong>{c.sos.connected}</strong><span>{action}</span></div><button className="primary-btn" onClick={onClose}>{c.common.close}</button></> : <><div className="sos-contact-list"><button className={action === c.sos.alertMemberName ? "selected" : ""} onClick={() => choose(c.sos.alertMemberName)}><MemberPortrait id="member-1" /><span><small>{c.sos.alertMember}</small><strong>{c.sos.alertMemberName}</strong></span><Phone /></button><button className={action === c.sos.primary ? "selected" : ""} onClick={() => choose(c.sos.primary)}><span className="contact-icon"><Users /></span><span><small>{c.sos.caregiver}</small><strong>{c.sos.primary}</strong></span><Phone /></button><button className={action === c.sos.medical ? "selected" : ""} onClick={() => choose(c.sos.medical)}><span className="contact-icon emergency"><FileHeart /></span><span><small>{c.sos.services}</small><strong>{c.sos.medical}</strong></span><Phone /></button><button className={action === c.sos.public ? "selected" : ""} onClick={() => choose(c.sos.public)}><span className="contact-icon emergency"><ShieldAlert /></span><span><small>{c.sos.services}</small><strong>{c.sos.public}</strong></span><Phone /></button></div><button className="contact-now" disabled={!action} onClick={confirm}><Phone />{action ? `${c.sos.confirmTitle} · ${action}` : c.sos.chooseAction}</button><p className="offline-note"><ShieldCheck />{c.sos.safetyNote}</p></>}</section></div>;
}

export default function HomePage() {
  const [lang, setLang] = useState<Language>("zh"); const [auth, setAuth] = useState<AuthScreen>("welcome"); const [view, setView] = useState<MainView>("overview"); const [previousView, setPreviousView] = useState<MainView>("overview"); const [selectedMember, setSelectedMember] = useState("member-1"); const [memberStartTab, setMemberStartTab] = useState<MemberTab>("overview"); const [monitorStartView, setMonitorStartView] = useState<MonitorView>("system"); const [alertState, setAlertState] = useState<AlertState>("sent"); const [safeMode, setSafeMode] = useState(false); const [normalMode, setNormalMode] = useState(false); const [previewMode, setPreviewMode] = useState(false); const [frameWidth, setFrameWidth] = useState<number | undefined>(); const [showSplash, setShowSplash] = useState(true); const [sos, setSos] = useState(false); const [toast, setToast] = useState(""); const c = copy[lang];
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get("splash") === "1";
    const shouldSkip = (params.get("preview") === "1" && !forced) || (window.sessionStorage.getItem("luoshen-splash-seen") === "1" && !forced);
    if (shouldSkip) { const skipTimer = window.setTimeout(() => setShowSplash(false), 0); return () => window.clearTimeout(skipTimer); }
    const timer = window.setTimeout(() => { window.sessionStorage.setItem("luoshen-splash-seen", "1"); setShowSplash(false); }, 2100);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { document.documentElement.lang = lang === "zh" ? "zh-CN" : "en"; }, [lang]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const requestedLang = params.get("lang");
      if (requestedLang === "zh" || requestedLang === "en") setLang(requestedLang);
      const requestedFrame = Number(params.get("frame"));
      if ([360, 390, 430].includes(requestedFrame)) setFrameWidth(requestedFrame);
      if (params.get("preview") !== "1") return;
      setPreviewMode(true);
      const requestedView = params.get("view");
      const allowedViews: MainView[] = ["overview", "people", "monitor", "records", "member", "alert", "admin", "api", "regional", "account"];
      if (requestedView && allowedViews.includes(requestedView as MainView)) { setView(requestedView as MainView); setAuth("app"); }
      const requestedAlert = params.get("alert");
      if (["sent", "acknowledged", "handling", "escalated", "resolved"].includes(requestedAlert || "")) setAlertState(requestedAlert as AlertState);
      const requestedMonitor = params.get("monitor");
      if (["timeline", "system", "flow"].includes(requestedMonitor || "")) setMonitorStartView(requestedMonitor as MonitorView);
      const requestedTab = params.get("tab");
      if (["overview", "profile", "health", "planning", "rules", "devices", "network", "history"].includes(requestedTab || "")) setMemberStartTab(requestedTab as MemberTab);
      if (params.get("safe") === "1") { setSafeMode(true); setView("regional"); setAuth("app"); }
      if (params.get("normal") === "1") { setNormalMode(true); setAlertState("resolved"); setView("overview"); setAuth("app"); }
      if (params.get("sos") === "1") { setView("overview"); setAuth("app"); setSos(true); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2400); }; const navigate = (next: MainView) => { setPreviousView(view); setView(next); window.scrollTo(0, 0); document.querySelector<HTMLElement>(".app-main")?.scrollTo(0, 0); }; const selectMember = (id: string) => { setSelectedMember(id); navigate("member"); }; const signOut = () => { setAuth("welcome"); setView("overview"); setAlertState("sent"); setSafeMode(false); };
  const page = (() => { const props = { c, lang }; if (view === "overview") return <Overview {...props} setView={navigate} selectMember={selectMember} alertState={alertState} normalMode={normalMode} setPlanChoice={() => notify(c.toast.saved)} />; if (view === "people") return <People {...props} selectMember={selectMember} />; if (view === "member") return <MemberDetail {...props} id={selectedMember} initialTab={memberStartTab} goBack={() => setView(previousView)} openAlert={() => navigate("alert")} setPlanChoice={() => notify(c.toast.saved)} />; if (view === "alert") return <AlertDetail {...props} state={alertState} setState={setAlertState} goBack={() => setView(previousView)} notify={notify} />; if (view === "monitor") return <Monitor {...props} initialView={monitorStartView} openAlert={() => navigate("alert")} />; if (view === "records") return <Records {...props} />; if (view === "admin" || view === "api") return <Admin key={view} {...props} initialTab={view === "api" ? "connections" : "data"} goBack={() => setView(previousView)} />; if (view === "regional") return <Regional c={c} safeMode={safeMode} setSafeMode={setSafeMode} goBack={() => setView(previousView)} notify={notify} />; return <Account {...props} setLang={setLang} goBack={() => setView(previousView)} signOut={signOut} />; })();
  const previewReturn = previewMode ? <a className="preview-return" href={`/preview?lang=${lang}`} target="_top"><ArrowLeft size={16} />{lang === "zh" ? "返回界面画廊" : "Back to gallery"}</a> : null;
  if (showSplash) return <SplashScreen c={c} onSkip={() => { window.sessionStorage.setItem("luoshen-splash-seen", "1"); setShowSplash(false); }} />;
  if (auth === "welcome") return <>{previewReturn}<Welcome lang={lang} setLang={setLang} setScreen={setAuth} /></>;
  if (auth === "login") return <>{previewReturn}<Login lang={lang} setLang={setLang} setScreen={setAuth} /></>;
  return <>{previewReturn}<div className="app-shell" style={frameWidth ? { maxWidth: frameWidth, "--frame-inner": `${frameWidth - 16}px` } as React.CSSProperties : undefined}><AppHeader c={c} lang={lang} setLang={setLang} setView={navigate} openSos={() => setSos(true)} /><main className="app-main">{page}</main><BottomNav c={c} view={view} setView={navigate} frameWidth={frameWidth} />{sos && <SosModal c={c} onClose={() => setSos(false)} />}{toast && <div className="toast"><Check />{toast}</div>}</div></>;
}
