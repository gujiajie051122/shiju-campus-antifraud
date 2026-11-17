import {courseContent} from "./course-content.ts";
import {courseNotes} from "./course-notes.ts";
import {readPractice,type PracticeResponse} from './practice-bank.ts';
export type Lesson={id:string;title:string;description:string;sourceIds:string[];question:string;topic?:string;scene?:string;action?:string;focus?:string;videoCase?:string};
export const lessons:Lesson[]=[
 {id:"jobs",title:"招聘信息，先核实什么",description:"从收费要求、岗位来源到独立联系渠道。",sourceIds:["job-fees","job-identity","independent-callback"],question:"身份核实和查看对方证件有什么区别？",videoCase:"job"},
 {id:"rewards",title:"为什么先给你一点甜头",description:"认识刷单返利与后续追加投入的风险。",sourceIds:["small-rewards","unknown-app"],question:"刷单骗局为什么一开始真的返钱？",videoCase:"rebate"},
 {id:"cost",title:"已经投入，还要继续吗",description:"理解沉没成本，把过去付出与下一步判断分开。",sourceIds:["sunk-cost","job-fees"],question:"什么是沉没成本？能举个大学生的例子吗？"},
 {id:"identity",title:"看见人、听见声音之后",description:"认识AI换脸、声音克隆与社会工程学。",sourceIds:["ai-forgery","voice-check","social-engineering"],question:"视频里看到本人，为什么还需要核实？",videoCase:"face"}
];
for (const c of courseContent) { const found=lessons.find(l=>l.id===c.id); if(found) Object.assign(found,{topic:c.topic,scene:c.scene,action:c.action,focus:c.focus}); else lessons.push({id:c.id,title:c.title,description:c.focus,topic:c.topic,scene:c.scene,action:c.action,focus:c.focus,sourceIds:[c.sourceId],question:c.title}); }
export type QuizItem={id:string;lesson:string;question:string;options:string[];correct:number;explanation:string;sourceId:string;kind?:"单选题"|"判断题"|"材料题"};
export const quizItems:QuizItem[]=[
 {id:"fee",lesson:"jobs",question:"招聘方要求先交培训费才能入职，下一步更合理的是？",options:["岗位名称正规，直接付款","暂停付款，从独立渠道核对主体与收费依据","只问该联系人是否正规"],correct:1,explanation:"暂停付款是为了核实。岗位名称和对方自述都不能替代独立核查，也不能仅凭收费要求认定具体人违法。",sourceId:"job-fees"},
 {id:"callback",lesson:"jobs",question:"对方给了一个核实电话。拨通后，对方确认岗位真实。这足够吗？",options:["足够，已经多问了一个人","不够，核实渠道仍然由同一方提供","号码看起来像座机就足够"],correct:1,explanation:"关键在信息来源是否独立。应自己从机构官网等已知渠道查找联系方式。",sourceId:"independent-callback"},
 {id:"job-source",lesson:"jobs",question:"哪一项最有助于核实招聘主体？",options:["联系人头像穿着正式","招聘广告排版专业","通过正规渠道对照岗位，并查询企业情况"],correct:2,explanation:"外观和排版都可以包装，独立的主体与岗位信息更有核查价值。",sourceId:"job-identity"},
 {id:"reward",lesson:"rewards",question:"刷单收到第一笔小额返利，能说明什么？",options:["这笔回款发生过，不能证明后续充值可靠","平台所有任务都可靠","投入越多越容易收回"],correct:0,explanation:"此前的小额回款不能为后续追加本金作保证。学习重点是区分一次结果与后续风险。",sourceId:"small-rewards"},
 {id:"app",lesson:"rewards",question:"为领取兼职报酬，对方要求安装不明结算App，你应该？",options:["报酬就在里面，先安装","只要不交钱就没有风险","先核实软件来源与信息用途"],correct:2,explanation:"陌生应用还可能收集账户或身份信息。风险不限于直接转账。",sourceId:"unknown-app"},
 {id:"cost",lesson:"cost",question:"“已经花了这么多时间，现在放弃太可惜了。”这最接近哪个概念？",options:["独立核实","沉没成本效应","身份认证"],correct:1,explanation:"这是原创教学例子：过去投入影响继续行动的倾向。概念解释不等于对用户作心理诊断。",sourceId:"sunk-cost"},
 {id:"new-cost",lesson:"cost",question:"为任务已经投入精力，对方现在要求追加费用。更合理的判断依据是？",options:["重新评估后续风险和可核实的信息","过去投入的时间越多，越应该继续","对方承诺这是最后一次收费"],correct:0,explanation:"过去付出不能证明新要求可靠。应重新评估下一步，而不是只为避免过去的投入落空。",sourceId:"sunk-cost"},
 {id:"video",lesson:"identity",question:"陌生账号的视频中出现同学的脸，要求借钱。更合理的处理是？",options:["看到了脸就转账","结束通话，用原有联系方式核实本人和事情","没有发现画面破绽就可以转账"],correct:1,explanation:"合成视频可能用于冒充身份。未看到破绽，不代表核实完成。",sourceId:"ai-forgery"},
 {id:"voice",lesson:"identity",question:"声音与室友相似，是否足以证明对方就是室友？",options:["足以，熟人的声音不会认错","不足，应通过原有渠道独立核实","问一个公开的生日就一定能核实"],correct:1,explanation:"熟悉的声音可以被克隆。应联系本人，必要时通过其他熟悉的人核实。",sourceId:"voice-check"},
 {id:"social",lesson:"identity",question:"自称客服的人利用信任，诱导提供受保护的信息，属于哪类手法？",options:["社会工程学手法","完成了官方认证","单纯的设备故障"],correct:0,explanation:"社会工程学通过欺骗影响人的沟通与行为，获取本应受到保护的信息。",sourceId:"social-engineering"}
];
for (const [i,c] of courseContent.entries()) { const options=[c.action,c.wrong1,c.wrong2]; const shift=i%3; quizItems.push({id:c.id+"-scene",lesson:c.id,kind:"材料题",question:c.scene+" 下一步更合理的是？",options:options.map((_,j)=>options[(j+shift)%3]),correct:(3-shift)%3,explanation:c.action+"。"+courseNotes[c.id].why,sourceId:c.sourceId}); const yes=i%2===0; quizItems.push({id:c.id+"-check",lesson:c.id,kind:"判断题",question:c.scene+" 因此，"+(yes?c.action:c.wrong1)+"，是更合理的处理。",options:["正确","错误"],correct:yes?0:1,explanation:courseNotes[c.id].reminder+"建议："+c.action+"。",sourceId:c.sourceId}); }
export const learningKey="shiju.learning.v1";
export type LearningProgress={completed:string[];answers:Record<string,number>;practice?:Record<string,PracticeResponse>};
export function readLearning(value:unknown):LearningProgress{
 const v=value&&typeof value==="object"?value as Partial<LearningProgress>:{};
 return {completed:Array.isArray(v.completed)?[...new Set(v.completed.filter((id):id is string=>typeof id==="string"&&lessons.some(l=>l.id===id)))]:[],answers:Object.fromEntries(quizItems.filter(q=>Number.isInteger(v.answers?.[q.id])&&v.answers![q.id]>=0&&v.answers![q.id]<q.options.length).map(q=>[q.id,v.answers![q.id]])),...(v.practice===undefined?{}:{practice:readPractice(v.practice)})};
}
