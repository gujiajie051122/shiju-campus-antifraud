import test from 'node:test';
import assert from 'node:assert/strict';
import {makeJobRun,jobEvent,finishJob,isJobRun} from '../lib/job-workshop.ts';
import {jobOutcome} from '../lib/job-outcome.ts';
const earned=(r,id)=>jobOutcome(r).badges.find(b=>b.id===id).earned;
for(const mode of ['learning','independent']){
 test(mode+': safe exit is not credited as verified; reported claims cannot create evidence',()=>{
  const r=finishJob(makeJobRun(mode),'report','全部查过了','both');assert.equal(jobOutcome(r).state,'safe');assert.equal(earned(r,'identity'),false);assert.equal(earned(r,'compare'),false);
 });
 test(mode+': independent identity check supports a concrete finding without mandatory all-tool clicks',()=>{
  const r=finishJob(jobEvent(makeJobRun(mode),'contact','result'),'exit','','identity');assert.equal(jobOutcome(r).state,'verified');assert.ok(earned(r,'identity'));assert.equal(earned(r,'compare'),false);
 });
 test(mode+': clicking a directory is not the same as comparing an attachment',()=>{
  let r=jobEvent(makeJobRun(mode),'directory','result');assert.equal(jobOutcome(finishJob(r,'pause','','process')).state,'safe');
  r=jobEvent(r,'attachment','attachment');assert.equal(jobOutcome(finishJob(r,'pause','','process')).state,'verified');assert.equal(jobOutcome(finishJob(r,'pause')).state,'safe');
 });
 test(mode+': continuing remains risky even with every achievement lookup',()=>{
  let r=makeJobRun(mode);for(const a of ['directory','contact','attachment'])r=jobEvent(r,a,'x');r=finishJob(r,'continue','','both');assert.equal(jobOutcome(r).state,'risk');assert.equal(earned(r,'boundary'),false);
 });
 test(mode+': a simulated install cannot be erased by exiting and correction requires later evidence',()=>{
  let r=jobEvent(makeJobRun(mode),'install','simulated');let end=finishJob(r,'exit');assert.equal(jobOutcome(end).state,'corrected');assert.ok(jobOutcome(end).install);assert.equal(earned(end,'boundary'),false);assert.equal(earned(end,'correct'),false);
  r=jobEvent(r,'contact','result');end=finishJob(r,'exit','','identity');assert.ok(earned(end,'correct'));assert.ok(jobOutcome(end).install);
 });
}
test('old records remain readable and unknown findings are rejected',()=>{
 const r=makeJobRun('learning');assert.ok(isJobRun(r));assert.equal(isJobRun({...r,finding:'fake'}),false);const end=finishJob(r,'exit','','identity');assert.deepEqual(finishJob(end,'continue'),end);assert.ok(isJobRun(JSON.parse(JSON.stringify(end))));
});
