"use client";
import {useSyncExternalStore} from "react";
import {lessons,learningKey,readLearning} from "@/lib/learning";
import {practiceBank,practiceCorrect} from '@/lib/practice-bank';
const subscribeHydration=()=>()=>{};
function subscribe(listener:()=>void){window.addEventListener('storage',listener);return ()=>window.removeEventListener('storage',listener);}
function snapshot(){try{return localStorage.getItem(learningKey)||'';}catch{return '';}}
export function LearningRecordSummary(){
 const raw=useSyncExternalStore(subscribe,snapshot,()=>''),loaded=useSyncExternalStore(subscribeHydration,()=>true,()=>false);
 let progress=readLearning(null);try{progress=readLearning(JSON.parse(raw||'null'));}catch{}
 const answered=Object.keys(progress.practice??{}).length,wrong=practiceBank.filter(q=>practiceCorrect(q,progress.practice?.[q.id])===false),review=practiceBank.filter(q=>q.kind==='材料分析'&&progress.practice?.[q.id]?.review).length;
 return <section className="learning-record-summary panel"><div><span className="mini-label">学习中心</span><h2>课程与题目</h2><p>{loaded?`图文已读 ${progress.completed.length}/${lessons.length} 课 · 已答 ${answered}/${practiceBank.length} 道题库题 · 错题 ${wrong.length} 道 · 材料待复习 ${review} 道 · 课程随堂已答 ${Object.keys(progress.answers).length} 题`:"正在读取本地学习记录…"}</p>{progress.completed.length>0&&<small>{lessons.filter(l=>progress.completed.includes(l.id)).map(l=>l.title).join(" / ")}</small>}</div><a className="secondary small" href="/learn">继续学习 →</a></section>;
}
