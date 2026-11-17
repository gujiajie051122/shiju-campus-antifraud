import {jobStories,jobReview,jobActionLabels,type JobRun,type JobMode,type JobAction,type JobDecision} from './job-workshop.ts';
import {reflectionContext,type ReflectionContext,type Focus,type Evidence} from './reflection-context.ts';

export type JobReviewInput={mode:JobMode;actions:{id:string;action:JobAction|'decision';decision?:JobDecision}[];selfReport?:{id:string;text:string}};
const actions:JobAction[]=['posting','attachment','directory','contact','sender','install','hint'];
const decisions:JobDecision[]=['pause','continue','exit','report'];

// Only action codes and the explicitly saved rationale leave the browser.
// Stable synthetic IDs exclude chat contents, quotes, dates and run identifiers.
export function jobReviewInput(run:JobRun):JobReviewInput{
 const seen=new Set<string>(),summary:JobReviewInput['actions']=[];
 for(const log of run.logs){
  if(log.action==='decision')break;
  if(actions.includes(log.action as JobAction)&&!seen.has(log.action)){
   summary.push({id:'job-'+log.action,action:log.action as JobAction});seen.add(log.action);
  }
 }
 if(run.decision)summary.push({id:'job-decision',action:'decision',decision:run.decision});
 return {mode:run.mode,actions:summary,...(run.rationale?.trim()?{selfReport:{id:'job-reason',text:run.rationale.trim()}}:{})};
}
export const jobReviewBasis=(input:JobReviewInput)=>JSON.stringify(input);
export function parseJobReviewInput(value:unknown):JobReviewInput|null{
 if(!value||typeof value!=='object')return null;const v=value as JobReviewInput;
 if(!['learning','independent'].includes(v.mode)||!Array.isArray(v.actions)||!v.actions.length||v.actions.length>8)return null;
 const ids=new Set<string>(),kinds=new Set<string>();const parsed:JobReviewInput['actions']=[];
 for(const a of v.actions){
  if(!a||typeof a.id!=='string'||!(/^[\w-]{1,80}$/).test(a.id)||ids.has(a.id)||kinds.has(a.action)||![...actions,'decision'].includes(a.action))return null;
  if(a.action==='decision'?!decisions.includes(a.decision!):a.decision!==undefined)return null;
  ids.add(a.id);kinds.add(a.action);parsed.push({id:a.id,action:a.action,...(a.action==='decision'?{decision:a.decision}:{})});
 }
 if(parsed.at(-1)?.action!=='decision')return null;
 let selfReport:JobReviewInput['selfReport'];
 if(v.selfReport!==undefined){const r=v.selfReport;if(!r||typeof r.id!=='string'||!(/^[\w-]{1,80}$/).test(r.id)||ids.has(r.id)||typeof r.text!=='string'||!r.text.trim()||r.text.length>300)return null;selfReport={id:r.id,text:r.text.trim()};}
 return {mode:v.mode,actions:parsed,...(selfReport?{selfReport}:{})};
}
export function jobReflectionContext(input:JobReviewInput):ReflectionContext{
 const story=jobStories[input.mode],seen=(action:JobAction)=>input.actions.some(a=>a.action===action),end=input.actions.at(-1)!;
 const run:JobRun={version:1,id:'summary',mode:input.mode,decision:end.decision,logs:input.actions.map(a=>({id:a.id,action:a.action,text:'',at:''}))};
 const findings=jobReview(run);
 const evidence:Evidence[]=[{id:'trace',title:'本轮操作摘要',text:'仅依据结束前实际记录到的操作；没有记录不等于已完成核实，操作本身不能证明心理原因。'},...input.actions.map(a=>({id:a.id,title:jobActionLabels[a.action],text:a.action==='posting'?story.posting:a.action==='attachment'?story.attachmentText:a.action==='directory'?story.directory:a.action==='contact'?story.contact:a.action==='sender'?'回拨了对方提供的号码，结果仍来自对方，不能视为独立核实。':a.action==='install'?'点击过模拟安装请求，未实际安装软件。':a.action==='hint'?'查看过学习提示。':({pause:'暂缓办理',continue:'继续办理',exit:'结束沟通',report:'标记并报告（仅模拟）'}[a.decision!])})),...(input.selfReport?[{id:input.selfReport.id,title:'你保存的判断理由',text:input.selfReport.text}]:[])];
 const ids=(...kinds:string[])=>input.actions.filter(a=>kinds.includes(a.action)).map(a=>a.id);
 const candidates:Focus[]=[];
 if(seen('sender')&&!seen('contact'))candidates.push({id:'source',title:'换了号码，来源是否独立？',text:'回拨对方给的号码不能替代公开渠道的联系人授权核实。',evidenceIds:ids('sender'),skill:'independent'});
 candidates.push({id:'identity',title:findings[0].title,text:findings[0].text,evidenceIds:seen('contact')?ids('contact'):['trace'],skill:'independent'});
 candidates.push({id:seen('attachment')&&seen('directory')?'conflict':'terms',title:findings[1].title,text:findings[1].text,evidenceIds:ids('attachment','directory').length?ids('attachment','directory'):['trace'],skill:'terms'});
 if(seen('contact')||seen('directory'))candidates.push({id:'checked',title:'核实结果能支持哪些判断？',text:'只把已取得的独立材料用于对应事项。岗位是否存在、联系人是否获授权和办理方式是否一致，需要分别判断。',evidenceIds:ids('directory','contact'),skill:'independent'});
 candidates.push({id:'choice',title:findings[2].title,text:findings[2].text,evidenceIds:[end.id,...ids('directory','contact')],skill:'pause'});
 // Reuse only the self-report hypothesis rules; never reuse legacy scenario facts.
 const hypotheses=reflectionContext({variant:'R',actions:[{id:end.id,kind:'decision',decision:end.decision!}],selfReport:input.selfReport}).hypotheses;
 return {evidence,candidates,hypotheses,usedHints:seen('hint')};
}
