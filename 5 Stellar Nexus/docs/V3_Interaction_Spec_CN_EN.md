# 星河交汇 V3｜流动的知识入口与双语展示

Figma（可编辑中英文开场、悬停状态、16秒时间轴）：
https://www.figma.com/design/h2QxiybQeu417soinIJquE

线上网站：
https://stellar-nexus-knowledge.p-tyrionchow.chatgpt.site

## 本次新增

- 持续流动的七色粒子星河，1190个基础粒子，使用本地Canvas计算；不依赖背景视频。
- 桌面8个、窄屏4个流动技能槽位。主题沿曲线从左向右行进，左侧渐入、右侧渐出，循环时换入下一个主题。当前池包含24个已批准的演示主题。
- 悬停技能会暂停该节点并放大至120%，显示当前想学与可教数量。鼠标附近的粒子轻微聚拢，并留下消散的彩色轨迹。
- 音效默认关闭。用户按“开启音效”后，Web Audio合成轻微气流声；位置影响声像和滤波，进入技能时有短促柔和提示音。关闭、离开与后台状态会静音。没有麦克风权限，也不播放第三方音乐。
- 支持暂停、系统与账号的减少动态偏好。键盘聚焦技能时暂停运动，失焦恢复，按Enter可以选择技能。
- 中文 / EN切换覆盖开场、六入口、主要表单、按钮、知识图谱、演示活动、知识与导师介绍。语言保存在当前设备，不改变数据库原始资料、筛选值或API枚举。
- 自由输入的私人笔记保留原文；没有将用户内容发送给翻译服务，也不会假装自动翻译未知内容。已编写的演示资料提供人工撰写的英文版本。

## 具体数据与内容

在V2的12个主题基础上新增12个：蓝晒、版画、阳台种植、生活英语、口述故事、信息设计、衣物修补、地方茶文化、声音采集、无障碍数字工具、社区地图、生活记账。

新增10场有明确成果的活动：蓝晒明信片、街角纹理小册、阳台配土、三分钟生活英语、地方故事访谈、活动信息海报、衣物修补、冲泡条件比较、声音明信片和新朋友社区地图。每场有目标、设备、时间、人数、带领者及实际演示报名记录。新增10份逐主题编写的具体练习清单、10则求课、4位分享者、30位明确标记为Demo的虚构成员及60条想学技能连结。

这些是同一演示数据库中的合成记录，能产生供需与人数展示，不代表真实需求调研、参与人数、文化趋势或合作场地。私人笔记、复习与学习时间线不替虚构成员伪造。

新增植物、缝纫和茶具的独立摄影素材，其他主题复用相符的工作过程图片。完整出处见photo-credits.json；素材不冒充真实平台活动或人物肖像。

## 信息系统的具体想法

1. 共同做出一件东西：每场活动输出一张明信片、一页地图、一段声音或一份观察表，便于比较过程并留下可复用的知识。
2. 同一主题允许多种角色：参与者在熟悉领域协助带领，在另一领域继续学习；共同带领邀请必须由对方接受。
3. 需求变成可核对条件：观星台先显示现在的主題需求、地区与分享者，再把程度、时段、设备、人数和场地许可交给组织者确认。
4. 公共与私人形成循环：活动内共同笔记 → 本人私人笔记 → 选源整理与复习 → 主动授权摘录 → 人工审核后公开。原始资料和退出分享的选择持续保留。
5. 让地方文化有具体内容：街道纹理、口述记忆、声音和茶文化作为可以实践的主题；时间趋势只有在累积足够真实历史数据后展示。

## Motion / bilingual implementation notes

The live site uses a canvas particle field, pointer attraction and short-lived trails. Eight desktop (four narrow-screen) DOM skill buttons travel at 2.8% of the surface width per second along three curved lanes. A complete travel cycle takes approximately 46 seconds; labels update when a slot wraps back to the left. Hover pauses one label, keyboard focus pauses travel, and reduced-motion preferences retain a static usable interface.

Sound is opt-in and generated in the browser. A band-pass filtered noise loop provides a quiet flow texture, stereo panning follows horizontal position, and short sine tones acknowledge skill entry. The audio context is closed when the opening unmounts. Audio and motion controls remain separate.

The Figma file contains editable vectors, text, local colour variables and instances of a reusable skill component. Its 16-second demonstration timeline illustrates entrance and exit; website timing is longer for readability. Mouse-reactive physics and sound run on the website; Figma is the editable design and motion reference.

The locale adapter localises rendered text and accessibility labels while preserving canonical select values, raw user input, IDs and request payloads. Unknown free-form content stays in its original language. English and Chinese search both operate on canonical topic data and authored translations.

AI knowledge organisation remains an explicitly labelled source-compilation template. No live LLM, external translation model, background push or actual venue booking has been added in this update.
