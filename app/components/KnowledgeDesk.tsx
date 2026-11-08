"use client";
import {useEffect,useRef,useState} from "react";
import {ArrowRight,BookOpen,ExternalLink,Loader2,Square} from "lucide-react";
import type {KnowledgeAnswer} from "@/lib/knowledge-answer";
export function KnowledgeDesk({modelConfigured=false}:{modelConfigured?:boolean}){
 const [question,setQuestion]=useState(""),[answer,setAnswer]=useState<KnowledgeAnswer|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const controller=useRef<AbortController|null>(null),epoch=useRef(0);
 useEffect(()=>()=>{epoch.current++;controller.current?.abort();},[]);
 async function ask(value=question){
  if(!value.trim()||busy)return;setQuestion(value);setBusy(true);setAnswer(null);setError("");const token=++epoch.current,ctl=new AbortController();controller.current=ctl;
  try{const r=await fetch("/api/knowledge",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:value.trim()}),signal:AbortSignal.any([ctl.signal,AbortSignal.timeout(25000)])});const data=await r.json() as KnowledgeAnswer&{error?:string};if(!r.ok)throw Error(data.error||"资料查询未完成");if(token===epoch.current)setAnswer(data);}
  catch(e){if(token===epoch.current)setError(e instanceof Error&&e.name==="TimeoutError"?"资料查询等待超时，可以修改问题后重试。":e instanceof Error?e.message:"资料查询未完成，请重试。");}
  finally{if(token===epoch.current)setBusy(false);}
 }
 function cancel(){epoch.current++;controller.current?.abort();setBusy(false);setError("已停止本次查询，可以修改问题后再查。");}
 return <details className="panel knowledge-desk">
  <summary><BookOpen size={17}/><span>查一条建议</span><small>资料与出处</small></summary>
  <div className="knowledge-body">
   <p>把疑问带回资料里，看看依据是什么。</p>
   <div className="knowledge-prompts">{["兼职先交培训费靠谱吗？","回拨对方给的号码算核实吗？","怀疑被骗，要留什么记录？"].map(q=><button key={q} disabled={busy} onClick={()=>void ask(q)}>{q}</button>)}</div>
   <form onSubmit={e=>{e.preventDefault();void ask();}}><label htmlFor="knowledge-question">想核对什么？</label><div className="knowledge-query"><input id="knowledge-question" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={300} required disabled={busy} placeholder="输入兼职或交易中的一个疑问"/><button className="primary" disabled={busy||!question.trim()}>查资料<ArrowRight size={14}/></button></div></form>
   {busy&&<div className="knowledge-progress" role="status"><Loader2 size={15} className="spin"/><span>正在检索资料并整理依据…</span><button className="text-button" onClick={cancel}><Square size={12}/>停止</button></div>}
   {error&&<p className="knowledge-message" role="alert">{error}</p>}
   {answer&&<div className="knowledge-answer" aria-live="polite"><span className="mini-label">{answer.engine==="model"?"模型整理 · 附资料依据":answer.engine==="retrieval"?"资料检索 · 依据已收录资料":"未找到足够资料"}</span>{answer.message&&<p className="knowledge-message">{answer.message}</p>}{answer.warning&&<p className="knowledge-message">{answer.warning}</p>}
    {answer.points.map((point,index)=><article className="knowledge-point" key={index}><p>{point.text}</p><div className="knowledge-citations">{point.sourceIds.map(id=>{const item=answer.sources.find(s=>s.id===id);if(!item)return null;return <details key={id}><summary>查看依据 · {item.heading}</summary><div className="source-note"><strong>{item.source.title}</strong><span>{item.source.publisher} · {item.source.date}</span><p><b>定位：</b>{item.source.locator}</p><p><b>资料摘要：</b>{item.text}</p>{item.source.scope&&<p className="source-scope">{item.source.scope}</p>}<a href={item.source.url} target="_blank" rel="noreferrer">打开原文<ExternalLink size={12}/></a></div></details>;})}</div></article>)}
   </div>}
   <small className="knowledge-disclaimer">{modelConfigured?"问题会交由已配置的模型服务整理；不上传演练记录。":"仅查询已收录资料，不上传演练记录。"}请勿输入真实个人信息。</small>
  </div>
 </details>;
}
