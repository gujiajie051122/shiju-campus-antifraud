export type Variant="R"|"N";
export type Mode="learning"|"independent";
export type Decision="pause"|"exit"|"report"|"continue";
export type Tool="posting"|"contact"|"callback";
export type Event={id:string;at:string;branch:string;kind:string;title:string;text:string;channel?:string};
export type Checkpoint={events:Event[];stage:number;verified:Tool[];requirementShown:boolean};
export type Session={version:1;id:string;variant:Variant;mode:Mode;branch:string;stage:number;verified:Tool[];requirementShown:boolean;events:Event[];checkpoint?:Checkpoint;archives:{branch:string;events:Event[];decision?:Decision}[];decision?:Decision;reason?:string};
export const STORAGE_KEY="shiju.pilot.session.v1";
export const JOB_CODE="QH-061";
export type Observation="identity"|"settlement"|"requirement";
export const observations:Record<Observation,{title:string;text:string}>={
 identity:{title:"联系人身份",text:"林老师自称工作室招聘联系人，需通过其他渠道核对。"},
 settlement:{title:"报酬与结算",text:"当前说明未写明单价与结算周期，需进一步确认。"},
 requirement:{title:"入职要求",text:"需要将联系人提出的入职要求与独立渠道结果对照。"}
};
export const guidance=[{title:"针对大学生群体的常见诈骗类型",publisher:"湖南公安",date:"2026-07-16",url:"https://gat.hunan.gov.cn/gat/ztzl2/qfqz/202607/t20260716_34027484.html"},{title:"大学校园电诈套路提示",publisher:"武汉公安",date:"2026-09-11",url:"https://gaj.wuhan.gov.cn/jmzx/jfts/202609/t20260911_2846437.html"}];
export const uid=()=>crypto.randomUUID();
export function event(s:Session,kind:string,title:string,text:string,channel?:string):Session{return {...s,events:[...s.events,{id:uid(),at:new Date().toISOString(),branch:s.branch,kind,title,text,channel}]};}
export function createSession(variant:Variant,mode:Mode):Session{
 const s:Session={version:1,id:uid(),variant,mode,branch:uid(),stage:0,verified:[],requirementShown:false,events:[],archives:[]};
 const material=event(s,"material","已查看招聘信息","青禾校园内容工作室（虚构）· 内容运营助理；编号 "+JOB_CODE+"；每周约6小时，报酬按双方确认的工作量结算。");
 return event(material,"actor","林老师 · 情境开场","你好，我是这份兼职的联系人林老师。我们招内容运营助理，主要做活动资料和文案整理，你想先了解哪方面？","scenario");
}
export const requirement=(v:Variant)=>v==="R"?"上岗前需本人先支付298元培训费。此处仅为模拟要求，不提供支付入口。":"培训由工作室承担，应聘者无需支付培训费。";
export function showRequirement(s:Session):Session{
 if(s.decision||s.requirementShown)return s;
 const checkpoint={events:[...s.events],stage:s.stage,verified:[...s.verified],requirementShown:false};
 return event({...s,checkpoint,stage:3,requirementShown:true},"material","已查看入职要求",requirement(s.variant));
}
export function verify(s:Session,tool:Tool):Session{
 if(s.decision)return s;
 const name={posting:"查询岗位目录",contact:"核实联系人",callback:"通过独立渠道模拟回拨"}[tool];
 const text=s.variant==="R"?(tool==="posting"?"岗位编号未获该工作室发布授权；工作室不要求应聘者先付此项培训费。":"该联系人未获该工作室本次招聘授权。"):(tool==="posting"?"岗位编号与该工作室招聘目录一致；培训由工作室承担。":"该联系人获得该工作室本次招聘授权。");
 return event({...s,verified:[...new Set([...s.verified,tool])]},"verification",name+" · 结果已显示",text+"【平台预置模拟结果，无真实查询或拨号】",tool);
}
// A source choice or a failed search is an attempt, never a successful verification.
export function lookup(s:Session,tool:Tool,query:string,source:"directory"|"sender"="directory"):Session{
 if(s.decision)return s;
 if(tool==="callback"&&source==="sender")return event(s,"verification_attempt","联系了对方提供的号码","该号码中的联系人重复了原来的说法。来源仍由对方提供，不能作为独立身份确认。","sender");
 const value=query.trim().replace(/\s/g,"").toUpperCase();
 if(tool!=="callback"&&value!==(tool==="posting"?JOB_CODE:"林老师"))return event(s,"verification_attempt","未查到匹配记录","查询内容：“"+query.trim().slice(0,80)+"”。未找到匹配项，请核对材料后重试；未查到不等于已确认虚假。",tool);
 return verify(s,tool);
}
export function recordObservation(s:Session,id:Observation):Session{
 if(s.decision||(id==="requirement"&&!s.requirementShown)||s.events.some(e=>e.kind==="material_note"&&e.channel===id))return s;
 return event(s,"material_note","记下待确认项 · "+observations[id].title,observations[id].text,id);
}
export function reviewContext(s:Session){
 const hasIdentity=s.verified.includes("contact")||s.verified.includes("callback"),hasPosting=s.verified.includes("posting");
 const cards=[
  {label:"联系人身份",claim:"对方自称：工作室招聘联系人。",result:hasIdentity?(s.variant==="R"?"独立名录：该联系人未获招聘授权。":"独立名录：该联系人获得本次招聘授权。"):(hasPosting?"已核对岗位，尚未单独核对联系人。":"本轮尚未取得独立核实结果。"),state:hasIdentity?(s.variant==="R"?"说法有冲突":"授权信息一致"):"仍待确认"},
  {label:"培训与费用",claim:s.requirementShown?requirement(s.variant):"本轮未打开联系人提供的入职要求。",result:hasPosting?"岗位目录：培训由工作室承担，不要求应聘者先付培训费。":"本轮未取得岗位目录的费用说明。",state:s.requirementShown&&hasPosting?(s.variant==="R"?"说法有冲突":"费用说明一致"):"材料未齐全"}
 ];
 const incomplete=!hasIdentity||!hasPosting;
 const next=!s.verified.length?"下次先选择对方以外的渠道，取得可对照的信息。":!s.requirementShown?"下次可以打开入职要求，再把条件与独立渠道的结果放在一起判断。":incomplete?`本轮还有${!hasIdentity?"联系人身份":"岗位费用说明"}未核实。${cards.some(c=>c.state==="说法有冲突")?"已取得的信息存在冲突，可先处理冲突，再补齐缺少的核实。":"先补齐缺少的信息，再判断两边说法是否一致。"}`:s.variant==="R"?(s.decision==="continue"?"本轮独立结果与对方说法存在冲突。可以重演，在继续之前先处理这些冲突。":"你可以重演一次，练习用具体材料解释暂停或结束沟通的原因。"):(s.decision==="report"?"本轮已取得的信息支持正常对照。重演时可以区分“还有疑问”和“已有反证”。":"本轮材料相互支持。仍可继续确认单价、结算周期和书面安排，继续或拒绝都由你决定。");
 return {cards,next,notes:s.events.filter(e=>e.kind==="material_note"),attempts:s.events.filter(e=>e.kind==="verification_attempt")};
}
export function decide(s:Session,d:Decision):Session{
 if(s.decision)return s;
 return event({...s,decision:d},"decision",{pause:"暂停，保留疑问",exit:"结束沟通",report:"提交模拟报告",continue:"继续了解（模拟）"}[d],"仅记录本次选择，无真实支付或对外联系。");
}
export function replay(s:Session):Session{
 if(!s.checkpoint)return s; const c=s.checkpoint;
 return event({...s,...c,events:[...c.events],verified:[...c.verified],branch:uid(),decision:undefined,reason:undefined,archives:[...s.archives,{branch:s.branch,events:[...s.events],decision:s.decision}]},"replay","已回到入职要求之前","本次为学习重演，不能作为独立训练效果证明。");
}
export function setReason(s:Session,reason:string):Session{if(!s.decision)return s;return event({...s,reason},"reason","你对当时选择的解释",reason);}
export function summarize(s:Session){
 const verified=s.verified.length>0,evidence=s.events.filter(e=>e.kind==="verification"),visible=s.events.filter(e=>e.kind==="material");
 const findings=[
 {label:"独立核实",status:verified?"已取得核实信息":"尚未取得核实信息",text:verified?"你通过操作台获得了模拟独立渠道的结果。是否理解核实结果，还需结合你的说明。":"当前没有独立核实结果。表达核实意愿或阅读对方材料，不等于完成核实。",ids:evidence.map(e=>e.id)},
 {label:"入职条件",status:s.requirementShown?"已查看":"未展示，不作评价",text:s.requirementShown?requirement(s.variant):"你尚未打开要求卡，不能据此评价你的判断。",ids:visible.filter(e=>e.title==="已查看入职要求").map(e=>e.id)},
 {label:"本次选择",status:s.decision?{pause:"已暂停",exit:"已退出",report:"已模拟报告",continue:"继续了解"}[s.decision]:"尚未结束",text:s.decision==="exit"&&!verified?"你选择了退出，但联系人身份尚未确认。退出不等于识破了全部问题。":s.variant==="N"&&verified?"核实结果一致。继续或拒绝均可，不能仅因拒绝正常招聘就判断能力不足。":"本次记录只反映模拟情境中的行为，不生成防骗等级。",ids:s.events.filter(e=>e.kind==="decision").map(e=>e.id)},
 {label:"敏感信息保护",status:"本场景不适用",text:"当前流程未要求提交真实敏感信息，因此不对这一项作正负评价。",ids:[]}
 ];
 return {findings,evidence,visible,usedHints:s.events.some(e=>e.kind==="hint"),isReplay:s.archives.length>0};
}
export const replies={
 greeting:"你好，我们先确认工作内容和时间。你可以查看岗位材料，也可以随时通过操作台核实信息。",
 work:"岗位主要是内容整理和活动文案辅助，每周约6小时。具体任务和结算方式需要在双方确认的书面说明中明确。",
 time:"你可以先说明自己的课余时间。如果安排不适合，也可以暂停或结束本次交流。",
 interview:"可以，请介绍一次你整理资料或参与校园活动的经历。不需要提供真实姓名、学校或其他个人信息。",
 verify:"你可以打开资料区的独立核实操作台。核实结果由模拟目录提供，我不能替它确认身份。",
 unknown:"这条信息在当前岗位材料中尚未明确，可以列为待确认项。你也可以查看入职要求或核实已有信息。"
};
export type ReplyId=keyof typeof replies;
export function classify(text:string):ReplyId{
 if(/核实|查证|回拨|官方|身份|真假|诈骗|骗子/.test(text))return "verify";
 if(/时间|课|周几|几点|工时/.test(text))return "time";
 if(/工资|报酬|工作|内容|任务|结算/.test(text))return "work";
 if(/面试|介绍|准备好|开始/.test(text))return "interview";
 if(/你好|您好/.test(text))return "greeting";return "unknown";
}
export function isSession(x:unknown):x is Session{
 if(!x||typeof x!=="object")return false;const s=x as Session;
 const events=(es:unknown):es is Event[]=>Array.isArray(es)&&es.length<1000&&es.every(e=>e&&typeof e.id==="string"&&typeof e.title==="string"&&typeof e.text==="string"&&typeof e.kind==="string"&&typeof e.branch==="string"&&typeof e.at==="string"&&!Number.isNaN(Date.parse(e.at)));
 const verified=(ts:unknown):ts is Tool[]=>Array.isArray(ts)&&ts.every(t=>["posting","contact","callback"].includes(t));
 const decision=(d:unknown)=>d===undefined||["pause","exit","report","continue"].includes(d as string);
 return s.version===1&&typeof s.id==="string"&&(s.variant==="R"||s.variant==="N")&&(s.mode==="learning"||s.mode==="independent")&&events(s.events)&&verified(s.verified)&&typeof s.requirementShown==="boolean"&&Array.isArray(s.archives)&&s.archives.length<100&&s.archives.every(a=>a&&typeof a.branch==="string"&&events(a.events)&&decision(a.decision))&&Number.isFinite(s.stage)&&typeof s.branch==="string"&&decision(s.decision)&&(s.reason===undefined||typeof s.reason==="string")&&(!s.checkpoint||(events(s.checkpoint.events)&&verified(s.checkpoint.verified)&&Number.isFinite(s.checkpoint.stage)&&typeof s.checkpoint.requirementShown==="boolean"));
}

