import {jobRoleContext,JOB_ROLE_PROMPT,validJobRoleReply} from './job-role.ts';
import {jobTurnPlan,jobTurnReply,type JobChatInput,type JobCheck} from './job-conversation.ts';
import {completeJSON,type ModelConfig} from './model-service.ts';
export type {JobChatInput} from './job-conversation.ts';
export function parseJobChat(v:unknown):JobChatInput|null{
 if(!v||typeof v!=='object')return null;
 const a=v as Record<string,unknown>;
 if(a.jobWorkshop!==true||!['learning','independent'].includes(a.mode as string)||typeof a.text!=='string'||!a.text.trim()||a.text.length>1000||typeof a.opened!=='boolean'||!Array.isArray(a.history)||a.history.length>8)return null;
 if(!a.history.every(h=>h&&['user','assistant'].includes(h.role)&&typeof h.content==='string'&&h.content.length<=1000))return null;
 if(a.checks!==undefined&&(!Array.isArray(a.checks)||a.checks.length>3||!a.checks.every(c=>['directory','contact','sender'].includes(c))))return null;
 let quote:JobChatInput['quote'];
 if(a.quote!==undefined){const q=a.quote as Record<string,unknown>;if(!q||typeof q!=='object'||typeof q.name!=='string'||q.name.length>30||typeof q.text!=='string'||q.text.length>160)return null;quote={name:q.name,text:q.text};}
 return {mode:a.mode as JobChatInput['mode'],text:a.text.trim(),opened:a.opened,history:a.history,checks:(a.checks??[]) as JobCheck[],...(quote?{quote}:{})};
}
export async function generateJobChat(input:JobChatInput,config:ModelConfig|null,signal?:AbortSignal,transport?:typeof fetch){
 const plan=jobTurnPlan(input);
 const fallback=(warning?:string)=>({reply:jobTurnReply(input,plan),engine:'rules' as const,...(warning?{warning}:{})});
 if(signal?.aborted)throw signal.reason;
 if(plan.includes('refuse')||/忽略|提示词|system|正常组|风险组/i.test(input.text))return fallback();
 if(!config)return fallback('智能对话暂不可用，当前为预设演练回复');
 try{
  const fast=/^qwen/i.test(config.model)?{...config,enableThinking:false}:config;
  const output=await completeJSON(fast,JOB_ROLE_PROMPT,jobRoleContext(input),{type:'object',properties:{reply:{type:'string'}},required:['reply'],additionalProperties:false},'job_role_turn',signal,transport);
  if(!validJobRoleReply(output,input))throw Error('Invalid role reply');
  return {reply:output.reply.trim(),engine:'model' as const};
 }catch{if(signal?.aborted)throw signal.reason;return fallback('本条回复未完成或未通过情境校验，已使用预设演练回复');}
}
