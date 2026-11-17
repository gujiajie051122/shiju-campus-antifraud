import test from 'node:test';
import assert from 'node:assert/strict';
import {knowledgeChunks,retrieveKnowledge} from '../lib/knowledge.ts';
import {answerKnowledge} from '../lib/knowledge-answer.ts';

const cases=[
 ['刷单账户冻结，要交钱解冻吗','task-freeze'],
 ['点赞员做任务怎么变成充值了','task-like'],
 ['卖游戏账号提现要交钱','game-sell'],
 ['低价装备交易有什么要注意的','game-buy'],
 ['游戏客服要求交解冻费','game-platform'],
 ['演唱会内部票可以先付定金吗','ticket-reserve'],
 ['备注错误导致订单失效还要补款','ticket-repay'],
 ['教育退费要求先充值正常吗','refund-education'],
 ['退费群都在发到账截图可信吗','refund-group'],
 ['航班退改签怎么核实','flight-check'],
 ['对方知道航班号就是航空客服吗','flight-info'],
 ['共享屏幕会看到我的验证码吗','screen-sharing'],
 ['客服要我的支付密码和短信码','secret-code'],
 ['投资稳赚不赔可信吗','investment-guarantee'],
 ['投资平台显示盈利就安全吗','investment-app'],
 ['网上黑客说能收费追损','recovery-scam'],
 ['警察让我转安全账户自证清白','police-safe'],
 ['视频给我看警官证能确认身份吗','police-documents'],
 ['来电显示号码可能被伪装吗','caller-spoof'],
 ['助学金通知应该找谁核实','aid-contact'],
 ['补助要交手续费才能领取','aid-fee'],
 ['奖学金通知让我交手续费才能领取，怎么办？','aid-fee'],
 ['学费不够应该从哪里了解学生资助','aid-channels'],
 ['配音培训贷承诺可以接单还钱','loan-training'],
 ['贷款合同没写金额让我先签字','loan-contract'],
 ['贷款逾期了可以借新还旧吗','loan-rollover'],
 ['陷入校园贷可以找谁求助','loan-help'],
 ['有人让我替人贷款赚佣金','loan-task'],
 ['朋友付佣金借卡代收转账可以吗','lend-cards'],
 ['刚转了钱发现被骗要怎么止付','money-sent'],
];
test('expanded topics retrieve the relevant reviewed guidance among the available sources',()=>{
 for(const [q,id] of cases)assert.ok(retrieveKnowledge(q).some(r=>r.chunk.id===id),`${q}: ${retrieveKnowledge(q).map(r=>r.chunk.id)}`);
});
test('all knowledge entries have unique IDs and traceable source locations',()=>{
 assert.equal(new Set(knowledgeChunks.map(c=>c.id)).size,knowledgeChunks.length);
 assert.equal(knowledgeChunks.length,45);
 for(const c of knowledgeChunks){assert.ok(c.text.length>30);assert.ok(c.source.publisher&&c.source.date&&c.source.locator);assert.equal(new URL(c.source.url).protocol,'https:');}
});
test('short action followups prioritize immediate remedy without losing conversation context',async()=>{
 const history=[{role:'user',content:'卖游戏账号提现要交钱'},{role:'assistant',content:'先暂停付款核实。'}];
 const a=await answerKnowledge('我已经转了钱，怎么办？',null,undefined,undefined,history);
 assert.equal(a.sources[0].id,'money-sent');assert.match(a.points[0].text,/110/);
 const b=await answerKnowledge('那能追回吗？',null,undefined,undefined,history);
 assert.ok(b.sources.some(s=>s.id==='recovery-scam'));
 const c=await answerKnowledge('番茄炒蛋怎么做',null,undefined,undefined,history);
 assert.equal(c.engine,'none');
});
test('model receives source-bound action and clarification instructions; failure remains usable',async()=>{
 let system;const config={base:'https://example.test/v1',key:'test',model:'test',format:'schema'};
 const a=await answerKnowledge('助学金通知应该找谁核实',config,undefined,async(_url,init)=>{system=JSON.parse(init.body).messages[0].content;return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({points:[{text:'先通过学校老师或当地教育部门核实。对方要求你转账了吗？',sourceIds:['aid-contact']}]})}}]});});
 assert.equal(a.engine,'model');assert.match(system,/追问/);assert.match(system,/不得声称联网查询/);
 const b=await answerKnowledge('卖游戏账号提现要交钱',config,undefined,async()=>new Response('',{status:503}));
 assert.equal(b.engine,'retrieval');assert.ok(b.warning&&b.points.length);
});
