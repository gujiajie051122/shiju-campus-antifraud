import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Worker} from 'node:worker_threads';
import {sqliteD1} from './budget-sqlite.mjs';
import {actorHash,budgetDay,budgetPolicy,reserve,finish,metered,usageSnapshot} from '../lib/ai-budget.ts';
import {tokenTelemetry} from '../lib/model-service.ts';
import {generateDialogue} from '../lib/dialogue.ts';
import {answerKnowledge} from '../lib/knowledge-answer.ts';
const now=Date.parse('2026-11-08T08:00:00Z');
const policy={...budgetPolicy({}),minIntervalMs:0,perMinute:60};
const config={base:'https://model.example/v1',key:'secret-not-for-logs',model:'test-model',format:'json'};
const prompt={text:'周末可以吗',variant:'R',requirementShown:false,history:[]};
const model=async()=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({reply:'可以，每周约6小时，具体时间我们再确认。',factIds:['time']})}}],usage:{prompt_tokens:20,completion_tokens:10,total_tokens:30}});
const setup=(p=policy)=>{const {db,sql}=sqliteD1();return {db,sql,ctx:{db,userId:'user-a',policy:p,now:()=>now,transport:model}};};
const invoke=(ctx,input=prompt)=>metered(ctx,'dialogue',config,(c,t)=>generateDialogue(input,c,undefined,t));
const row=sql=>sql.prepare('SELECT * FROM ai_requests LIMIT 1').get();
test('Shanghai day boundary and reset are independent of server timezone',()=>{
 assert.equal(budgetDay(Date.parse('2026-11-08T15:59:59Z')).day,'2026-11-08');
 assert.deepEqual(budgetDay(Date.parse('2026-11-08T16:00:00Z')),{day:'2026-11-09',resetsAt:'2026-11-09T16:00:00.000Z'});
});
test('configuration has bounded defaults, allows zero to disable and rejects malformed limits',()=>{
 assert.equal(budgetPolicy({}).userDaily,200);assert.equal(budgetPolicy({}).siteDaily,1000);
 assert.equal(budgetPolicy({AI_SITE_DAILY_LIMIT:'0'}).siteDaily,0);
 for(const raw of ['-1','Infinity','3.5','100001',' '])assert.equal(budgetPolicy({AI_SITE_DAILY_LIMIT:raw}),null);
});

test('review allowance continues beyond 40 calls while retaining personal and site ceilings',async()=>{
 const {db,sql}=sqliteD1(),p=budgetPolicy({});
 const seed=sql.prepare("INSERT INTO ai_requests (request_id,actor_hash,day,feature,model,started_at,lease_until,outcome) VALUES (?,?,?,?,?,?,?,'model')");
 let serial=0;
 const add=(hash,n)=>{for(let i=0;i<n;i++)seed.run('seed-'+serial++,hash,budgetDay(now).day,'knowledge','test',now-120000,now-120000);};
 add('reviewer',40);
 const next=await reserve(db,'reviewer','reflection','test',p,now);assert.ok(next.id);await finish(db,next.id,'model',now,{});
 add('reviewer',159);
 assert.equal((await reserve(db,'reviewer','dialogue','test',p,now+60001)).code,'user_daily');
 add('another-reviewer',800);
 assert.equal((await reserve(db,'fresh-reviewer','knowledge','test',p,now+60001)).code,'site_daily');
 assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM ai_requests').get().n,1000);sql.close();
});
test('dialogue and knowledge share a per-user cap; no reservation when rejected',async()=>{
 const {db,sql}=setup();const p={...policy,userDaily:2};
 for(const feature of ['dialogue','knowledge']){const r=await reserve(db,'a',feature,'test',p,now);assert.ok(r.id);await finish(db,r.id,'model',now,{});}
 assert.equal((await reserve(db,'a','dialogue','test',p,now)).code,'user_daily');
 assert.ok((await reserve(db,'b','dialogue','test',p,now)).id);
 assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM ai_requests').get().n,3);sql.close();
});
test('whole-site daily cap is shared across users and features',async()=>{
 const {db,sql}=setup();const p={...policy,siteDaily:2};
 for(const user of ['a','b']){const r=await reserve(db,user,'knowledge','test',p,now);await finish(db,r.id,'failed',now,{});}
 assert.equal((await reserve(db,'c','dialogue','test',p,now)).code,'site_daily');sql.close();
});
test('atomic admission stays within the site cap across independent SQLite connections',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'shiju-budget-')),file=join(dir,'quota.sqlite');
 const {sql}=sqliteD1(file);sql.close();
 try{
  const p={...policy,siteDaily:3,siteConcurrent:20};
  const bookings=await Promise.all(Array.from({length:12},(_,i)=>new Promise((resolve,reject)=>{
   const w=new Worker(new URL('./budget-worker.mjs',import.meta.url),{workerData:{file,user:'actor-'+i,policy:p,now}});w.once('message',resolve);w.once('error',reject);w.once('exit',code=>{if(code)reject(Error('worker failed'));});
  })));
  assert.equal(bookings.filter(b=>b.id).length,3);
  const check=sqliteD1(file,false);assert.equal(check.sql.prepare('SELECT COUNT(*) AS n FROM ai_requests').get().n,3);check.sql.close();
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('per-user and global active leases block overlap; expired leases retain daily usage',async()=>{
 const {db,sql}=setup();const p={...policy,siteConcurrent:2};
 await reserve(db,'a','dialogue','test',p,now);
 assert.equal((await reserve(db,'a','knowledge','test',p,now+1000)).code,'busy');
 await reserve(db,'b','knowledge','test',p,now);
 assert.equal((await reserve(db,'c','knowledge','test',p,now)).code,'busy');
 assert.ok((await reserve(db,'a','knowledge','test',p,now+45001)).id);
 assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM ai_requests WHERE actor_hash=?').get('a').n,2);sql.close();
});
test('short interval and rolling per-minute limit hold after successful completion',async()=>{
 const {db,sql}=setup();const p={...policy,minIntervalMs:1500,perMinute:2};
 const a=await reserve(db,'a','dialogue','test',p,now);await finish(db,a.id,'model',now,{});
 assert.equal((await reserve(db,'a','dialogue','test',p,now+1499)).code,'rapid');
 const b=await reserve(db,'a','dialogue','test',p,now+1500);await finish(db,b.id,'model',now+1501,{});
 assert.equal((await reserve(db,'a','dialogue','test',p,now+5000)).code,'rapid');
 assert.ok((await reserve(db,'a','dialogue','test',p,now+60001)).id);sql.close();
});
test('midnight resets daily cap but does not reset active or recent-request guards',async()=>{
 const {db,sql}=setup();const p={...policy,userDaily:1};const start=Date.parse('2026-11-08T15:59:59Z');
 const a=await reserve(db,'a','dialogue','test',p,start);
 assert.equal((await reserve(db,'a','dialogue','test',p,start+1001)).code,'busy');
 await finish(db,a.id,'model',start+2000,{});
 assert.ok((await reserve(db,'a','dialogue','test',p,start+3000)).id);sql.close();
});
test('real generation records provider tokens and metadata without keys or prompts',async()=>{
 const {ctx,sql}=setup();const result=await invoke(ctx);assert.equal(result.engine,'model');
 const saved=row(sql);assert.equal(saved.total_tokens,30);assert.equal(saved.outcome,'model');assert.equal(saved.http_status,200);
 assert.equal(saved.actor_hash,await actorHash('user-a'));assert.doesNotMatch(JSON.stringify(saved),/secret-not-for-logs|周末|user-a|Bearer|model.example/);
 const snap=await usageSnapshot(ctx,true);assert.equal(snap.used,1);assert.equal(snap.remaining,199);assert.equal(snap.tokens,30);sql.close();
});
test('disabled cap never calls provider and still returns a usable actor fallback',async()=>{
 const {ctx,sql}=setup({...policy,siteDaily:0});let calls=0;ctx.transport=async()=>{calls++;return model();};
 const result=await invoke(ctx);assert.equal(result.engine,'rules');assert.equal(result.budgetCode,'site_daily');assert.ok(result.reply);assert.equal(calls,0);assert.equal(row(sql),undefined);sql.close();
});
test('blocked knowledge still returns traceable curated summaries',async()=>{
 const {ctx,sql}=setup({...policy,userDaily:0});let calls=0;ctx.transport=async()=>{calls++;return model();};
 const result=await metered(ctx,'knowledge',config,(c,t)=>answerKnowledge('兼职入职要先交培训费怎么办',c,undefined,t));
 assert.equal(result.engine,'retrieval');assert.equal(result.budgetCode,'user_daily');assert.ok(result.sources.length);assert.ok(result.points.length);assert.equal(calls,0);sql.close();
});
test('deterministic responses and no-hit retrieval consume no quota even if DB is down',async()=>{
 const {ctx,sql}=setup();ctx.db={prepare(){throw Error('down');}};ctx.transport=()=>{throw Error('must not call');};
 const a=await invoke(ctx,{...prompt,text:'我不想继续了'});assert.equal(a.engine,'rules');assert.equal(a.budgetCode,undefined);
 const b=await metered(ctx,'knowledge',config,(c,t)=>answerKnowledge('火星地质学',c,undefined,t));assert.equal(b.engine,'none');
 assert.equal(row(sql),undefined);sql.close();
});
test('missing visitor identity, storage or valid policy fails closed without provider calls',async()=>{
 for(const missing of [{userId:null},{db:undefined},{policy:null},{db:{prepare(){throw Error('unavailable');}}}]){
  const {ctx,sql}=setup();let calls=0;ctx.transport=async()=>{calls++;return model();};const result=await invoke({...ctx,...missing});assert.equal(result.engine,'rules');assert.ok(result.budgetCode);assert.equal(calls,0);sql.close();
 }
});
test('provider errors retain quota, release overlap guard and report unknown token usage',async()=>{
 const {ctx,sql}=setup();ctx.transport=async()=>new Response('',{status:503});assert.equal((await invoke(ctx)).engine,'rules');
 assert.equal(row(sql).outcome,'failed');assert.equal(row(sql).total_tokens,null);
 const snap=await usageSnapshot(ctx,true);assert.equal(snap.failures,1);assert.equal(snap.unknownTokens,1);assert.equal(snap.remaining,199);
 ctx.transport=model;assert.equal((await invoke(ctx)).engine,'model');sql.close();
});
test('invalid model output still records billed usage and a validation fallback',async()=>{
 const {ctx,sql}=setup();ctx.transport=async()=>Response.json({choices:[{finish_reason:'stop',message:{content:'{}'}}],usage:{prompt_tokens:8,completion_tokens:2,total_tokens:10}});
 assert.equal((await invoke(ctx)).engine,'rules');assert.equal(row(sql).outcome,'fallback');assert.equal(row(sql).total_tokens,10);sql.close();
});
test('cancellation keeps its lease, daily attempt and cancellation metadata',async()=>{
 const {ctx,sql}=setup();const controller=new AbortController();ctx.transport=async()=>{controller.abort();throw new DOMException('Aborted','AbortError');};
 await assert.rejects(()=>metered(ctx,'dialogue',config,(c,t)=>generateDialogue(prompt,c,controller.signal,t)));
 assert.equal(row(sql).outcome,'cancelled');assert.equal((await reserve(ctx.db,await actorHash(ctx.userId),'dialogue','test',policy,now+1000)).code,'busy');
 assert.equal((await usageSnapshot(ctx,true)).used,1);sql.close();
});
test('token reporting rejects fabricated or inconsistent values and never estimates missing usage',()=>{
 assert.deepEqual(tokenTelemetry(undefined),{});assert.deepEqual(tokenTelemetry({prompt_tokens:1,completion_tokens:2,total_tokens:9}),{});
 assert.deepEqual(tokenTelemetry({prompt_tokens:-1,completion_tokens:'2',total_tokens:Infinity}),{});
 assert.deepEqual(tokenTelemetry({total_tokens:0}),{totalTokens:0});
});
test('usage API projection isolates users and reveals no identifiers or site traffic',async()=>{
 const {ctx,sql}=setup();await invoke(ctx);const other=await usageSnapshot({...ctx,userId:'other'},true);
 assert.equal(other.used,0);assert.equal(other.tokens,null);assert.doesNotMatch(JSON.stringify(other),/user-a|actor_hash|request_id|siteDaily|secret/);sql.close();
});
