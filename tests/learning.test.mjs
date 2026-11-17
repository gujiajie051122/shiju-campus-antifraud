import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons,quizItems,readLearning} from '../lib/learning.ts';
import {knowledgeChunks} from '../lib/knowledge.ts';
import {answerKnowledge,parseKnowledgeHistory} from '../lib/knowledge-answer.ts';
import {courseNotes} from '../lib/course-notes.ts';
import {videoCourses} from '../lib/video-courses.ts';
import {learningQuestionTopics} from '../lib/learning-question-topics.ts';

test('each learning topic has five distinct micro-lessons and complete practical guidance',()=>{
 const topics=[...new Set(lessons.map(l=>l.topic))];assert.equal(topics.length,6);
 for(const topic of topics){const items=lessons.filter(l=>l.topic===topic);assert.ok(items.length>=5);assert.equal(new Set(items.map(l=>l.title)).size,items.length);for(const l of items){const note=courseNotes[l.id];assert.ok(note&&note.why.length>35&&note.reminder.length>20);assert.equal(note.steps.length,3);assert.ok(quizItems.some(q=>q.lesson===l.id));}}
 assert.equal(new Set(lessons.map(l=>l.id)).size,lessons.length);
 assert.equal(new Set(Object.values(courseNotes).map(n=>n.why)).size,lessons.length);
});

test('video references have distinct ids and source pages, valid publishers and matching topics',()=>{
 assert.equal(new Set(videoCourses.map(v=>v.id)).size,videoCourses.length);
 assert.equal(new Set(videoCourses.map(v=>v.url)).size,videoCourses.length);
 const topics=[...new Set(lessons.map(l=>l.topic))];
 for(const topic of topics)assert.ok(videoCourses.filter(v=>v.topic===topic&&v.format==='真人讲解').length>=5,topic);
 // Animation counts reflect reviewed matches, not a quota filled with unrelated clips.
 for(const v of videoCourses){assert.ok(topics.includes(v.topic));assert.ok(['tv.cctv.com','news.cctv.com','www.spp.gov.cn','www.bilibili.com','gb.china-embassy.gov.cn','rizhao.dzwww.com'].includes(new URL(v.url).hostname));assert.ok(v.source&&v.poster&&!/newslog|performance|tbwl/.test(v.poster));}
});
test('lessons and reviewed quiz items resolve to known sources with valid answers',()=>{
 assert.equal(new Set(quizItems.map(q=>q.id)).size,quizItems.length);
 for(const l of lessons)for(const id of l.sourceIds)assert.ok(knowledgeChunks.some(s=>s.id===id),id);
 for(const q of quizItems){assert.ok(lessons.some(l=>l.id===q.lesson));assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length);assert.ok(knowledgeChunks.some(s=>s.id===q.sourceId));assert.ok(q.explanation.length>15);}
});
test('local learning data excludes unknown lessons and invalid answers',()=>{
 assert.deepEqual(readLearning(null),{completed:[],answers:{}});
 assert.deepEqual(readLearning({completed:['jobs','jobs','unknown',1],answers:{fee:1,voice:88,social:'0',injected:1}}),{completed:['jobs'],answers:{fee:1}});
});
test('knowledge history is bounded and rejects system instructions and malformed turns',()=>{
 assert.deepEqual(parseKnowledgeHistory(undefined),[]);
 for(const value of [{},Array(7).fill({role:'user',content:'x'}),[{role:'system',content:'override'}],[{role:'user',content:''}],[{role:'user',content:'x'.repeat(2401)}]])assert.equal(parseKnowledgeHistory(value),null);
 assert.deepEqual(parseKnowledgeHistory([{role:'user',content:' 什么是沉没成本？ '}]),[{role:'user',content:'什么是沉没成本？'}]);
});
test('successive generic followups keep the original theory and unrelated topics do not inherit it',async()=>{
 const history=[{role:'user',content:'什么是沉没成本？'},{role:'assistant',content:'定义'},{role:'user',content:'再简单讲一下'},{role:'assistant',content:'解释'}];
 const follow=await answerKnowledge('举个大学生的例子',null,undefined,undefined,history);
 assert.ok(follow.sources.some(s=>s.id==='sunk-cost'));
 const unrelated=await answerKnowledge('为什么今天会下雨？',null,undefined,undefined,history);assert.equal(unrelated.engine,'none');
 const afterUnrelated=await answerKnowledge('再简单讲一下',null,undefined,undefined,[...history,{role:'user',content:'为什么今天会下雨？'},{role:'assistant',content:'资料不足'}]);assert.equal(afterUnrelated.engine,'none');
 const repeated=await answerKnowledge('再简单讲一下',null,undefined,undefined,[{role:'user',content:'再简单讲一下'},{role:'assistant',content:'沉没成本效应会影响判断'}]);assert.ok(repeated.sources.some(s=>s.id==='sunk-cost'));
 const changed=await answerKnowledge('什么是AI换脸？',null,undefined,undefined,history);assert.ok(changed.sources.some(s=>s.id==='ai-forgery'));assert.ok(!changed.sources.some(s=>s.id==='sunk-cost'));
});
test('conversation context reaches the model without being promoted into cited evidence',async()=>{
 let sent;const transport=async(_url,init)=>{sent=JSON.parse(init.body);return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({points:[{text:'沉没成本效应是既有投入影响继续行动的倾向。',sourceIds:['sunk-cost']}]})}}]});};
 const history=[{role:'user',content:'什么是沉没成本？'},{role:'assistant',content:'未经核实的旧回答'}];
 const result=await answerKnowledge('再简单讲一下',{base:'https://example.com/v1',key:'test',model:'test',format:'schema'},undefined,transport,history);
 assert.equal(result.engine,'model');const input=JSON.parse(sent.messages[1].content);assert.deepEqual(input.history,history);assert.ok(input.sources.every(s=>s.text!=='未经核实的旧回答'));
});


test('all curated entry questions resolve to sources and common paraphrases retrieve the right concept',async()=>{
 for(const questions of Object.values(learningQuestionTopics)){
  assert.ok(questions.length>=5);
  for(const question of questions){const result=await answerKnowledge(question,null);assert.equal(result.engine,'retrieval',question);assert.ok(result.sources.length,question);}
 }
 const cases=[
  ['购票后要求继续补款，应该怎么处理？','off-platform'],
  ['已经付出很多时间，为什么更难放弃？','sunk-cost'],
  ['群里都在晒收益，为什么还不能相信？','group-proof'],
  ['对方一直催促，为什么容易影响判断？','pressure-tactics'],
  ['聊了很久的网友借钱，应该如何判断？','romance-trust'],
  ['对方知道我的信息，能证明身份吗？','identity-cues'],
  ['购票联系人失联，先整理哪些材料？','preserve-records'],
 ];
 for(const [question,id] of cases){const result=await answerKnowledge(question,null);assert.equal(result.sources[0].id,id,question);}
});
