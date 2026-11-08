"use client";
import {useState} from "react";
import {Briefcase,Search,Phone,Check,ChevronDown,ArrowRight} from "lucide-react";
import {type Session,type Tool} from "@/lib/scenario";

const tools=[{id:"posting",title:"查岗位目录",icon:Briefcase},{id:"contact",title:"核实联系人",icon:Search},{id:"callback",title:"选择回拨渠道",icon:Phone}] as const;
const sources:Record<string,string>={posting:"工作室公开岗位目录",contact:"工作室招聘授权名录",callback:"工作室公开目录中的值班电话",sender:"招聘联系人提供的号码"};
export function VerificationDesk({session,onLookup}:{session:Session;onLookup:(tool:Tool,query:string,source:"directory"|"sender")=>void}){
 const [active,setActive]=useState<Tool|null>(null),[query,setQuery]=useState(""),[channel,setChannel]=useState<"directory"|"sender"|null>(null);
 const latest=session.events.filter(e=>e.kind==="verification"||e.kind==="verification_attempt").at(-1);
 const records=session.events.filter(e=>e.kind==="verification");
 const disabled=Boolean(session.decision);
 function open(t:Tool){setActive(t===active?null:t);setQuery("");setChannel(null);}
 return <>
  <p className="inspector-intro">你准备核对哪一项？</p>
  <div className="tool-list">{tools.map(t=><div key={t.id}>
   <button className={"tool-button "+(session.verified.includes(t.id)?"verified":"")} disabled={disabled} aria-expanded={active===t.id} aria-controls={"lookup-"+t.id} onClick={()=>open(t.id)}><t.icon size={17}/><strong>{t.title}</strong>{session.verified.includes(t.id)?<Check size={16}/>:<ChevronDown size={16}/>}</button>
   {active===t.id&&<form id={"lookup-"+t.id} className="lookup-form" onSubmit={e=>{e.preventDefault();if(t.id!=="callback"||channel)onLookup(t.id,query,channel??"directory");}}>
    {t.id==="callback"?<fieldset disabled={disabled}><legend>你从哪里找到这个号码？</legend><label><input type="radio" name="callback-source" value="directory" checked={channel==="directory"} onChange={()=>setChannel("directory")}/>工作室公开目录</label><label><input type="radio" name="callback-source" value="sender" checked={channel==="sender"} onChange={()=>setChannel("sender")}/>招聘联系人发来的消息</label></fieldset>:<><span className="lookup-source">{sources[t.id]} · 模拟</span><label htmlFor={"query-"+t.id}>{t.id==="posting"?"输入邀请中的岗位编号":"输入联系人称呼"}</label><input id={"query-"+t.id} value={query} maxLength={80} placeholder={t.id==="posting"?"在岗位资料中查看编号":"按材料中的称呼查询"} onChange={e=>setQuery(e.target.value)} disabled={disabled} required autoComplete="off"/></>}
    <button className="secondary full" disabled={disabled||(t.id==="callback"?!channel:!query.trim())}>{t.id==="callback"?"模拟回拨":"查询"}<ArrowRight size={14}/></button>
   </form>}
  </div>)}</div>
  {latest&&<div className={"verification-result "+(latest.kind==="verification_attempt"?"unconfirmed":"")} role="status" aria-live="polite"><span className="mini-label">{latest.kind==="verification"?"已取得结果":"本次未完成独立确认"}</span><p>{latest.text.replace(/【.*?】/g,"")}</p><small>来源：{sources[latest.channel??""]??"模拟独立目录"}</small></div>}
  {records.length>0&&<details className="evidence-records"><summary>已取得的核实记录 · {records.length}</summary>{records.map(r=><article key={r.id}><strong>{sources[r.channel??""]??r.title}</strong><p>{r.text.replace(/【.*?】/g,"")}</p></article>)}</details>}
  <p className="inspector-note">目录和回拨均为预置模拟材料。</p>
 </>;
}
