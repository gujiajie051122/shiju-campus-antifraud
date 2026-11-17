import {expandedKnowledge,expandedMatchers} from "./knowledge-expanded.ts";
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
 {id:"preserve-records",heading:"留存沟通与付款材料",text:"怀疑遭遇兼职诈骗时，应保留双方聊天、转账凭证和对方账号等材料，及时向当地公安机关求助。保存材料有助于说明经过，不等于平台已认定某人违法。",tags:["证据","记录","材料","订单","失联","聊天","转账","凭证","被骗","求助","报警","举报","维权","怎么办"],source:{...jobs,locator:"文末提示：保存重要证据"}},
 {id:"off-platform",heading:"离开正规交易平台要提高警惕",text:"门票和二手交易骗局会将用户带到陌生链接或仿冒平台，随后以交易异常为由要求继续操作。不要因为对方声称交易失败，就继续追加付款或开放屏幕共享。",tags:["门票","购票","出票","补款","二手","购物","链接","二维码","共享屏幕","屏幕共享","私下","交易","异常"],source:{...campus,locator:"虚假购物服务类诈骗段落"}}
];
knowledgeChunks.push(
 {id:"sunk-cost",heading:"什么是沉没成本效应",text:"沉没成本效应指：已经投入金钱、时间或精力后，人会更倾向于继续原来的行动。通俗地说，就是舍不得已经付出的东西，因而继续投入。原创学习例子：兼职已经花了几天，对方又要求付费；此前花的时间不能证明现在交费可靠。判断下一步时，应重新看后续风险和独立依据。",tags:["沉没成本","沉默成本","不甘心","舍不得","投入","付出","放弃","时间","心理误区"],source:{title:"The psychology of sunk cost",publisher:"Arkes & Blumer · Organizational Behavior and Human Decision Processes",date:"1985-02",url:"https://www.sciencedirect.com/science/article/pii/0749597885900494",locator:"论文摘要：既有投入与继续行动的倾向",scope:"概念据论文摘要释义；兼职例子与建议为原创教学延伸，不是论文案例或个人心理诊断。"}},
 {id:"ai-forgery",heading:"AI换脸为什么会影响身份判断",text:"生成式AI能生成或修改图像、声音与视频，也可能被用于冒充身份。换脸视频中的面孔不能单独证明来者身份。原创学习例子：自称同学的人视频借钱，可以结束通话，用你原来保存的联系方式找本人核实。画面自然、没有明显破绽，也不等于已经核实。",tags:["AI","换脸","深度伪造","视频","合成","人脸"],source:{title:"Criminals Use Generative Artificial Intelligence to Facilitate Financial Fraud",publisher:"FBI / IC3",date:"2024-12-03",url:"https://www.ic3.gov/psa/2024/psa241203",locator:"AI-Generated Videos及身份核实提示",scope:"技术风险与核实方法的中文释义；同学借钱为原创例子，不引用境外报案渠道。"}},
 {id:"social-engineering",heading:"社会工程学：利用信任获取信息",text:"在信息安全语境中，社会工程学指通过欺骗他人获取本应受到保护的信息。它利用人的信任与沟通行为，不一定需要破解设备。原创学习例子：自称客服的人说要帮你处理异常，逐步要求账号信息或验证码；应先从已知官方渠道核实身份和事项。",tags:["社会工程学","社会工程","信任","客服","冒充","验证码"],source:{title:"Criminals Use Generative Artificial Intelligence to Facilitate Financial Fraud",publisher:"FBI / IC3",date:"2024-12-03",url:"https://www.ic3.gov/psa/2024/psa241203",locator:"注释2：Social engineering的定义",scope:"概念释义；客服例子为原创教学说明，不构成对具体人的违法认定。"}},
 {id:"voice-check",heading:"熟悉的声音也需要独立核实",text:"声音克隆可以模仿熟人的声音。听到熟悉的声音不等于确认身份；应通过原本已知的联系方式联系本人，联系不上时也可通过其他熟悉的人核实。原创学习例子：室友用陌生号码说急需转账，先用原有联系方式找室友确认，而不是继续拨打这次来电提供的号码。",tags:["声音","克隆","熟悉","室友","亲友","借钱"],source:{title:"Scammers use AI to enhance their family emergency schemes",publisher:"美国联邦贸易委员会 FTC",date:"2023-03",url:"https://consumer.ftc.gov/consumer-alerts/2023/03/scammers-use-ai-enhance-their-family-emergency-schemes",locator:"正文：用已知号码核实亲友身份",scope:"采用声音克隆原理和核实方法；室友例子为原创教学延伸。"}}
);
knowledgeChunks.push(
  {
    "id": "group-proof",
    "heading": "群友晒单不能替代独立依据",
    "text": "任务骗局可能把犹豫充值的人拉入群聊，让假冒的老用户讲述成功经历。群里多人晒收益，也可能来自同一套安排，不是多条独立证据。原创教学建议：把群内说法与自己能核实的来源分开，不以晒单截图决定继续垫资。",
    "tags": [
      "群里",
      "群聊",
      "群友",
      "晒单",
      "晒收益",
      "从众",
      "成功经历"
    ],
    "source": {
      "title": "Paying to get paid: gamified job scams drive record losses",
      "publisher": "美国联邦贸易委员会 FTC",
      "date": "2024-12",
      "url": "https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses",
      "locator": "正文：假冒老用户在群聊中讲述成功经历",
      "scope": "任务骗局机制的中文释义；不以此认定所有群成员都是骗子，不对用户作心理诊断。"
    }
  },
  {
    "id": "pressure-tactics",
    "heading": "催促会压缩思考和核实时间",
    "text": "诈骗者可能催促你立刻行动，甚至让你不要挂断电话，使你来不及思考或核对说法。紧迫感不是要求真实的证据。可以暂停操作，离开当前通话，自己从已知渠道核实，再向信任的人说明情况。这里分析的是催促话术的作用，不是在判断个人性格。",
    "tags": [
      "催促",
      "限时",
      "马上",
      "立刻",
      "紧迫",
      "来不及",
      "影响判断"
    ],
    "source": {
      "title": "How To Avoid a Scam",
      "publisher": "美国联邦贸易委员会 FTC",
      "date": "2023-07",
      "url": "https://consumer.ftc.gov/articles/how-avoid-scam",
      "locator": "Four Signs第3点及How To Avoid建议：抵抗立即行动的压力",
      "scope": "一般防骗方法的中文释义；不援引境外报案渠道或作心理疾病诊断。"
    }
  },
  {
    "id": "romance-trust",
    "heading": "相处时长不等于借款事项已经核实",
    "text": "情感诈骗者可能频繁聊天、建立信任，随后编造紧急事情索要钱款。聊了很久能说明有一段沟通过程，不能单独证明身份、借款用途或还款承诺。面对网友借钱，应暂停转账，向信任的人说明情况，通过独立渠道核实相关事项。",
    "tags": [
      "网友",
      "网恋",
      "交友",
      "聊了很久",
      "情感",
      "借钱",
      "信任"
    ],
    "source": {
      "title": "What To Know About Romance Scams",
      "publisher": "美国联邦贸易委员会 FTC",
      "date": "2022-08",
      "url": "https://consumer.ftc.gov/articles/what-know-about-romance-scams",
      "locator": "What Is a Romance Scam及How to Avoid段落",
      "scope": "相处、信任与索款机制的中文释义；不是对任一网友的违法认定。"
    }
  },
  {
    "id": "identity-cues",
    "heading": "外观与已知信息不是身份核实结论",
    "text": "冒充者可能使用真实机构名称，来电显示的名字和号码也可能被伪装。知道你的信息、穿着制服或说话专业，都不能单独完成身份确认。原创教学建议：查看对方展示的证件只是获得一项材料，还要自己通过已知官方渠道确认联系人的身份与具体事项。",
    "tags": [
      "穿制服",
      "说话专业",
      "知道我的信息",
      "查看证件",
      "身份核实",
      "证明身份"
    ],
    "source": {
      "title": "How To Avoid a Scam",
      "publisher": "美国联邦贸易委员会 FTC",
      "date": "2023-07",
      "url": "https://consumer.ftc.gov/articles/how-avoid-scam",
      "locator": "Four Signs第1点及独立联系机构的建议",
      "scope": "来源说明冒充机构与来电伪装；制服、证件为原创教学延伸，不据此认定真伪。"
    }
  }
);
knowledgeChunks.push(...expandedKnowledge);
export const knowledgeVersion="2026-11-17.2";
const topics:Record<string,RegExp>={"job-fees":/培训|费用|押金|保证金|交钱|付费|缴费|收费|先.{0,4}(付|交)/,"job-identity":/身份|联系人|公司|资质|岗位|目录|核实|官方|可信|授权/,"independent-callback":/回拨|电话|号码|独立.{0,4}(核实|渠道)/,"small-rewards":/刷单|返利|返现|佣金|本金|垫付|充值|升级|卡单/,"unknown-app":/app|软件|平台|下载|安装|注册|账户|隐私|验证码|身份证/i,"preserve-records":/证据|记录|材料|订单|失联|聊天|凭证|被骗|求助|报警|举报|维权/,"off-platform":/门票|购票|出票|补款|二手|购物|链接|二维码|屏幕|私下|交易/};
Object.assign(topics,{"sunk-cost":/\u6c89\u6ca1|\u6c89\u9ed8\u6210\u672c|\u4e0d\u7518\u5fc3|\u820d\u4e0d\u5f97|\u5fc3\u7406\u8bef\u533a/,"ai-forgery":/ai|\u6362\u8138|\u4f2a\u9020|\u89c6\u9891|\u5408\u6210|\u4eba\u8138/i,"social-engineering":/\u793e\u4f1a\u5de5\u7a0b|\u5192\u5145|\u5ba2\u670d|\u9a8c\u8bc1\u7801/,"voice-check":/\u58f0\u97f3|\u514b\u9686|\u719f\u6089|\u5ba4\u53cb|\u4eb2\u53cb|\u501f\u94b1/});
Object.assign(topics,{"group-proof":/群里|群聊|群友|晒单|晒收益|从众/,"pressure-tactics":/催促|限时|紧迫|来不及|立刻|马上/,"romance-trust":/网友|网恋|交友|聊了很久|情感/,"identity-cues":/制服|专业|证件|知道.{0,6}信息|证明身份|核实身份/});
topics["sunk-cost"]=/沉没|沉默成本|不甘心|舍不得|心理误区|付出.{0,10}(时间|金钱|精力)|更难放弃/;
Object.assign(topics,expandedMatchers);
function tokens(text:string){const words=text.toLowerCase().match(/[a-z0-9]+|[\u3400-\u9fff]+/g)??[];return words.flatMap(w=>/^[a-z0-9]+$/.test(w)?[w]:w.length===1?[w]:Array.from({length:w.length-1},(_,i)=>w.slice(i,i+2)));}
// BM25 over Chinese bigrams plus explicit domain keyword boosts.
export function retrieveKnowledge(question:string,limit=3){
 if(/人肉|开盒|住址|家庭地址|绕过验证/.test(question))return [];
 const query=[...new Set(tokens(question))],documents=knowledgeChunks.map(c=>tokens(c.heading+" "+c.text+" "+c.tags.join(" "))),average=documents.reduce((n,d)=>n+d.length,0)/documents.length;
 const ranked=knowledgeChunks.map((chunk,index)=>{const document=documents[index];let score=0;for(const token of query){const frequency=document.filter(t=>t===token).length;if(!frequency)continue;const containing=documents.filter(d=>d.includes(token)).length;const idf=Math.log(1+(documents.length-containing+.5)/(containing+.5));score+=idf*(frequency*2.2)/(frequency+1.2*(.25+.75*document.length/average));}score+=chunk.tags.filter(tag=>question.toLowerCase().includes(tag.toLowerCase())).reduce((n,tag)=>n+(tag.length>1?4:0),0);return {chunk,score:Math.round(score*100)/100};}).filter(r=>topics[r.chunk.id].test(question)&&r.score>=3.5).sort((a,b)=>b.score-a.score||a.chunk.id.localeCompare(b.chunk.id));
 return ranked.filter(r=>r.score>=(ranked[0]?.score??0)*.4).slice(0,Math.max(1,Math.min(limit,3)));
}
