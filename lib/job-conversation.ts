import {jobReplies, type JobLog, type JobMode, type JobRun} from './job-workshop.ts';

export type JobCheck='directory'|'contact'|'sender';
export type JobChatInput={mode:JobMode;text:string;opened:boolean;history:{role:'user'|'assistant';content:string}[];checks?:JobCheck[];quote?:JobLog['quote']};

export function jobChatInput(run:JobRun,text:string,quote?:JobLog['quote']):JobChatInput{
 return {mode:run.mode,text,opened:run.logs.some(l=>l.action==='attachment'),
  checks:(['directory','contact','sender'] as JobCheck[]).filter(action=>run.logs.some(l=>l.action===action)),
  history:run.logs.filter(l=>l.action==='user'||l.action==='actor').slice(-8).map(l=>({role:l.action==='user'?'user':'assistant',content:l.text.slice(0,1000)})),
  ...(quote?{quote}:{})};
}

// Grounded preset replies used only when model generation is unavailable.
export function jobAnswerMenu(input:JobChatInput):Record<string,string>{
 const menu:Record<string,string>={...jobReplies(input.mode,input.opened),
  proof:'目前发给你的就是岗位说明和办理附件，还没有其他可供确认的授权材料。',
  channel:'岗位编号在刚发的说明里，我这里暂时没有另外的授权证明。',
  clarification:input.opened?(input.mode==='learning'?'你说的是附件里的培训要求吗？里面写了先缴298元培训费，报酬和结算时间还没定。':'你说的是附件里的入职流程吗？里面要求安装协作助手、开启屏幕共享；报酬和结算时间还没定。'):'你想问岗位内容、报酬，还是附件里的办理要求？可以具体说一下。'
 };
 if(input.checks?.includes('contact'))menu.contactResult='你查到的名单里没有我，我这边目前也拿不出额外的授权证明。这件事先不往下办。';
 if(input.checks?.includes('directory'))menu.directoryResult=input.mode==='learning'?'你说目录里没有这个编号，我现在拿不出与目录对应的发布记录。':'目录中有这个岗位，但我个人的授权材料目前没有提供。';
 if(input.opened&&input.checks?.includes('directory'))menu.conflict=input.mode==='learning'?'我发的附件要求培训费，与你查到的目录不一致，这个差异我现在解释不了。':'我发的是协作助手办理通知，与你查到的公开邮箱方式不一致。我目前拿不出这套流程的授权。';
 if(input.checks?.includes('sender'))menu.senderResult='刚才的号码是我提供的对接号码，我没有另外的授权材料。';
 return menu;
}

const patterns:[string,RegExp][]=[
 ['pay',/工资|报酬|薪|结算|发钱|多少钱|日结|时薪/],
 ['requirement',/收费|培训|软件|共享|安装|入职|押金|费用|交钱|付钱|办理/],
 ['verify',/身份|核实|公司|官方|真假|授权|诈骗|骗子|工作室/],
 ['time',/时间|周几|几点|工时|排班|多久|几小时/],
 ['work',/工作|任务|做什么|内容|负责|具体做/],
 ['proof',/证件|执照|证明|授权书|合同/],
 ['channel',/从哪|哪里查|怎么查|怎么核|电话|联系谁/]
];

export function jobTurnPlan(input:JobChatInput):string[]{
 const text=input.text;
 if(/忽略|提示词|system|正常组|风险组/i.test(text))return ['unknown'];
 const asks=/能不能|可不可以|是否|怎么办|会不会|如果|假如|有人说|你说/.test(text);
 if(/结束沟通|结束演练|停止演练|不要再联系|我决定退出|我拒绝|我不愿|我不想|我不接受|不做了|再见/.test(text)||(!asks&&/^(我)?(不交(钱|费|这笔培训费)?了?|不安装了?|不共享了?|退出|暂停(办理)?|先不办|不继续)[。！!，,\s]*$/.test(text)))return ['refuse'];
 const menu=jobAnswerMenu(input),result:string[]=[];
 if(/查到|查过|目录|官网|公开渠道|授权名单|不在名单|没有记录|对不上|不一致|矛盾/.test(text)){
  if(menu.contactResult&&/授权|名单|身份|联系人/.test(text))result.push('contactResult');
  if(menu.conflict&&/附件|要求|收费|培训|软件|共享|不一致|矛盾|对不上/.test(text))result.push('conflict');
  if(menu.directoryResult&&!result.length)result.push('directoryResult');
 }
 if(menu.senderResult&&/电话|号码|回拨/.test(text)&&/你给|你发|打过|拨过|确认/.test(text))result.push('senderResult');
 const contextual=result.length>0;
 for(const [id,pattern] of [...patterns].sort((a,b)=>text.search(a[1])-text.search(b[1])))if(pattern.test(text)&&(!contextual||!['verify','requirement','channel'].includes(id)))result.push(id);
 if(!result.length&&/你好|您好/.test(text))result.push('greeting');
 if(!result.length&&/为什么|什么意思|这(个|项|是)|那(个|项|是|呢)|详细|具体|再说|还有呢|确定吗/.test(text)){
  const context=input.quote?.text??[...input.history].reverse().find(h=>h.role==='user')?.content??'';
  result.push(...patterns.filter(([,pattern])=>pattern.test(context)).map(([id])=>id));
  if(!result.length)result.push('clarification');
 }
 return [...new Set(result.length?result:['unknown'])].slice(0,4);
}

export function jobTurnReply(input:JobChatInput,selection=jobTurnPlan(input)):string{
 const menu=jobAnswerMenu(input);
 if(!selection.includes('refuse')&&!selection.some(id=>/Result|conflict/.test(id))){
  if(/担心|不放心|保证|怕.*骗/.test(input.text)&&input.opened)return input.mode==='learning'?'我这边发的是岗前培训说明，但没有另外的担保或退款约定可提供。你提到费用方面的顾虑，我暂时给不了额外保证。':'我发的是协作助手核验通知，但没有另外的流程授权证明可提供。你提到共享方面的顾虑，我暂时给不了额外保证。';
  if(/钱不够|没钱|能不能先|先开始工作/.test(input.text))return input.opened?(input.mode==='learning'?'按我发的说明，是先培训再安排任务，不能直接跳过培训。我这里没有先工作后培训的安排。':'我发的流程不收培训费，是先按通知完成入职核验。站内只模拟选择，不会安装软件。'):'具体办理要求在附件里，你先看看，再告诉我哪一步有顾虑。';
  if(/愿意|同意|下一步|怎么操作|可以继续/.test(input.text))return menu.requirement;
  if(/详细|再说|讲清/.test(input.text)&&selection.includes('pay'))return '我还没给出书面的报酬单价和结算周期，所以现在没法算具体能拿多少，也不能向你承诺日结。';
 }
 return selection.map(id=>menu[id]??menu.unknown).join('\n\n');
}
