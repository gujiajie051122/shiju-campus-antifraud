// Reviewed paraphrases, not live web search. Recheck source pages when updating.
export type KnowledgeChunk={id:string;heading:string;text:string;tags:string[];source:{title:string;publisher:string;date:string;url:string;locator:string;scope?:string}};
const campus={title:"针对大学生群体的常见诈骗类型",publisher:"湖南公安",date:"2026-07-16",url:"https://gat.hunan.gov.cn/gat/ztzl2/qfqz/202607/t20260716_34027484.html"};
const jobs={title:"面对网络兼职，不轻信、不转账",publisher:"武汉市公安局网站（来源：武汉市政府信息网）",date:"2025-03-14",url:"https://gaj.wuhan.gov.cn/jmzx/gwyxx/202503/t20250314_2552050.html"};
const caller={title:"警惕假“网信办”来电！带你识破热门骗局",publisher:"中国网信网（来源：互联网联合辟谣平台）",date:"2024-04-19",url:"https://www.cac.gov.cn/2024-04/19/c_1715206244089929.htm"};
export const knowledgeChunks:KnowledgeChunk[]=[
 {id:"job-fees",heading:"先交费用的招聘要谨慎核实",text:"遇到以入职为条件索取培训费或保证金的招聘，应暂停付款并核对招聘主体。职位名称听起来正规，不能替代对资质和收费要求的核查。",tags:["培训费","费用","交钱","押金","保证金","入职","招聘","付款","298"],source:{...jobs,locator:"公安机关提示：预先交费的兼职岗位"}},
 {id:"job-identity",heading:"核对招聘主体和岗位来源",text:"核查招聘方时，可查询企业注册与经营情况，并从正规招聘渠道对照岗位信息。不要只靠自称或高薪承诺判断招聘方可信。",tags:["身份","联系人","公司","资质","岗位","目录","核实","官方","可信","授权"],source:{...jobs,locator:"公安机关提示：核实招聘方资质"}},
 {id:"independent-callback",heading:"回拨号码也要核对来源",text:"核实来电者身份时，应结束原通话，自己从机构官网等已知渠道找到联系方式再联系。对方发来的号码仍来自同一方，不能仅凭接通电话完成身份确认。",tags:["回拨","电话","号码","独立","渠道","身份","核实","联系人"],source:{...caller,locator:"防范措施第2点：核实来电身份",scope:"原文讨论冒充官方机构来电；此处将独立查找联系方式的方法用于模拟练习，并非对本虚构岗位的认证。"}},
 {id:"small-rewards",heading:"小额返利不能证明后续任务可靠",text:"大学生兼职刷单骗局可能先给少量佣金，再用升级任务吸引投入更多本金。此前收到回款，不能作为继续垫资或追加充值的充分依据。",tags:["刷单","返利","返现","佣金","小额","本金","垫付","充值","升级","任务","卡单"],source:{...campus,locator:"刷单返利类诈骗段落"}},
 {id:"unknown-app",heading:"陌生结算平台可能带来额外风险",text:"一些虚假兼职借结算之名要求安装不明应用或注册陌生平台，可能收集账户和身份信息。不要为了领取报酬就忽略软件来源与信息用途。",tags:["APP","软件","平台","下载","安装","结算","账户","身份证","信息","隐私","验证码"],source:{...jobs,locator:"虚假平台型兼职段落"}},
 {id:"preserve-records",heading:"留存沟通与付款材料",text:"怀疑遭遇兼职诈骗时，应保留双方聊天、转账凭证和对方账号等材料，及时向当地公安机关求助。保存材料有助于说明经过，不等于平台已认定某人违法。",tags:["证据","记录","聊天","转账","凭证","被骗","求助","报警","举报","维权","怎么办"],source:{...jobs,locator:"文末提示：保存重要证据"}},
 {id:"off-platform",heading:"离开正规交易平台要提高警惕",text:"门票和二手交易骗局会将用户带到陌生链接或仿冒平台，随后以交易异常为由要求继续操作。不要因为对方声称交易失败，就继续追加付款或开放屏幕共享。",tags:["门票","二手","购物","链接","二维码","共享屏幕","屏幕共享","私下","交易","异常"],source:{...campus,locator:"虚假购物服务类诈骗段落"}}
];
export const knowledgeVersion="2026-11-08.1";
const topics:Record<string,RegExp>={"job-fees":/培训|费用|押金|保证金|交钱|付费|缴费|收费|先.{0,4}(付|交)/,"job-identity":/身份|联系人|公司|资质|岗位|目录|核实|官方|可信|授权/,"independent-callback":/回拨|电话|号码|独立.{0,4}(核实|渠道)/,"small-rewards":/刷单|返利|返现|佣金|本金|垫付|充值|升级|卡单/,"unknown-app":/app|软件|平台|下载|安装|注册|账户|隐私|验证码|身份证/i,"preserve-records":/证据|记录|聊天|凭证|被骗|求助|报警|举报|维权/,"off-platform":/门票|二手|购物|链接|二维码|屏幕|私下|交易/};
function tokens(text:string){const words=text.toLowerCase().match(/[a-z0-9]+|[\u3400-\u9fff]+/g)??[];return words.flatMap(w=>/^[a-z0-9]+$/.test(w)?[w]:w.length===1?[w]:Array.from({length:w.length-1},(_,i)=>w.slice(i,i+2)));}
// BM25 over Chinese bigrams plus explicit domain keyword boosts.
export function retrieveKnowledge(question:string,limit=3){
 if(/人肉|开盒|住址|家庭地址|绕过验证/.test(question))return [];
 const query=[...new Set(tokens(question))],documents=knowledgeChunks.map(c=>tokens(c.heading+" "+c.text+" "+c.tags.join(" "))),average=documents.reduce((n,d)=>n+d.length,0)/documents.length;
 const ranked=knowledgeChunks.map((chunk,index)=>{const document=documents[index];let score=0;for(const token of query){const frequency=document.filter(t=>t===token).length;if(!frequency)continue;const containing=documents.filter(d=>d.includes(token)).length;const idf=Math.log(1+(documents.length-containing+.5)/(containing+.5));score+=idf*(frequency*2.2)/(frequency+1.2*(.25+.75*document.length/average));}score+=chunk.tags.filter(tag=>question.toLowerCase().includes(tag.toLowerCase())).reduce((n,tag)=>n+(tag.length>1?4:0),0);return {chunk,score:Math.round(score*100)/100};}).filter(r=>topics[r.chunk.id].test(question)&&r.score>=3.5).sort((a,b)=>b.score-a.score||a.chunk.id.localeCompare(b.chunk.id));
 return ranked.filter(r=>r.score>=(ranked[0]?.score??0)*.4).slice(0,Math.max(1,Math.min(limit,3)));
}
