export const household = {
  id: "hh-lin-001",
  nameKey: "header.household",
  primaryManagerId: "contact-pm",
  cloudStatus: "synced",
  memberIds: ["member-1", "member-2", "member-3"],
};

export const householdInsights = {
  updated: "21:24",
  ranges: {
    today: {
      labels: ["06", "09", "12", "15", "18", "21", "24"],
      water: [42, 68, 57, 91, 82, 118, 96],
      energy: [0.4, 0.8, 0.6, 1.1, 0.9, 1.7, 1.2],
      abnormalUses: 3,
      energyTotal: "3.2 kWh",
      peak: "21:00",
      change: "−8%",
    },
    yesterday: {
      labels: ["06", "09", "12", "15", "18", "21", "24"],
      water: [36, 61, 49, 78, 88, 103, 84],
      energy: [0.3, 0.7, 0.5, 0.9, 1.0, 1.4, 1.0],
      abnormalUses: 1,
      energyTotal: "3.5 kWh",
      peak: "21:00",
      change: "+4%",
    },
    week: {
      labels: ["M", "T", "W", "T", "F", "S", "S"],
      water: [518, 562, 534, 608, 590, 671, 624],
      energy: [2.7, 2.9, 2.8, 3.1, 3.0, 3.5, 3.2],
      abnormalUses: 6,
      energyTotal: "21.2 kWh",
      peak: "Sat",
      change: "−5%",
    },
  },
  energyBreakdown: [
    { key: "heater", share: 68, color: "#5f86ec" },
    { key: "filter", share: 19, color: "#55bcc8" },
    { key: "sensors", share: 13, color: "#86bda6" },
  ],
};

export const members = [
  { id: "member-1", name: { zh: "林慧芳", en: "Wai-fong Lin" }, age: 72, relation: { zh: "母亲", en: "Mother" }, needs: [{ zh: "年长者", en: "Older Adult" }, { zh: "温度敏感", en: "Temperature Sensitive" }], status: "attention", temp: "49°C", quality: { zh: "正常", en: "Normal" }, device: { zh: "浴室在线", en: "Bathroom online" }, routine: { zh: "夜间时长偏长", en: "Longer nighttime use" }, lastCheck: { zh: "2 分钟前", en: "2 min ago" }, alerts: 1, network: { zh: "主要管理员已收到", en: "Primary Manager notified" } },
  { id: "member-2", name: { zh: "林惠敏", en: "Wai-man Lin" }, age: 45, relation: { zh: "本人", en: "Self" }, needs: [{ zh: "敏感肌肤", en: "Sensitive Skin" }], status: "stable", temp: "41°C", quality: { zh: "正常", en: "Normal" }, device: { zh: "厨房在线", en: "Kitchen online" }, routine: { zh: "符合日常规律", en: "Within routine" }, lastCheck: { zh: "5 分钟前", en: "5 min ago" }, alerts: 0, network: { zh: "无需响应", en: "No response needed" } },
  { id: "member-3", name: { zh: "林晓晴", en: "Hiu-ching Lin" }, age: 9, relation: { zh: "女儿", en: "Daughter" }, needs: [{ zh: "儿童", en: "Child" }], status: "normal", temp: "39°C", quality: { zh: "正常", en: "Normal" }, device: { zh: "儿童浴室在线", en: "Child bathroom online" }, routine: { zh: "符合日常规律", en: "Within routine" }, lastCheck: { zh: "8 分钟前", en: "8 min ago" }, alerts: 0, network: { zh: "家长可联系", en: "Parent available" } },
];

export const supportingCareRecords = [
  { id: "note-1", memberId: "member-1", date: "2026-08-12", title: { zh: "沐浴温度与协助说明", en: "Bathing temperature & assistance" }, source: { zh: "家庭上传 · PDF", en: "Family upload · PDF" }, note: { zh: "对温度变化较敏感；沐浴前先确认水温，并保持扶手区域畅通。", en: "Sensitive to temperature changes. Check water temperature first and keep the grab-rail area clear." } },
  { id: "note-2", memberId: "member-1", date: "2026-07-03", title: { zh: "夜间用水照护备注", en: "Nighttime water-care note" }, source: { zh: "主要管理员", en: "Primary Manager" }, note: { zh: "夜间浴室用水异常时，优先通知陈嘉怡。", en: "Notify Ka-yee Chan first for unusual nighttime bathroom use." } },
];

export const careProfiles = {
  "member-1": { comfort: "38–43°C", highTemp: "48°C", sensitivity: { zh: "较高", en: "High" }, typical: "07:00–08:00 / 20:30–22:00", night: true, noUse: "18h", baseline: "2026-05-14", confidence: "87%" },
};

export const devices = [
  { id: "dev-1", name: { zh: "智能热水器", en: "Smart water heater" }, room: { zh: "主浴室", en: "Main bathroom" }, memberId: "member-1", health: "healthy", firmware: "2.8.4", api: "api-device" },
  { id: "dev-2", name: { zh: "浴室流量传感器", en: "Bathroom flow sensor" }, room: { zh: "主浴室", en: "Main bathroom" }, memberId: "member-1", health: "delayed", firmware: "1.4.7", api: "api-device" },
  { id: "dev-3", name: { zh: "厨房净水与 TDS 模组", en: "Kitchen filter & TDS module" }, room: { zh: "厨房饮用水", en: "Kitchen drinking water" }, memberId: "member-2", health: "healthy", firmware: "3.1.2", api: "api-quality" },
  { id: "dev-4", name: { zh: "次浴室温度传感器", en: "Second bathroom temperature sensor" }, room: { zh: "次浴室", en: "Second bathroom" }, memberId: "member-3", health: "healthy", firmware: "2.8.4", api: "api-device" },
  { id: "dev-5", name: { zh: "智能水表与漏水传感器", en: "Smart meter & leak sensor" }, room: { zh: "家庭主水管", en: "Household main" }, memberId: "member-2", health: "healthy", firmware: "1.9.3", api: "api-device" },
];

export const deviceCatalog = [
  { id: "temperature", image: "/devices/clean_Temperature_Sensor.jpg", icon: "temperature", name: { zh: "温度传感器", en: "Temperature sensor" }, dataType: { zh: "温度", en: "Temperature" }, status: "healthy" },
  { id: "flow", image: "/devices/clean_Flow_Sensor.jpg", icon: "flow", name: { zh: "流量传感器", en: "Flow sensor" }, dataType: { zh: "流量", en: "Flow rate" }, status: "healthy" },
  { id: "tds", image: "/devices/clean_TDS_Sensor.jpg", icon: "quality", name: { zh: "TDS 水质设备", en: "TDS quality device" }, dataType: { zh: "水质 / TDS", en: "Water quality / TDS" }, status: "healthy" },
  { id: "meter", image: "/devices/clean_Smart_Water_Meter.jpg", icon: "meter", name: { zh: "智能水表", en: "Smart water meter" }, dataType: { zh: "用量 / 流量", en: "Usage / Flow" }, status: "healthy" },
  { id: "filter", image: "/devices/clean_Water_Purifier.jpg", icon: "filter", name: { zh: "净水过滤系统", en: "Water filter system" }, dataType: { zh: "过滤 / 水质", en: "Filter / Quality" }, status: "healthy" },
  { id: "heater", image: "/devices/clean_Water_Heater.jpg", icon: "heater", name: { zh: "热水器", en: "Water heater" }, dataType: { zh: "水温", en: "Water temperature" }, status: "attention" },
  { id: "leak", image: "/devices/clean_Leak_Sensor.jpg", icon: "leak", name: { zh: "漏水传感器", en: "Leak sensor" }, dataType: { zh: "漏水检测", en: "Leak detection" }, status: "healthy" },
  { id: "faucet", image: "/devices/clean_Kitchen_Faucet.jpg", icon: "waterPoint", name: { zh: "智能龙头", en: "Smart faucet" }, dataType: { zh: "用水点", en: "Water point" }, status: "healthy" },
  { id: "shower", image: "/devices/clean_Shower.jpg", icon: "shower", name: { zh: "浴室花洒", en: "Bathroom shower" }, dataType: { zh: "浴室用水点", en: "Bathroom water point" }, status: "delayed" },
  { id: "inlet", image: "/devices/clean_Main_Inlet_Valve.jpg", icon: "source", name: { zh: "主进水阀", en: "Main inlet valve" }, dataType: { zh: "总阀控制", en: "Main inlet control" }, status: "healthy" },
  { id: "kitchen", image: "/devices/clean_Kitchen_Water_Point.jpg", icon: "kitchen", name: { zh: "厨房用水点", en: "Kitchen water point" }, dataType: { zh: "厨房用水", en: "Kitchen water" }, status: "healthy" },
  { id: "pressure", image: "/devices/clean_Pressure_Sensor.jpg", icon: "pressure", name: { zh: "管道压力计", en: "Pipe pressure gauge" }, dataType: { zh: "压力", en: "Pressure" }, status: "healthy" },
];

export const waterSystemNodes = [
  { id: "municipal", image: "/devices/clean_Main_Inlet_Valve.jpg", icon: "source", status: "healthy", x: 59, y: 70, name: { zh: "入户供水", en: "Household supply" }, room: { zh: "入户总管", en: "Main inlet" }, value: "8.4 L/min", lastCheck: "2", source: { zh: "市政供水与主水表", en: "Municipal supply & main meter" }, detail: { zh: "官方供水进入家庭总管", en: "Official supply entering the household main" } },
  { id: "meter", image: "/devices/clean_Smart_Water_Meter.jpg", icon: "meter", status: "healthy", x: 55, y: 64, name: { zh: "智能水表", en: "Smart meter" }, room: { zh: "玄关", en: "Entry" }, value: "8.4 L/min", lastCheck: "2", source: { zh: "本地智能水表", en: "Local smart meter" }, detail: { zh: "玄关总管流量与漏水监测", en: "Entry-main flow and leak sensing" } },
  { id: "filter", image: "/devices/clean_Water_Purifier.jpg", icon: "filter", status: "healthy", x: 86, y: 82, name: { zh: "厨房净水系统", en: "Kitchen filter" }, room: { zh: "厨房", en: "Kitchen" }, value: "118 ppm", lastCheck: "3", source: { zh: "净水器 TDS 传感器", en: "Filter TDS sensor" }, detail: { zh: "厨房 TDS 118 ppm", en: "Kitchen TDS 118 ppm" } },
  { id: "heater", image: "/devices/clean_Water_Heater.jpg", icon: "heater", status: "attention", x: 54, y: 16, name: { zh: "主浴室热水器", en: "Main-bath heater" }, room: { zh: "主浴室", en: "Main bathroom" }, value: "49°C", lastCheck: "1", source: { zh: "热水器温度传感器", en: "Heater temperature sensor" }, detail: { zh: "当前 49°C，需要关注", en: "Now 49°C, needs attention" } },
  { id: "kitchen", image: "/devices/clean_Kitchen_Water_Point.jpg", icon: "kitchen", status: "healthy", x: 84, y: 70, name: { zh: "厨房用水点", en: "Kitchen water point" }, room: { zh: "厨房", en: "Kitchen" }, value: "Normal", lastCheck: "4", source: { zh: "厨房净水设备", en: "Kitchen filter device" }, detail: { zh: "水质正常", en: "Quality normal" } },
  { id: "bathroom", image: "/devices/clean_Shower.jpg", icon: "shower", status: "delayed", x: 77, y: 39, name: { zh: "次浴室传感器", en: "Second-bath sensor" }, room: { zh: "次浴室", en: "Second bathroom" }, value: "—", lastCheck: "18", source: { zh: "浴室流量传感器", en: "Bathroom flow sensor" }, detail: { zh: "流量数据延迟", en: "Flow data delayed" } },
  { id: "basin", image: "/devices/clean_Kitchen_Faucet.jpg", icon: "waterPoint", status: "healthy", x: 62, y: 10, name: { zh: "主浴室洗手台", en: "Main-bath basin" }, room: { zh: "主浴室", en: "Main bathroom" }, value: "6.1 L/min", lastCheck: "2", source: { zh: "洗手台流量传感器", en: "Basin flow sensor" }, detail: { zh: "运行正常", en: "Operating normally" } },
];

export const sensors = [
  { id: "sensor-temp", type: "temperature", value: 49, unit: "°C", health: "healthy", updated: "20:58", deviceId: "dev-1" },
  { id: "sensor-flow", type: "usage", value: 8.4, unit: "L/min", health: "delayed", updated: "20:51", deviceId: "dev-2" },
  { id: "sensor-tds", type: "quality", value: 118, unit: "ppm", health: "healthy", updated: "20:59", deviceId: "dev-3" },
];

export const apiConnections = [
  { id: "api-device", serviceKey: "deviceApi", health: "offline", lastSync: "—", latency: "—", endpoint: "https://device.example/v2", webhook: "/hooks/device", lastResponse: "—", error: "Not connected" },
  { id: "api-quality", serviceKey: "qualityApi", health: "offline", lastSync: "—", latency: "—", endpoint: "https://quality.example/v1", webhook: "/hooks/quality", lastResponse: "—", error: "Not connected" },
  { id: "api-regional", serviceKey: "regionalApi", health: "offline", lastSync: "—", latency: "—", endpoint: "https://regional.example/notices", webhook: "/hooks/regional", lastResponse: "—", error: "Not connected" },
  { id: "api-notify", serviceKey: "notificationApi", health: "offline", lastSync: "—", latency: "—", endpoint: "https://notify.example/v2", webhook: "/hooks/status", lastResponse: "—", error: "Not connected" },
  { id: "api-ai", serviceKey: "aiApi", health: "offline", lastSync: "—", latency: "—", endpoint: "https://assist.example/explain", webhook: "—", lastResponse: "—", error: "Not connected" },
];

export const careNetwork = [
  { id: "contact-pm", name: { zh: "林惠敏", en: "Wai-man Lin" }, role: "primary", priority: 1, permissions: { zh: "完整照护权限", en: "Full care access" }, availability: "available", delay: "0 min", status: "viewed" },
  { id: "contact-sc", name: { zh: "陈嘉怡", en: "Ka-yee Chan" }, role: "secondary", priority: 2, permissions: { zh: "选定安全数据", en: "Selected safety data" }, availability: "standby", delay: "5 min", status: "delivered" },
  { id: "contact-ec", name: { zh: "林国强", en: "Kwok-keung Lin" }, role: "emergency", priority: 3, permissions: { zh: "仅紧急必要信息", en: "Emergency-only data" }, availability: "available", delay: "10 min", status: "sent" },
];

export const timelineNodes = [
  ["normal", "normal", "change", "normal", "normal", "attention"],
  ["normal", "normal", "normal", "normal", "normal", "normal"],
  ["normal", "missing", "normal", "normal", "change", "normal"],
];

export const records = [
  { id: "event-1", type: "care", titleKey: "resolvedTemp", time: "20:58", status: "resolved", detail: { zh: "主浴室水温恢复至照护范围", en: "Main-bath temperature returned to the care range" }, art: "/scene-shower-v11.png" },
  { id: "event-2", type: "system", titleKey: "delayedSensor", time: "20:51", status: "degraded", detail: { zh: "流量更新延迟，相关判断已降级", en: "Flow updates delayed; related checks degraded" }, art: "/scene-shower-v11.png" },
  { id: "event-3", type: "regional", titleKey: "regionalNotice", time: "19:05", status: "viewed", detail: { zh: "管网维护公告已由家人查看", en: "Water-main notice viewed by the family" }, art: "/scene-inlet-v11.png" },
  { id: "event-4", type: "care", titleKey: "careRule", time: "16:40", status: "acknowledged", detail: { zh: "主要照护人确认夜间提醒", en: "Primary caregiver acknowledged the night rule" }, art: "/luoshen-manager-portrait.png" },
  { id: "event-5", type: "device", titleKey: "filterChecked", time: "15:18", status: "resolved", detail: { zh: "厨房净水器滤芯状态已检查", en: "Kitchen filter cartridge checked" }, art: "/scene-filter-v11.png" },
  { id: "event-7", type: "sos", titleKey: "sosCancelled", time: "14:22", status: "resolved", detail: { zh: "家人已取消紧急联系", en: "Emergency contact cancelled by the family" }, art: "/luoshen-family-reference.png" },
  { id: "event-6", type: "quality", titleKey: "drinkingWaterCheck", time: "14:08", status: "healthy", detail: { zh: "厨房饮用水 · TDS 118 ppm", en: "Kitchen drinking water · TDS 118 ppm" }, art: "/scene-filter-v11.png" },
];

export const dataMappings = [
  { signal: { zh: "实时水温", en: "Real-time temperature" }, source: { zh: "本地温度传感器", en: "Local temperature sensor" }, purpose: { zh: "使用中风险监测", en: "Active-risk monitoring" } },
  { signal: { zh: "浊度与 TDS", en: "Turbidity and TDS" }, source: { zh: "厨房水质模块", en: "Kitchen quality module" }, purpose: { zh: "定时与使用前检查", en: "Scheduled and pre-use checks" } },
  { signal: { zh: "区域供水公告", en: "Regional water notice" }, source: { zh: "官方水务数据", en: "Official water authority data" }, purpose: { zh: "区域风险交叉验证", en: "Regional-risk cross-check" } },
  { signal: { zh: "辅助说明", en: "Assisted explanation" }, source: { zh: "AI 辅助服务", en: "AI support service" }, purpose: { zh: "解释规则或可信来源提供的事实", en: "Explain facts from rules or trusted sources" } },
];
