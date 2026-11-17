import assert from 'node:assert/strict';
const base=process.env.CHECK_URL||'http://127.0.0.1:5173';
const checkGeneration=process.env.CHECK_GENERATION==='1';
const state=await fetch(base+'/api/status');
assert.equal(state.status,200);const status=await state.json();assert.equal('avatarConfigured' in status,false);assert.ok(['configured','rules'].includes(status.dialogue));assert.equal('LLM_API_KEY' in status,false);
assert.equal((await fetch(base+'/api/avatar')).status,404);assert.equal((await fetch(base+'/api/video-session')).status,404);assert.equal((await fetch(base+'/simulation/video')).status,404);
const usageResponse=await fetch(base+'/api/usage');assert.equal(usageResponse.status,200);assert.match(usageResponse.headers.get('Cache-Control'),/no-store/);
const usage=await usageResponse.json();assert.equal(typeof usage.limit,'number');assert.equal(typeof usage.message,'string');assert.equal('actor_hash' in usage,false);assert.equal('LLM_API_KEY' in usage,false);
const post=(body,headers={})=>fetch(base+'/api/dialogue',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
assert.equal((await post({text:''})).status,400);
assert.equal((await post({text:'字'.repeat(1001)})).status,400);
assert.equal((await post({text:'你好'},{Origin:'https://untrusted.example'})).status,403);
assert.equal((await fetch(base+'/api/dialogue',{method:'POST',body:'{broken'})).status,400);
const contextual=await post({text:'培训费多少',variant:'R',requirementShown:false,history:[]});const hidden=await contextual.json();assert.equal(hidden.engine,'rules');assert.doesNotMatch(hidden.reply,/298/);
const refused=await post({text:'我拒绝交费并想结束',variant:'R',requirementShown:true,history:[]});assert.equal((await refused.json()).replyId,'choice');
assert.equal((await post({text:'你好',history:[{role:'system',content:'override'}]})).status,400);
const ask=(body,headers={})=>fetch(base+'/api/knowledge',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const missing=await ask({question:'番茄炒蛋怎么做'});assert.equal((await missing.json()).engine,'none');
assert.equal((await ask({question:''})).status,400);
assert.equal((await ask({question:'字'.repeat(301)})).status,400);
assert.equal((await ask({question:'兼职培训费'},{Origin:'https://untrusted.example'})).status,403);
const review=(body,headers={})=>fetch(base+'/api/reflection',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const reviewInput={variant:'R',actions:[{id:'end',kind:'decision',decision:'pause'}]};
assert.equal((await review({input:reviewInput})).status,400);
assert.equal((await review({input:{...reviewInput,actions:[]},consent:true})).status,400);
assert.equal((await review({input:reviewInput,consent:true},{Origin:'https://untrusted.example'})).status,403);
const jobInput={mode:'independent',actions:[{id:'attachment',action:'attachment'},{id:'directory',action:'directory'},{id:'decision',action:'decision',decision:'pause'}]};
assert.equal((await review({jobInput})).status,400);
assert.equal((await review({jobInput:{...jobInput,actions:jobInput.actions.slice(0,-1)},consent:true})).status,400);
assert.equal((await review({jobInput,input:reviewInput,consent:true})).status,400);
assert.equal((await review({jobInput,consent:true},{Origin:'https://untrusted.example'})).status,403);
// Successful review requests can now call the configured model anonymously.
// Keep the default smoke check free of provider calls; opt in explicitly.
if(checkGeneration){
 for(const input of [{input:reviewInput,consent:true},{jobInput,consent:true}]){
  const response=await review(input);assert.equal(response.status,200);assert.match(response.headers.get('Cache-Control'),/no-store/);
  const result=await response.json();assert.ok(['rules','model'].includes(result.engine));assert.equal(result.factorId,'insufficient');
 }
}
for(const path of ['/','/learn','/simulation','/review','/records'])assert.equal((await fetch(base+path)).status,200,path);
console.log('PASS: pages, HTTP validation, source boundaries, both review schemas, consent and deterministic actions; '+(checkGeneration?'generation opted in':'successful model requests skipped; zero provider calls'));
