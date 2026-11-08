import test from "node:test";
import assert from "node:assert/strict";
import {createSession,event,showRequirement,verify,decide,replay,summarize,isSession,classify,lookup,recordObservation,reviewContext} from "../lib/scenario.ts";
test("independent verification is available immediately and results remain fixed",()=>{const s=createSession("R","independent");const first=verify(s,"contact"),again=verify(first,"contact");assert.equal(first.events.at(-1).text,again.events.at(-1).text);assert.deepEqual(again.verified,["contact"]);});
test("normal and risk controls return different fixed facts",()=>{assert.match(verify(createSession("N","learning"),"posting").events.at(-1).text,/一致/);assert.match(verify(createSession("R","learning"),"posting").events.at(-1).text,/未获/);});
test("saying verification does not count as obtaining a result",()=>{const s=event(createSession("R","learning"),"user","我的回复","我要核实身份");assert.equal(summarize(s).findings[0].status,"尚未取得核实信息");assert.equal(classify("我要核实身份"),"verify");});
test("generated or interrupted speech never becomes a viewed requirement",()=>{let s=createSession("R","learning");s=event(s,"speech_generated","回复已生成","支付298元");s=event(s,"speech_interrupted","中断","");assert.equal(summarize(s).findings[1].status,"未展示，不作评价");});
test("opening requirement is explicit and idempotent",()=>{const s=showRequirement(createSession("R","learning"));assert.equal(s.requirementShown,true);assert.match(summarize(s).findings[1].text,/298/);assert.equal(showRequirement(s).events.length,s.events.length);});
test("safe exit without verification does not claim identity confirmed",()=>{const s=decide(createSession("R","learning"),"exit");assert.match(summarize(s).findings[2].text,/身份尚未确认/);});
test("normal recruitment rejection is not a failure",()=>{const s=decide(verify(createSession("N","learning"),"posting"),"exit");assert.match(summarize(s).findings[2].text,/不能仅因拒绝/);});
test("no sensitive information request means not applicable",()=>{assert.equal(summarize(createSession("R","learning")).findings[3].status,"本场景不适用");});
test("ended sessions cannot change facts by additional actions",()=>{const s=decide(createSession("R","learning"),"pause");assert.equal(verify(s,"contact"),s);assert.equal(showRequirement(s),s);assert.equal(decide(s,"report"),s);});
test("replay restores only visible checkpoint facts and preserves the old branch",()=>{let s=showRequirement(createSession("R","learning"));s=verify(s,"contact");s=decide(s,"exit");const branch=s.branch,r=replay(s);assert.notEqual(r.branch,branch);assert.equal(r.requirementShown,false);assert.deepEqual(r.verified,[]);assert.equal(r.decision,undefined);assert.equal(r.archives[0].events.length,s.events.length);assert.equal(summarize(r).isReplay,true);});
test("verification acquired before checkpoint remains visible on replay",()=>{const s=showRequirement(verify(createSession("R","learning"),"posting"));assert.deepEqual(replay(s).verified,["posting"]);});
test("hints are explicitly recorded",()=>{assert.equal(summarize(event(createSession("R","learning"),"hint","查看提示","核实来源")).usedHints,true);});
test("malformed persisted data is rejected",()=>{assert.equal(isSession({version:1,variant:"R"}),false);assert.equal(isSession(createSession("N","independent")),true);});
test("ambiguous response does not execute any consequential action",()=>{assert.equal(classify("那就这样"),"unknown");const s=event(createSession("R","learning"),"user","回复","那就这样");assert.equal(s.decision,undefined);});
test("an unsuccessful directory search is not evidence of a fake job",()=>{
 const s=lookup(createSession("N","learning"),"posting","wrong-code");
 assert.deepEqual(s.verified,[]);assert.equal(s.events.at(-1).kind,"verification_attempt");assert.match(s.events.at(-1).text,/不等于已确认虚假/);
 assert.equal(reviewContext(s).cards[1].state,"材料未齐全");
});
test("verification requires the matching job or person and preserves source provenance",()=>{
 const s=lookup(createSession("R","learning"),"posting"," qh-061 ");
 assert.deepEqual(s.verified,["posting"]);assert.equal(s.events.at(-1).channel,"posting");
 const wrong=lookup(s,"contact","王老师");assert.deepEqual(wrong.verified,["posting"]);
 const right=lookup(wrong,"contact","林老师");assert.deepEqual(right.verified,["posting","contact"]);
});
test("a sender-supplied callback never counts as independent verification",()=>{
 const s=lookup(createSession("R","learning"),"callback","","sender");
 assert.deepEqual(s.verified,[]);assert.equal(s.events.at(-1).channel,"sender");
 const independent=lookup(s,"callback","","directory");assert.deepEqual(independent.verified,["callback"]);
});
test("notes cannot mark unseen requirements and replay removes later observations",()=>{
 let s=createSession("R","learning");assert.equal(recordObservation(s,"requirement"),s);
 s=recordObservation(s,"identity");s=showRequirement(s);s=recordObservation(s,"requirement");
 assert.equal(reviewContext(s).notes.length,2);
 const r=replay(decide(s,"pause"));assert.equal(reviewContext(r).notes.length,1);assert.equal(reviewContext(r).notes[0].channel,"identity");
});
test("comparisons do not infer person authorization from job lookup or claim unseen material",()=>{
 let s=lookup(createSession("R","independent"),"posting","QH-061");
 const first=reviewContext(s);assert.equal(first.cards[0].state,"仍待确认");assert.match(first.cards[1].claim,/未打开/);
 s=showRequirement(s);assert.equal(reviewContext(s).cards[1].state,"说法有冲突");
 const n=showRequirement(lookup(createSession("N","learning"),"posting","QH-061"));assert.equal(reviewContext(n).cards[1].state,"费用说明一致");
});
test("completed sessions cannot gain observations or lookup results",()=>{
 const s=decide(showRequirement(createSession("R","learning")),"exit");
 assert.equal(recordObservation(s,"requirement"),s);assert.equal(lookup(s,"posting","QH-061"),s);
});
test("partial checks never produce a blanket agreement in the next-step advice",()=>{
 const n=decide(showRequirement(lookup(createSession("N","learning"),"posting","QH-061")),"continue");
 assert.match(reviewContext(n).next,/联系人身份未核实/);assert.doesNotMatch(reviewContext(n).next,/材料相互支持/);
 const r=decide(showRequirement(lookup(createSession("R","learning"),"contact","林老师")),"pause");
 assert.match(reviewContext(r).next,/岗位费用说明未核实/);assert.match(reviewContext(r).next,/存在冲突/);
});
test('partial normal checks also remain qualified in the decision explanation',()=>{
 const s=decide(lookup(createSession('N','learning'),'posting','QH-061'),'exit');
 const choice=summarize(s).findings.find(f=>f.label==='本次选择');
 assert.match(choice.text,/未核实事项仍待确认/);assert.doesNotMatch(choice.text,/核实结果一致/);
});
test('256 decision paths retain only obtained evidence and never modify completed outcomes',()=>{
 let paths=0;
 for(const variant of ['R','N'])for(const mode of ['learning','independent'])for(const shown of [false,true])for(let mask=0;mask<8;mask++)for(const decision of ['pause','exit','report','continue']){
  let s=createSession(variant,mode);const tools=['posting','contact','callback'];
  for(let i=0;i<3;i++)if(mask&(1<<i))s=verify(s,tools[i]);if(shown)s=showRequirement(s);s=decide(s,decision);
  const report=summarize(s),context=reviewContext(s);
  assert.equal(report.findings[0].ids.length,tools.filter((_,i)=>mask&(1<<i)).length);
  assert.equal(report.findings[1].status,shown?'已查看':'未展示，不作评价');
  if(!(mask&6))assert.equal(context.cards[0].state,'仍待确认');
  if(!shown||!(mask&1))assert.equal(context.cards[1].state,'材料未齐全');
  assert.equal(lookup(s,'posting','QH-061'),s);assert.equal(showRequirement(s),s);assert.equal(decide(s,'pause'),s);paths++;
 }
 assert.equal(paths,256);
});

