"use client";
import {useEffect,useRef,useState} from "react";
import useEmblaCarousel from "embla-carousel-react";
import {ArrowRight,ArrowLeft,ArrowUpRight,X,Check,BookOpen,Pause,Play,Loader2} from "lucide-react";
import {practiceCases} from "@/lib/reflection-practice";
import {newsCases as cases} from "@/lib/case-library";
import type {Mode} from "@/lib/scenario";
import {KnowledgeDesk} from "./KnowledgeDesk";
import {sections} from "./SiteNav";
import {BrandLogo} from "./BrandLogo";
import {CaseArticle} from "./CaseArticle";

import {CaseVideo,type VideoState} from "./CaseVideo";

type Props={ready:boolean;mode:Mode;onMode:(mode:Mode)=>void;hasSession:boolean;jobLabel:string;onJob:()=>void;onReview:()=>void;onRecords:()=>void;modelConfigured:boolean};
export function CaseHome({ready,mode,onMode,hasSession,jobLabel,onJob,onReview,onRecords,modelConfigured}:Props){
 const [viewport,carousel]=useEmblaCarousel({loop:true}),[thumbViewport,thumbCarousel]=useEmblaCarousel({loop:true,align:"center",duration:24}),[active,setActive]=useState(0),[auto,setAuto]=useState(true),[hover,setHover]=useState(false),[hidden,setHidden]=useState(false),[reduced,setReduced]=useState(false),[railHover,setRailHover]=useState(false),[dragging,setDragging]=useState(false);
 const [preview,setPreview]=useState(false),[videoState,setVideoState]=useState<VideoState>("loading"),[keyboardFocus,setKeyboardFocus]=useState(false);
 const [panel,setPanel]=useState<"case"|"simulation"|"knowledge"|"short"|"video"|null>(null),[exercise,setExercise]=useState("source-video"),[answers,setAnswers]=useState<Record<string,string>>({});
 const [report,setReport]=useState(cases[0]),[reportState,setReportState]=useState<VideoState>("loading");
 const root=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDialogElement>(null);
 const item=cases[active],practice=practiceCases.find(c=>c.id===exercise),answer=answers[exercise],playing=preview&&videoState==="playing";
 useEffect(()=>{if(!carousel)return;const select=()=>{setActive(carousel.selectedScrollSnap());setPreview(false);setVideoState("loading");setHover(false);};select();carousel.on("select",select);carousel.on("reInit",select);return()=>{carousel.off("select",select);carousel.off("reInit",select);};},[carousel]);
 useEffect(()=>{if(thumbCarousel)thumbCarousel.scrollTo(active,reduced);},[active,thumbCarousel,reduced]);
 useEffect(()=>{
  if(!carousel||!thumbCarousel)return;
  const sync=()=>{const index=thumbCarousel.selectedScrollSnap();if(index!==carousel.selectedScrollSnap())carousel.scrollTo(index);};
  const down=()=>setDragging(true),up=()=>setDragging(false);
  thumbCarousel.on("select",sync);thumbCarousel.on("pointerDown",down);thumbCarousel.on("pointerUp",up);
  carousel.on("pointerDown",down);carousel.on("pointerUp",up);
  return()=>{thumbCarousel.off("select",sync);thumbCarousel.off("pointerDown",down);thumbCarousel.off("pointerUp",up);carousel.off("pointerDown",down);carousel.off("pointerUp",up);};
 },[carousel,thumbCarousel]);
 useEffect(()=>{window.scrollTo({top:0,left:0,behavior:"instant"});},[]);
 useEffect(()=>{const media=window.matchMedia("(prefers-reduced-motion: reduce)");const motion=()=>{setReduced(media.matches);if(media.matches)setAuto(false);};motion();media.addEventListener("change",motion);const visibility=()=>{setHidden(document.hidden);if(document.hidden){setPreview(false);setHover(false);}};document.addEventListener("visibilitychange",visibility);return()=>{media.removeEventListener("change",motion);document.removeEventListener("visibilitychange",visibility);};},[]);
 useEffect(()=>{if(!carousel||!auto||hover||hidden||panel||preview||keyboardFocus||railHover||dragging)return;const timer=setTimeout(()=>carousel.scrollNext(),8500);return()=>clearTimeout(timer);},[carousel,auto,hover,hidden,panel,preview,keyboardFocus,railHover,dragging,active]);
 useEffect(()=>{if(!hover||panel||reduced)return;const timer=setTimeout(()=>{setVideoState("loading");setPreview(true);},1400);return()=>clearTimeout(timer);},[hover,panel,reduced,active]);
 useEffect(()=>{if(panel&&!dialog.current?.open)dialog.current?.showModal();else if(!panel)dialog.current?.close();},[panel]);
 useEffect(()=>{if(!panel)return;const html=document.documentElement,body=document.body,previousHtml=html.style.overflow,previousBody=body.style.overflow;html.style.overflow="hidden";body.style.overflow="hidden";return()=>{html.style.overflow=previousHtml;body.style.overflow=previousBody;};},[panel]);
 function trackHover(event:React.PointerEvent<HTMLElement>){
  if(event.pointerType!=="mouse"||preview||window.matchMedia("(max-width: 640px)").matches)return;
  const target=event.target as HTMLElement;
  setHover(!target.closest(".case-header,.case-copy,.case-video-toolbar,.case-bottom"));
 }
 function pauseMedia(){root.current?.querySelectorAll("video").forEach(video=>video.pause());}
 function openPanel(value:typeof panel){pauseMedia();setHover(false);setPreview(false);setVideoState("loading");setPanel(value);}
 function closePanel(){pauseMedia();setHover(false);setPreview(false);setPanel(null);}
 function choose(index:number){pauseMedia();setHover(false);setPreview(false);setVideoState("loading");carousel?.scrollTo(index,reduced);}
 function stopPreview(){if(!panel)pauseMedia();setPreview(false);setHover(false);}
 function playReport(){setReport(item);setReportState("loading");openPanel("video");}
 return <div ref={root} className="case-home" onClickCapture={e=>{if((e.target as HTMLElement).closest("a[href]")){pauseMedia();setHover(false);setPreview(false);if(panel==="video")setPanel(null);}}}>
  <a className="case-skip" href="#case-heading">跳到案例内容</a>
  <main className={"case-stage"+(playing?" is-playing":"")} aria-label="诈骗案例轮播" aria-roledescription="轮播图" onPointerMove={trackHover} onPointerLeave={stopPreview} onPointerDownCapture={()=>setKeyboardFocus(false)} onKeyDown={e=>{if(e.key==="Escape"&&preview)stopPreview();}} onFocusCapture={e=>{const target=e.target as HTMLElement;setKeyboardFocus(!target.closest("[data-auto-control]")&&target.matches(":focus-visible"));}} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setKeyboardFocus(false);}}>
   <div className="case-viewport" ref={viewport}><div className="case-track">{cases.map((c,i)=><div className={"case-slide"+(c.id==="tutor"?" case-slide-evidence":"")} key={c.id} aria-hidden={i!==active}><img src={c.poster} alt={c.alt} width="1280" height="720" fetchPriority={i===0?"high":"low"} loading={i===0?"eager":"lazy"} referrerPolicy="no-referrer"/></div>)}</div></div>
   {preview&&videoState!=="error"&&<CaseVideo key={item.id} src={item.video} preview onState={setVideoState} onEnd={stopPreview}/>}
   <div className="case-shade"/>
   <header className="case-header" onPointerEnter={()=>setHover(false)}><a className="case-brand" href="/" aria-label="识局首页"><BrandLogo inverse/><span>看见套路，练习判断</span></a><nav aria-label="项目功能">{sections.map(s=><a href={s.href} key={s.href} aria-current={s.href==="/"?"page":undefined}>{s.label}</a>)}</nav></header>
   <section className="case-copy" aria-live={auto?"off":"polite"} aria-atomic="true"><span className="case-kicker">校园真实案例<span>/</span>{item.name}</span><h1 id="case-heading"><span>{item.line}</span>{item.title}</h1><p>{item.intro}</p><a className="case-source" href={item.url} target="_blank" rel="noreferrer">{item.source} · {item.date}<ArrowUpRight size={13}/></a><div className="case-actions"><button className="case-watch" onClick={playReport}><Play size={18}/>观看案例视频</button><button className="case-read" onClick={()=>openPanel("case")}>查看详情<ArrowUpRight size={17}/></button></div><a className="case-practice-link" href="/simulation"><span>情境演练</span>看完案例，去练习判断<ArrowRight size={17}/></a></section>
   <div className="case-video-toolbar" onPointerEnter={()=>setHover(false)}>
    {!preview&&<button onClick={playReport}><Play size={13}/><span>案例封面 · 观看完整视频</span></button>}
    {preview&&videoState==="loading"&&<span role="status"><Loader2 size={14} className="spin"/>正在载入原报道…</span>}
    {preview&&videoState==="error"&&<a href={item.url} target="_blank" rel="noreferrer" role="status">视频暂不可用，前往原报道<ArrowUpRight size={14}/></a>}
    {playing&&<><span>静音预览中</span><button onClick={playReport}><Play size={16}/>观看完整视频</button><button onClick={stopPreview} aria-label="返回案例照片"><X size={16}/>返回照片</button></>}
   </div>
   <div className="case-bottom" onPointerEnter={()=>{setHover(false);setRailHover(true);}} onPointerLeave={()=>setRailHover(false)} onKeyDown={e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();choose((active+(e.key==="ArrowRight"?1:cases.length-1))%cases.length);}}}>
    <button className="case-auto" data-auto-control aria-label={auto?"暂停自动轮播":"开始自动轮播"} aria-pressed={auto} onClick={()=>{stopPreview();setAuto(a=>!a);}}>{auto?<Pause size={14}/>:<Play size={14}/>}<span>{auto?"自动轮播":"已暂停"}</span></button>
    <div className="case-carousel-row"><button className="case-carousel-arrow" aria-label="上一个案例" onClick={()=>choose((active+cases.length-1)%cases.length)}><ArrowLeft size={18}/></button><div className="case-thumbnails" ref={thumbViewport} role="group" aria-label="案例预览，可左右滑动"><div className="case-thumb-track">{cases.map((c,i)=><div className="case-thumb-slide" key={c.id}><button tabIndex={active===i?0:-1} aria-label={"查看"+c.name} aria-pressed={active===i} className={i===active?"selected":""} onClick={()=>choose(i)}><img src={c.poster} alt="" width="160" height="100" loading="lazy" referrerPolicy="no-referrer"/><span>{c.name}</span></button></div>)}</div></div><button className="case-carousel-arrow" aria-label="下一个案例" onClick={()=>choose((active+1)%cases.length)}><ArrowRight size={18}/></button></div>
   </div>
  </main>
  <footer className="case-footer"><span>识局 · 校园反诈学习与演练</span><span>公开报道供浏览 · 原创情境供练习</span><button onClick={()=>openPanel("case")}>素材来源<ArrowUpRight size={12}/></button></footer>
  <dialog ref={dialog} className={"case-dialog"+(panel==="video"?" case-player-dialog":panel==="case"?" case-article-dialog":"")} aria-labelledby={panel==="case"?"case-article-title":undefined} aria-label={panel==="video"?"观看案例视频":panel==="case"?"案例详情":panel==="knowledge"?"知识查询":panel==="short"?"短情境练习":"选择情境模拟"} onCancel={e=>{e.preventDefault();closePanel();}} onClick={e=>{if(e.target===e.currentTarget)closePanel();}}>{panel!=="case"&&<button className="case-close" aria-label="关闭窗口" onClick={closePanel}><X size={21}/></button>}
   {panel==="video"&&<section className="case-player"><header><span>{report.source} · {report.date}</span><h2>{report.line} · {report.title}</h2></header><div className="case-player-screen"><CaseVideo key={report.id} src={report.video} poster={report.poster} onState={setReportState} onEnd={()=>setReportState("paused")}/>{reportState==="loading"&&<p className="case-player-status" role="status"><Loader2 size={18} className="spin"/>正在载入视频…</p>}{reportState==="error"&&<div className="case-player-error" role="alert"><p>视频暂时无法加载</p><a href={report.url} target="_blank" rel="noreferrer">前往原站观看<ArrowUpRight size={15}/></a></div>}</div><footer><span>可使用进度条拖动、调节音量或全屏观看</span><a href={report.url} target="_blank" rel="noreferrer">查看原报道<ArrowUpRight size={14}/></a></footer></section>}
   {panel==="case"&&<CaseArticle item={item} onClose={closePanel}/>}
   {panel==="simulation"&&<><span className="case-dialog-kicker">情境模拟</span><h2>挑一个场景，练习自己的判断。</h2><p className="case-panel-intro">首页的报道供你了解骗局。这里选取几类高频情境，用原创材料练习核实与选择。</p><button className="case-full-practice" onClick={onJob}><div><span>完整演练</span><strong>同学群里的一份兼职邀请</strong><small>查看资料 · 交流与核实 · 决策复盘</small></div><span>{jobLabel}<ArrowRight size={18}/></span></button>{!hasSession&&<div className="case-mode" aria-label="练习方式"><button aria-pressed={mode==="learning"} onClick={()=>onMode("learning")}>学习模式</button><button aria-pressed={mode==="independent"} onClick={()=>onMode("independent")}>独立演练</button></div>}<h3>短情境练习</h3><div className="case-short-list">{["source-video","source-books","pause-deadline"].map(id=>{const c=practiceCases.find(p=>p.id===id)!;return <button key={id} onClick={()=>{setExercise(id);setPanel("short");}}>{c.title}<ArrowUpRight size={16}/></button>;})}</div><small>原创模拟材料，不涉及真实支付与联系。</small></>}
   {panel==="knowledge"&&<><span className="case-dialog-kicker">知识查询</span><h2>带着疑问，查一条依据。</h2><KnowledgeDesk modelConfigured={modelConfigured} initiallyOpen/></>}
   {panel==="short"&&practice&&<><span className="case-dialog-kicker">原创模拟 / 短情境练习</span><h2>{practice.title}</h2><p>{practice.material}</p><fieldset className="case-choices" disabled={Boolean(answer)}><legend>{practice.question}</legend>{practice.choices.map(c=><label key={c.id} className={answer===c.id?"selected":""}><input type="radio" name={practice.id} checked={answer===c.id} onChange={()=>setAnswers(a=>({...a,[practice.id]:c.id}))}/>{c.text}</label>)}</fieldset>{answer&&<div className="case-feedback" role="status"><strong>{answer===practice.preferred?<Check size={17}/>:<BookOpen size={17}/>} {answer===practice.preferred?"这一步增加了独立依据":"再想一步：依据来自哪里？"}</strong><p>{practice.explanation}</p><button onClick={()=>setAnswers(a=>{const n={...a};delete n[exercise];return n;})}>重新选择</button></div>}<button className="case-back" onClick={()=>setPanel("simulation")}><ArrowLeft size={15}/>返回情境选择</button><small>仅供学习，本页内保留选择，不作为能力测评。</small></>}
  </dialog>
 </div>;
}
