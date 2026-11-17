"use client";
import {useEffect,useRef,useState} from "react";
import {learningQuestionTopics as topics, learningQuestionDescriptions as descriptions} from "@/lib/learning-question-topics";
import {ArrowRight,ArrowUpRight,Loader2,Square,Plus,BookOpen,MessageCircle} from "lucide-react";
import type {KnowledgeAnswer,KnowledgeTurn} from "@/lib/knowledge-answer";
type Exchange={id:number;question:string;answer:KnowledgeAnswer};
export function KnowledgeChat({initialQuestion=""}:{initialQuestion?:string}){
 const [draft,setDraft]=useState(initialQuestion),[exchanges,setExchanges]=useState<Exchange[]>([]),[pending,setPending]=useState(""),[error,setError]=useState("");
 const [topic,setTopic]=useState("骗局识别");
 const controller=useRef<AbortController|null>(null),epoch=useRef(0),last=useRef<HTMLDivElement>(null);
 const [prefill,setPrefill]=useState(initialQuestion);
 if(prefill!==initialQuestion){setPrefill(initialQuestion);if(initialQuestion)setDraft(initialQuestion);}
 useEffect(()=>()=>{epoch.current++;controller.current?.abort();},[]);
 useEffect(()=>{if(exchanges.length)last.current?.scrollIntoView({behavior:"smooth",block:"nearest"});},[exchanges.length]);
 async function ask(question=draft){
  if(pending||!question.trim())return;const q=question.trim();setDraft("");setPending(q);setError("");const token=++epoch.current,ctl=new AbortController();controller.current=ctl;
  const history:KnowledgeTurn[]=exchanges.slice(-3).flatMap(e=>[{role:"user" as const,content:e.question},{role:"assistant" as const,content:e.answer.points.map(p=>p.text).join("\n").slice(0,2400)||e.answer.message||"资料不足"}]);
  try{const r=await fetch("/api/knowledge",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:q,history}),signal:AbortSignal.any([ctl.signal,AbortSignal.timeout(26000)])});const data=await r.json() as KnowledgeAnswer&{error?:string};if(!r.ok)throw Error(data.error||"答疑暂未完成");if(token===epoch.current)setExchanges(v=>[...v.slice(-19),{id:token,question:q,answer:data}]);}
  catch(e){if(token===epoch.current){setDraft(q);setError(e instanceof Error&&e.name==="TimeoutError"?"等待超时，问题已保留，请重试。":"答疑暂未完成，问题已保留，请重试。");}}
  finally{if(token===epoch.current)setPending("");}
 }
 function resetConversation(){setExchanges([]);setError("");setDraft("");}
 function stop(){epoch.current++;controller.current?.abort();setDraft(pending);setPending("");setError("已停止，问题已放回输入框。");}
 return <section className={"knowledge-v2 "+(exchanges.length||pending?"has-thread":"")} aria-label="反诈知识答疑">
 <aside className="knowledge-history"><h2>问答记录</h2><button disabled={Boolean(pending)} onClick={resetConversation}><Plus size={16}/>新的问题</button>
 {exchanges.length?<><small>本次提问</small>{exchanges.map(e=><button className="knowledge-history-item" key={e.id} onClick={()=>document.getElementById("exchange-"+e.id)?.scrollIntoView({behavior:"smooth"})}>{e.question}</button>)}<button disabled={Boolean(pending)} onClick={()=>setExchanges([])}>清空本次记录</button></>:<div className="knowledge-history-empty"><MessageCircle size={30} strokeWidth={1.3}/><p>暂无提问记录</p><small>你的问题会显示在这里</small></div>}
 <div className="knowledge-history-tip"><strong>提问小提示</strong><p>描述对方的要求、已有材料和你的疑问。</p></div></aside>
 <div className="knowledge-main"><div className="knowledge-mobile-tools"><button disabled={Boolean(pending)} onClick={resetConversation}><Plus size={15}/>新的问题</button></div>
 {!exchanges.length&&!pending&&<header className="knowledge-welcome"><div><span>反诈知识问答</span><h1><span>把疑问说清，</span><span>把依据弄明白。</span></h1><p>围绕具体情境提问，了解风险线索、核实方法与应对思路。</p></div><img src="/design/question-desk.webp" alt="" width={174} height={116}/></header>}
 <div className="learn-thread" aria-live="polite">{exchanges.map(e=><article className="learn-exchange" id={"exchange-"+e.id} key={e.id}><header className="knowledge-question"><span>你的问题</span><h2>{e.question}</h2></header><div className="learn-response"><span className="learn-answer-label">{e.answer.engine==="model"?"知识讲解":e.answer.engine==="retrieval"?"已收录知识要点":"资料边界"}</span>{e.answer.message&&<p>{e.answer.message}</p>}{e.answer.warning&&<p className="learn-status">{e.answer.warning}</p>}{e.answer.points.map((p,i)=><p key={i}>{p.text}</p>)}{e.answer.sources.length>0&&<details className="learn-sources"><summary>查看本次依据 · {e.answer.sources.length}条</summary>{e.answer.sources.map(s=><div key={s.id}><a href={s.source.url} target="_blank" rel="noreferrer">{s.source.title}<ArrowUpRight size={12}/></a><small>{s.source.publisher} · {s.source.date} · {s.source.locator}</small>{s.source.scope&&<small>{s.source.scope}</small>}</div>)}</details>}</div></article>)}{pending&&<div className="learn-pending" role="status"><strong>{pending}</strong><span><Loader2 className="spin" size={15}/>正在查找依据并整理讲解…</span><button onClick={stop}><Square size={13}/>停止</button></div>}<div ref={last}/></div>
 {exchanges.length>0&&!pending&&<div className="learn-followups">{["再简单讲一下","举个大学生的例子","把核实步骤讲清楚"].map(q=><button key={q} onClick={()=>void ask(q)}>{q}</button>)}</div>}
 <form onSubmit={e=>{e.preventDefault();void ask();}}><div className="knowledge-composer"><label htmlFor="theory-question">{exchanges.length?"继续提问":"你的问题"}</label><textarea id="theory-question" aria-describedby="knowledge-compose-help" rows={3} maxLength={300} value={draft} disabled={Boolean(pending)} onChange={e=>setDraft(e.target.value)} placeholder="如：兼职入职前要求先交培训费，我该核实什么？" required/><div className="knowledge-compose-actions"><small id="knowledge-compose-help">可描述具体经过，无需提供个人身份信息。</small><button disabled={Boolean(pending)||!draft.trim()} type="submit">提交问题<ArrowRight size={17}/></button></div></div><small>请勿填写姓名、账号、验证码等个人信息。</small></form>
 {!exchanges.length&&!pending&&<section className="knowledge-discover"><header><h2>从你关心的问题开始</h2><p>选择一个问题，继续了解</p></header><nav aria-label="问题主题">{Object.keys(topics).map(t=><button key={t} aria-pressed={topic===t} onClick={()=>setTopic(t)}>{t}</button>)}</nav><div>{topics[topic].map((q,i)=><button key={q} onClick={()=>void ask(q)}><span>{String(i+1).padStart(2,"0")}</span><div><strong>{q}</strong><small>{descriptions[topic][i]}</small></div><ArrowRight size={17}/></button>)}</div><p><BookOpen size={15}/>回答供反诈学习参考，涉及具体事项请结合原始材料核实。</p></section>}{error&&<p className="learn-status" role="alert">{error}</p>}
 </div></section>;
}
