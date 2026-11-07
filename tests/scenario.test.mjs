import test from "node:test";
import assert from "node:assert/strict";
import {createSession,event,showRequirement,verify,decide,replay,summarize,isSession,classify} from "../lib/scenario.ts";
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

