"use client";

import {useEffect,useState,useSyncExternalStore} from "react";
import {BookOpen,MessageCircle,ClipboardList} from "lucide-react";
import {QuestionBank} from "./QuestionBank";
import {LearningCatalog} from "./LearningCatalog";
import {IllustratedLesson} from "./IllustratedLesson";
import {SiteNav} from "./SiteNav";
import {KnowledgeChat} from "./KnowledgeChat";
import {lessons,learningKey,readLearning,type LearningProgress} from "@/lib/learning";

type Tab="courses"|"quiz"|"ask";
type LearningLocation={reading:boolean;quizScope:string;tab:Tab;lessonId:string};
const subscribeHydration=()=>()=>{};
function readLocation():LearningLocation {
  const params=new URLSearchParams(typeof window==="undefined"?"":window.location.search);
  const t=params.get("tab"),id=params.get("lesson"),exists=lessons.some(l=>l.id===id);
  return {tab:t==="ask"||t==="quiz"?t:"courses",reading:exists,lessonId:exists?id!:"jobs",quizScope:params.get("scope")==="wrong"?"wrong":lessons.some(l=>l.id===params.get("scope"))?params.get("scope")!:""};
}
function readSavedLearning():{progress:LearningProgress;error:string} {
  try{return {progress:readLearning(typeof window==="undefined"?null:JSON.parse(localStorage.getItem(learningKey)||"null")),error:""};}
  catch{return {progress:readLearning(null),error:"未能读取学习记录，本次仍可学习。"};}
}
export function LearningCenter(){
  const ready=useSyncExternalStore(subscribeHydration,()=>true,()=>false);
  if(!ready)return <div className="learning-page"><SiteNav active="/learn"/><main className="learning-main"><p className="learn-status" role="status">正在打开学习内容…</p></main></div>;
  // Mount the stateful view only after hydration: its initializers can then
  // read the real query string and saved browser progress without a reset effect.
  return <LearningCenterContent/>;
}
function LearningCenterContent(){
  const [location,setLocation]=useState(readLocation),[quizRun,setQuizRun]=useState(0),[question,setQuestion]=useState("");
  const [saved,setSaved]=useState(readSavedLearning);
  const {reading,quizScope,tab,lessonId}=location,{progress,error:storageError}=saved;

  useEffect(()=>{
    const handleLocation=()=>setLocation(readLocation());
    window.addEventListener("popstate",handleLocation);
    return ()=>window.removeEventListener("popstate",handleLocation);
  },[]);
  function updateProgress(next:LearningProgress){
    let error="";
    try{localStorage.setItem(learningKey,JSON.stringify(next));}
    catch{error="浏览器未能保存记录，本次进度仅在当前页面保留。";}
    setSaved({progress:next,error});
  }

  function chooseTab(t:Tab){
    setLocation(old=>({...old,tab:t,reading:t==="courses"?false:old.reading}));
    window.history.pushState({},"",t==="courses"?"/learn":"/learn?tab="+t);
  }
  function openLesson(id:string){
    setLocation(old=>({...old,lessonId:id,reading:true,tab:"courses"}));
    window.history.pushState({},"","/learn?lesson="+id);
    window.scrollTo({top:0,behavior:"instant"});
  }
  function practice(value:string){setLocation(old=>({...old,quizScope:value}));setQuizRun(n=>n+1);chooseTab("quiz");window.scrollTo({top:0});}
  function ask(value:string){setQuestion(value);chooseTab("ask");window.scrollTo({top:0});}
  const lesson=lessons.find(l=>l.id===lessonId)!;
  const inLesson=tab==="courses"&&reading;

  return <div className={`learning-page${tab==="quiz"?" is-practice":""}${inLesson?" is-micro-reading":""}`}>
    <SiteNav active="/learn"/>
    <main className="learning-main">

      {!inLesson&&<nav className="learn-tabs" aria-label="学习方式">{([{id:"courses",label:"课程学习",Icon:BookOpen},{id:"quiz",label:"题库练习",Icon:ClipboardList},{id:"ask",label:"知识问答",Icon:MessageCircle}] as const).map(t=><button key={t.id} aria-pressed={tab===t.id} onClick={()=>chooseTab(t.id)}><t.Icon size={18}/>{t.label}</button>)}</nav>}
      {storageError&&<p className="learn-status" role="status">{storageError}</p>}
      <div hidden={tab!=="courses"||reading}><LearningCatalog progress={progress} onOpen={openLesson}/></div>
      {inLesson&&<IllustratedLesson key={lessonId} lesson={lesson} progress={progress} ready={true} onBack={()=>chooseTab("courses")} onChoose={openLesson} onProgress={updateProgress} onAsk={ask} onPractice={practice}/>}
      <div hidden={tab!=="quiz"}><QuestionBank key={quizRun+":"+quizScope} progress={progress} onProgress={updateProgress} onAsk={ask} initialScope={quizScope}/></div>
      <div hidden={tab!=="ask"}><KnowledgeChat initialQuestion={question}/></div>
    </main>
  </div>;
}
