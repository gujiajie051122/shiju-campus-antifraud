import test from 'node:test';
import assert from 'node:assert/strict';
import {createSession,event,showRequirement,verify,lookup,decide,setReason,replay,isSession} from '../lib/scenario.ts';
import {reviewInput,parseReviewInput,reflectionContext,validateReviewSelection,reviewBasis,practiceSkill} from '../lib/reflection-context.ts';
import {analyzeReflection} from '../lib/reflection-answer.ts';
import {isReflectionRecord} from '../lib/reflection-types.ts';
import {practiceCases,nextPractice,practiceResult} from '../lib/reflection-practice.ts';
import {metered,budgetPolicy} from '../lib/ai-budget.ts';
import {sqliteD1} from './budget-sqlite.mjs';
const config={base:'https://model.example/v1',key:'test-only',model:'test-model',format:'json'};
const ended=()=>decide(createSession('R','learning'),'continue');
const input=reason=>reviewInput(reason?setReason(ended(),reason):ended());
const response=selection=>async()=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(selection)}}],usage:{prompt_tokens:15,completion_tokens:5,total_tokens:20}});
const record=(i,selection)=>({basis:reviewBasis(i),createdAt:new Date().toISOString(),selection,practice:[]});

test('review sends bounded action codes and saved self-report, never raw chat, event text or archives',()=>{
 let s=event(createSession('R','learning'),'user','我的回复','private-chat-do-not-send');
 s=lookup(s,'posting','wrong-code');s=decide(s,'pause');s=setReason(s,'我想先核实身份');
 s.archives=[{branch:'old',events:[{text:'private-old-branch'}]}];
 const i=reviewInput(s),wire=JSON.stringify(i);
 assert.doesNotMatch(wire,/private-chat|private-old-branch|"at":|"title":/);assert.match(wire,/我想先核实身份/);
 assert.equal(i.actions.at(-1).decision,'pause');assert.ok(parseReviewInput(i));
});
test('parser rejects ongoing, post-decision, duplicate identifiers, bad tools and oversized self-report',()=>{
 const good=input('我担心错过机会');
 for(const bad of [null,{...good,actions:[]},{...good,actions:[{id:'a',kind:'terms'}]},{...good,actions:[...good.actions,{id:'after',kind:'hint'}]},{...good,actions:[good.actions[0],good.actions[0]]},{...good,actions:[{id:'x',kind:'verified',tool:'internet'},...good.actions]},{...good,selfReport:{id:'r',text:'字'.repeat(501)}}])assert.equal(parseReviewInput(bad),null);
 assert.deepEqual(parseReviewInput({...good,chat:'secret'}),good);
});
test('mere continuation, failed lookup and absent self-report never support psychological factors',()=>{
 const i=reviewInput(decide(lookup(createSession('R','learning'),'posting','wrong'),'continue'));
 const c=reflectionContext(i);assert.deepEqual(c.hypotheses,[]);
 assert.match(c.evidence.find(e=>e.title==='曾有未匹配的查询').text,/不等于已确认虚假/);
 assert.equal(validateReviewSelection({focusIds:['identity'],factorId:'authority'},i),null);
 assert.match(c.candidates.find(f=>f.id==='terms').text,/暂不评价/);
});
test('denials, quoted and hypothetical factor mentions are excluded before model selection',()=>{
 for(const reason of ['我不担心错过机会','我没有因为老师的头衔相信对方','如果担心错过机会会怎样？','他问“是否担心错过机会”']){
  assert.deepEqual(reflectionContext(input(reason)).hypotheses,[],reason);
  assert.equal(validateReviewSelection({focusIds:['identity'],factorId:'time'},input(reason)),null);
 }
 assert.ok(reflectionContext(input('我担心错过机会，还没有核实联系人')).hypotheses.some(f=>f.id==='time'));
});
test('partial verification is scoped; a normal rejection does not imply lack of ability',()=>{
 const i=reviewInput(decide(verify(createSession('N','independent'),'posting'),'exit')),c=reflectionContext(i);
 assert.ok(c.candidates.some(f=>f.id==='identity'));assert.match(c.candidates.find(f=>f.id==='checked').text,/已核对的事项/);
 assert.match(c.candidates.find(f=>f.id==='choice').text,/不能单独代表判断能力/);assert.ok(!c.candidates.some(f=>f.id==='conflict'));
});
test('sender-supplied callback does not count as independent; visible conflicts cite real operation IDs',()=>{
 const a=reviewInput(decide(lookup(createSession('R','learning'),'callback','','sender'),'pause'));
 assert.ok(reflectionContext(a).candidates.some(f=>f.id==='source'));
 const b=reviewInput(decide(showRequirement(verify(createSession('R','learning'),'posting')),'continue')),c=reflectionContext(b),focus=c.candidates[0];
 assert.equal(focus.id,'conflict');assert.equal(focus.evidenceIds.length,3);
 assert.ok(focus.evidenceIds.every(id=>c.evidence.some(e=>e.id===id)));assert.match(focus.text,/不等于付款/);
});
test('model selects only supported focus IDs and a conditional factor, with no free explanation rendered',async()=>{
 const i=input('我担心错过机会，所以想先继续了解');let wire;
 const result=await analyzeReflection(i,config,undefined,async(url,init)=>{wire=JSON.parse(init.body);return response({focusIds:['identity'],factorId:'time',explanation:'UNSUPPORTED CLAIM'})();});
 assert.deepEqual(result,{engine:'model',focusIds:['identity'],factorId:'time'});assert.doesNotMatch(JSON.stringify(result),/UNSUPPORTED/);
 const payload=JSON.parse(wire.messages[1].content);assert.ok(payload.hypotheses.some(f=>f.id==='time'));assert.equal(wire.stream,false);
});
test('unsupported factor or fact ID, refusal, truncated and broken model output safely fall back',async()=>{
 const i=input();
 const transports=[response({focusIds:['identity'],factorId:'time'}),response({focusIds:['conflict'],factorId:'insufficient'}),async()=>Response.json({choices:[{finish_reason:'length',message:{content:'{}'}}]}),async()=>Response.json({choices:[{finish_reason:'stop',message:{refusal:'no',content:'{}'}}]}),async()=>new Response('broken'),async()=>new Response('',{status:503})];
 for(const transport of transports){const r=await analyzeReflection(i,config,undefined,transport);assert.equal(r.engine,'rules');assert.equal(r.factorId,'insufficient');assert.ok(r.warning);}
});
test('unconfigured fallback abstains even if self-report contains an eligible factor',async()=>{
 let calls=0;const r=await analyzeReflection(input('我担心错过机会'),null,undefined,async()=>{calls++;throw Error('must not call');});
 assert.equal(calls,0);assert.equal(r.engine,'rules');assert.equal(r.factorId,'insufficient');
});
test('fast selection uses the documented vendor option only for Aliyun Qwen3.8-Flash',async()=>{
 for(const [base,model,expected] of [['https://workspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1','qwen3.8-flash',false],['https://model.example/v1','qwen3.8-flash',undefined],['https://workspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1','different-model',undefined]]){
  let body;await analyzeReflection(input(),{...config,base,model},undefined,async(url,init)=>{body=JSON.parse(init.body);return response({focusIds:['identity'],factorId:'insufficient'})();});assert.equal(body.enable_thinking,expected);
 }
});
test('request cancellation is propagated, never silently saved as a new model review',async()=>{
 const ctl=new AbortController();ctl.abort(new Error('test cancellation'));
 await assert.rejects(()=>analyzeReflection(input(),config,ctl.signal,async()=>{throw ctl.signal.reason;}),/test cancellation/);
});
test('only confirmed factors alter practice; rejection and uncertainty use the operation gap',()=>{
 const i=input('我担心错过机会'),s={focusIds:['identity'],factorId:'time'};
 assert.equal(practiceSkill(s,i,'confirm'),'pause');
 for(const status of [undefined,'reject','unsure'])assert.equal(practiceSkill(s,i,status),'independent');
});
test('saved self-report or action changes invalidate the previous review; unrelated chat is excluded',()=>{
 const s=setReason(ended(),'我担心错过机会'),before=reviewBasis(reviewInput(s));
 assert.notEqual(before,reviewBasis(reviewInput(setReason(s,'我想先查证身份'))));
 assert.equal(before,reviewBasis(reviewInput(event(s,'user','回复','unrelated private text'))));
 assert.notEqual(before,reviewBasis(reviewInput(decide(createSession('R','learning'),'exit'))));
});
test('review, correction and answers survive serialization; replay clears current review and archives it',async()=>{
 let s=setReason(decide(showRequirement(createSession('R','learning')),'pause'),'我担心错过机会'),i=reviewInput(s);
 s.reflection=record(i,await analyzeReflection(i,null));s.reflection.feedback={status:'reject',note:'只是想看清条件',at:new Date().toISOString()};
 s.reflection.practice=[{caseId:'source-video',choiceId:'known',at:new Date().toISOString()}];
 const restored=JSON.parse(JSON.stringify(s));assert.ok(isSession(restored));assert.deepEqual(restored.reflection,s.reflection);
 const r=replay(s);assert.equal(r.reflection,undefined);assert.equal(r.reason,undefined);assert.deepEqual(r.archives[0].reflection,s.reflection);assert.ok(isSession(r));
 assert.ok(isSession(createSession('R','learning')));assert.equal(isSession({...s,reflection:{...s.reflection,feedback:{status:'diagnosis'}}}),false);
 assert.equal(isReflectionRecord({...s.reflection,practice:[{caseId:'bad',choiceId:'x',at:'not-date'}]}),false);
});
test('targeted practice changes contexts, validates choices and records learning without scores',()=>{
 for(const skill of ['independent','terms','pause']){
  const first=nextPractice(skill,[]),second=nextPractice(skill,[{caseId:first.id}]);assert.notEqual(first.id,second.id);assert.notEqual(first.material,second.material);
  assert.equal(practiceResult(first.id,'not-a-choice'),null);
  assert.equal(practiceResult(first.id,first.preferred).preferred,true);
  const wrong=first.choices.find(c=>c.id!==first.preferred);assert.equal(practiceResult(first.id,wrong.id).preferred,false);
  assert.equal(nextPractice(skill,[{caseId:first.id},{caseId:second.id}]),null);
 }
 assert.equal(practiceCases.length,6);assert.equal(practiceResult('unknown','known'),null);
});
test('reflection consumes the same persistent quota as dialogue and knowledge, without storing self-report',async()=>{
 const {db,sql}=sqliteD1(),p={...budgetPolicy({}),minIntervalMs:0,perMinute:60,userDaily:2};
 const ctx={db,userId:'synthetic-user',policy:p,now:()=>Date.parse('2026-11-08T08:00:00Z'),transport:response({focusIds:['identity'],factorId:'time'})};
 const i=input('我担心错过机会');
 const r=await metered(ctx,'reflection',config,(c,t)=>analyzeReflection(i,c,undefined,t));assert.equal(r.engine,'model');
 await metered(ctx,'dialogue',config,async(c,t)=>{if(c)await t('https://model.example');return {engine:c?'model':'rules'};});
 const denied=await metered(ctx,'knowledge',config,async(c,t)=>{try{if(c)await t('https://model.example');return {engine:c?'model':'rules'};}catch{return {engine:'rules'};}});assert.equal(denied.budgetCode,'user_daily');
 const rows=sql.prepare('SELECT * FROM ai_requests').all();assert.equal(rows.length,2);assert.equal(rows[0].feature,'reflection');assert.doesNotMatch(JSON.stringify(rows),/错过机会|synthetic-user/);sql.close();
});
