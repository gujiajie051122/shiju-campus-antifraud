"use client";
import {useEffect,useRef,useState} from "react";
import {ArrowRight,Check,Loader2} from "lucide-react";
import type {Session} from "@/lib/scenario";
import {reflectionContext,reviewInput,reviewBasis,validateReviewSelection,practiceSkill} from "@/lib/reflection-context";
import {isReflectionRecord,type ReflectionRecord,type ReviewFeedback,type ReviewSelection} from "@/lib/reflection-types";
import {nextPractice,practiceCases,practiceResult,skillTitles} from "@/lib/reflection-practice";

export function ReflectionDesk({session,onSave,onEvidence,modelConfigured,hasUnsavedReason}:{session:Session;onSave:(record:ReflectionRecord)=>void;onEvidence:()=>void;modelConfigured:boolean;hasUnsavedReason:boolean}){
 const input=reviewInput(session),basis=reviewBasis(input),context=reflectionContext(input);
 const saved=session.reflection&&isReflectionRecord(session.reflection)&&session.reflection.basis===basis&&validateReviewSelection(session.reflection.selection,input)?session.reflection:undefined;
 const [consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(""),[feedback,setFeedback]=useState<ReviewFeedback["status"]|null>(saved?.feedback?.status??null),[note,setNote]=useState(saved?.feedback?.note??""),[practiceOpen,setPracticeOpen]=useState(false),[choice,setChoice]=useState(""),[lastCase,setLastCase]=useState<string|null>(null);
 const [editingFeedback,setEditingFeedback]=useState(false);
 const pending=useRef<AbortController|null>(null);
 // The parent keys this component by its evidence basis, so edits remount and abort stale work.
 useEffect(()=>()=>pending.current?.abort(),[]);
 const selection:ReviewSelection=saved?.selection??{engine:"rules",focusIds:context.candidates.slice(0,2).map(c=>c.id),factorId:"insufficient"};
 const selectedFocus=selection.focusIds.map(id=>context.candidates.find(c=>c.id===id)!).filter(Boolean);
 const factor=context.hypotheses.find(f=>f.id===selection.factorId),rejected=saved?.feedback?.status==="reject";
 const skill=practiceSkill(selection,input,saved?.feedback?.status);
 const answers=saved?.practice??[],upcoming=nextPractice(skill,answers),last=practiceCases.find(c=>c.id===lastCase),active=last??upcoming,answer=answers.find(a=>a.caseId===active?.id),result=active&&answer?practiceResult(active.id,answer.choiceId):null;
 function recordBase():ReflectionRecord{return saved??{basis,createdAt:new Date().toISOString(),selection:{engine:"rules",focusIds:context.candidates.slice(0,2).map(c=>c.id),factorId:"insufficient"},practice:[]};}
 async function generate(){
  if(!consent||busy||hasUnsavedReason)return;const ctl=new AbortController();pending.current=ctl;setBusy(true);setError("");
  try{const r=await fetch("/api/reflection",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({input,consent:true}),signal:AbortSignal.any([ctl.signal,AbortSignal.timeout(25000)])}),raw=await r.json() as ReviewSelection&{error?:string};
   if(!r.ok)throw Error(raw.error??"复盘暂未完成");const checked=validateReviewSelection(raw,input);if(!checked||!["model","rules"].includes(raw.engine))throw Error("复盘格式不正确");
   if(ctl.signal.aborted)return;
   onSave({basis,createdAt:new Date().toISOString(),selection:{engine:raw.engine,...checked,...(typeof raw.warning==="string"?{warning:raw.warning.slice(0,400)}:{})},practice:saved?.practice??[]});setFeedback(null);setNote("");setPracticeOpen(false);setLastCase(null);
  }catch(e){if(!ctl.signal.aborted)setError(e instanceof Error&&e.name==="TimeoutError"?"等待超时，已有操作复盘仍可查看。":e instanceof Error?e.message:"复盘暂未完成");}finally{if(pending.current===ctl){setBusy(false);pending.current=null;}}
 }
 function evidence(ids:string[]){return <details className="reflection-evidence"><summary>查看本轮依据</summary>{ids.map(id=>{const e=context.evidence.find(x=>x.id===id);return e?<div key={id}><strong>{e.title}</strong><p>{e.text}</p>{id!=="trace"&&id!=="self-report"&&<a href={"#event-"+id} onClick={onEvidence}>定位到记录</a>}</div>:null;})}</details>;}
 function editFeedback(){setFeedback(saved?.feedback?.status??null);setNote(saved?.feedback?.note??"");setEditingFeedback(true);}
 function saveFeedback(){if(!saved||!feedback)return;onSave({...saved,feedback:{status:feedback,note:note.trim().slice(0,500),at:new Date().toISOString()}});setEditingFeedback(false);setPracticeOpen(false);setLastCase(null);setChoice("");}
 function submitPractice(){if(!active||!choice||!practiceResult(active.id,choice))return;const record=recordBase();onSave({...record,practice:[...record.practice.filter(a=>a.caseId!==active.id),{caseId:active.id,choiceId:choice,at:new Date().toISOString()}].slice(-6)});setLastCase(active.id);setChoice("");}
 return <details className="panel reflection-desk" open={Boolean(saved)}><summary><div><span className="mini-label">决策路径 · 可确认与修正</span><h2>当时，你是怎么判断的？</h2></div><span aria-hidden="true">展开复盘</span></summary><div className="reflection-content">
  <div className="reflection-section-title"><span>01</span><h3>先看发生了什么</h3><small>{saved?.selection.engine==="model"?"AI整理":"操作摘要"}</small></div>
  <div className="reflection-facts">{selectedFocus.map(f=><article key={f.id}><h4>{f.title}</h4><p>{f.text}</p>{evidence(f.evidenceIds)}</article>)}</div>
  <div className="reflection-section-title"><span>02</span><h3>再确认当时的想法</h3></div>
  {session.reflection&&!saved&&<p className="reflection-notice">你的解释已变化，旧整理不再沿用。可以依据新自述重新生成。</p>}
  {!saved&&<p className="reflection-muted">操作记录不能证明心理原因。{session.reason?<>已保存你的自述，可生成一个待确认的问题。</>:<><a href="#reflection-reason">先写下当时的依据</a>，再决定是否让AI帮你整理。</>}</p>}
  {saved?.selection.warning&&<p className="reflection-notice" role="status">{saved.selection.warning}</p>}{error&&<p className="reflection-notice" role="status">{error}</p>}
  {factor&&(!saved?.feedback||editingFeedback)?<article className="factor-question"><span className="mini-label">{factor.title} · 待你确认</span><p>{factor.question}</p>{evidence(factor.evidenceIds)}<fieldset><legend>符合你当时的想法吗？</legend>{([["confirm","符合"],["reject","不符合"],["unsure","还不确定"]] as const).map(([id,label])=><label key={id}><input type="radio" name={"factor-"+session.branch} checked={feedback===id} onChange={()=>setFeedback(id)}/>{label}</label>)}</fieldset><textarea aria-label="补充或修正这条分析" placeholder="也可以补充自己的原因（选填）" maxLength={500} value={note} onChange={e=>setNote(e.target.value)}/><button className="secondary small" disabled={!feedback} onClick={saveFeedback}>保存我的确认或修正<Check size={14}/></button></article>:saved&&<p className="reflection-muted">{rejected?"已按你的修正停止沿用原解释。":factor?"已保留你的判断，可以随时修改。":"现有信息不足以判断心理原因，暂不推断。"}</p>}
  {saved?.feedback&&!editingFeedback&&<div className="reflection-feedback" role="status"><strong>你的{saved.feedback.status==="confirm"?"确认":saved.feedback.status==="reject"?"修正":"保留判断"}已保存</strong>{saved.feedback.note&&<p>{saved.feedback.note}</p>}<small>你的说明是自述，不是心理测评结论。</small>{rejected&&<details><summary>查看原来的待确认问题</summary><p>{factor?.question}</p>{factor&&evidence(factor.evidenceIds)}</details>}<button className="text-button" onClick={editFeedback}>修改这次判断</button></div>}
  {(!saved||saved.selection.engine==="rules")&&<div className="reflection-generate">{hasUnsavedReason&&<p>你刚修改了解释，请先保存，再生成复盘。</p>}<label><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>同意把本轮操作摘要与已保存自述发送至已配置的模型服务</label><small>不发送聊天原文；最多占用1次智能回复额度。</small><button className="secondary" disabled={!modelConfigured||!consent||busy||hasUnsavedReason} onClick={()=>void generate()}>{busy?<><Loader2 size={15} className="spin"/>整理中，可继续查看操作摘要</>:<>生成AI复盘<ArrowRight size={15}/></>}</button>{!modelConfigured&&<small>未连接模型，仍可查看操作摘要和换题练习。</small>}</div>}
  <div className="reflection-section-title"><span>03</span><h3>换个题面，试一次</h3></div><p className="reflection-muted">{skillTitles[skill]}。这是学习练习，不据此认定能力提升。</p>
  {!practiceOpen?<button className="secondary small" onClick={()=>setPracticeOpen(true)}>开始针对性练习<ArrowRight size={14}/></button>:active?<article className="reflection-practice"><span className="mini-label">原创模拟材料 · 不调用模型</span><h4>{active.title}</h4><p className="practice-material">{active.material}</p><fieldset disabled={Boolean(answer)}><legend>{active.question}</legend>{active.choices.map(c=><label className={answer?.choiceId===c.id?"selected":""} key={c.id}><input type="radio" name={active.id} checked={(answer?.choiceId??choice)===c.id} onChange={()=>setChoice(c.id)}/>{c.text}</label>)}</fieldset>{!answer?<button className="secondary small" disabled={!choice} onClick={submitPractice}>提交这次选择</button>:<div className="practice-explanation" role="status"><strong>{result?.preferred?"这一步补充了判断依据":"可以再想想信息来自哪里"}</strong><p>{result?.explanation}</p><small>记录已保存，不计分，也不作为独立效果证明。</small>{upcoming&&<button className="text-button" onClick={()=>{setLastCase(null);setChoice("");}}>再换一道题<ArrowRight size={14}/></button>}</div>}</article>:<p className="reflection-muted">这一方向的两道练习已完成。选择已保留，可随本轮记录导出。</p>}
 </div></details>;
}
