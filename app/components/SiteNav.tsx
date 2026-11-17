import Link from "next/link";
import {BrandLogo} from "./BrandLogo";
export const sections=[{href:"/",label:"首页"},{href:"/learn",label:"学习中心"},{href:"/simulation",label:"情境模拟"},{href:"/review",label:"AI复盘"},{href:"/records",label:"学习记录"}];
export function SiteNav({active}:{active:string}){return <header className="site-nav"><Link className="site-logo" href="/" aria-label="识局首页"><BrandLogo inverse/><span className="site-tagline">看见套路，练习判断</span></Link><nav aria-label="主导航">{sections.map(s=><Link key={s.href} href={s.href} aria-current={active===s.href?"page":undefined}>{s.label}</Link>)}</nav></header>;}
