# API与实现 V2

原有/api负责认证、兴趣、求课、课程、活动、报名候补、签到、反馈、知识审核与撤回。/api/v2/bootstrap组合公共导师/主题关系和本人私人资料。

|V2 POST|用途与边界|
|---|---|
|note|增改删自己的笔记；删除只清理相关复习、合集关联与整理草稿|
|collection|创建私人合集、加入本人的笔记|
|save-public / unsave|收藏已公开且有授权的知识，保留来源|
|ai|最多12份本人授权来源；organize / review；mode=template_demo|
|confirm-job / review|本人核对草稿或标记复习状态|
|share|本人确认并同意后进入pending知识卡|
|mentor|本人申请/退出；管理员有依据地审核推荐|
|group-note|仅正式活动成员、教师、组织管理者读写|
|invite|组织者邀请，目标成员接受后加入教师表|
|settings|个人资料和界面偏好持久保存|
|export|只返回本人笔记、收藏、复习、任务和时间线|
|password|验证当前密码；禁止更改Demo密码；撤销其他会话|

数据表与迁移见db/schema.ts和drizzle/0001_familiar_morlocks.sql。真实模型密钥、上传、邮件、推送、历史趋势快照与账号恢复未连接。不要将演示权限账号用于面向公众的真实服务。
