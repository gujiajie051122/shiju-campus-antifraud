"use client";
import {useState} from 'react';
import {ArrowRight,Download,FileText,Minus,Plus} from 'lucide-react';
import documents from '@/lib/job-documents.json';
import {jobStories,type JobMode} from '@/lib/job-workshop';

export function JobPosting({mode,onClose}:{mode:JobMode;onClose:()=>void}){
 const story=jobStories[mode];
 return <div className="job-posting-sheet"><span className="job-document-eyebrow">联系人提供的资料 · 教学模拟</span><h2>{story.role}</h2><p className="job-posting-org">{story.org}<span>{story.code}</span></p><p className="job-posting-lead">{mode==='learning'?'协助整理校园活动资料与文案。':'协助整理、归档校园活动资料。'}</p><dl className="job-posting-facts"><div className="wide"><dt>工作内容</dt><dd>{mode==='learning'?'整理公开活动资料，辅助撰写校园活动文案。':'协助归档活动资料，具体任务另行沟通。'}</dd></div><div><dt>每周时长</dt><dd>约6小时</dd></div><div><dt>工作时段</dt><dd>{mode==='learning'?'协商确定':'入职后确认'}</dd></div><div><dt>报酬单价</dt><dd>未说明</dd></div><div><dt>结算周期</dt><dd>未说明</dd></div></dl><footer><p>材料由当前联系人提供，需结合独立渠道核实。</p><button className="job-solid-button" onClick={onClose}>返回聊天<ArrowRight size={16}/></button></footer></div>;
}

export function JobDocumentReader({mode,onClose}:{mode:JobMode;onClose:()=>void}){
 const doc=documents[mode],[zoom,setZoom]=useState(100);
 return <div className="job-pdf-reader"><header className="job-reader-toolbar"><div><FileText size={25}/><div><strong>{doc.file}</strong><small>联系人发来的附件 · 教学模拟</small></div></div><div className="job-reader-controls"><span>1 / 1</span><i/><button aria-label="缩小文档" disabled={zoom<=75} onClick={()=>setZoom(z=>z-25)}><Minus size={16}/></button><output aria-label="文档缩放比例">{zoom}%</output><button aria-label="放大文档" disabled={zoom>=150} onClick={()=>setZoom(z=>z+25)}><Plus size={16}/></button></div><a className="job-reader-download" href={'/documents/job-'+mode+'.pdf'} download={doc.file} aria-label="下载PDF"><Download size={20}/><span>下载</span></a></header><div className="job-reader-canvas"><article className="job-document-page" style={{width:`${zoom*6.4}px`,maxWidth:zoom>100?'none':'100%'}}><header><p>{doc.org}</p><small>{doc.code} · {mode==='learning'?'岗前培训说明':'入职办理通知'}</small><h2>{doc.title}</h2></header><div className="job-document-meta"><span>适用岗位：{doc.role}</span><span>联系人员：{doc.contact}</span></div><div className="job-document-sections">{doc.sections.map(([title,text])=><section key={title}><h3>{title}</h3><p>{text}</p></section>)}</div><div className="job-document-sign"><p>{doc.org}</p><p>情境日期：2026年11月17日</p></div><footer><span>识局 · 教学模拟材料｜机构、岗位与人物均为虚构</span><span>— 1 —</span></footer></article></div><footer className="job-reader-footer"><p>材料由当前联系人提供，内容尚待独立核实。</p><button className="job-solid-button" onClick={onClose}>返回聊天<ArrowRight size={16}/></button></footer></div>;
}
