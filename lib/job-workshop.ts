import {isReflectionRecord,type ReflectionRecord} from './reflection-types.ts';
export type JobMode='learning'|'independent';
export type JobAction='posting'|'attachment'|'directory'|'contact'|'sender'|'install'|'hint';
export type JobDecision='pause'|'continue'|'exit'|'report';
export type JobLog={id:string;at:string;action:JobAction|'user'|'actor'|'decision';text:string;quote?:{name:string;text:string}};
export type JobRun={finding?:'uncertain'|'identity'|'process'|'both';version:1;id:string;mode:JobMode;logs:JobLog[];decision?:JobDecision;rationale?:string;reflection?:ReflectionRecord};
export const JOB_RUN_KEY='shiju.job-workshop.v1';
export const jobStories={
 learning:{title:'群里转来一份兼职',subtitle:'一条群消息，一次课余工作的机会。',name:'林老师',avatar:'林',org:'青禾校园内容工作室',role:'内容运营助理',code:'QH-061',entry:'同学群 · 兼职信息',opening:'你好，看到你对群里的兼职感兴趣。主要帮忙整理活动资料，每周大约6小时。你想先了解什么？',attachment:'岗前培训说明.pdf',attachmentText:'青禾校园内容工作室\n内容运营助理 · QH-061\n\n上岗前需先缴纳298元岗前培训费，缴纳后安排培训。\n报酬单价与结算周期另行确认。\n联系人：林老师\n\n此材料由聊天中的联系人提供。',posting:'整理公开活动资料，辅助撰写校园活动文案。每周约6小时，具体时段协商。报酬单价、结算周期尚未约定。联系人自称来自青禾校园内容工作室。',directory:'青禾校园内容工作室的招聘目录中没有QH-061的发布记录。目录说明：招聘不向应聘者收取岗前培训费。',contact:'通过预置的工作室公开渠道核实：林老师不在本次招聘授权联系人名单中。',hint:'公司名称、岗位和联系人需要分别核实。对方发送的文件仍是同一来源；可以找对方以外的渠道对照。'},
 independent:{title:'面试通过之后',subtitle:'面试结束，招聘联系人发来一份入职通知。',name:'陈经理',avatar:'陈',org:'远帆文化工作室',role:'活动资料助理',code:'YF-204',entry:'线上面试 · 后续沟通',opening:'你好，刚才的资料整理面试已通过。先把入职通知发给你，流程办完后我们再确认排班。',attachment:'入职办理通知.pdf',attachmentText:'远帆文化工作室\n活动资料助理 · YF-204\n\n请先安装联系人提供的“远帆协作助手”，开启屏幕共享完成入职核验。此流程不收培训费。\n报酬标准与结算周期另行书面确认。\n联系人：陈经理\n\n此材料由聊天中的联系人提供。',posting:'协助归档活动资料，每周约6小时。岗位编号YF-204。联系人发来的面试通知带有工作室名称，报酬与结算周期尚未书面约定。',directory:'工作室公开招聘目录确有YF-204岗位。目录写明：通过工作室公开邮箱办理入职，不要求安装联系人私发的软件，也不要求屏幕共享。',contact:'通过预置的工作室公开渠道核实：陈经理不在YF-204岗位的授权联系人名单中。岗位存在，不代表当前联系人获得授权。',hint:''}
} as const;
export function makeJobRun(mode:JobMode):JobRun{return {version:1,id:crypto.randomUUID(),mode,logs:[{id:crypto.randomUUID(),at:new Date().toISOString(),action:'actor',text:jobStories[mode].opening}]};}
export function jobEvent(run:JobRun,action:JobLog['action'],text:string,quote?:JobLog['quote']):JobRun{if(run.decision)return run;return {...run,logs:[...run.logs,{id:crypto.randomUUID(),at:new Date().toISOString(),action,text,...(quote?{quote}:{})}]};}
export function finishJob(run:JobRun,decision:JobDecision,rationale='',finding:'uncertain'|'identity'|'process'|'both'='uncertain'):JobRun{if(run.decision)return run;const reason=rationale.trim().slice(0,300);return {...jobEvent(run,'decision',decision),decision,finding,...(reason?{rationale:reason}:{})};}
export function jobReview(run:JobRun){
 const seen=(action:JobAction)=>run.logs.some(l=>l.action===action);const story=jobStories[run.mode];
 return [{title:'联系人身份',state:seen('contact')?'已核实':'尚未核实',text:seen('contact')?story.contact:'本轮没有取得联系人授权的独立核实结果，不能仅凭头像、姓名或面试认定身份。'},
 {title:'岗位与办理要求',state:seen('directory')&&seen('attachment')?'已取得对照材料':'对照材料未齐',text:seen('directory')&&seen('attachment')?(run.mode==='learning'?'联系人要求缴培训费，与独立目录“不收岗前培训费”的说明冲突。':'岗位在目录中存在，但指定软件、屏幕共享要求与目录中的公开邮箱办理方式冲突。'):seen('directory')?'你取得了目录信息，但尚未打开入职附件，无法评价是否比较过两边要求。':seen('attachment')?'你查看了对方提供的附件，但尚未取得独立目录信息。':'本轮未查看入职附件，也未查询独立目录。'},
 {title:'你的处理',state:{pause:'暂缓办理',continue:'决定继续',exit:'结束沟通',report:'标记并报告'}[run.decision??'pause'],text:run.decision==='continue'?'本次选择了继续。请对照自己实际取得的信息；若尚未核实或存在冲突，继续办理会留下风险。':seen('contact')&&seen('directory')?'你核实了岗位和联系人，并在取得对照信息后作出了选择。可以用具体材料说明你的判断依据。':seen('contact')||seen('directory')?'你在取得部分核实信息后作出了选择。还需结合上面列出的未核实事项判断。':'你选择了停止或暂缓，但本轮尚无独立核实结果。这不等同于已查明对方身份。'}];
}
export function isJobRun(v:unknown):v is JobRun{if(!v||typeof v!=='object')return false;const r=v as JobRun;return r.version===1&&(r.finding===undefined||['uncertain','identity','process','both'].includes(r.finding))&&(r.reflection===undefined||isReflectionRecord(r.reflection))&&typeof r.id==='string'&&['learning','independent'].includes(r.mode)&&(!r.decision||['pause','continue','exit','report'].includes(r.decision))&&(r.rationale===undefined||(typeof r.rationale==='string'&&r.rationale.length<=300))&&Array.isArray(r.logs)&&r.logs.length<500&&r.logs.every(l=>l&&typeof l.id==='string'&&typeof l.text==='string'&&l.text.length<=2000&&typeof l.at==='string'&&(!l.quote||(typeof l.quote.name==='string'&&l.quote.name.length<=30&&typeof l.quote.text==='string'&&l.quote.text.length<=160))&&['posting','attachment','directory','contact','sender','install','hint','user','actor','decision'].includes(l.action));}

export function jobReviewPlan(run:JobRun){
 const seen=(action:JobAction)=>run.logs.some(l=>l.action===action);
 const gaps:string[]=[],practice:{lesson:string;title:string;why:string}[]=[];
 if(!seen('contact'))gaps.push('还没有从工作室公开渠道确认联系人的招聘授权。');
 if(!seen('directory'))gaps.push('还没有取得独立的岗位目录，无法对照来源与办理要求。');
 if(!seen('attachment'))gaps.push('还没有查看入职附件，具体办理要求尚未进入本轮判断。');
 const add=(lesson:string,title:string,why:string)=>{if(!practice.some(p=>p.lesson===lesson))practice.push({lesson,title,why});};
 if(seen('install'))add('job-app','陌生软件与资料用途','本轮点击过安装请求，先练习核实软件来源和信息用途。');
 if(!seen('contact')||seen('sender'))add('job-channel','核实电话，从哪里找','区分联系人提供的号码与自己找到的公开渠道。');
 if(!seen('directory')||!seen('attachment'))add('jobs','岗位、联系人，分开核实','补齐对照材料，再判断这份邀请。');
 add(run.mode==='learning'?'job-fee':'job-app',run.mode==='learning'?'入职前的收费要求':'入职时的软件要求',run.mode==='learning'?'练习核对收费主体、用途与岗位来源。':'练习识别真实岗位之外的联系人和办理流程风险。');
 const factors=[run.mode==='learning'?
  {title:'群转发带来的熟悉感',text:'邀请来自同学群，容易让人把消息渠道的熟悉感当作招聘身份的证明。群转发本身不提供授权证据。'}
  :{title:'面试通过后的权威感',text:'面试和正式附件容易增加可信感；即使目录中确有岗位，也仍需核实当前联系人的授权。'}];
 if(seen('sender'))factors.push({title:'多问一次，不一定是独立核实',text:'你回拨过对方提供的号码。两个说法一致仍可能来自同一来源，需要另找公开联系方式。'});
 if(run.decision==='continue')factors.push({title:'准备继续时，再看一次依据',text:'本轮选择了继续办理。可以自问：如果没有面试和前面的聊天，仅凭现在的独立材料，我还会作出同样的选择吗？这用于自查，不能说明你存在某种心理偏差。'});
 return {gaps,practice:practice.slice(0,3),factors,checks:['directory','contact'].filter(action=>run.logs.some(l=>l.action===action)).length,looked:seen('attachment')};
}

export const jobActionLabels:Record<JobLog['action'],string>={posting:'查看岗位说明',attachment:'查看入职附件',directory:'查询独立岗位目录',contact:'核实联系人授权',sender:'回拨对方提供的号码',install:'点击安装请求（未安装）',hint:'查看学习提示',user:'发出消息',actor:'收到回复',decision:'作出本轮决定'};
export function jobReplies(mode:JobMode,opened:boolean){return {
 greeting:'你好，可以先聊聊你的课余安排。',work:mode==='learning'?'主要整理公开活动资料，辅助撰写校园活动文案。':'主要协助归档活动资料。',
 pay:'报酬单价和结算周期还没有书面约定，这两项需要在开始工作前确认。',
 requirement:opened?(mode==='learning'?'这边按附件先安排298元岗前培训，再对接任务。你可以在站内查看附件；后续选择仅记录演练，不会真实付款。':'我这边按通知安排协作助手和屏幕共享核验，不收培训费。站内操作只记录模拟选择，不会下载或安装软件。'):'办理事项在刚发来的附件里，你可以先打开入职通知。',
 verify:mode==='learning'?'我是对接这份兼职的林老师，目前发给你的材料是岗位说明和培训附件。':'我这边是跟进面试后流程的陈经理，刚才发给你的是办理通知。',
 refuse:'好的，那先暂停这次办理，不再继续安排。',
 time:'每周约6小时，具体时段还需要双方商量。',
 unknown:'你具体想了解岗位、报酬，还是刚发的附件？你说清楚一点，我接着回答。'
};}
export function jobReplyId(text:string):keyof ReturnType<typeof jobReplies>{if(/不做|拒绝|不想|不愿|不接受|不交|不安装|不共享|退出|再见|暂停/.test(text))return 'refuse';if(/忽略|提示词|system|正常组|风险组/i.test(text))return 'unknown';if(/工资|报酬|薪|结算|发钱/.test(text))return 'pay';if(/收费|培训|软件|共享|安装|入职|押金|费用/.test(text))return 'requirement';if(/身份|核实|公司|官方|真假|授权|诈骗/.test(text))return 'verify';if(/时间|周几|几点|工时|排班/.test(text))return 'time';if(/工作|任务|做什么|内容/.test(text))return 'work';if(/你好|您好/.test(text))return 'greeting';return 'unknown';}
