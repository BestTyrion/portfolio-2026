// Retired shared demo: do not expose V1 personal data on the public site.
export function GET(){return Response.json({error:'旧版入口已停用，请使用 /api/life 创建独立演示成员'},{status:410})}
export const POST=GET;
