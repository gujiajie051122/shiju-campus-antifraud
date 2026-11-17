"use client";

import {useRef,useState} from "react";
import {ArrowLeft, ArrowRight, ArrowUpRight, Search, BookOpen, Play, Check} from "lucide-react";
import {lessons, type LearningProgress, type Lesson} from "@/lib/learning";
import {newsCases} from "@/lib/case-library";
import {videoCourses} from "@/lib/video-courses";
import {lessonArtwork,lessonEditorial} from "@/lib/lesson-editorial";

export const subjects = ["求职兼职", "刷单返利", "二手交易", "冒充客服", "交友与AI伪造", "购票骗局"];
const formats = ["全部", "真人讲解", "动画教学", "图文课程"];
// Mix formats and subjects in the opening rows; filters still expose the complete catalogue.
const featured = [
  "human-job", "animation-bird", "human-share",
  "trade-platform", "identity", "ticket-channel", "animation-pig",
  "animation-cards", "human-rebate",
  "human-face", "animation-campus", "job-fee", "human-pay",
];
const illustratedFeatured=["jobs","rewards","trade-link","service-share","identity","ticket-channel"];
type VideoCourse = (typeof videoCourses)[number];
type Entry = {id:string; video:VideoCourse; lesson?:never} | {id:string; lesson:Lesson; video?:never};

export function topicPicture(topic:string) {
  if (topic === "二手交易") return "/course-posters/trade.webp";
  const id = ({
    "求职兼职":"job", "刷单返利":"rebate", "冒充客服":"customer",
    "交友与AI伪造":"face", "购票骗局":"ticket",
  } as Record<string,string>)[topic];
  return newsCases.find(c => c.id === id)?.poster ?? newsCases[0].poster;
}

function VideoCard({video}:{video:VideoCourse}) {
  return <a className="library-course" href={video.url} target="_blank" rel="noreferrer">
    <div className="library-cover">
      <img src={video.poster} alt={video.title+"原视频封面"} loading="lazy" referrerPolicy="no-referrer"/>
      <span>{video.format}<Play size={13}/></span>
    </div>
    <small>{video.topic}</small>
    <h3>{video.title}</h3>
    <p>{video.source} · 原站观看 · 不计入已读<ArrowUpRight size={14}/></p>
  </a>;
}

function TextCard({lesson,completed,onOpen}:{lesson:Lesson;completed:boolean;onOpen:(id:string)=>void}) {
  return <button className="library-course library-text-course" onClick={() => onOpen(lesson.id)}>
    <div className="library-cover">
      <img src={lessonArtwork(lesson.id)} alt={lessonEditorial[lesson.id].visualAlt} width={1200} height={800} loading="lazy"/>
      <span>图文微课<BookOpen size={13}/></span>
      {completed && <b><Check size={14}/>已读</b>}
    </div>
    <small>{lesson.topic}</small>
    <h3>{lesson.title}</h3>
    <p><span>图文课程</span><ArrowRight size={14}/></p>
  </button>;
}

export function LearningCatalog({progress,onOpen}:{progress:LearningProgress;onOpen:(id:string)=>void}) {
  const [format,setFormat] = useState("全部");
  const [subject,setSubject] = useState("全部课程");
  const [query,setQuery] = useState("");
  const [page,setPage]=useState(1);
  const heading=useRef<HTMLHeadingElement>(null);
  const match = (topic:string,title:string) =>
    (subject === "全部课程" || topic === subject) &&
    (!query.trim() || (title+topic).includes(query.trim()));
  const texts = lessons.filter(l => (format === "全部" || format === "图文课程") && match(l.topic??"",l.title));
  const videos = videoCourses.filter(v => (format === "全部" || format === v.format) && match(v.topic,v.title));
  let entries:Entry[] = [
    ...videos.map(video => ({id:video.id,video})),
    ...texts.map(lesson => ({id:lesson.id,lesson})),
  ];
  const order=format==="图文课程"?illustratedFeatured:featured;
  const priority = (id:string) => {const index=order.indexOf(id); return index < 0 ? order.length : index;};
  if(subject!=="全部课程"&&format==="全部"){
    const groups=[entries.filter(e=>e.video?.format==="真人讲解"),entries.filter(e=>e.video?.format==="动画教学"),entries.filter(e=>e.lesson)];
    entries=Array.from({length:Math.max(...groups.map(g=>g.length))},(_,i)=>groups.flatMap(g=>g[i]?[g[i]]:[])).flat();
  }else entries.sort((a,b) => priority(a.id)-priority(b.id));
  const totalPages=Math.ceil(entries.length/6),currentPage=Math.min(page,Math.max(1,totalPages));
  const pageNumbers=Array.from({length:totalPages},(_,i)=>i+1).filter(n=>n===1||n===totalPages||Math.abs(n-currentPage)<=1);
  const visibleEntries=entries.slice((currentPage-1)*6,currentPage*6);
  function resetFilters() {setFormat("全部"); setSubject("全部课程"); setQuery("");setPage(1);}
  function turnPage(next:number){setPage(next);heading.current?.focus({preventScroll:true});window.scrollTo({top:0,behavior:"instant"});}
  const renderCourse=(entry:Entry)=>entry.video
    ? <VideoCard key={entry.id} video={entry.video}/>
    : <TextCard key={entry.id} lesson={entry.lesson} completed={progress.completed.includes(entry.id)} onOpen={onOpen}/>;
  return <section className="library-v2 library-editorial library-edition">
    <header className="learning-toolbar">
      <h1 className="sr-only" ref={heading} tabIndex={-1}>课程目录</h1>
      <span className="learning-toolbar-label">按你关心的问题选课</span>
      <label className="library-search"><Search size={18}/>
        <input aria-label="搜索课程" placeholder="搜索课程或关键词" value={query} onChange={e => {setQuery(e.target.value);setPage(1);}}/>
      </label>
    </header>
    <nav className="library-topics" aria-label="课程专题">
      {["全部课程",...subjects].map(s => <button key={s} aria-pressed={subject===s} onClick={() => {setSubject(s);setPage(1);}}>{s==="全部课程"?"全部":s}</button>)}
    </nav>
    <p className="library-progress-note">共 {lessons.length} 节图文课程、{videoCourses.length} 项原站视频。图文完成后计入已读进度；视频在原站观看，本站不记录观看进度。</p>
    <div className="library-layout">
      <div className="library-body">
        <nav className="format-nav" aria-label="教学形式">
          {formats.map(f => <button key={f} aria-pressed={format===f} onClick={() => {setFormat(f);setPage(1);}}>{f==="全部"?"全部形式":f}</button>)}
          <span className="library-result-count" aria-live="polite">{entries.length} 项课程资源</span>
        </nav>
        {visibleEntries.length>0&&<div className={`library-feature${visibleEntries.length===1?" library-feature--single":""}`}>
          {visibleEntries.slice(0,3).map(renderCourse)}
        </div>}
        {visibleEntries.length>3&&<section className="library-more" aria-label="更多课程">
          <div className="library-section"><h2>更多课程</h2><span>{subject==="全部课程"?"六个专题，按需学习。":subject}</span></div>
          <div className="library-grid">{visibleEntries.slice(3).map(renderCourse)}</div>
        </section>}
        {!entries.length && <div className="catalog-empty">
          <h3>暂未收录匹配课程</h3><p>试试其他教学形式或关键词。</p>
          <button onClick={resetFilters}>查看全部课程</button>
        </div>}
        {totalPages>1&&<nav className="library-pagination" aria-label="课程分页"><span>第 {currentPage} / {totalPages} 页</span><button disabled={currentPage===1} onClick={()=>turnPage(currentPage-1)} aria-label="上一页课程"><ArrowLeft size={15}/><span>上一页</span></button>{pageNumbers.flatMap((n,i)=>[...(i>0&&n-pageNumbers[i-1]>1?[<span key={`gap-${n}`} aria-hidden="true">…</span>]:[]),<button key={n} aria-label={`第${n}页课程`} aria-current={currentPage===n?"page":undefined} onClick={()=>turnPage(n)}>{n}</button>])}<button disabled={currentPage===totalPages} onClick={()=>turnPage(currentPage+1)} aria-label="下一页课程"><span>下一页</span><ArrowRight size={15}/></button></nav>}
        <p className="library-note">图文为原创教学微课，图片为教学示意，非真实案卷；真人与动画视频保留原始封面及出处，在来源网站观看。</p>
      </div>
    </div>
  </section>;
}
