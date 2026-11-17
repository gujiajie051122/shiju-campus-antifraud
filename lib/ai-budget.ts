import type {ModelConfig, ModelTelemetry} from "./model-service.ts";

export type BudgetPolicy={userDaily:number;siteDaily:number;perMinute:number;minIntervalMs:number;userConcurrent:number;siteConcurrent:number};
export type BudgetDB=Pick<D1Database,"prepare">;
export type BudgetContext={db:BudgetDB|undefined;userId:string|null;policy:BudgetPolicy|null;guest?:boolean;setCookie?:string;now?:()=>number;transport?:typeof fetch};
export type BudgetCode="signin"|"unavailable"|"user_daily"|"site_daily"|"busy"|"rapid";
const messages:Record<BudgetCode,string>={
 signin:"登录后可使用智能回复；当前仍可使用预设演练与资料检索。",
 unavailable:"智能回复暂不可用，已保留预设演练与资料检索。",
 user_daily:"今日智能回复额度已用完，北京时间零点恢复；可继续预设演练与资料检索。",
 site_daily:"本站今日智能回复额度已用完，北京时间零点恢复；可继续预设演练与资料检索。",
 busy:"当前有回复正在处理，请稍后再试；本次使用预设回复或资料检索。",
 rapid:"操作较快，请稍后再试；本次使用预设回复或资料检索。",
};
export function budgetPolicy(env:Record<string,string|undefined>=process.env):BudgetPolicy|null{
 const read=(key:string,fallback:number,max:number)=>{const raw=env[key];if(raw===undefined||raw==="")return fallback;if(!/^\d+$/.test(raw))throw Error("Invalid budget setting");const n=Number(raw);if(!Number.isSafeInteger(n)||n>max)throw Error("Invalid budget setting");return n;};
 try{return {userDaily:read("AI_USER_DAILY_LIMIT",200,10000),siteDaily:read("AI_SITE_DAILY_LIMIT",1000,100000),perMinute:read("AI_USER_PER_MINUTE",6,60),minIntervalMs:read("AI_MIN_INTERVAL_MS",1500,60000),userConcurrent:1,siteConcurrent:read("AI_SITE_CONCURRENT",3,20)};}catch{return null;}
}
export function budgetDay(now:number){const shifted=now+8*3600000;const day=new Date(shifted).toISOString().slice(0,10);return {day,resetsAt:new Date((Math.floor(shifted/86400000)+1)*86400000-8*3600000).toISOString()};}
export async function actorHash(id:string){const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("shiju:appgprj_6aef3fc7ab888191933ff7d3ac43e3c2:"+id));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");}

// The predicate and insert run as ONE write statement on D1's primary.
// A separate read-then-increment would allow simultaneous requests to exceed caps.
export const RESERVE_SQL=`INSERT INTO ai_requests
 (request_id,actor_hash,day,feature,model,started_at,lease_until,outcome)
 SELECT ?1,?2,?3,?4,?5,?6,?7,'reserved'
 WHERE (SELECT COUNT(*) FROM ai_requests WHERE day=?3) < ?8
 AND (SELECT COUNT(*) FROM ai_requests WHERE actor_hash=?2 AND day=?3) < ?9
 AND (SELECT COUNT(*) FROM ai_requests WHERE actor_hash=?2 AND started_at>?10) < ?11
 AND NOT EXISTS(SELECT 1 FROM ai_requests WHERE actor_hash=?2 AND started_at>?12)
 AND (SELECT COUNT(*) FROM ai_requests WHERE actor_hash=?2 AND outcome IN ('reserved','cancelled') AND lease_until>?6) < ?13
 AND (SELECT COUNT(*) FROM ai_requests WHERE outcome IN ('reserved','cancelled') AND lease_until>?6) < ?14`;
const COUNTS_SQL=`SELECT
 (SELECT COUNT(*) FROM ai_requests WHERE day=?1) AS site,
 (SELECT COUNT(*) FROM ai_requests WHERE actor_hash=?2 AND day=?1) AS personal,
 (SELECT COUNT(*) FROM ai_requests WHERE actor_hash=?2 AND started_at>?3) AS recent,
 (SELECT MAX(started_at) FROM ai_requests WHERE actor_hash=?2) AS last,
 (SELECT COUNT(*) FROM ai_requests WHERE actor_hash=?2 AND outcome IN ('reserved','cancelled') AND lease_until>?4) AS active_user,
 (SELECT COUNT(*) FROM ai_requests WHERE outcome IN ('reserved','cancelled') AND lease_until>?4) AS active_site`;
type Counts={site:number;personal:number;recent:number;last:number|null;active_user:number;active_site:number};
function blocked(c:Counts,p:BudgetPolicy,now:number):BudgetCode|null{
 if(c.site>=p.siteDaily)return "site_daily";
 if(c.personal>=p.userDaily)return "user_daily";
 if(c.active_user>=p.userConcurrent||c.active_site>=p.siteConcurrent)return "busy";
 if(c.recent>=p.perMinute||(c.last!==null&&now-c.last<p.minIntervalMs))return "rapid";
 return null;
}
async function counts(db:BudgetDB,hash:string,now:number){return db.prepare(COUNTS_SQL).bind(budgetDay(now).day,hash,now-60000,now).first<Counts>();}
export async function reserve(db:BudgetDB,hash:string,feature:"dialogue"|"knowledge"|"reflection",model:string,p:BudgetPolicy,now:number){
 const id=crypto.randomUUID();
 const result=await db.prepare(RESERVE_SQL).bind(id,hash,budgetDay(now).day,feature,model.slice(0,120),now,now+45000,p.siteDaily,p.userDaily,now-60000,p.perMinute,now-p.minIntervalMs,p.userConcurrent,p.siteConcurrent).run();
 if(result.meta.changes===1)return {id,code:null};
 const c=await counts(db,hash,now);return {id:null,code:c?blocked(c,p,now)??"busy":"unavailable"} as {id:null;code:BudgetCode};
}
export const FINISH_SQL=`UPDATE ai_requests SET finished_at=?2,outcome=?3,http_status=?4,prompt_tokens=?5,completion_tokens=?6,total_tokens=?7 WHERE request_id=?1 AND outcome='reserved'`;
export async function finish(db:BudgetDB,id:string,outcome:string,now:number,telemetry:ModelTelemetry){
 // Cancelled calls may still be running upstream: retain their lease until expiry.
 await db.prepare(FINISH_SQL).bind(id,now,outcome,telemetry.status??null,telemetry.promptTokens??null,telemetry.completionTokens??null,telemetry.totalTokens??null).run();
}
type EngineResult={engine:string;warning?:string};
export async function metered<T extends EngineResult>(ctx:BudgetContext,feature:"dialogue"|"knowledge"|"reflection",config:ModelConfig|null,work:(config:ModelConfig|null,transport:typeof fetch)=>Promise<T>):Promise<T&{budgetCode?:BudgetCode}>{
 let id:string|null=null,code:BudgetCode|undefined,telemetry:ModelTelemetry={},providerFailed=false,attempted=false;
 const now=ctx.now??Date.now;
 const guarded:typeof fetch=async(input,init)=>{
  // Reserve only when generation really needs a provider; deterministic paths are free.
  if(attempted)throw Error("Only one provider attempt is allowed");attempted=true;
  if(init?.signal?.aborted)throw init.signal.reason;
  if(!ctx.userId)code="signin";else if(!ctx.db||!ctx.policy)code="unavailable";
  if(!code){try{const booking=await reserve(ctx.db!,await actorHash(ctx.userId!),feature,config!.model,ctx.policy!,now());id=booking.id;code=booking.code??undefined;}catch{code="unavailable";}}
  if(code)throw Error("Model budget unavailable");
  try{return await (ctx.transport??fetch)(input,init);}catch(error){providerFailed=true;throw error;}
 };
 const observed=config?{...config,observe:(event:ModelTelemetry)=>{telemetry={...telemetry,...event};}}:null;
 let result:T;
 try{result=await work(observed,guarded);}catch(error){if(id&&ctx.db){try{await finish(ctx.db,id,"cancelled",now(),telemetry);}catch{}}throw error;}
 if(id&&ctx.db){const outcome=providerFailed||(telemetry.status??200)>=400?"failed":result.engine==="model"?"model":"fallback";try{await finish(ctx.db,id,outcome,now(),telemetry);}catch{/* Reservation stays counted and leased if persistence is unavailable. */}}
 return code?{...result,warning:messages[code],budgetCode:code}:result;
}
export async function usageSnapshot(ctx:BudgetContext,configured:boolean){
 const now=(ctx.now??Date.now)(),p=ctx.policy;const base={configured,guest:ctx.guest===true,limit:p?.userDaily??0,resetsAt:budgetDay(now).resetsAt};
 if(!ctx.userId)return {...base,available:false,requiresSignIn:true,message:messages.signin};
 if(!ctx.db||!p)return {...base,available:false,message:messages.unavailable};
 try{
  const hash=await actorHash(ctx.userId),c=await counts(ctx.db,hash,now);if(!c)throw Error("Missing usage");
  const stats=await ctx.db.prepare(`SELECT COUNT(*) AS attempts, SUM(CASE WHEN outcome='model' THEN 1 ELSE 0 END) AS succeeded, SUM(CASE WHEN outcome IN ('failed','fallback','cancelled') OR (outcome='reserved' AND lease_until<=?3) THEN 1 ELSE 0 END) AS failures, SUM(total_tokens) AS tokens, SUM(CASE WHEN total_tokens IS NULL THEN 1 ELSE 0 END) AS unknown_tokens FROM ai_requests WHERE actor_hash=?1 AND day=?2`).bind(hash,budgetDay(now).day,now).first<{attempts:number;succeeded:number|null;failures:number|null;tokens:number|null;unknown_tokens:number|null}>();
  const reason=blocked(c,p,now);return {...base,available:configured&&!reason,used:c.personal,remaining:Math.max(0,p.userDaily-c.personal),succeeded:stats?.succeeded??0,failures:stats?.failures??0,tokens:stats?.tokens??null,unknownTokens:stats?.unknown_tokens??0,message:!configured?"尚未连接模型，可继续使用预设演练与资料检索。":reason?messages[reason]:ctx.guest?"无需登录即可体验智能问答、情境对话与AI复盘，三项功能共用体验额度。":"对话、资料整理与AI复盘共用额度。"};
 }catch{return {...base,available:false,message:messages.unavailable};}
}
