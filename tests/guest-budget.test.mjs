import test from 'node:test';
import assert from 'node:assert/strict';
import {budgetVisitor} from '../lib/budget-visitor.ts';
import {budgetPolicy,metered,usageSnapshot} from '../lib/ai-budget.ts';
import {sqliteD1} from './budget-sqlite.mjs';
const req=cookie=>new Request('https://review.example/api/usage',{headers:cookie?{cookie}:{}});
const config={base:'https://model.example/v1',key:'test-only',model:'test',format:'json'};
test('fresh reviewer gets an anonymous quota cookie and no account requirement',()=>{
 const v=budgetVisitor(req());assert.equal(v.guest,true);assert.match(v.userId,/^guest:/);assert.match(v.setCookie,/HttpOnly; SameSite=Lax/);assert.match(v.setCookie,/; Secure$/);
 const again=budgetVisitor(req(v.setCookie.split(';')[0]));assert.equal(again.userId,v.userId);assert.equal(again.setCookie,undefined);
 const other=budgetVisitor(req());assert.notEqual(other.userId,v.userId);
 assert.doesNotMatch(budgetVisitor(new Request('http://127.0.0.1/api/usage')).setCookie,/; Secure/);
});
test('invalid and duplicate quota cookies get replaced and never become authenticated identities',()=>{
 for(const cookie of ['shiju_ai_visitor=admin','shiju_ai_visitor=../../admin','shiju_ai_visitor=x; shiju_ai_visitor=y']){const v=budgetVisitor(req(cookie));assert.equal(v.guest,true);assert.match(v.userId,/^guest:/);assert.ok(v.setCookie);}
 const a=budgetVisitor(new Request('https://review.example',{headers:{'oai-authenticated-user-id':'trusted-platform-user'}}));assert.equal(a.userId,'trusted-platform-user');assert.equal(a.guest,false);
 assert.equal(budgetVisitor(req(),true).userId,null);
});
test('anonymous reviewer can access all three model features under the same quota bucket',async()=>{
 const {db,sql}=sqliteD1();const visitor=budgetVisitor(req());
 const ctx={...visitor,db,policy:{...budgetPolicy({}),minIntervalMs:0},transport:async()=>Response.json({ok:true})};
 for(const feature of ['knowledge','dialogue','reflection']){
  const a=await metered(ctx,feature,config,async(_c,t)=>{const r=await t('https://model.example/v1',{method:'POST'});assert.equal(r.status,200);return {engine:'model'};});
  assert.equal(a.engine,'model');assert.equal(a.budgetCode,undefined);
 }
 const snapshot=await usageSnapshot(ctx,true);assert.equal(snapshot.guest,true);assert.equal(snapshot.requiresSignIn,undefined);assert.equal(snapshot.used,3);assert.match(snapshot.message,/无需登录/);sql.close();
});
test('resetting anonymous visitor cookie does not bypass the site spending cap',async()=>{
 const {db,sql}=sqliteD1();let calls=0;
 for(let i=0;i<2;i++){
  const ctx={...budgetVisitor(req()),db,policy:{...budgetPolicy({}),siteDaily:1,minIntervalMs:0},transport:async()=>{calls++;return Response.json({ok:true});}};
  const a=await metered(ctx,'knowledge',config,async(_c,t)=>{try{await t('https://model.example/v1');return {engine:'model'};}catch{return {engine:'retrieval'};}});
  assert.equal(a.engine,i===0?'model':'retrieval');if(i)assert.equal(a.budgetCode,'site_daily');
 }
 assert.equal(calls,1);sql.close();
});
