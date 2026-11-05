"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Camera, Check, ChevronRight, CircleHelp, Droplets, ImagePlus, Info, Link2, RotateCcw, ScanLine, ShieldCheck, X } from "lucide-react";
import type { Language } from "./translations";

export type RegisteredDevice = {
  id: string;
  type: string;
  location: string;
  photo?: string;
  platform?: string;
  model?: string;
  connection: "not-connected" | "pending";
};

const types = [
  { id: "purifier", zh: "饮用水过滤器", en: "Drinking-water filter", image: "/devices/clean_Water_Purifier.jpg", data: { zh: "滤芯状态 · 水质", en: "Filter status · water quality" } },
  { id: "heater", zh: "热水器", en: "Water heater", image: "/devices/clean_Water_Heater.jpg", data: { zh: "水温 · 运行状态", en: "Temperature · operating status" } },
  { id: "meter", zh: "智能水表", en: "Smart water meter", image: "/devices/clean_Smart_Water_Meter.jpg", data: { zh: "用水量 · 流量", en: "Usage · flow" } },
  { id: "shower", zh: "花洒／淋浴设备", en: "Shower", image: "/devices/clean_Shower.jpg", data: { zh: "用水状态", en: "Water-use status" } },
  { id: "sensor", zh: "水务传感器", en: "Water sensor", image: "/devices/clean_Temperature_Sensor.jpg", data: { zh: "按设备能力确认", en: "Depends on device" } },
] as const;

const labels = {
  zh: {
    back: "返回用户资料", find: "先找到家里的设备", findBody: "例如饮用水过滤器通常装在厨房水槽下方。", found: "我找到了", cantFind: "找不到？看看其他位置", places: "还可以看看水槽旁、橱柜内及入户水管附近。", photo: "给设备拍一张正面照", photoBody: "让整台设备进入框内，避开反光。识别时照片会提交给识别服务；添加后保存在此浏览器。", take: "拍摄或选择照片", retake: "重新拍摄", noPhoto: "暂时无法拍照，手动添加", label: "再看看有没有型号标签", labelBody: "标签可能在机身侧面或底部；找不到也可以继续。", labelPhoto: "拍摄标签", skip: "找不到标签，跳过", next: "下一步", confirm: "确认这是什么设备", confirmBody: "识别结果需要你确认，也可以手动改选。", identify: "设备类型由你确认", model: "品牌或型号（可修改）", modelPlaceholder: "看不清可留空", location: "设备装在哪里？", kitchen: "厨房", bathroom: "浴室", main: "入户水管", other: "其他位置", link: "它原本有手机 App 吗？", linkBody: "有 App 的设备可能支持连接；拍照本身不会让设备联网。", yes: "有，我用过", no: "没有", unsure: "不确定", appName: "原有 App 名称（可选）", appPlaceholder: "例如净水器品牌 App", review: "确认要添加的设备", reviewBody: "请检查设备和连接状态，然后保存。", device: "设备", system: "原有智能系统", data: "可能提供的数据", none: "未选择", unknown: "暂不确定", status: "连接状态", pending: "等待授权连接", disconnected: "尚未连接", caution: "只有成功连接后，设备提供的读数才会出现在洛神中。", save: "完成添加", done: "设备已加入家庭资料", doneBody: "设备照片与类型已经保存。连接可以稍后完成。", finish: "返回用户资料", startOver: "添加另一台", step: "步骤", photoHint: "示例：拍下设备整体", labelHint: "示例：拍下品牌或型号", noRecognition: "识别暂不可用，请手动选择设备类型。", recognizing: "正在识别照片…", recognized: "照片识别建议 · 请确认", fileError: "图片读取失败，请重试。",
  },
  en: {
    back: "Back to profiles", find: "Find your water device", findBody: "A drinking-water filter is often under the kitchen sink.", found: "I found it", cantFind: "Can't find it? See other places", places: "Check beside the sink, inside the cabinet, or near the main inlet.", photo: "Photograph the front", photoBody: "Fit the whole device in frame. For recognition, photos go to the recognition service; added photos stay in this browser.", take: "Take or choose a photo", retake: "Retake photo", noPhoto: "Can't photograph now? Add manually", label: "Look for a model label", labelBody: "It may be on the side or bottom. You can continue without one.", labelPhoto: "Photograph the label", skip: "Can't find it, skip", next: "Continue", confirm: "Confirm the device type", confirmBody: "Confirm the suggested type or choose another.", identify: "Confirm the type yourself", model: "Brand or model (editable)", modelPlaceholder: "Leave blank if unclear", location: "Where is it installed?", kitchen: "Kitchen", bathroom: "Bathroom", main: "Main inlet", other: "Other", link: "Does it already have an app?", linkBody: "A device with its own app may support a connection. A photo alone does not connect it.", yes: "Yes, I use one", no: "No", unsure: "I'm not sure", appName: "Existing app name (optional)", appPlaceholder: "e.g. the filter brand app", review: "Review this device", reviewBody: "Check the device and connection status before saving.", device: "Device", system: "Existing smart system", data: "Data it may provide", none: "None selected", unknown: "Not sure yet", status: "Connection status", pending: "Awaiting connection approval", disconnected: "Not connected", caution: "Readings appear in LUOSHEN only after an actual connection succeeds.", save: "Add device", done: "Device added to your household", doneBody: "Its photo and type are saved. You can connect it later.", finish: "Back to profiles", startOver: "Add another device", step: "Step", photoHint: "Example: show the whole device", labelHint: "Example: show the brand or model", noRecognition: "Recognition is unavailable; choose the device type yourself.", recognizing: "Identifying the photo…", recognized: "Photo suggestion · please confirm", fileError: "Could not read the photo. Please try again.",
  },
};

type Stage = "find" | "photo" | "label" | "confirm" | "link" | "review" | "done";

async function readSmallImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("file"));
    reader.onload = () => { img.src = String(reader.result); };
    img.onerror = () => reject(new Error("image"));
    img.onload = () => {
      const max = 680, scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", .76));
    };
    reader.readAsDataURL(file);
  });
}

export function DeviceGuide({ lang, onClose, onSave }: { lang: Language; onClose: () => void; onSave: (item: RegisteredDevice) => void }) {
  const t = labels[lang];
  const [stage, setStage] = useState<Stage>("find");
  const [showPlaces, setShowPlaces] = useState(false);
  const [photo, setPhoto] = useState<string>();
  const [labelPhoto, setLabelPhoto] = useState<string>();
  const [type, setType] = useState<string>("purifier");
  const [location, setLocation] = useState<string>("kitchen");
  const [hasApp, setHasApp] = useState<"yes" | "no" | "unsure">("unsure");
  const [appName, setAppName] = useState("");
  const [error, setError] = useState("");
  const [recognition, setRecognition] = useState<"idle" | "loading" | "recognized" | "unavailable">("idle");
  const [model, setModel] = useState("");
  const frontInput = useRef<HTMLInputElement>(null);
  const labelInput = useRef<HTMLInputElement>(null);
  const recognitionRequest = useRef(0);
  const selected = types.find(x => x.id === type) || types[0];
  const current = stage === "find" ? 1 : stage === "photo" || stage === "label" ? 2 : stage === "confirm" ? 3 : 4;
  const goBack = () => { if (stage === "find" || stage === "done") onClose(); else setStage(({ photo: "find", label: "photo", confirm: "label", link: "confirm", review: "link" } as Partial<Record<Stage, Stage>>)[stage] || "find"); };
  const identify = async (front?: string, label?: string) => {
    const requestId = ++recognitionRequest.current;
    setStage("confirm");
    if (!front) { setRecognition("unavailable"); return; }
    setRecognition("loading");
    try {
      const response = await fetch("/api/identify-device", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ photo: front, labelPhoto: label }) });
      if (!response.ok) throw new Error("Unavailable");
      const result = await response.json() as { category?: string; model?: string };
      if (!types.some(item => item.id === result.category)) throw new Error("Unknown");
      if (requestId !== recognitionRequest.current) return;
      setType(String(result.category)); setModel(result.model || ""); setRecognition("recognized");
    } catch { if (requestId === recognitionRequest.current) setRecognition("unavailable"); }
  };
  const receive = async (file: File | undefined, kind: "front" | "label") => {
    if (!file) return;
    try { const result = await readSmallImage(file); if (kind === "front") { setPhoto(result); setStage("label"); } else { setLabelPhoto(result); void identify(photo, result); } setError(""); }
    catch { setError(t.fileError); }
  };
  const save = () => {
    onSave({ id: `home-device-${Date.now()}`, type, location, photo, model, platform: hasApp === "yes" ? appName.trim() : undefined, connection: hasApp === "yes" ? "pending" : "not-connected" });
    setStage("done");
  };
  const again = () => { recognitionRequest.current++; setPhoto(undefined); setLabelPhoto(undefined); setType("purifier"); setLocation("kitchen"); setHasApp("unsure"); setAppName(""); setModel(""); setRecognition("idle"); setStage("find"); };
  return <div className="device-guide page-stack">
    <div className="guide-top"><button type="button" onClick={goBack} aria-label={t.back}><ArrowLeft size={18} /></button><span>{stage === "done" ? "LUOSHEN" : `${t.step} ${current} / 4`}</span><button type="button" onClick={onClose} aria-label={t.back}><X size={18} /></button></div>
    {stage !== "done" && <div className="guide-progress" aria-hidden="true">{[1,2,3,4].map(n => <i className={n <= current ? "active" : ""} key={n} />)}</div>}
    <input ref={frontInput} hidden type="file" accept="image/*" capture="environment" onChange={e => receive(e.target.files?.[0], "front")} />
    <input ref={labelInput} hidden type="file" accept="image/*" capture="environment" onChange={e => receive(e.target.files?.[0], "label")} />
    {stage === "find" && <><header className="guide-heading"><small>01 · FIND</small><h1>{t.find}</h1><p>{t.findBody}</p></header><div className="guide-photo guide-find-photo"><Image src="/scene-filter-v11.png" fill sizes="390px" alt={t.find} /><span className="guide-focus"><ScanLine size={26} /></span><span className="guide-photo-caption">{t.photoHint}</span></div>{showPlaces && <p className="guide-tip"><CircleHelp size={17} />{t.places}</p>}<div className="guide-actions"><button className="guide-primary" onClick={() => setStage("photo")}>{t.found}<ChevronRight size={18} /></button><button className="guide-text" onClick={() => setShowPlaces(!showPlaces)}>{t.cantFind}</button></div></>}
    {stage === "photo" && <><header className="guide-heading"><small>02 · PHOTO</small><h1>{t.photo}</h1><p>{t.photoBody}</p></header><div className="guide-viewfinder" role="img" aria-label={t.photoHint}><Image src={photo || "/devices/clean_Water_Purifier.jpg"} fill sizes="390px" alt="" /><span className="viewfinder-corners" /><span className="guide-photo-caption">{t.photoHint}</span></div>{error && <p className="guide-error">{error}</p>}<div className="guide-actions"><button className="guide-primary" onClick={() => frontInput.current?.click()}><Camera size={18} />{photo ? t.retake : t.take}</button><button className="guide-text" onClick={() => { setRecognition("unavailable"); setStage("confirm"); }}>{t.noPhoto}</button></div></>}
    {stage === "label" && <><header className="guide-heading"><small>02 · LABEL</small><h1>{t.label}</h1><p>{t.labelBody}</p></header><div className="guide-label-example"><div><Image src={photo || selected.image} fill sizes="280px" alt="" /></div><div><ScanLine size={30} /><strong>{t.labelHint}</strong></div></div>{labelPhoto && <div className="guide-label-preview"><Image src={labelPhoto} fill sizes="90px" alt="" /><Check size={18} /></div>}{error && <p className="guide-error">{error}</p>}<div className="guide-actions"><button className="guide-primary" onClick={() => labelInput.current?.click()}><ImagePlus size={18} />{t.labelPhoto}</button><button className="guide-text" onClick={() => void identify(photo)}>{t.skip}</button></div></>}
    {stage === "confirm" && <><header className="guide-heading"><small>03 · CONFIRM</small><h1>{t.confirm}</h1><p>{t.confirmBody}</p></header><div className="guide-selected-photo"><Image src={photo || selected.image} fill sizes="360px" alt="" /><span>{t.identify}</span></div><p className="guide-service-note"><Info size={15} />{recognition === "loading" ? t.recognizing : recognition === "recognized" ? t.recognized : t.noRecognition}</p><div className="guide-type-list" role="group" aria-label={t.confirm}>{types.map(item => <button key={item.id} className={type === item.id ? "selected" : ""} onClick={() => { recognitionRequest.current++; setType(item.id); setRecognition("idle"); }}><Image src={item.image} width={42} height={42} alt="" /><span>{item[lang]}</span>{type === item.id && <Check size={17} />}</button>)}</div><label className="guide-select-label">{t.model}<input value={model} placeholder={t.modelPlaceholder} onChange={e => { recognitionRequest.current++; setModel(e.target.value); }} /></label><label className="guide-select-label">{t.location}<select value={location} onChange={e => setLocation(e.target.value)}>{(["kitchen","bathroom","main","other"] as const).map(key => <option value={key} key={key}>{t[key]}</option>)}</select></label><button className="guide-primary" onClick={() => setStage("link")}>{t.next}<ChevronRight size={18} /></button></>}
    {stage === "link" && <><header className="guide-heading"><small>04 · CONNECT</small><h1>{t.link}</h1><p>{t.linkBody}</p></header><div className="guide-link-art"><Image src={photo || selected.image} fill sizes="280px" alt="" /><span><Link2 size={24} /></span></div><div className="guide-answer-list">{(["yes","no","unsure"] as const).map(value => <button className={hasApp === value ? "selected" : ""} key={value} onClick={() => setHasApp(value)}><span>{t[value]}</span>{hasApp === value && <Check size={18} />}</button>)}</div>{hasApp === "yes" && <label className="guide-select-label">{t.appName}<input value={appName} placeholder={t.appPlaceholder} onChange={e => setAppName(e.target.value)} /></label>}<button className="guide-primary" onClick={() => setStage("review")}>{t.next}<ChevronRight size={18} /></button></>}
    {stage === "review" && <><header className="guide-heading"><small>04 · REVIEW</small><h1>{t.review}</h1><p>{t.reviewBody}</p></header><div className="guide-review-device"><Image src={photo || selected.image} fill sizes="160px" alt="" /><span><small>{t.device}</small><strong>{selected[lang]}</strong><em>{t[location as "kitchen" | "bathroom" | "main" | "other"]}</em></span></div><div className="guide-review-list"><div><span><Link2 size={17} />{t.system}</span><strong>{hasApp === "yes" ? appName.trim() || t.unknown : t.none}</strong></div><div><span><Droplets size={17} />{t.data}</span><strong>{hasApp === "yes" ? selected.data[lang] : t.none}</strong></div><div><span><ShieldCheck size={17} />{t.status}</span><strong>{hasApp === "yes" ? t.pending : t.disconnected}</strong></div></div><p className="guide-caution"><Info size={16} />{t.caution}</p><button className="guide-primary" onClick={save}>{t.save}<Check size={18} /></button></>}
    {stage === "done" && <><div className="guide-done-art"><Image src={photo || selected.image} fill sizes="320px" alt="" /><span><Check size={32} /></span></div><header className="guide-heading done"><small>LUOSHEN</small><h1>{t.done}</h1><p>{t.doneBody}</p></header><div className="guide-actions"><button className="guide-primary" onClick={onClose}>{t.finish}<ChevronRight size={18} /></button><button className="guide-text" onClick={again}><RotateCcw size={15} />{t.startOver}</button></div></>}
  </div>;
}

export const deviceGuideTypes = types;
