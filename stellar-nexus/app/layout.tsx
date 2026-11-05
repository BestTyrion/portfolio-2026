import type { Metadata } from 'next';
import './globals.css';
import './dark-theme.css';
import {LanguageProvider} from './components/I18n';
export const metadata: Metadata = {title:'星河交匯 · Stellar Nexus',description:'每個人的知識，都可以照亮別人。群體學習與AI輔助的私人及公共知識平台。'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body><LanguageProvider>{children}</LanguageProvider></body></html>}
