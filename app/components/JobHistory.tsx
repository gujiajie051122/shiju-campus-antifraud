"use client";
import Link from 'next/link';
import {useSyncExternalStore} from 'react';
import {jobStories,isJobRun,JOB_RUN_KEY,type JobRun} from '@/lib/job-workshop';
import {JOB_HISTORY_KEY,readJobHistory,jobHistoryWithCurrent} from '@/lib/job-history';
const subscribe=(fn:()=>void)=>{window.addEventListener('storage',fn);window.addEventListener('shiju-job',fn);return()=>{window.removeEventListener('storage',fn);window.removeEventListener('shiju-job',fn);};};
const snapshot=()=>{try{return JSON.stringify([localStorage.getItem(JOB_RUN_KEY),localStorage.getItem(JOB_HISTORY_KEY)]);}catch{return 'error';}};
const decisions={pause:'暂缓办理',continue:'继续办理',exit:'结束沟通',report:'标记并报告'};
export function useJobRecords(){
 const raw=useSyncExternalStore(subscribe,snapshot,()=> '[]');
 let runs:JobRun[]=[];let error='';
 try{if(raw==='error')throw Error();const [current,history]=JSON.parse(raw);const parsed=current?JSON.parse(current):null;if(parsed&&!isJobRun(parsed))throw Error();runs=jobHistoryWithCurrent(readJobHistory(history),parsed).sort((a,b)=>b.logs[0].at.localeCompare(a.logs[0].at));}catch{error='暂时无法读取完整记录，已保存的数据不会被清空。';}
 return {runs,error};
}
export function JobRunRecord({fallback}:{fallback?:React.ReactNode}){
 const {runs,error}=useJobRecords();
 if(!runs.length)return error?<p role="status">{error}</p>:fallback??null;
 return <section className="job-history" aria-label="求职演练记录"><header><h2>我的情境练习</h2><span>{runs.length} 轮记录 · 保存在此浏览器</span></header>{runs.map(run=><article key={run.id}><div><small>{run.mode==='learning'?'引导演练':'独立挑战'} · {run.decision?'已完成':'未结束'}</small><h3>{jobStories[run.mode].title}</h3><time>{new Date(run.logs[0].at).toLocaleString('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}</time><p>{run.decision?decisions[run.decision]:'尚未作出决定'} · {run.logs.filter(l=>l.action==='user'||l.action==='actor').length} 条对话消息</p></div><div>{run.decision?<Link href={'/review?run='+encodeURIComponent(run.id)}>查看复盘与对话 ↗</Link>:<Link href={'/simulation?run='+encodeURIComponent(run.id)}>继续这次练习 ↗</Link>}<button onClick={()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(run,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`识局-求职演练-${run.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>导出记录</button></div></article>)}</section>;
}
