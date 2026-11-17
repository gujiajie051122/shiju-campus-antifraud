import test from 'node:test';
import assert from 'node:assert/strict';
import {makeJobRun,jobEvent,finishJob,JOB_RUN_KEY,isJobRun} from '../lib/job-workshop.ts';
import {jobReviewInput,parseJobReviewInput,jobReviewBasis,jobReflectionContext} from '../lib/job-reflection.ts';
import {analyzeReflectionContext} from '../lib/reflection-answer.ts';
import {validateContextSelection} from '../lib/reflection-context.ts';
import {persistJobRun,persistJobReflection,readJobHistory,JOB_HISTORY_KEY} from '../lib/job-history.ts';
const config={base:'https://model.example/v1',key:'test-only',model:'test-model',format:'json'};
const completed=(mode='independent',reason='')=>finishJob(jobEvent(jobEvent(makeJobRun(mode),'attachment','private-material'),'directory','private-directory'),'pause',reason);
const record=(run,selection={engine:'model',focusIds:['conflict'],factorId:'insufficient'})=>({basis:jobReviewBasis(jobReviewInput(run)),createdAt:new Date().toISOString(),selection,practice:[]});

test('new review sends only bounded action codes and saved rationale, without chat, dates or identifiers',()=>{
 const source=jobEvent(makeJobRun('learning'),'user','private-chat',{name:'private-name',text:'private-quote'});
 let run=jobEvent(jobEvent(source,'attachment','private-material'),'attachment','private-material');
 run=finishJob(run,'pause','我担心错过机会');
 const input=jobReviewInput(run),wire=JSON.stringify(input);
 assert.ok(parseJobReviewInput(input));assert.equal(input.actions.length,2);
 assert.doesNotMatch(wire,/private-|"at"|2026|"logs"/);assert.ok(!wire.includes(run.id));
 assert.match(wire,/我担心错过机会/);
});
test('new parser rejects unfinished, duplicate, post-decision and oversized summaries',()=>{
 const good=jobReviewInput(completed());
 for(const bad of [null,{...good,mode:'unknown'},{...good,actions:[]},{...good,actions:good.actions.slice(0,-1)},{...good,actions:[...good.actions,{id:'after',action:'hint'}]},{...good,actions:[good.actions[0],...good.actions]},{...good,selfReport:{id:'r',text:'字'.repeat(301)}},{...good,actions:[{id:'x',action:'contact',decision:'pause'},good.actions.at(-1)]}])assert.equal(parseJobReviewInput(bad),null);
 assert.deepEqual(parseJobReviewInput({...good,chat:'private'}),good);
});
test('independent review uses software conflict, never legacy fee or normal-job assumptions',()=>{
 const context=jobReflectionContext(jobReviewInput(completed()));
 assert.match(context.candidates.find(c=>c.id==='conflict').text,/软件、屏幕共享/);
 assert.doesNotMatch(JSON.stringify(context),/298|缴纳.*培训费|正常机会/);
 assert.match(context.candidates.find(c=>c.id==='identity').text,/没有取得/);
 assert.deepEqual(context.hypotheses,[]);
 assert.ok(context.candidates.every(c=>c.evidenceIds.every(id=>context.evidence.some(e=>e.id===id))));
});
test('learning review uses fee conflict and incomplete records never gain unseen evidence',()=>{
 const context=jobReflectionContext(jobReviewInput(completed('learning')));
 assert.match(context.candidates.find(c=>c.id==='conflict').text,/培训费/);
 const partial=jobReflectionContext(jobReviewInput(finishJob(makeJobRun('independent'),'exit')));
 assert.doesNotMatch(JSON.stringify(partial),/远帆协作助手|YF-204|不在.*授权联系人/);
 assert.equal(validateContextSelection({focusIds:['conflict'],factorId:'insufficient'},partial),null);
 assert.match(partial.candidates.find(c=>c.id==='terms').text,/未查看/);
});
test('model uses new context, strips unsupported prose and falls back on invented factors',async()=>{
 const input=jobReviewInput(completed('independent')),context=jobReflectionContext(input);let wire;
 const transport=async(url,init)=>{wire=JSON.parse(init.body);return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({focusIds:['conflict'],factorId:'insufficient',explanation:'invented'})}}]});};
 assert.deepEqual(await analyzeReflectionContext(input,context,config,undefined,transport),{engine:'model',focusIds:['conflict'],factorId:'insufficient'});
 assert.doesNotMatch(JSON.stringify(wire),/private-|298|缴纳.*培训费/);
 const invalid=async()=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({focusIds:['conflict'],factorId:'authority'})}}]});
 const fallback=await analyzeReflectionContext(input,context,config,undefined,invalid);assert.equal(fallback.engine,'rules');assert.equal(fallback.factorId,'insufficient');assert.ok(fallback.warning);
});
test('new review handles unavailable model and cancellation without claiming a successful AI result',async()=>{
 const input=jobReviewInput(completed('learning')),context=jobReflectionContext(input);
 const result=await analyzeReflectionContext(input,context,config,undefined,async()=>new Response('',{status:503}));assert.equal(result.engine,'rules');
 const controller=new AbortController();controller.abort(new Error('cancelled'));
 await assert.rejects(analyzeReflectionContext(input,context,config,controller.signal,async()=>{throw Error('network');}),/cancelled/);
});
test('archived AI result and user correction persist without replacing the active run',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 const old=completed(),active=makeJobRun('learning');persistJobRun(storage,old);persistJobRun(storage,active);
 const reflection={...record(old),feedback:{status:'reject',note:'',at:new Date().toISOString()}};
 persistJobReflection(storage,old.id,reflection);
 assert.deepEqual(JSON.parse(storage.getItem(JOB_RUN_KEY)),active);
 const restored=readJobHistory(storage.getItem(JOB_HISTORY_KEY)).find(r=>r.id===old.id);
 assert.deepEqual(restored.reflection,reflection);assert.ok(isJobRun(restored));
 assert.equal(JSON.parse(JSON.stringify(restored)).reflection.selection.engine,'model');
 const before=storage.getItem(JOB_HISTORY_KEY);
 assert.throws(()=>persistJobReflection(storage,old.id,{...reflection,basis:'stale'}));assert.equal(storage.getItem(JOB_HISTORY_KEY),before);
 assert.throws(()=>persistJobReflection(storage,active.id,record(active)));
});
