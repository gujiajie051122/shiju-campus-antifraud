"use client";
import {useEffect,useRef,useState} from 'react';
import {Loader2,Sparkles} from 'lucide-react';
import type {JobRun} from '@/lib/job-workshop';
import {jobReviewInput,jobReviewBasis,jobReflectionContext} from '@/lib/job-reflection';
import {validateContextSelection} from '@/lib/reflection-context';
import {isReflectionRecord,type ReflectionRecord,type ReviewFeedback} from '@/lib/reflection-types';

export function JobAIReflection({run,onSave}:{run:JobRun;onSave:(record:ReflectionRecord)=>boolean}){
 const input=jobReviewInput(run),basis=jobReviewBasis(input),context=jobReflectionContext(input);
 const saved=isReflectionRecord(run.reflection)&&run.reflection.basis===basis&&validateContextSelection(run.reflection.selection,context)?run.reflection:undefined;
 const [consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[signin,setSignin]=useState(false);
 const pending=useRef<AbortController|null>(null);useEffect(()=>()=>pending.current?.abort(),[]);
 const selected=saved?.selection.focusIds.map(id=>context.candidates.find(c=>c.id===id)!).filter(Boolean)??[];
 const factor=context.hypotheses.find(h=>h.id===saved?.selection.factorId);
 function evidence(ids:string[]){return <details><summary>查看这条整理的依据</summary>{ids.map(id=>{const e=context.evidence.find(x=>x.id===id);return e?<div className="job-ai-evidence" key={id}><strong>{e.title}</strong><p>{e.text}</p></div>:null;})}</details>;}
 async function generate(){
  if(!consent||busy)return;const ctl=new AbortController();pending.current=ctl;setBusy(true);setError('');setSignin(false);
  try{
   const response=await fetch('/api/reflection',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jobInput:input,consent:true}),signal:AbortSignal.any([ctl.signal,AbortSignal.timeout(25000)])});
   const payload=await response.json();if(ctl.signal.aborted)return;
   if(!payload||typeof payload!=='object')throw Error('复盘返回格式不正确，已保留操作摘要。');const raw=payload as Record<string,unknown>;
   if(!response.ok)throw Error(typeof raw.error==='string'?raw.error:'AI复盘暂未完成，请稍后重试。');
   const selection=validateContextSelection(raw,context);if(!selection||(raw.engine!=='model'&&raw.engine!=='rules'))throw Error('返回内容无法与本轮依据对应，已保留操作摘要。');
   setSignin(raw.budgetCode==='signin');
   const record:ReflectionRecord={basis,createdAt:new Date().toISOString(),selection:{engine:raw.engine,...selection,...(raw.engine==='rules'?{warning:typeof raw.warning==='string'?raw.warning.slice(0,400):'本次未获得模型整理，显示规则摘要；可稍后重试。'}:{})},practice:[]};
   if(!onSave(record))throw Error('复盘未能保存，请检查浏览器存储后重试。');
  }catch(e){if(!ctl.signal.aborted)setError(e instanceof Error&&e.name==='TimeoutError'?'等待超时，下面的操作摘要仍可查看，请稍后重试。':e instanceof Error?e.message:'连接暂不可用，下面的操作摘要仍可查看。');}
  finally{if(pending.current===ctl){pending.current=null;setBusy(false);}}
 }
 function feedback(status:ReviewFeedback['status']){if(saved&&!onSave({...saved,feedback:{status,note:'',at:new Date().toISOString()}}))setError('确认结果未能保存，请重试。');}
 return <section className="job-ai-reflection" aria-label="AI复盘">
  <header><div><span className="job-section-kicker"><Sparkles size={15}/>结合本轮依据</span><h2>AI复盘</h2></div><span className="job-ai-badge">{saved?(saved.selection.engine==='model'?'AI整理 · 已保存':'规则摘要 · 已保存'):'尚未生成'}</span></header>
  <p>请AI从本轮记录中整理值得回看的判断依据。原始操作与核实结果可在判断依据和行动记录中回看。</p>
  {selected.map(f=><article className="job-ai-focus" key={f.id}><h3>{f.title}</h3><p>{f.text}</p>{evidence(f.evidenceIds)}</article>)}
  {saved?.selection.warning&&<p className="job-ai-notice" role="status">{saved.selection.warning}</p>}
  {factor?<div className="job-ai-factor"><h3>{factor.title} · {saved?.feedback?({confirm:'已确认',reject:'已修正',unsure:'暂未确定'}[saved.feedback.status]):'待你确认'}</h3><p>{saved?.feedback?.status==='reject'?'你已表示不符合，后续不沿用这条解释。':factor.question}</p>{evidence(factor.evidenceIds)}<div className="job-ai-feedback" role="group" aria-label="确认或修正AI复盘">{([['confirm','符合'],['reject','不符合'],['unsure','还不确定']] as const).map(([id,label])=><button key={id} aria-pressed={saved?.feedback?.status===id} onClick={()=>feedback(id)}>{label}</button>)}</div>{saved?.feedback&&<p role="status">你的{saved.feedback.status==='confirm'?'确认':saved.feedback.status==='reject'?'修正':'保留判断'}已保存，可随时更改。</p>}</div>:saved&&<p>现有自述不足以判断心理原因，暂不推断。</p>}
  {(!saved||saved.selection.engine==='rules')&&<div className="job-ai-generate"><label><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>同意将本轮操作摘要与已保存的判断理由发送至已配置的模型服务</label><small>不发送聊天原文；最多使用 1 次智能回复额度。生成后自动保存在本次演练记录中。</small><button className="job-ai-generate-button" disabled={!consent||busy} onClick={()=>void generate()}>{busy?<><Loader2 size={16} className="spin"/>正在整理…</>:<><Sparkles size={16}/>{saved?'重试AI复盘':'生成AI复盘'}</>}</button></div>}
  {signin&&<a className="job-ai-signin" href={'/signin-with-chatgpt?return_to='+encodeURIComponent('/review?run='+run.id)}>登录并启用AI复盘</a>}
  {error&&<p className="job-ai-notice" role="status">{error}</p>}
  <small>AI依据已记录材料选择整理重点；不诊断、不评分，也不把操作记录当作真实心理原因。</small>
 </section>;
}
