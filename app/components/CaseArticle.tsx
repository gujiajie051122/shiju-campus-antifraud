import {ArrowUpRight, X} from "lucide-react";
import type {NewsCase} from "@/lib/case-library";
import {BrandLogo} from "./BrandLogo";

export function CaseArticle({item,onClose}:{item:NewsCase;onClose:()=>void}) {
 const warning=item.type==="警方提醒",investigation=item.type==="调查报道";
 const sentences=item.detail.match(/[^。！？]+[。！？]?/g)??[item.detail];
 const split=sentences.length>1?Math.ceil(sentences.length/2):sentences.length;
 const paragraphs=[sentences.slice(0,split).join(""),sentences.slice(split).join("")].filter(Boolean);
 const imageSource=item.posterSource?.name??item.source;
 return <>
  <div className="case-document-bar"><div className="case-document-brand"><BrandLogo/><span aria-hidden="true">/</span><span>案例资料</span></div><button className="case-document-close" aria-label="关闭案例详情" onClick={onClose}><X size={22}/></button></div>
  <div className="case-document-scroll" key={item.id}>
   <article className="case-article">
    <header><p className="case-article-category">{warning?"警示解读":investigation?"调查解读":"案例解读"}<span aria-hidden="true">/</span>{item.name}</p><h2 id="case-article-title"><span>{item.line}</span>{item.title}</h2><dl className="case-article-meta"><div><dt>报道来源</dt><dd>{item.source}</dd></div><div><dt>报道日期</dt><dd><time dateTime={item.date.replaceAll(".","-")}>{item.date}</time></dd></div></dl></header>
    <figure><img src={item.poster} alt={item.alt} width="1280" height="720" referrerPolicy="no-referrer"/><figcaption><span>{item.mediaNote}｜{imageSource}</span>{item.posterSource&&<a href={item.posterSource.url} target="_blank" rel="noreferrer">配图出处<ArrowUpRight size={12}/></a>}</figcaption></figure>
    <section className="case-article-section" aria-labelledby="case-article-overview"><h3 id="case-article-overview">{warning?"报道要点":investigation?"调查概要":"案例经过"}</h3><div className="case-article-summary">{paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div></section>
    <section className="case-article-section case-article-guidance" aria-labelledby="case-article-guidance"><div className="case-article-section-heading"><h3 id="case-article-guidance">风险提示</h3><span>识局整理</span></div><p>{item.point}</p></section>
    <footer><div className="case-article-source-row"><a className="case-original" href={item.url} target="_blank" rel="noreferrer">阅读原始报道<ArrowUpRight size={15}/></a><span>来源：{item.source}</span></div><small>案例简介据原报道整理，风险提示由识局归纳。<br/>图片、视频版权归原权利人所有。</small></footer>
   </article>
  </div>
 </>;
}
