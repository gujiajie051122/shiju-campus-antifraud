import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonReading} from '../lib/lesson-reading.ts';
import {courseContent} from '../lib/course-content.ts';
import {lessons,quizItems,readLearning} from '../lib/learning.ts';
import {lessonInsights} from '../lib/lesson-insights.ts';

test('every course has contextual explanations that connect the scene to an independent check',()=>{
 assert.deepEqual(Object.keys(lessonInsights).sort(),courseContent.map(c=>c.id).sort());
 assert.equal(new Set(Object.values(lessonInsights).map(r=>r.question)).size,30);
 for(const course of courseContent){const r=lessonInsights[course.id];assert.equal(r.annotations.length,2);assert.ok(r.question.trim(),course.id);assert.ok(r.annotations.every(([label,text])=>label.trim()&&text.trim()),course.id);assert.notEqual(r.annotations[0][1],r.annotations[1][1],course.id);}
 assert.match(lessonInsights['trade-platform'].annotations.flat().join(''),/便宜100元本身不能判断真假/);
 assert.doesNotMatch(JSON.stringify(lessonInsights['trade-link']),/1280|1180/);
});

test('all 30 illustrated lessons have distinct contextual material, evidence comparisons and actionable methods',()=>{
 assert.deepEqual(Object.keys(lessonReading).sort(),courseContent.map(c=>c.id).sort());
 for(const key of ['intro','context','analysis','contrastText']){
  assert.equal(new Set(Object.values(lessonReading).map(r=>r[key])).size,30,key);
 }
 for(const course of courseContent){
  const reading=lessonReading[course.id];
  assert.ok(reading.intro.length>=30,course.id);
  assert.equal(reading.dialogue.length,3,course.id);
  assert.equal(reading.annotations.length,2,course.id);
  assert.ok(reading.dialogue.some(([speaker])=>speaker==='你'),course.id);
  assert.equal(reading.panels.length,2,course.id);
  for(const panel of reading.panels){assert.equal(panel.fields.length,3);assert.ok(panel.path.trim());assert.ok(panel.note.trim());assert.equal(new Set(panel.fields.map(f=>f[0])).size,3);assert.ok(panel.fields.every(f=>f.every(s=>s.trim())));}
  assert.equal(reading.details.length,3,course.id);
  assert.ok(reading.details.every(s=>s.trim()&&!/待补充|TODO|待完善/.test(s)),course.id);
  assert.ok(lessons.some(l=>l.id===course.id));
  assert.ok(quizItems.some(q=>q.id===course.id+'-scene'));
 }
});

test('camera lesson keeps buyer/seller roles, price differences and unpaid order consistent',()=>{
 const r=lessonReading['trade-platform'];
 assert.deepEqual(r.dialogue.map(x=>x[0]),['卖家','你','卖家']);
 assert.match(r.context,/1280元、待付款/);
 assert.match(r.panels[0].fields.flat().join(''),/1180/);
 assert.match(r.panels[1].fields.flat().join(''),/1280.*待付款/);
 assert.match(r.contrastText,/便宜100元本身不能判断真假/);
 assert.doesNotMatch(r.context,/买家称/);
});

test('reading redesign retains assessment IDs and accepted saved progress for every lesson',()=>{
 const progress={completed:lessons.map(l=>l.id),answers:Object.fromEntries(courseContent.map(c=>[c.id+'-scene',quizItems.find(q=>q.id===c.id+'-scene').correct]))};
 assert.deepEqual(readLearning(JSON.parse(JSON.stringify(progress))),progress);
 for(const course of courseContent){const q=quizItems.find(q=>q.id===course.id+'-scene');assert.equal(q.options[q.correct],course.action);}
});
