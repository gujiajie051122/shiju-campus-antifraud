import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {lessons,quizItems} from '../lib/learning.ts';
import {lessonEditorial,lessonArtwork} from '../lib/lesson-editorial.ts';

test('every micro-lesson has distinct teaching artwork, captions and a usable assessment',async()=>{
 const hashes=new Set();
 assert.deepEqual(Object.keys(lessonEditorial).sort(),lessons.map(l=>l.id).sort());
 for(const lesson of lessons){
  const editorial=lessonEditorial[lesson.id];
  assert.equal(editorial.cues.length,3,lesson.id);
  assert.equal(new Set(editorial.cues.map(c=>c[0])).size,3,lesson.id);
  assert.ok(editorial.cues.every(c=>c.every(text=>text.trim().length>0)),lesson.id);
  assert.equal(editorial.stepLabels.length,3);
  assert.ok(quizItems.some(q=>q.id===lesson.id+'-scene'),lesson.id);
  const bytes=await readFile(new URL('../public'+lessonArtwork(lesson.id),import.meta.url));
  const hash=createHash('sha256').update(bytes).digest('hex');
  assert.ok(!hashes.has(hash),'repeated artwork: '+lesson.id);hashes.add(hash);
  const info=await sharp(bytes).metadata();
  assert.equal(info.format,'webp');assert.equal(info.width,1200);assert.equal(info.height,800);
  assert.ok(bytes.length<400000,'oversized cover: '+lesson.id);
 }
});
