import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'新邻旧里 · 把日子慢慢过成回忆',description:'青年社区生活、居民共创与生活记忆服务。研究原型，所有人物及活动均为示例。'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
