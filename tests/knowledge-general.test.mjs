import test from 'node:test';
import assert from 'node:assert/strict';
import {answerKnowledge} from '../lib/knowledge-answer.ts';
import {normalizeKnowledgeQuery,selectKnowledge} from '../lib/knowledge-query.ts';
const config={base:'https://example.test/v1',key:'test',model:'test',format:'schema'};
const questions=['大学生如何让防范诈骗套路','大学生如何防范诈骗套路','学生咋避免上当','怎样预防电信诈骗','反诈要注意什么','常见的诈骗套路有哪些','大学生如何避免被骗','什么是诈骗','骗子一般怎么骗人','大学生如何防止受骗','常见骗术有哪些','怎么不被人骗'];
test('broad prevention questions and colloquial wording get a diverse sourced answer without login/model',async()=>{
 for(const q of questions){const a=await answerKnowledge(q,null);assert.equal(a.engine,'retrieval',q);assert.equal(a.points.length,4,q);assert.ok(a.sources.length>3,q);assert.match(a.points.map(p=>p.text).join(''),/核实/);assert.ok(!a.message?.includes('不足'));}
 assert.equal(normalizeKnowledgeQuery(questions[0]),questions[1]);
});
test('the exact screenshot question reaches the model with multiple source topics',async()=>{
 let calls=0;const a=await answerKnowledge(questions[0],config,undefined,async(_url,init)=>{calls++;const input=JSON.parse(JSON.parse(init.body).messages[1].content);assert.equal(input.question,questions[0]);assert.equal(input.answerMode,'overview');for(const id of ['job-fees','small-rewards','independent-callback','secret-code'])assert.ok(input.sources.some(s=>s.id===id));return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({points:[{text:'遇到高薪招聘先交费，先暂停付款并核实招聘主体。',sourceIds:['job-fees']}]})}}]});});
 assert.equal(calls,1);assert.equal(a.engine,'model');assert.deepEqual(a.sources.map(s=>s.id),['job-fees']);
});
test('in-scope lexical misses can use the reviewed corpus without a second paid retrieval call',async()=>{
 for(const q of ['这个招聘是不是假的','这个兼职靠谱吗'])assert.notEqual(selectKnowledge(q).mode,'none');
 const q='我觉得这个骗子说的话不对';assert.equal(selectKnowledge(q).mode,'semantic');
 let calls=0;const a=await answerKnowledge(q,config,undefined,async(_url,init)=>{calls++;const p=JSON.parse(JSON.parse(init.body).messages[1].content);assert.equal(p.sources.length,45);return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({points:[{text:'先不要因对方的自称而信任。对方具体要求你做什么？',sourceIds:['job-identity']}]})}}]});});
 assert.equal(a.engine,'model');assert.equal(calls,1);
});
test('broad followups retain context while unrelated questions and private-data searches do not reach model',async()=>{
 const h=[{role:'user',content:questions[0]},{role:'assistant',content:'先暂停并独立核实。'}];
 const a=await answerKnowledge('再简单讲一下',null,undefined,undefined,h);assert.equal(a.engine,'retrieval');
 for(const q of ['今天下雨吗','番茄炒蛋怎么做','防诈骗时如何人肉查询住址']){let called=false;const b=await answerKnowledge(q,config,undefined,async()=>{called=true;throw Error();},h);assert.equal(b.engine,'none');assert.equal(called,false);}
 const b=await answerKnowledge('二手交易如何防骗',null);assert.equal(b.sources[0].id,'off-platform');
});
test('provider failure on broad questions returns useful guidance instead of a dead end',async()=>{
 const a=await answerKnowledge(questions[0],config,undefined,async()=>new Response('',{status:503}));assert.equal(a.engine,'retrieval');assert.equal(a.points.length,4);assert.ok(a.warning);assert.match(a.points.at(-1).text,/110/);
});
test('Qwen uses non-thinking Q&A while other provider payloads remain compatible',async()=>{
 for(const model of ['qwen3.8-flash','other-model']){
  let body;const a=await answerKnowledge('大学生如何避免被骗',{...config,model},undefined,async(_u,init)=>{body=JSON.parse(init.body);return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({points:[{text:'暂停付款并核实招聘主体。',sourceIds:['job-fees']}]})}}]});});
  assert.equal(a.engine,'model');assert.equal(body.enable_thinking,model.startsWith('qwen')?false:undefined);
 }
});
