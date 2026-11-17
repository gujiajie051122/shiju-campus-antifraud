import test from 'node:test';
import assert from 'node:assert/strict';
import {practiceBank,practiceCorrect,readPractice} from '../lib/practice-bank.ts';
import {knowledgeChunks} from '../lib/knowledge.ts';
import {readLearning} from '../lib/learning.ts';
test('960 tasks cover 120 different scenarios, six topics and all four response formats',()=>{
 assert.equal(practiceBank.length,960);assert.equal(new Set(practiceBank.map(q=>q.id)).size,960);
 assert.equal(new Set(practiceBank.map(q=>q.material)).size,120);
 assert.equal(new Set(practiceBank.map(q=>q.material+'|'+q.question)).size,960);
 for(const topic of new Set(practiceBank.map(q=>q.topic)))assert.equal(practiceBank.filter(q=>q.topic===topic).length,160);
 for(const [kind,n] of [['单选题',360],['多选题',240],['判断题',240],['材料分析',120]])assert.equal(practiceBank.filter(q=>q.kind===kind).length,n);
});
test('all choices, references, explanations and shuffled answer mappings are complete',()=>{
 for(const q of practiceBank){assert.ok(knowledgeChunks.some(s=>s.id===q.sourceId),q.id);assert.ok(q.explanation.length>10);assert.equal(q.reference.length,3);assert.ok(q.sample.length>40);
  if(q.kind==='材料分析'){assert.equal(q.options.length,0);assert.equal(q.correct.length,0);continue;}
  assert.equal(q.options.length,new Set(q.options).size,q.id);assert.equal(q.optionNotes.length,q.options.length);
  assert.ok(q.correct.length>0);assert.ok(q.correct.every(i=>i>=0&&i<q.options.length));assert.ok(q.optionNotes.every(s=>s.length>8));
  assert.equal(practiceCorrect(q,{answer:[...q.correct].reverse(),review:false,at:'2026-11-16'}),true);
  assert.equal(practiceCorrect(q,{answer:q.options.map((_,i)=>i).filter(i=>!q.correct.includes(i)),review:false,at:'2026-11-16'}),false);
 }
});
test('multi-select rejects omissions and extra choices; writing is never auto-scored',()=>{
 const q=practiceBank.find(q=>q.kind==='多选题');const r=answer=>({answer,review:false,at:'2026-11-16'});
 assert.equal(practiceCorrect(q,r(q.correct.slice(1))),false);assert.equal(practiceCorrect(q,r([...q.correct,q.options.findIndex((_,i)=>!q.correct.includes(i))])),false);
 assert.equal(practiceCorrect(practiceBank.find(q=>q.kind==='材料分析'),r('不同的合理表达')),undefined);
});
test('saved practice validates input and preserves legacy course answers',()=>{
 const q=practiceBank[0],writing=practiceBank.find(q=>q.kind==='材料分析');const entry={answer:[q.correct[0]],review:false,at:'2026-11-16'};
 const loaded=readLearning({completed:['jobs'],answers:{fee:1},practice:{[q.id]:entry,[writing.id]:{answer:'先通过原渠道联系本人，核对具体事情。',review:true,at:'2026-11-16'}}});
 assert.equal(loaded.answers.fee,1);assert.deepEqual(loaded.completed,['jobs']);assert.equal(Object.keys(loaded.practice).length,2);
 assert.deepEqual(readPractice({[q.id]:{...entry,answer:[99]}}),{});assert.deepEqual(readPractice({[writing.id]:{...entry,answer:' '}}),{});
 assert.equal(readPractice({[q.id]:{...entry,answer:[0,0]}})[q.id],undefined);
});
