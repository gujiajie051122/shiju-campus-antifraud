"use client";
import {useEffect,useRef,useState} from "react";
import {ArrowUpRight,ArrowRight,ArrowLeft,ShieldCheck,ScanLine,MessageSquare,BookOpen,History,Settings2,ChevronRight,ChevronDown,Mic,MicOff,Video,VideoOff,PhoneOff,RotateCcw,Check,CheckCheck,Search,FileText,Briefcase,Clock,ExternalLink,Download,Trash2,X,Info,Pause,Flag,Send,Volume2,Square,Command,Plus,NotebookPen,Loader2} from "lucide-react";
import {createSession,event,showRequirement,lookup,recordObservation,observations,reviewContext,JOB_CODE,decide,replay,setReason,summarize,isSession,requirement,guidance,STORAGE_KEY,type Session,type Mode,type Variant,type Tool,type Decision,type Observation} from "@/lib/scenario";
import {VerificationDesk} from "./components/VerificationDesk";
import {LiveAvatar} from "@/lib/avatar";
type Recognition={lang:string;continuous:boolean;interimResults:boolean;start:()=>void;stop:()=>void;abort:()=>void;onresult:((e:{results:{isFinal:boolean;0:{transcript:string}}[]})=>void)|null;onerror:((e:{error:string})=>void)|null;onend:(()=>void)|null};
type View="practice"|"review"|"history";
export default function Home(){
 const [mobileInspector,setMobileInspector]=useState(false),[timelineOpen,setTimelineOpen]=useState(false);
 const [previous,setPrevious]=useState<Session[]>([]);
 const [inspector,setInspector]=useState<"job"|"verify">("job");
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[view,setView]=useState<View>("practice"),[mode,setMode]=useState<Mode>("learning"),[draft,setDraft]=useState(""),[busy,setBusy]=useState(false),[notice,setNotice]=useState(""),[settings,setSettings]=useState(false),[confirm,setConfirm]=useState<Decision|"delete"|null>(null),[reason,setReasonDraft]=useState(""),[factor,setFactor]=useState(""),[reasonSaved,setReasonSaved]=useState(false),[sources,setSources]=useState(false),[audioOn,setAudioOn]=useState(false),[listening,setListening]=useState(false),[speechAvailable,setSpeechAvailable]=useState(false),[live,setLive]=useState(false),[connecting,setConnecting]=useState(false),[status,setStatus]=useState({dialogue:"rules",avatarConfigured:false}),[showJob,setShowJob]=useState(false);
 const current=useRef(session),avatar=useRef<LiveAvatar|null>(null),video=useRef<HTMLVideoElement>(null),recognition=useRef<Recognition|null>(null),request=useRef<AbortController|null>(null),epoch=useRef(0),utterance=useRef<SpeechSynthesisUtterance|null>(null),bottom=useRef<HTMLDivElement>(null);
 current.current=session;
 useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});},[view,session?.id]);
 useEffect(()=>{
  const saved=session?.reason;
  if(!saved){setReasonDraft("");setFactor("");setReasonSaved(false);return;}
  const match=saved.match(/^自选影响因素：([^。]+)。([\s\S]*)$/);
  setFactor(match?.[1]??"");setReasonDraft(match?.[2]??saved);setReasonSaved(true);
 },[session?.id,session?.reason]);
 function update(fn:(s:Session)=>Session){setSession(s=>s?fn(s):s);}
 function note(t:string){setNotice(t);}
 useEffect(()=>{
  try{const raw=localStorage.getItem(STORAGE_KEY);if(raw){const s=JSON.parse(raw);if(isSession(s)){setSession(s);setMode(s.mode);if(s.decision)setView("review");}else localStorage.removeItem(STORAGE_KEY);}}catch{note("本地记录无法读取，可以开始新练习。");}
  setReady(true);
  try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY+".history")||"[]");if(Array.isArray(saved))setPrevious(saved.filter(isSession).slice(-20));}catch{note("往期记录无法读取，当前练习仍可继续。");}
  setSpeechAvailable(Boolean((window as unknown as {SpeechRecognition?:unknown;webkitSpeechRecognition?:unknown}).SpeechRecognition||(window as unknown as {webkitSpeechRecognition?:unknown}).webkitSpeechRecognition));
  fetch("/api/status").then(r=>r.json()).then(raw=>{const s=raw as {dialogue?:unknown;avatarConfigured?:unknown};if(typeof s.dialogue==="string"&&typeof s.avatarConfigured==="boolean")setStatus({dialogue:s.dialogue,avatarConfigured:s.avatarConfigured});}).catch(()=>note("服务状态暂不可用，正在保留本地演练功能。"));
  return ()=>{epoch.current++;request.current?.abort();recognition.current?.abort();window.speechSynthesis?.cancel();void avatar.current?.disconnect().catch(()=>{});};
 },[]);
 useEffect(()=>{if(ready){try{if(session)localStorage.setItem(STORAGE_KEY,JSON.stringify(session));else localStorage.removeItem(STORAGE_KEY);}catch{note("浏览器存储不可用，本次记录仅保留在当前页面，请及时导出。");}}},[session,ready]);
 useEffect(()=>{if(ready)try{localStorage.setItem(STORAGE_KEY+".history",JSON.stringify(previous));}catch{note("往期记录未能保存，请及时导出。");}},[previous,ready]);
 useEffect(()=>{
  if(!settings&&!sources&&!showJob&&!confirm)return;
  const old=document.activeElement as HTMLElement|null;
  const modal=document.querySelector<HTMLElement>('[role="dialog"]');
  const focusable=()=>Array.from(modal?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, textarea, [tabindex="0"]')||[]);
  focusable()[0]?.focus();
  const keys=(e:KeyboardEvent)=>{if(e.key==="Escape"){setSettings(false);setSources(false);setShowJob(false);setConfirm(null);}if(e.key==="Tab"){const items=focusable(),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
  document.addEventListener("keydown",keys);return()=>{document.removeEventListener("keydown",keys);old?.focus();};
 },[settings,sources,showJob,confirm]);
 useEffect(()=>{const panel=bottom.current?.parentElement;if(panel)panel.scrollTo({top:panel.scrollHeight,behavior:"smooth"});},[session?.events.length]);
 async function stop(){
  epoch.current++;request.current?.abort();request.current=null;recognition.current?.abort();setListening(false);window.speechSynthesis?.cancel();utterance.current=null;setBusy(false);
  const a=avatar.current;avatar.current=null;setLive(false);setConnecting(false);
  if(a)try{await a.stop();}catch{note("视频连接已在本地关闭，请检查服务会话状态。");}
  if(video.current){video.current.pause();video.current.srcObject=null;}
 }
 function start(v?:Variant){
  if(current.current)setPrevious(p=>[...p.filter(s=>s.id!==current.current?.id),current.current!].slice(-20));
  void stop();setSession(createSession(v??(crypto.getRandomValues(new Uint8Array(1))[0]%2?"R":"N"),mode));setView("practice");setDraft("");setReasonDraft("");setFactor("");setReasonSaved(false);setNotice("");setShowJob(false);setInspector("job");setMobileInspector(false);setTimelineOpen(false);
 }
 async function connect(){
  if(!session||session.decision)return;
  if(!status.avatarConfigured){setSettings(true);return;}
  const token=++epoch.current;setConnecting(true);
  const a=new LiveAvatar();avatar.current=a;
  try{if(!video.current)throw Error("播放区域尚未就绪");await a.connect(video.current,s=>{
   if(avatar.current!==a)return;
   if(s.type==="connection"){setLive(s.value==="connected");if(s.value==="disconnected"){setLive(false);setConnecting(false);}}
   if(s.type==="error"){note(s.value);setLive(false);}
   if(s.type==="video")update(x=>event(x,"video_status","视频播放状态",s.value,"provider"));
  });if(token===epoch.current){setLive(a.connected);setConnecting(false);note("数字人已连接。回复将发送至第三方服务进行语音与人像生成。");}}
  catch{if(token===epoch.current){setConnecting(false);setLive(false);note("数字人连接未成功，可继续文字演练。请检查账号权限、来源域名及服务额度。");}await a.disconnect().catch(()=>{});}
 }
 async function speak(text:string){
  if(avatar.current?.connected){try{await avatar.current.speak(text);}catch{note("人像播报失败，本条保留文字内容。");}return;}
  if(!audioOn||!("speechSynthesis" in window))return;
  window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="zh-CN";utterance.current=u;
  u.onstart=()=>update(s=>event(s,"speech_started","设备朗读开始","播报进度不作为用户理解的依据。","device"));
  u.onend=()=>{if(utterance.current===u)update(s=>event(s,"speech_completed","设备朗读完成","本轮评价仍只依据可见材料与明确操作。","device"));};
  window.speechSynthesis.speak(u);
 }
 async function send(){
  if(!current.current||current.current.decision||busy||!draft.trim())return;
  const text=draft.trim().slice(0,1000);setDraft("");setBusy(true);
  const token=++epoch.current;const ctl=new AbortController();request.current=ctl;
  update(s=>event({...s,stage:Math.max(s.stage,1)},"user","我的回复",text,"text"));
  try{
   const r=await fetch("/api/dialogue",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text}),signal:ctl.signal});
   const data=await r.json() as {error?:string;reply:string;engine:string;warning?:string};if(!r.ok)throw Error(data.error||"请求失败");if(typeof data.reply!=="string")throw Error("回复格式不正确");if(token!==epoch.current)return;
   update(s=>event(s,"actor","林老师 · "+(data.engine==="model"?"模型分类 / 受控回复":"预设规则回复"),data.reply,"visible_text"));
   if(data.warning)note(data.warning);
   void speak(data.reply);
  }catch(e){if(token===epoch.current){note(e instanceof Error?e.message:"回复未成功，请重新发送。");update(s=>event(s,"error","回复服务异常","本条未生成回复，可重新输入；不影响已有材料与核实结果。"));}}
  finally{if(token===epoch.current)setBusy(false);}
 }
 async function microphone(){
  if(listening){recognition.current?.stop();return;}
  if(!speechAvailable){note("当前浏览器不支持语音转文字，请使用输入框。");return;}
  if(!window.confirm("语音识别可能由浏览器的云服务处理。本站不保存原始录音；识别内容会先进入输入框，确认后才发送。是否启用麦克风？"))return;
  epoch.current++;request.current?.abort();setBusy(false);window.speechSynthesis?.cancel();avatar.current?.interrupt();
  const C=(window as unknown as {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition}).SpeechRecognition||(window as unknown as {webkitSpeechRecognition?:new()=>Recognition}).webkitSpeechRecognition;
  if(!C)return;const r=new C();r.lang="zh-CN";r.continuous=false;r.interimResults=false;recognition.current=r;
  r.onresult=e=>{const t=Array.from(e.results).map(x=>x[0].transcript).join("");setDraft(t.slice(0,1000));note("语音已转为文字，请确认或修改后发送。");};
  r.onerror=()=>{setListening(false);note("未能识别语音，请检查麦克风权限或使用文字。");};r.onend=()=>setListening(false);
  try{r.start();setListening(true);}catch{setListening(false);note("麦克风启动失败，可使用文字。");}
 }
 function tool(t:Tool,query:string,source:"directory"|"sender"){if(!session||session.decision)return;update(s=>lookup(s,t,query,source));}
 function selectInspector(value:"job"|"verify"){setInspector(value);setMobileInspector(true);}
 function tabKey(e:React.KeyboardEvent<HTMLButtonElement>){if(["ArrowLeft","ArrowRight","Home","End"].includes(e.key)){e.preventDefault();const next=e.key==="Home"?"job":e.key==="End"?"verify":inspector==="job"?"verify":"job";selectInspector(next);document.getElementById(next+"-tab")?.focus();}}
 function finish(d:Decision){void stop();update(s=>decide(s,d));setConfirm(null);setView("review");setTimelineOpen(false);setReasonDraft("");setFactor("");setReasonSaved(false);}
 function rewind(){void stop();update(replay);setInspector("job");setMobileInspector(false);setView("practice");setReasonDraft("");setFactor("");setReasonSaved(false);note("已恢复当时的信息。先前路径已保存；本次重演属于学习练习。");}
 function exportRecord(){
  if(!session)return;const blob=new Blob([JSON.stringify({...session,previousSessions:previous,exportedAt:new Date().toISOString(),evaluationScope:"仅为模拟学习记录，不是能力认证"},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="识局-演练记录.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function saveReason(){
  const explanation=reason.trim();
  if(!explanation){note("请先写下你的解释，也可以跳过本项。");return;}
  update(s=>setReason(s,(factor?"自选影响因素："+factor+"。":"")+explanation));setReasonSaved(true);
 }
 const report=session?summarize(session):null;
 const context=session?reviewContext(session):null;
 const chat=session?.events.filter(e=>e.kind==="actor"||e.kind==="user")??[];

 const disabled=!session||Boolean(session.decision);
 const icon=(n:string)=>n==="核实"?<Search size={17}/>:<FileText size={17}/>;
 return <div className="app-shell">
  <aside className="sidebar">
   <a className="brand" href="/" aria-label="识局首页"><span className="brand-icon"><ScanLine size={25}/></span><span>识局</span></a>
   
   <nav aria-label="主导航">
    <button title="情境演练" aria-label="情境演练" className={view==="practice"?"nav-item active":"nav-item"} onClick={()=>setView("practice")}><Command size={19}/>情境演练<span className="nav-dot"/></button>
    <button title="决策复盘" aria-label="决策复盘" className={view==="review"?"nav-item active":"nav-item"} onClick={()=>{if(session?.decision)setView("review");else note("完成一次决定后，即可查看本次复盘。");}}><NotebookPen size={19}/>决策复盘</button>
    <button title="练习记录" aria-label="练习记录" className={view==="history"?"nav-item active":"nav-item"} onClick={()=>setView("history")}><History size={19}/>练习记录{session&&<span className="nav-count">{1+session.archives.length+previous.length}</span>}</button>
   </nav>
   <button className="sidebar-setting" onClick={()=>setSettings(true)}><Settings2 size={17}/>服务与设备<span>验证版</span></button>
   
  </aside>
  <div className="main-shell">
   <header className="topbar"><div className="breadcrumb">识局 <ChevronRight size={14}/><strong>{view==="practice"?"情境演练":view==="review"?"决策复盘":"练习记录"}</strong></div><div className="top-actions"><span className="simulation-pill"><span/>模拟演练</span><button className="icon-button mobile-settings" aria-label="服务与设备" onClick={()=>setSettings(true)}><Settings2 size={18}/></button><button className="text-button" onClick={()=>setSources(true)}><BookOpen size={16}/>资料来源</button></div></header>
   <main>
    {notice&&<div className="notice" role="status"><Info size={17}/><span>{notice}</span><button className="icon-button" onClick={()=>setNotice("")} aria-label="关闭提示"><X size={16}/></button></div>}
    {view==="practice"&&<>
     <div className="page-heading"><div><span className="eyebrow">情境 01 / 求职</span><h1>课余兼职</h1></div><button className="text-button" onClick={()=>setSettings(true)}><Settings2 size={16}/>设置</button></div>
     {!session?<section className="invitation-entry" aria-label="开始兼职情境"><span className="mini-label"><Briefcase size={15}/>情境邀请</span><h2>同学群里，转来一份兼职。</h2><p>内容运营助理，每周约 6 小时。联系人自称来自青禾校园内容工作室。</p><div className="entry-facts"><span>看材料</span><span>交流与核实</span><span>作出决定</span></div><div className="entry-bottom"><div className="mode-switch" aria-label="选择练习模式"><button aria-pressed={mode==="learning"} className={mode==="learning"?"selected":""} onClick={()=>setMode("learning")}>学习模式</button><button aria-pressed={mode==="independent"} className={mode==="independent"?"selected":""} onClick={()=>setMode("independent")}>独立演练</button></div><button className="primary" disabled={!ready} onClick={()=>start()}>打开邀请<ArrowRight size={17}/></button></div><small>{mode==="learning"?"可按需查看提示；你仍可以自由选择处理方式。":"不提供学习提示；只记录本轮实际操作。"}</small></section>:<div className="workspace">
      <section className="conversation-panel" aria-label="与招聘联系人的交流">
       <div className="conversation-header"><div><span className="person-badge">林</span><div><strong>林老师</strong><small>招聘联系人 · 模拟角色</small></div></div><button className="text-button channel-label" onClick={()=>setSettings(true)}>{live?<Video size={15}/>:<MessageSquare size={15}/>} {live?"视频已连接":status.dialogue==="configured"?"受控回复":"预设回复"}</button></div>
       {(status.avatarConfigured||live||connecting)&&<div className={"video-stage "+(live?"connected":"")}>
        <video ref={video} autoPlay playsInline controls={live} aria-label="实时数字人视频" style={{display:live?"block":"none"}}/>
        {!live&&<div className="video-placeholder"><Video size={28}/><h3>{connecting?"连接中…":"视频交流"}</h3><button className="primary" disabled={disabled||connecting} onClick={connect}>{connecting?"正在连接":"连接视频"}</button></div>}
       </div>}
       <div className="conversation-body">
        {!session?<div className="start-panel"><div className="invitation-stamp"><Briefcase size={28}/></div><span className="invitation-from">青禾校园内容工作室</span><h2>你收到一份兼职邀请</h2><p>内容运营助理 · 每周约 6 小时</p><div className="mode-switch" aria-label="选择练习模式"><button className={mode==="learning"?"selected":""} onClick={()=>setMode("learning")}>学习模式</button><button className={mode==="independent"?"selected":""} onClick={()=>setMode("independent")}>独立演练</button></div><button className="primary" onClick={()=>start()} disabled={!ready}>开始了解<ArrowRight size={17}/></button></div>:<>
         {chat.length===0&&!session.decision&&<div className="chat-welcome"><p>可以向联系人提问，也可以先查看岗位资料。</p><div className="quick-prompts">{["具体做什么工作？","我想了解面试安排"].map(p=><button key={p} disabled={Boolean(session.decision)} onClick={()=>setDraft(p)}>{p}<ArrowUpRight size={13}/></button>)}</div></div>}
         {chat.map(e=><div className={"chat-row "+(e.kind==="user"?"mine":"")} key={e.id}>{e.kind!=="user"&&<span className="chat-avatar">林</span>}<div><small>{e.kind==="user"?"我":"林老师"}</small><div className="chat-bubble">{e.text}</div></div></div>)}
         {busy&&<div className="typing"><Loader2 className="spin" size={15}/><small>回复中…</small></div>}
         {session.decision&&<div className="ended-message">本轮已结束 <button onClick={()=>setView("review")}>查看复盘<ArrowRight size={14}/></button><button onClick={()=>start()}>再练一轮</button></div>}<div ref={bottom}/>
        </>}
       </div>
       <div className="composer">
        <form onSubmit={e=>{e.preventDefault();void send();}}><textarea aria-label="回复招聘联系人" placeholder={session?"回复林老师…":"开始后可发送消息"} value={draft} onChange={e=>setDraft(e.target.value)} maxLength={1000} disabled={disabled||busy} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send();}}}/><div className="compose-actions"><button type="button" className={"icon-button "+(listening?"recording":"")} aria-label={listening?"停止录音":"语音输入"} disabled={disabled||!speechAvailable} onClick={()=>void microphone()}>{listening?<MicOff size={19}/>:<Mic size={19}/>}</button><button type="button" className="icon-button" aria-label="停止播报与连接" disabled={disabled} onClick={()=>{void stop();note("已停止回复与播报。");}}><Square size={16}/></button><button className="send-button" aria-label="发送回复" disabled={disabled||busy||!draft.trim()}>{busy?<Loader2 className="spin" size={16}/>:<ArrowRight size={19}/>}</button></div></form>
        <div className="compose-tools"><span>{listening?"正在录音，识别后请确认文字":"Enter 发送 · Shift + Enter 换行"}</span><button className="text-button" disabled={disabled||live} onClick={()=>{setAudioOn(!audioOn);if(audioOn)window.speechSynthesis?.cancel();}} aria-pressed={audioOn}><Volume2 size={14}/>{audioOn?"朗读已开":"朗读"}</button></div>
       </div>
       <div className="decision-bar" aria-label="作出本轮决定"><span>本轮决定</span><div><button disabled={disabled} onClick={()=>setConfirm("pause")}>先暂停</button><button disabled={disabled} onClick={()=>setConfirm("continue")}>决定继续</button><button disabled={disabled} onClick={()=>setConfirm("exit")}>结束沟通</button><button disabled={disabled} onClick={()=>setConfirm("report")}><Flag size={14}/>模拟报告</button></div></div>
      </section>
      <aside className={"inspector-panel "+(mobileInspector?"mobile-expanded":"")}>
       <div className="inspector-tabs" role="tablist" aria-label="资料与核实"><button role="tab" id="job-tab" aria-selected={inspector==="job"} aria-controls="job-panel" tabIndex={inspector==="job"?0:-1} onKeyDown={tabKey} onClick={()=>selectInspector("job")}><FileText size={16}/>岗位资料</button><button role="tab" id="verify-tab" aria-selected={inspector==="verify"} aria-controls="verify-panel" tabIndex={inspector==="verify"?0:-1} onKeyDown={tabKey} onClick={()=>selectInspector("verify")}><Search size={16}/>独立核实{Boolean(session?.verified.length)&&<span className="tab-count">{session?.verified.length}</span>}</button></div>
       {inspector==="job"?<div className="inspector-content" role="tabpanel" id="job-panel" aria-labelledby="job-tab">
        <article className="job-card"><div className="job-card-top"><span className="job-symbol">禾</span><span className="outline-tag">虚构岗位</span></div><p className="org-name">青禾校园内容工作室</p><h2>内容运营助理</h2><p className="job-subtitle">资料整理 / 活动文案</p><dl><div><dt>岗位编号</dt><dd className="job-code">{JOB_CODE}</dd></div><div><dt>时间</dt><dd>每周约 6 小时</dd></div><div><dt>报酬</dt><dd>按确认的工作量结算</dd></div><div><dt>联系人</dt><dd>林老师（自述）</dd></div></dl><button className="job-detail" onClick={()=>{setShowJob(true);if(session&&!session.decision&&!session.events.some(e=>e.kind==="material_detail"))update(s=>event(s,"material_detail","打开完整岗位说明","已打开工作内容与结算说明。"));}}>完整岗位说明<ArrowUpRight size={15}/></button></article>
        <button className={"material-link "+(session?.requirementShown?"opened":"")} disabled={disabled} onClick={()=>update(showRequirement)}><FileText size={18}/><span>入职要求说明</span>{session?.requirementShown?<Check size={16}/>:<ChevronRight size={16}/>}</button>
        {session?.requirementShown&&<div className="requirement-card"><p>{requirement(session.variant)}</p></div>}
        <details className="material-notes"><summary>记下待确认项{context?.notes.length?" · "+context.notes.length:""}</summary><p>选出你想继续核对的信息。</p><div>{(Object.entries(observations) as [Observation,{title:string;text:string}][]).filter(([id])=>id!=="requirement"||session?.requirementShown).map(([id,item])=>{const saved=session?.events.some(e=>e.kind==="material_note"&&e.channel===id);return <button key={id} disabled={disabled||saved} onClick={()=>update(s=>recordObservation(s,id))}>{saved?<Check size={13}/>:<Plus size={13}/>} {item.title}{saved?" · 已记下":""}</button>;})}</div></details><p className="inspector-note">以上信息由联系人提供。</p>
       </div>:<div className="inspector-content" role="tabpanel" id="verify-panel" aria-labelledby="verify-tab">
        {session&&<VerificationDesk key={session.id+session.branch} session={session} onLookup={tool}/>}
        {session?.mode==="learning"&&<details className="hint-card" onToggle={e=>{if(e.currentTarget.open&&!session.decision)update(s=>event(s,"hint","查看学习提示","将对方的说法与独立渠道的结果进行对照。"));}}><summary>需要提示？</summary><p>将对方的说法与独立渠道的结果进行对照。</p></details>}
       </div>}
       <button className="inspector-close" onClick={()=>setMobileInspector(false)}>收起资料<ChevronDown size={14}/></button>
      </aside>
     </div>}
     <p className="workspace-footer"><ShieldCheck size={14}/>所有材料与操作均为模拟，不会产生真实支付或联系。</p>
    </>}
    {view==="review"&&session?.decision&&report&&<>
     <div className="page-heading"><div><div className="eyebrow">本轮结果</div><h1>练习复盘</h1></div><button className="secondary small" onClick={exportRecord}><Download size={16}/>导出记录</button></div>
     <div className="review-banner"><div className="review-symbol"><ShieldCheck size={31}/></div><div><span className="mini-label">{session.mode==="learning"?"学习模式":"独立演练"}{report.usedHints?" · 使用过提示":""}{report.isReplay?" · 学习重演":""}</span><h2>{session.decision==="pause"?"你选择了暂缓决定":session.decision==="exit"?"你选择了结束沟通":session.decision==="report"?"你完成了一次模拟报告":"你选择了继续了解"}</h2><p>{session.verified.length?"你已经通过独立工具获得核实信息。":"本次尚未获得独立核实结果，相关身份仍待确认。"}</p></div><span className="review-case">本组材料：{session.variant==="R"?"风险情境":"正常对照"}</span></div>
     <div className="findings-grid">{report.findings.filter(f=>f.label!=="敏感信息保护").map(f=><article className="finding" key={f.label}><div><span>{f.label}</span>{f.ids.length?<Check size={16}/>:<Info size={16}/>}</div><h3>{f.status}</h3><details><summary>说明与依据</summary><p>{f.text}</p>{f.ids.length>0&&<a onClick={()=>setTimelineOpen(true)} href={"#event-"+f.ids[0]}>查看记录<ArrowDownIcon/></a>}</details></article>)}</div>
     <div className="review-columns"><div className="review-main">{context&&<section className="panel comparison-panel"><div className="section-heading"><h2>把两边的信息放在一起</h2></div>{context.cards.map(c=><article className="comparison-row" key={c.label}><div><h3>{c.label}</h3><span>{c.state}</span></div><p>{c.claim}</p><p className="independent-fact">{c.result}</p></article>)}{context.notes.length>0&&<div className="review-notes"><span>你记下的待确认项</span>{context.notes.map(n=><p key={n.id}>{n.text}</p>)}</div>}<div className="next-practice"><strong>下次可以怎么做</strong><p>{context.next}</p></div></section>}<details className="panel timeline-panel" open={timelineOpen} onToggle={e=>setTimelineOpen(e.currentTarget.open)}><summary className="section-heading"><h2>完整决策记录</h2><span>{session.events.filter(e=>!["speech_started","speech_completed","video_status"].includes(e.kind)).length} 条记录</span></summary><div className="timeline">{session.events.filter(e=>!["speech_started","speech_completed","video_status"].includes(e.kind)).map((e,i)=><article id={"event-"+e.id} key={e.id}><span className={"timeline-point "+(e.kind==="verification"?"accent":"")}>{e.kind==="verification"?<Check size={12}/>:i+1}</span><div><div className="timeline-title"><strong>{e.title}</strong><time>{new Date(e.at).toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"})}</time></div><p>{e.text}</p></div></article>)}</div></details></div>
     <aside className="review-side"><section className="panel reflection"><h2>为什么这样选择？</h2><p>选填，记录你当时的想法。</p><div className="factor-options">{["身份信任","时间压力","关系压力","已投入时间","其他原因"].map(f=><button key={f} className={factor===f?"selected":""} onClick={()=>{setFactor(f);setReasonSaved(false);}}>{f}</button>)}</div><textarea aria-label="解释本次选择" placeholder="我当时主要依据了……" maxLength={500} value={reason} onChange={e=>{setReasonDraft(e.target.value);setReasonSaved(false);}}/><button className="primary full" onClick={saveReason}>{reasonSaved?<><Check size={15}/>已保存，可修改</>:<>保存我的解释<ArrowRight size={15}/></>}</button>{session.reason&&<div className="user-reflection"><span className="mini-label">你的自述 · 可修正</span><p>{session.reason}</p></div>}</section>
     <section className="replay-card"><RotateCcw size={22}/><h3>重新尝试</h3><p>回到入职要求前，原路径会保留。</p><button className="secondary full" disabled={!session.checkpoint} onClick={rewind}>重演关键节点<ArrowRight size={15}/></button>{!session.checkpoint&&<small>本次未进入要求节点，暂无该检查点。</small>}<button className="text-button" onClick={()=>start(session.variant==="R"?"N":"R")}>切换一组对照练习<ArrowUpRight size={14}/></button></section></aside></div>
     <section className="source-footer"><BookOpen size={18}/><div><strong>延伸阅读</strong></div><button className="text-button" onClick={()=>setSources(true)}>查看来源<ArrowUpRight size={16}/></button></section>
    </>}
    {view==="review"&&!session?.decision&&<div className="empty-panel"><NotebookPen size={36}/><h1>完成一次选择，再来复盘</h1><p>你可以暂停、结束或继续了解，系统会记录实际发生的过程。</p><button className="primary" onClick={()=>setView("practice")}>返回情境演练<ArrowRight size={16}/></button></div>}
    {view==="history"&&<><div className="page-heading"><div><div className="eyebrow">保存在当前浏览器</div><h1>练习记录</h1></div>{session&&<button className="secondary small" onClick={exportRecord}><Download size={16}/>导出全部分支</button>}</div>{session?<><section className="history-current panel"><div className="history-icon"><Briefcase size={24}/></div><div><span className="mini-label">当前练习</span><h2>一份课余兼职邀请</h2><p>{session.mode==="learning"?"学习模式":"独立演练"} · {session.events.length} 条操作与交流记录 · {session.decision?"已作出决定":"进行中"}</p></div><button className="primary" onClick={()=>setView(session.decision?"review":"practice")}>{session.decision?"查看复盘":"继续练习"}<ArrowRight size={16}/></button></section>{session.archives.map((a,i)=><details className="panel archive" key={a.branch}><summary>重演前的路径 {i+1}<span>{a.events.length} 条记录</span></summary>{a.events.map(e=><p key={e.id}><strong>{e.title}</strong> · {e.text}</p>)}</details>)}{previous.map((past,i)=><details className="panel archive" key={past.id}><summary>往期练习 {i+1}<span>{past.events.length} 条记录 · {past.decision?"已作决定":"未完成"}</span></summary>{past.events.map(e=><p key={e.id}><strong>{e.title}</strong> · {e.text}</p>)}{past.archives.map(a=><p key={a.branch}>另保留 {a.events.length} 条重演前分支记录，可导出查看。</p>)}</details>)}<button className="danger-link" onClick={()=>setConfirm("delete")}><Trash2 size={16}/>删除本地练习记录</button></>:<div className="empty-panel"><History size={36}/><h2>还没有练习记录</h2><p>从一则招聘信息开始，留下你的第一条决策路径。</p><button className="primary" onClick={()=>setView("practice")}>去体验情境<ArrowRight size={16}/></button></div>}</>}
   </main><footer className="page-footer"><span>识局 / 校园情境练习</span><span>体验版 · 记录仅用于学习</span></footer>
  </div>
  <nav className="mobile-nav" aria-label="移动端导航"><button aria-current={view==="practice"?"page":undefined} onClick={()=>setView("practice")}><Command size={18}/>情境演练</button><button aria-current={view==="review"?"page":undefined} onClick={()=>setView("review")}><NotebookPen size={18}/>决策复盘</button><button aria-current={view==="history"?"page":undefined} onClick={()=>setView("history")}><History size={18}/>练习记录</button></nav>
  {settings&&<div className="modal-backdrop" onClick={()=>setSettings(false)}><section className="modal" role="dialog" aria-modal="true" aria-label="服务与设备" onClick={e=>e.stopPropagation()}><button className="modal-close icon-button" aria-label="关闭设置" onClick={()=>setSettings(false)}><X size={20}/></button><span className="eyebrow">服务设置</span><h2>服务与设备</h2><p>当前可进行文字练习。使用视频时，回复会传至数字人服务商。</p><div className="service-row"><MessageSquare size={20}/><div><strong>对话理解</strong><small>{status.dialogue==="configured"?"已配置模型意图分类，实际可用性以请求为准":"预设回复（未连接大模型）"}</small></div></div><div className="service-row"><Video size={20}/><div><strong>实时数字人</strong><small>{status.avatarConfigured?"已有服务配置，待连接实测":"未接入，可使用文字交流"}</small></div></div><div className="service-row"><Mic size={20}/><div><strong>浏览器语音输入</strong><small>{speechAvailable?"浏览器支持；需要麦克风权限，识别后先确认文字":"当前浏览器不支持，可使用文字输入"}</small></div></div><p className="modal-note">接入配置说明随源代码提供。账号密钥由服务端配置，不在此页面输入。当前记录为浏览器本地保存。</p><button className="primary full" onClick={()=>{setSettings(false);if(status.avatarConfigured)void connect();}}>{status.avatarConfigured?"尝试连接数字人":"继续体验文字流程"}<ArrowRight size={16}/></button>{session&&<button className="text-button centered" onClick={()=>{setSettings(false);start();}}>重新随机开始一组练习<RotateCcw size={14}/></button>}</section></div>}
  {sources&&<div className="modal-backdrop" onClick={()=>setSources(false)}><section className="modal" role="dialog" aria-modal="true" aria-label="知识来源" onClick={e=>e.stopPropagation()}><button className="modal-close icon-button" aria-label="关闭来源" onClick={()=>setSources(false)}><X size={20}/></button><span className="eyebrow">资料来源 · 背景阅读</span><h2>参考资料</h2><p>当前资料用于场景背景和延伸阅读，不代表官方认证。尚未实现自动检索或逐条引用审校。</p>{guidance.map(g=><a className="source-link" href={g.url} target="_blank" rel="noreferrer" key={g.url}><BookOpen size={19}/><span><strong>{g.title}</strong><small>{g.publisher} · {g.date}</small></span><ExternalLink size={16}/></a>)}<button className="secondary full" onClick={()=>setSources(false)}>返回练习</button></section></div>}
  {showJob&&<div className="modal-backdrop" onClick={()=>setShowJob(false)}><section className="modal" role="dialog" aria-modal="true" aria-label="完整岗位说明" onClick={e=>e.stopPropagation()}><button className="modal-close icon-button" aria-label="关闭岗位说明" onClick={()=>setShowJob(false)}><X size={20}/></button><span className="eyebrow">模拟材料 · 联系人提供的说明</span><h2>内容运营助理</h2><p>岗位编号：{JOB_CODE}<br/>机构：青禾校园内容工作室（虚构）<br/>联系人：林老师（身份为联系人自述）</p><h3>工作内容</h3><p>整理公开活动资料，辅助撰写校园活动文案。每周约6小时，具体安排需双方确认。</p><h3>结算说明</h3><p>按双方确认的工作量结算。单价和周期在当前材料中尚未明确，需要进一步询问与核对。</p><p className="modal-note">页面展示的名称、头像或说明，不能单独作为身份核实结论。</p><button className="primary full" onClick={()=>setShowJob(false)}>我已查看<Check size={16}/></button></section></div>}
  {confirm&&<div className="modal-backdrop"><section className="modal compact" role="dialog" aria-modal="true" aria-label="确认操作"><span className="eyebrow">确认操作</span><h2>{confirm==="delete"?"删除本地记录？":{pause:"暂缓本次决定？",exit:"结束这次沟通？",report:"提交模拟报告？",continue:"继续了解这份工作？"}[confirm]}</h2><p>{confirm==="delete"?"当前练习与重演分支将从此浏览器移除，建议先导出需要保留的内容。":"提交这项决定将结束本轮，并进入复盘。不会产生真实联系或举报。"}</p><div className="modal-actions"><button className="secondary" onClick={()=>setConfirm(null)}>返回思考</button><button className="primary" onClick={()=>{if(confirm==="delete"){void stop();setSession(null);setPrevious([]);setConfirm(null);setView("history");localStorage.removeItem(STORAGE_KEY);}else finish(confirm);}}>确认{confirm==="delete"?"删除":"结束本轮"}<ArrowRight size={15}/></button></div></section></div>}
 </div>;
}
function ArrowDownIcon(){return <ChevronDown size={13}/>;}

