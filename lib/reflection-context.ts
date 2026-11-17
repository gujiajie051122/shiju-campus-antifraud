import type {Session,Decision,Tool} from "./scenario.ts";
import type {FocusId,FactorId,ReviewSelection} from "./reflection-types.ts";
type ActionKind="terms"|"verified"|"sender"|"unmatched"|"decision"|"hint";
export type ReviewAction={id:string;kind:ActionKind;tool?:Tool;decision?:Decision};
export type ReviewInput={variant:"R"|"N";actions:ReviewAction[];selfReport?:{id:string;text:string}};
export type Evidence={id:string;title:string;text:string};
export type Focus={id:FocusId;title:string;text:string;evidenceIds:string[];skill:Skill};
export type Skill="independent"|"terms"|"pause";
export type Factor={id:Exclude<FactorId,"insufficient">;title:string;question:string;evidenceIds:string[];skill:Skill};
export const factors:Record<Exclude<FactorId,"insufficient">,{title:string;question:string;pattern:RegExp;skill:Skill}>={
 authority:{title:"身份线索的影响",question:"你提到了身份或头衔。当时是否更相信了对方的说法？",pattern:/身份信任|老师|官方|正规|认证|权威|机构|学长|头衔/,skill:"independent"},
 time:{title:"时间与机会的影响",question:"你提到了时间或机会。当时是否因此想尽快作出决定？",pattern:/时间压力|错过|名额|截止|限时|赶紧|着急|来不及|机会|催促/,skill:"pause"},
 relationship:{title:"关系与人情的影响",question:"你提到了他人的关系。当时是否担心拒绝会影响关系？",pattern:/关系压力|朋友|同学|室友|熟人|人情|不好意思|推荐/,skill:"independent"},
 sunk:{title:"已投入时间的影响",question:"你提到了先前的投入。当时是否觉得现在退出有些可惜？",pattern:/已投入时间|已经花|已经付|投入|白费|可惜|折腾|不甘心/,skill:"pause"},
};
// Send action codes and one optional self-report, never chat text, timestamps or archives.
export function reviewInput(session:Session):ReviewInput{
 const actions:ReviewAction[]=[],seen=new Set<string>();
 for(const e of session.events){
  let a:ReviewAction|undefined;
  if(e.kind==="material"&&e.title==="已查看入职要求")a={id:e.id,kind:"terms"};
  if(e.kind==="verification"&&["posting","contact","callback"].includes(e.channel??""))a={id:e.id,kind:"verified",tool:e.channel as Tool};
  if(e.kind==="verification_attempt")a={id:e.id,kind:e.channel==="sender"?"sender":"unmatched",...(["posting","contact","callback"].includes(e.channel??"")?{tool:e.channel as Tool}:{})};
  if(e.kind==="hint")a={id:e.id,kind:"hint"};
  if(e.kind==="decision"&&session.decision)a={id:e.id,kind:"decision",decision:session.decision};
  if(a){const key=a.kind+":"+(a.tool??"");if(!seen.has(key)){actions.push(a);seen.add(key);}if(a.kind==="decision")break;}
 }
 const reason=session.reason?.trim().slice(0,500),reasonEvent=session.events.findLast(e=>e.kind==="reason");
 return {variant:session.variant,actions,...(reason?{selfReport:{id:reasonEvent?.id??"self-report",text:reason}}:{})};
}
export function parseReviewInput(value:unknown):ReviewInput|null{
 if(!value||typeof value!=="object")return null;const v=value as ReviewInput;
 if(!["R","N"].includes(v.variant)||!Array.isArray(v.actions)||!v.actions.length||v.actions.length>20)return null;
 const ids=new Set<string>();const actions:ReviewAction[]=[];
 for(const a of v.actions){
  if(!a||typeof a.id!=="string"||!(/^[\w-]{1,80}$/).test(a.id)||ids.has(a.id)||!["terms","verified","sender","unmatched","decision","hint"].includes(a.kind))return null;
  ids.add(a.id);
  if(a.kind==="verified"&&!["posting","contact","callback"].includes(a.tool??""))return null;
  if(a.kind==="decision"&&!["pause","exit","report","continue"].includes(a.decision??""))return null;
  if(a.kind!=="decision"&&a.decision!==undefined)return null;
  if(a.tool!==undefined&&!["posting","contact","callback"].includes(a.tool))return null;
  actions.push({id:a.id,kind:a.kind,...(a.tool?{tool:a.tool}:{}),...(a.decision?{decision:a.decision}:{})});
 }
 if(actions.at(-1)?.kind!=="decision"||actions.filter(a=>a.kind==="decision").length!==1)return null;
 let selfReport:ReviewInput["selfReport"];
 if(v.selfReport!==undefined){const r=v.selfReport;if(!r||typeof r.id!=="string"||!(/^[\w-]{1,80}$/).test(r.id)||ids.has(r.id)||typeof r.text!=="string"||!r.text.trim()||r.text.length>500)return null;selfReport={id:r.id,text:r.text.trim()};}
 return {variant:v.variant,actions,...(selfReport?{selfReport}:{})};
}
export function reflectionContext(input:ReviewInput){
 const a=input.actions,decision=a.at(-1)!,terms=a.find(x=>x.kind==="terms"),verified=a.filter(x=>x.kind==="verified"),posting=verified.find(x=>x.tool==="posting"),identity=verified.find(x=>x.tool==="contact"||x.tool==="callback"),sender=a.find(x=>x.kind==="sender");
 const evidence:Evidence[]=[{id:"trace",title:"本轮操作摘要",text:"只依据本轮结束前记录到的操作；缺少记录不能证明真实心理原因。"},...a.map(x=>({id:x.id,title:x.kind==="terms"?"已查看入职要求":x.kind==="verified"?{posting:"已查询岗位目录",contact:"已核实联系人",callback:"已使用独立渠道回拨"}[x.tool!]:x.kind==="sender"?"曾使用对方给的号码":x.kind==="unmatched"?"曾有未匹配的查询":x.kind==="hint"?"使用过学习提示":"已作出本轮选择",text:x.kind==="decision"?{pause:"暂缓决定",exit:"结束沟通",report:"模拟报告",continue:"继续了解"}[x.decision!]:x.kind==="verified"?"平台预置模拟结果，不是真实查询。":x.kind==="sender"?"来源仍由对方提供，不算独立核实。":x.kind==="unmatched"?"未匹配不等于已确认虚假。":"此项操作已记录。"})),...(input.selfReport?[{id:input.selfReport.id,title:"你保存的自述",text:input.selfReport.text}]:[])];
 const candidates:Focus[]=[];
 if(sender&&!identity)candidates.push({id:"source",title:"号码换了，来源是否换了？",text:"本轮曾使用对方提供的号码，记录中尚无独立身份核实结果。沿用同一来源，不能补上身份依据。",evidenceIds:[sender.id,"trace"],skill:"independent"});
 if(!identity)candidates.push({id:"identity",title:"联系人身份仍待确认",text:"本轮记录中没有取得联系人授权的独立结果。暂停或退出可以保留这个疑问，并不等于已经确认对方身份。",evidenceIds:["trace",decision.id],skill:"independent"});
 if(!terms)candidates.push({id:"terms",title:"还有一份条件没有打开",text:"本轮未记录到查看入职要求，暂不评价你是否识别了其中的费用条件。下一次可先补齐材料。",evidenceIds:["trace",decision.id],skill:"terms"});
 if(terms&&posting&&input.variant==="R"&&decision.decision==="continue")candidates.unshift({id:"conflict",title:"继续之前，先处理信息冲突",text:"已展示的费用要求与模拟岗位目录不一致，本轮随后选择了继续了解。继续了解不等于付款，但仍需要解释这处冲突。",evidenceIds:[terms.id,posting.id,decision.id],skill:"pause"});
 if(verified.length)candidates.push({id:"checked",title:"你取得了独立渠道的信息",text:"本轮记录了独立核实操作。它只能支持已核对的事项，不能代替其他尚未核实的内容。",evidenceIds:verified.map(x=>x.id),skill:identity?"terms":"independent"});
 if(!candidates.length||decision.decision==="exit"||decision.decision==="pause")candidates.push({id:"choice",title:"这个选择需要结合你的理由",text:"暂停、继续了解或拒绝机会都不能单独代表判断能力。是否理解材料，还需要结合当时依据与自述。",evidenceIds:[decision.id],skill:"terms"});
 // A negated, quoted or hypothetical mention is not evidence of influence.
 const clauses=input.selfReport?.text.split(/[，。；！\n]/)??[];
 const hypotheses:Factor[]=input.selfReport?(Object.entries(factors) as [Exclude<FactorId,"insufficient">,typeof factors.authority][]).filter(([,f])=>clauses.some(text=>f.pattern.test(text)&&!/(不是|并非|没有|不受|不会|没被|不担心|不觉得|不相信|并不|未受|不着急|不怕|无关|引用|假设|如果|是否|[“”「」？?])/.test(text))).map(([id,f])=>({id,title:f.title,question:f.question,evidenceIds:[input.selfReport!.id],skill:f.skill})):[];
 return {evidence,candidates,hypotheses,usedHints:a.some(x=>x.kind==="hint")};
}
export type ReflectionContext=ReturnType<typeof reflectionContext>;
export function validateContextSelection(value:unknown,c:ReflectionContext):{focusIds:FocusId[];factorId:FactorId}|null{
 if(!value||typeof value!=="object")return null;const v=value as ReviewSelection;
 if(!Array.isArray(v.focusIds)||!v.focusIds.length||v.focusIds.length>2||new Set(v.focusIds).size!==v.focusIds.length||v.focusIds.some(id=>!c.candidates.some(x=>x.id===id))||!(v.factorId==="insufficient"||c.hypotheses.some(x=>x.id===v.factorId)))return null;
 return {focusIds:v.focusIds,factorId:v.factorId};
}
export function validateReviewSelection(value:unknown,input:ReviewInput){return validateContextSelection(value,reflectionContext(input));}
export const reviewBasis=(input:ReviewInput)=>JSON.stringify(input);
export function practiceSkill(selection:Pick<ReviewSelection,"focusIds"|"factorId">,input:ReviewInput,feedback?:"confirm"|"reject"|"unsure"):Skill{
 const context=reflectionContext(input),factor=context.hypotheses.find(f=>f.id===selection.factorId);
 return factor&&feedback==="confirm"?factor.skill:context.candidates.find(c=>c.id===selection.focusIds[0])?.skill??"independent";
}
