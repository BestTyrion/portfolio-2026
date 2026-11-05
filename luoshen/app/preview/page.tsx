"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowUpRight, BellRing, CheckCircle2,
  CircleUserRound, Cloud, Droplets, FileClock, Gauge, HeartHandshake, Home,
  Languages, LifeBuoy, MapPin, MonitorSmartphone, Network, ShieldAlert,
  ShieldCheck, Smartphone, Tablet, Users, Waves,
} from "lucide-react";

type Language = "zh" | "en";
type Device = "mobile" | "tablet" | "desktop";

const hubCopy = {
  zh: {
    eyebrow: "洛神 · 界面设计",
    title: "洛神",
    preview: "界面画廊",
    subtitle: "家庭用水照护管理系统",
    version: "家庭水务照护",
    openApp: "打开完整 LUOSHEN App",
    reviewOrder: "推荐评审顺序",
    reviewHint: "沿着家庭水务 → 成员照护 → 风险响应快速理解项目。",
    entries: "关键页面快捷入口",
    states: "关键状态快捷入口",
    assets: "LUOSHEN 轻装饰素材系统",
    assetsHint: "PPT 边框、App 卡片纹样与可复用小组件",
    pptPack: "A · PPT 边框花纹",
    uiPack: "B · App UI 装饰纹样",
    symbolPack: "C · 分隔线与小图形",
    device: "查看设备",
    mobile: "Mobile · 390 × 845",
    tablet: "Tablet",
    desktop: "Desktop",
    ready: "可查看",
    demo: "交互状态",
    back: "返回入口",
    stageHint: "选择页面，查看界面与交互状态。",
    select: "选择任一入口开始预览",
  },
  en: {
    eyebrow: "LUOSHEN · Interface Design",
    title: "LUOSHEN",
    preview: "Interface Gallery",
    subtitle: "Household Water-Care Management System",
    version: "Household Water Care",
    openApp: "Open Full LUOSHEN App",
    reviewOrder: "Recommended review order",
    reviewHint: "Follow household water → member care → risk response to understand the system quickly.",
    entries: "Quick page entries",
    states: "Interaction states",
    assets: "LUOSHEN decorative asset system",
    assetsHint: "PPT borders, app card patterns, and reusable symbols",
    pptPack: "A · PPT border patterns",
    uiPack: "B · App UI patterns",
    symbolPack: "C · Dividers & symbols",
    device: "View on device",
    mobile: "Mobile · 390 × 844",
    tablet: "Tablet",
    desktop: "Desktop",
    ready: "Ready",
    demo: "State",
    back: "Back to Hub",
    stageHint: "Choose a screen to explore its interface and states.",
    select: "Choose any entry to begin",
  },
};

const entries = [
  { id: "welcome", icon: Home, title: { zh: "Welcome", en: "Welcome" }, desc: { zh: "品牌入口与家庭水务主题", en: "Brand entry and household water care" }, query: "" },
  { id: "overview", icon: Droplets, title: { zh: "Overview", en: "Overview" }, desc: { zh: "家庭水务照护状态", en: "Household water-care status" }, query: "view=overview" },
  { id: "people", icon: Users, title: { zh: "People", en: "People" }, desc: { zh: "多成员用水照护管理", en: "Multi-member water-care management" }, query: "view=people" },
  { id: "member", icon: CircleUserRound, title: { zh: "Member Detail", en: "Member Detail" }, desc: { zh: "档案、照护备注与照护网络", en: "Profile, care notes, and care network" }, query: "view=member&tab=profile" },
  { id: "timeline", icon: Activity, title: { zh: "Monitor — Timeline", en: "Monitor — Timeline" }, desc: { zh: "时间线监测矩阵", en: "Timeline Monitoring Matrix" }, query: "view=monitor&monitor=timeline" },
  { id: "water-system", icon: Waves, title: { zh: "Monitor — 家庭水路", en: "Monitor — Water System" }, desc: { zh: "家庭水务系统图", en: "Household Water System Map" }, query: "view=monitor&monitor=system" },
  { id: "care-flow", icon: HeartHandshake, title: { zh: "Monitor — 照护流程", en: "Monitor — Care Flow" }, desc: { zh: "水源与照护流程图", en: "Water Source & Care Flow" }, query: "view=monitor&monitor=flow" },
  { id: "alert", icon: BellRing, title: { zh: "Alert Detail", en: "Alert Detail" }, desc: { zh: "识别、确认与升级", en: "Detection, acknowledgement, escalation" }, query: "view=alert&alert=sent" },
  { id: "records", icon: FileClock, title: { zh: "Records", en: "Records" }, desc: { zh: "水务系统事件记录", en: "Water-system event history" }, query: "view=records" },
  { id: "regional", icon: MapPin, title: { zh: "Regional Risk", en: "Regional Risk" }, desc: { zh: "官方区域水务信息与家庭响应", en: "Official water information and response" }, query: "view=regional" },
  { id: "safe-mode", icon: ShieldCheck, title: { zh: "Household Safe Mode", en: "Household Safe Mode" }, desc: { zh: "区域风险响应状态", en: "Regional-risk response state" }, query: "view=regional&safe=1" },
  { id: "sos", icon: LifeBuoy, title: { zh: "SOS", en: "SOS" }, desc: { zh: "紧急联络选择流程", en: "Emergency contact selection" }, query: "view=overview&sos=1" },
  { id: "settings", icon: Network, title: { zh: "Water Settings", en: "Water Settings" }, desc: { zh: "设备、来源与家庭规则", en: "Devices, sources, and household rules" }, query: "view=admin" },
  { id: "account", icon: Cloud, title: { zh: "Preferences", en: "Preferences" }, desc: { zh: "语言与家庭视图", en: "Language and household view" }, query: "view=account" },
];

const demoStates = [
  { id: "normal", icon: CheckCircle2, title: { zh: "Normal Household", en: "Normal Household" }, desc: { zh: "家庭状态稳定", en: "Stable household state" }, query: "view=overview&normal=1" },
  { id: "attention", icon: AlertTriangle, title: { zh: "Needs Attention", en: "Needs Attention" }, desc: { zh: "成员需要行动", en: "Member action required" }, query: "view=overview" },
  { id: "active-alert", icon: BellRing, title: { zh: "Active Alert", en: "Active Alert" }, desc: { zh: "用水中风险提醒", en: "Active water-use risk" }, query: "view=alert&alert=sent" },
  { id: "awaiting", icon: FileClock, title: { zh: "Awaiting Acknowledgement", en: "Awaiting Acknowledgement" }, desc: { zh: "等待主要管理员确认", en: "Waiting for Primary Manager" }, query: "view=alert&alert=sent" },
  { id: "escalated", icon: ShieldAlert, title: { zh: "Escalated", en: "Escalated" }, desc: { zh: "已通知次级照护人", en: "Secondary Caregiver notified" }, query: "view=alert&alert=escalated" },
  { id: "degraded", icon: Gauge, title: { zh: "Data Source Degraded", en: "Data Source Degraded" }, desc: { zh: "查看延迟连接状态", en: "Inspect a delayed connection" }, query: "view=admin" },
  { id: "risk-active", icon: MapPin, title: { zh: "Regional Risk Active", en: "Regional Risk Active" }, desc: { zh: "官方供水维护公告", en: "Official maintenance notice" }, query: "view=regional" },
  { id: "safe-active", icon: ShieldCheck, title: { zh: "Safe Mode Active", en: "Safe Mode Active" }, desc: { zh: "家庭安全模式已开启", en: "Household Safe Mode enabled" }, query: "view=regional&safe=1" },
];

const reviewOrder = ["overview", "water-system", "people", "alert", "care-flow", "records"];

export default function PreviewHub() {
  const [lang, setLang] = useState<Language>("zh");
  const [device, setDevice] = useState<Device>("mobile");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<HTMLElement>(null);
  const c = hubCopy[lang];
  const allItems = useMemo(() => [...entries, ...demoStates], []);
  const selected = allItems.find((item) => item.id === selectedId) || null;
  const previewUrl = selected ? `/?preview=1&lang=${lang}${selected.query ? `&${selected.query}` : ""}` : "";

  useEffect(() => {
    const initialSearch = window.location.search;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(initialSearch);
      if (params.get("lang") === "en") setLang("en");
      if (["mobile", "tablet", "desktop"].includes(params.get("device") || "")) setDevice(params.get("device") as Device);
      const screen = params.get("screen");
      if (screen && allItems.some((item) => item.id === screen)) setSelectedId(screen);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [allItems]);

  useEffect(() => {
    const params = new URLSearchParams({ lang, device });
    if (selectedId) params.set("screen", selectedId);
    window.history.replaceState(null, "", `/preview?${params.toString()}`);
  }, [device, lang, selectedId]);
  useEffect(() => { document.documentElement.lang = lang === "zh" ? "zh-CN" : "en"; }, [lang]);

  const openPreview = (id: string) => {
    setSelectedId(id);
    window.setTimeout(() => stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  };

  return <main className="preview-hub">
    <div className="preview-ripples" aria-hidden="true"><span /><span /><span /></div>
    <header className="preview-header">
      <div className="preview-brand"><Image src="/luoshen-logo.png" width={350} height={260} alt="LUOSHEN 洛神" /><span><strong>{c.title}</strong><small>{c.version}</small></span></div>
      <div className="preview-header-actions"><button className="preview-language" onClick={() => setLang(lang === "zh" ? "en" : "zh")}><Languages size={17} />{lang === "zh" ? "English" : "中文"}</button><a className="preview-open-app" href={`/?lang=${lang}`} target="_top">{c.openApp}<ArrowUpRight size={17} /></a></div>
    </header>

    <section className="preview-hero">
      <p className="eyebrow">{c.eyebrow}</p>
      <h1>{c.title}<span>{c.preview}</span></h1>
      <p>{c.subtitle}</p>
    </section>

    <section className="review-path">
      <div><strong>{c.reviewOrder}</strong><p>{c.reviewHint}</p></div>
      <ol>{reviewOrder.map((id, index) => { const item = entries.find((entry) => entry.id === id)!; return <li key={id}><button onClick={() => openPreview(id)}><span>{String(index + 1).padStart(2, "0")}</span>{item.title[lang]}</button></li>; })}</ol>
    </section>

    <section className="hub-section"><div className="hub-section-title"><div><p className="eyebrow">A</p><h2>{c.entries}</h2></div><DevicePicker c={c} device={device} setDevice={setDevice} /></div><div className="preview-card-grid">{entries.map((item) => <PreviewCard key={item.id} item={item} lang={lang} tag={c.ready} onClick={() => openPreview(item.id)} />)}</div></section>

    <section className="hub-section"><div className="hub-section-title"><div><p className="eyebrow">B</p><h2>{c.states}</h2></div></div><div className="preview-state-grid">{demoStates.map((item) => <PreviewCard key={item.id} item={item} lang={lang} tag={c.demo} onClick={() => openPreview(item.id)} />)}</div></section>

    <section className="hub-section asset-pack"><div className="hub-section-title"><div><p className="eyebrow">VISUAL SYSTEM</p><h2>{c.assets}</h2><p>{c.assetsHint}</p></div></div><DecorativePack c={c} /></section>

    <section ref={stageRef} className={`preview-stage stage-${device}`}>
      <div className="preview-stage-bar"><button onClick={() => setSelectedId(null)}><ArrowLeft size={16} />{c.back}</button><span><i />{selected ? selected.title[lang] : c.select}</span><small>{device === "mobile" ? "390 × 845" : device === "tablet" ? "768 × 900" : "Desktop"}</small></div>
      {selected ? <div className="device-frame"><iframe key={previewUrl} title={`${selected.title[lang]} preview`} src={previewUrl} /></div> : <div className="preview-empty"><MonitorSmartphone /><strong>{c.select}</strong><p>{c.stageHint}</p></div>}
    </section>
  </main>;
}

function DecorativePack({ c }: { c: typeof hubCopy.zh }) {
  return <div className="asset-categories">
    <article className="asset-category"><h3>{c.pptPack}</h3><div className="border-samples">{Array.from({ length: 8 }, (_, i) => <div className={`border-sample border-${i + 1}`} key={i}><span /><i /></div>)}</div></article>
    <article className="asset-category"><h3>{c.uiPack}</h3><div className="ui-patterns">{Array.from({ length: 10 }, (_, i) => <div className={`ui-pattern pattern-${i + 1}`} key={i}><span /><i /><b /></div>)}</div></article>
    <article className="asset-category"><h3>{c.symbolPack}</h3><div className="symbol-row"><WaveSymbol /><LotusSymbol /><RippleSymbol /><CloudSymbol /><JadeSymbol /><LeafSymbol /></div></article>
  </div>;
}

function WaveSymbol() { return <span className="asset-symbol"><svg viewBox="0 0 120 40"><path d="M3 24c17-18 30 17 49-2s32 17 65-4"/><path d="M8 30c18-11 29 12 48-1s34 10 57-3"/></svg></span>; }
function LotusSymbol() { return <span className="asset-symbol"><svg viewBox="0 0 80 50"><path d="M40 42C20 32 17 17 17 17c12 0 20 6 23 16 3-10 11-16 23-16 0 0-3 15-23 25Z"/><path d="M40 34C29 22 40 7 40 7s11 15 0 27Z"/></svg></span>; }
function RippleSymbol() { return <span className="asset-symbol"><svg viewBox="0 0 80 50"><ellipse cx="40" cy="30" rx="30" ry="10"/><ellipse cx="40" cy="30" rx="20" ry="6"/><circle cx="40" cy="18" r="4"/></svg></span>; }
function CloudSymbol() { return <span className="asset-symbol"><svg viewBox="0 0 100 50"><path d="M8 32h24c2-12 19-14 24-4 5-8 20-6 21 4h15M18 39h62"/></svg></span>; }
function JadeSymbol() { return <span className="asset-symbol"><svg viewBox="0 0 70 50"><circle cx="35" cy="25" r="18"/><circle cx="35" cy="25" r="8"/><path d="M35 7v-5M35 48v-5"/></svg></span>; }
function LeafSymbol() { return <span className="asset-symbol"><svg viewBox="0 0 80 50"><path d="M12 37C17 9 52 8 68 12 59 34 34 43 12 37Z"/><path d="M17 35c17-7 27-14 42-20"/></svg></span>; }

type PreviewItem = (typeof entries)[number] | (typeof demoStates)[number];

function PreviewCard({ item, lang, tag, onClick }: { item: PreviewItem; lang: Language; tag: string; onClick: () => void }) {
  const Icon = item.icon;
  return <button className="preview-card" onClick={onClick}><span className="preview-card-icon"><Icon /></span><span className="preview-card-copy"><strong>{item.title[lang]}</strong><small>{item.desc[lang]}</small></span><span className="preview-card-tag">{tag}</span><ArrowUpRight className="preview-card-arrow" /></button>;
}

function DevicePicker({ c, device, setDevice }: { c: typeof hubCopy.zh; device: Device; setDevice: (device: Device) => void }) {
  const options: [Device, React.ReactNode, string][] = [["mobile", <Smartphone key="m" />, c.mobile], ["tablet", <Tablet key="t" />, c.tablet], ["desktop", <MonitorSmartphone key="d" />, c.desktop]];
  return <div className="device-picker" aria-label={c.device}>{options.map(([key, icon, label]) => <button key={key} className={device === key ? "active" : ""} onClick={() => setDevice(key)}>{icon}<span>{label}</span></button>)}</div>;
}
