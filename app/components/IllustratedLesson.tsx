"use client";

import {useEffect, useRef, useState} from "react";
import {ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Info, ListChecks, MessageCircle, RotateCcw, Maximize2, X, FileText, Route} from "lucide-react";
import {type Lesson, type LearningProgress, quizItems, lessons} from "@/lib/learning";
import {courseContent} from "@/lib/course-content";
import {courseNotes} from "@/lib/course-notes";
import {knowledgeChunks} from "@/lib/knowledge";
import {lessonArtwork, lessonEditorial} from "@/lib/lesson-editorial";
import {lessonReading} from "@/lib/lesson-reading";
import {lessonPhotography} from "@/lib/lesson-photography";
import {lessonInsights} from "@/lib/lesson-insights";

export function IllustratedLesson({lesson, progress, ready, onBack, onChoose, onProgress, onAsk, onPractice}:{
  lesson:Lesson; progress:LearningProgress; ready:boolean; onBack:()=>void;
  onChoose:(id:string)=>void; onProgress:(p:LearningProgress)=>void;
  onAsk:(question:string)=>void; onPractice:(id:string)=>void;
}) {
  const reading={...lessonReading[lesson.id],annotations:lessonInsights[lesson.id].annotations}, editorial=lessonEditorial[lesson.id], note=courseNotes[lesson.id];
  const topicLessons=courseContent.filter(c=>c.topic===lesson.topic).map(c=>lessons.find(l=>l.id===c.id)!);
  const nextLesson=topicLessons[topicLessons.findIndex(l=>l.id===lesson.id)+1];
  const question=quizItems.find(q=>q.id===lesson.id+"-scene")!;
  const isRecord=lesson.id.endsWith("record"), isCamera=lesson.id==="trade-platform";
  const chapters=[{id:"guide",label:"本课导读"},{id:"dialogue",label:isRecord?"经过回看":lesson.topic==="二手交易"||lesson.topic==="购票骗局"?"交易对话":"情境材料"},{id:"compare",label:"材料对照"},{id:"method",label:"核实方法"},{id:"check",label:"随堂判断"}];
  const [active,setActive]=useState("guide"), [answer,setAnswer]=useState<number|null>(progress.answers[question.id]??null);
  const [submitted,setSubmitted]=useState(question.id in progress.answers), [finished,setFinished]=useState(false);
  const content=useRef<HTMLElement>(null), dialog=useRef<HTMLDialogElement>(null), firstRender=useRef(true), focusTab=useRef(false);
  const [zoom,setZoom]=useState<"scene"|"guide"|"method"|"question"|number|null>(null);
  const completed=progress.completed.includes(lesson.id);
  const sources=lesson.sourceIds.map(id=>knowledgeChunks.find(s=>s.id===id)).filter(s=>s!==undefined);
  const title=reading.title??lesson.title;

  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{try {const saved=sessionStorage.getItem("shiju-chapter-"+lesson.id);if(chapters.some(c=>c.id===saved))setActive(saved!);}catch{}});
    return ()=>cancelAnimationFrame(frame);
  // The component is remounted when the course changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[lesson.id]);
  useEffect(()=>{
    if(firstRender.current){firstRender.current=false;return;}
    try{sessionStorage.setItem("shiju-chapter-"+lesson.id,active);}catch{}
    const frame=requestAnimationFrame(()=>{
      const target=content.current?.querySelector<HTMLElement>("#reading-"+active);
      target?.scrollIntoView({block:"start",behavior:"instant"});
      if(focusTab.current){content.current?.querySelector<HTMLElement>("#tab-"+active)?.focus({preventScroll:true});focusTab.current=false;}else target?.querySelector<HTMLElement>("h1,h2")?.focus({preventScroll:true});
    });
    return ()=>cancelAnimationFrame(frame);
  },[active,lesson.id]);
  useEffect(()=>{
    if(zoom===null)return;
    const original=document.body.style.overflow;document.body.style.overflow="hidden";
    const element=dialog.current;element?.showModal();
    return ()=>{element?.close();document.body.style.overflow=original;};
  },[zoom]);

  function jump(id:string){
    setActive(id);
  }
  const artwork=isCamera?"/lesson-reading/camera.webp":lessonArtwork(lesson.id);
  const artworkAlt=isCamera?"教学用二手相机商品示意":editorial.visualAlt;
  const currentIndex=chapters.findIndex(c=>c.id===active);
  function renderCurrentMaterial(){const panel=reading.panels[0];return <div className="reading-evidence-sheet"><div className="reading-evidence-band"><FileText size={20}/><span>{lesson.topic}</span><small>教学材料</small></div><div className="reading-evidence-body"><p className="reading-evidence-source">{panel.path}</p><h3>{panel.title}</h3><dl>{panel.fields.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div><p className="reading-evidence-foot">材料摘录 · 人物、账号与内容均为教学模拟</p></div>;}
  function renderMethodMap(){return <figure className="reading-method-photo-card"><img className="reading-chapter-photo" src={lessonPhotography[lesson.id].method} alt={isRecord?"教学示意：整理原始材料与经过":"教学示意：通过独立渠道核实信息"} width={1200} height={800}/><figcaption><small>操作情境 · 原创教学示意</small><h3>{isRecord?"让每一份材料对应经过":"把核实落到具体信息上"}</h3><p className="reading-method-photo-path"><Route size={17}/>{reading.panels[1].path}</p><dl>{reading.panels[1].fields.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><p>{reading.panels[1].note}</p></figcaption></figure>;}
  function renderSceneMaterial(expanded=false){return <figure className="reading-scene-figure">
    <img className="reading-chapter-photo" src={lessonPhotography[lesson.id].scene} alt={"教学情境："+reading.context} width={1200} height={800}/><figcaption className="reading-photo-caption">情境画面 · 原创教学模拟</figcaption>
    <div className="reading-scene-transcript"><header><strong>{chapters[1].label}</strong><small>教学模拟</small>{!expanded&&<button onClick={()=>setZoom("scene")}><Maximize2 size={15}/>放大查看</button>}</header>
    <div className="reading-messages" aria-label="教学对话">{reading.dialogue.map(([speaker,text],i)=><div className={"reading-message"+(speaker==="你"?" is-self":"")} key={i}><strong>{speaker}</strong><div><p>{text}</p></div>{i!==1&&<small className="reading-marker">0{i===0?1:2}</small>}</div>)}</div></div>
  </figure>;}
  function renderPanelMaterial(index:number,expanded=false){const panel=reading.panels[index];return <figure className="reading-panel" key={panel.title}><header><h3>{panel.title}</h3><p>{panel.path}</p><small>{index===0?"当前材料":"核对方向"}</small></header><dl>{panel.fields.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><figcaption>{panel.note}</figcaption>{!expanded&&<button className="reading-panel-zoom" onClick={()=>setZoom(index)}><Maximize2 size={15}/>放大这份材料</button>}</figure>;}
  function submit(){
    if(answer===null||!ready)return;
    setSubmitted(true);
    onProgress({...progress,answers:{...progress.answers,[question.id]:answer}});
  }
  function finish(){
    if(!submitted||!ready)return;
    if(!completed) onProgress({...progress,completed:[...progress.completed,lesson.id]});
    setFinished(true);
  }

  return <article className="reading-course" ref={content} aria-label="图文课程">
    <div className="reading-context">
      <div className="reading-breadcrumb"><button onClick={onBack}><ArrowLeft size={17}/>返回课程目录</button><span className="reading-crumb-topic">{lesson.topic}<span>/</span></span><span className="reading-crumb-title">{title}</span>
        <label className="reading-selector"><span className="sr-only">切换本专题课程</span><select aria-label="切换本专题课程" value={lesson.id} onChange={e=>onChoose(e.target.value)}>{topicLessons.map(l=><option key={l.id} value={l.id}>{lessonReading[l.id].title??l.title}</option>)}</select><ChevronDown size={14}/></label>
      </div>
      <nav className="reading-chapters" role="tablist" aria-label="本课章节">{chapters.map((chapter,i)=><button role="tab" id={"tab-"+chapter.id} aria-controls={"reading-"+chapter.id} aria-selected={active===chapter.id} tabIndex={active===chapter.id?0:-1} key={chapter.id} aria-current={active===chapter.id?"page":undefined} onClick={()=>jump(chapter.id)} onKeyDown={e=>{let next=i;if(e.key==="ArrowRight")next=(i+1)%chapters.length;else if(e.key==="ArrowLeft")next=(i+chapters.length-1)%chapters.length;else if(e.key==="Home")next=0;else if(e.key==="End")next=chapters.length-1;else return;e.preventDefault();focusTab.current=true;setActive(chapters[next].id);}}>{chapter.label}</button>)}</nav>
    </div>

    <section id="reading-guide" role="tabpanel" aria-labelledby="tab-guide" hidden={active!=="guide"} data-reading-section="guide" className="reading-guide">
      <div className="reading-guide-layout"><div><div className="reading-eyebrow">图文课程<span>{lesson.focus}</span>{completed&&<span className="reading-done"><Check size={14}/>已学习</span>}</div>
      <h1 tabIndex={-1}>{title}</h1><p className="reading-intro">{reading.intro}</p><p className="reading-meta">约 5–7 分钟<span>含 1 道情境判断</span><span>原创教学</span></p>
      <div className="reading-guide-points"><strong>本课的三个核实重点</strong><ol>{editorial.cues.map(([label,text],i)=><li key={label}><span>0{i+1}</span><div><strong>{label}</strong><p>{text}</p></div></li>)}</ol></div></div>
      <figure className="reading-guide-visual"><button onClick={()=>setZoom("guide")} aria-label="放大本课主题图"><img src={artwork} alt={artworkAlt} width={isCamera?600:1200} height={isCamera?450:800}/><span><Maximize2 size={15}/>放大查看</span></button><figcaption><strong>这节课从这里开始</strong><p>{reading.context}</p><small>图像与对话为原创教学模拟。</small></figcaption></figure></div>
    </section>

    <section id="reading-dialogue" role="tabpanel" aria-labelledby="tab-dialogue" hidden={active!=="dialogue"} data-reading-section="dialogue" className="reading-section">
      <header className="reading-section-heading"><span>01 · {chapters[1].label}</span><h2 tabIndex={-1}>{isCamera?reading.sceneTitle.split("，").map((part,i)=><span className="reading-title-phrase" key={part}>{part}{i===0?"，":""}</span>):reading.sceneTitle}</h2><p>{reading.context}</p></header>
      <div className="reading-scene-layout"><div>{renderSceneMaterial()}<p className="reading-caption">原创教学模拟，人物、对话与金额均为虚构；不是新闻证据。</p></div>
        <aside className="reading-scene-notes"><h3>观察这次{isRecord?"经过":"沟通"}的两个关键点</h3><ol>{reading.annotations.map(([label,text],i)=><li key={label}><span>0{i+1}</span><div><h4>{label}</h4><p>{text}</p></div></li>)}</ol><div className="reading-analysis"><h3>{lessonInsights[lesson.id].question}</h3><p>{reading.panels[0].note} {reading.panels[1].note}</p></div><p className="reading-scene-takeaway">{editorial.takeaway}</p><details className="reading-extra"><summary>展开观察与解释<ChevronDown size={16}/></summary><p>{reading.analysis}</p>{editorial.cues.map(([label,text])=><div key={label}><strong>{label}</strong><p>{text}</p></div>)}</details></aside>
      </div>
    </section>

    <section id="reading-compare" role="tabpanel" aria-labelledby="tab-compare" hidden={active!=="compare"} data-reading-section="compare" className="reading-section">
      <header className="reading-section-heading"><span>02 · {chapters[2].label}</span><h2 tabIndex={-1}>{reading.contrastTitle}</h2><p>把眼前的材料和需要确认的事情放在一起，看看哪些信息还没有被证实。</p></header>
      <div className="reading-comparison">{reading.panels.map((panel,index)=>renderPanelMaterial(index))}</div>
      <p className="reading-caption">界面与记录为教学示意，具体功能、流程与规则以所用平台或机构为准。</p>
      <div className="reading-prose"><h3>{isRecord?"材料要对应事实，也要保留来源":"相似的说法，不一定是独立的依据"}</h3><p>{reading.contrastText}</p><p>{note.why}</p></div>
    </section>

    <section id="reading-method" role="tabpanel" aria-labelledby="tab-method" hidden={active!=="method"} data-reading-section="method" className="reading-section">
      <header className="reading-section-heading"><span>03 · 核实方法</span><h2 tabIndex={-1}>{isRecord?"把材料整理到哪一步，才能讲清经过？":"真正有用的核实，要做到哪一步？"}</h2><p>{editorial.heading} 不只记住提醒，也把行动落到具体的信息与渠道上。</p></header>
      <div className="reading-method-layout"><ol className="reading-methods">{reading.details.map((text,i)=><li key={i}><span className="reading-step">0{i+1}</span><div><h3>{editorial.stepLabels[i]}</h3><p>{text}</p><p className="reading-method-proof"><strong>这一步重点：</strong>{note.steps[i]}</p></div></li>)}</ol><aside className="reading-method-visual">{renderMethodMap()}<button className="reading-panel-zoom" onClick={()=>setZoom("method")}><Maximize2 size={15}/>放大核实图解</button></aside></div>
      <aside className="reading-boundary"><Info size={19}/><div><h3>{isRecord?"整理的边界":"核实的边界"}</h3><p>{note.reminder}</p></div></aside>
    </section>

    <section id="reading-check" role="tabpanel" aria-labelledby="tab-check" hidden={active!=="check"} data-reading-section="check" className="reading-section reading-assessment">
      <header className="reading-section-heading"><span>04 · 随堂判断</span><h2 tabIndex={-1}>回到这个情境，你会怎么做？</h2><p>根据材料选择下一步。提交后，可以查看判断依据和其他选项遗漏的部分。</p></header>
      <div className="reading-question-layout"><div className="reading-question-evidence">{renderCurrentMaterial()}<button className="reading-panel-zoom" onClick={()=>setZoom("question")}><Maximize2 size={15}/>放大判断材料</button></div><div className="reading-question-brief"><small>情境任务</small><p>{lesson.scene}</p><strong>根据这份材料，选择下一步。</strong><span>先作判断，再查看解析。</span></div></div>
      <fieldset disabled={submitted} className="reading-options"><legend>{question.question.replace((lesson.scene??"")+" ","")}</legend>{question.options.map((option,i)=><label key={option} className={(answer===i?"is-selected ":"")+(submitted&&i===question.correct?"is-recommended ":"")+(submitted&&answer===i&&i!==question.correct?"needs-review":"")}><input type="radio" name={"reading-"+lesson.id} checked={answer===i} onChange={()=>setAnswer(i)}/><span>{String.fromCharCode(65+i)}.</span><span>{option}</span>{submitted&&i===question.correct&&<Check size={18} aria-label="建议做法"/>}</label>)}</fieldset>
      {!submitted?<div className="reading-submit"><span>{answer===null?"选择后确认，即可查看解析。":"已选择，确认后查看判断依据。"}</span><button className="learn-primary" disabled={answer===null||!ready} onClick={submit}>确认判断<ArrowRight size={17}/></button></div>:<div className="reading-feedback" role="status"><div className="reading-feedback-status"><strong>{answer===question.correct?"判断合理":"再看看，哪里需要补一步"}</strong><button onClick={()=>{setSubmitted(false);setAnswer(null);setFinished(false);}}><RotateCcw size={15}/>重新判断</button></div><h3>{answer===question.correct?"关键在于：判断有没有对应的依据":"先补齐依据，再决定是否继续"}</h3><p>{question.explanation}</p><p><strong>其他做法遗漏了什么？</strong>{reading.contrastText}</p><button className="reading-inline" onClick={()=>jump("method")}>对照本课的具体方法<ArrowLeft size={16}/></button></div>}
      <div className="reading-takeaway"><strong>带走一句话</strong><p>{editorial.takeaway}</p></div>
      {finished&&<p className="reading-saved" role="status"><Check size={17}/>本课学习已记录，可以继续下一课或返回目录。</p>}
      <footer className="reading-footer"><button onClick={onBack}><ArrowLeft size={16}/>返回课程目录</button><span>{submitted?"已完成随堂判断":"完成判断后，可记录本课学习"}</span>{!finished?<button className="learn-primary" disabled={!submitted||!ready} onClick={finish}>{completed?"完成本次复习":"完成本课"}<Check size={17}/></button>:nextLesson?<button className="learn-primary" onClick={()=>onChoose(nextLesson.id)}>学习下一课<ArrowRight size={17}/></button>:<button className="learn-primary" onClick={onBack}>返回目录<ArrowRight size={17}/></button>}</footer>
    </section>
    <nav className="reading-pagination" aria-label="课程分节导航"><button onClick={()=>currentIndex===0?onBack():jump(chapters[currentIndex-1].id)}><ArrowLeft size={17}/>{currentIndex===0?"返回课程目录":"上一部分："+chapters[currentIndex-1].label}</button>{currentIndex<chapters.length-1&&<button className="learn-primary" onClick={()=>jump(chapters[currentIndex+1].id)}>下一部分：{chapters[currentIndex+1].label}<ArrowRight size={17}/></button>}</nav>
    <dialog ref={dialog} className="reading-lightbox" aria-label="放大教学材料" onCancel={e=>{e.preventDefault();setZoom(null);}} onClick={e=>{if(e.target===e.currentTarget)setZoom(null);}}><div className="reading-lightbox-toolbar"><strong>本课材料 · 教学模拟</strong><button onClick={()=>setZoom(null)} aria-label="关闭放大材料"><X size={22}/></button></div>{zoom==="guide"?<figure className="reading-theme-preview"><img src={artwork} alt={artworkAlt} width={isCamera?600:1200} height={isCamera?450:800}/><figcaption>本课主题图 · 原创教学示意</figcaption></figure>:zoom==="scene"?renderSceneMaterial(true):zoom==="method"?renderMethodMap():zoom==="question"?renderCurrentMaterial():typeof zoom==="number"?renderPanelMaterial(zoom,true):null}</dialog>
    <div className="reading-resources"><details><summary><Info size={16}/>学习依据与适用范围<ChevronDown size={15}/></summary><p>本课为原创教学整理；以下资料支持相关原则，不代表原文中发生过图示情节。请勿将示例当作具体案件的事实认定。</p>{sources.map(s=><div key={s.id}><h3>{s.heading}</h3><p>{s.text}</p><a href={s.source.url} target="_blank" rel="noreferrer">{s.source.publisher} · {s.source.title}<ArrowUpRight size={14}/></a><small>{s.source.date} · {s.source.locator}</small><small>{s.source.scope}</small></div>)}</details><div><button onClick={()=>onAsk(lesson.question)}><MessageCircle size={16}/>问问这节课</button><button onClick={()=>onPractice(lesson.id)}><ListChecks size={16}/>更多练习</button></div></div>
  </article>;
}



