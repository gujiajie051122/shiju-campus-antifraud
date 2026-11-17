import {courseContent} from './course-content.ts';
import {courseNotes} from './course-notes.ts';
import {lessonReading} from './lesson-reading.ts';
import {practiceScenes} from './practice-scenes.ts';
export const practiceKinds=['单选题','多选题','判断题','材料分析'] as const;
export type PracticeKind=typeof practiceKinds[number];
export type PracticeQuestion={id:string;lesson:string;topic:string;kind:PracticeKind;skill:string;material:string;question:string;options:string[];correct:number[];optionNotes:string[];explanation:string;sourceId:string;reference:string[];sample:string};
export type PracticeResponse={answer:number[]|string;review:boolean;at:string};
export const practiceBank:PracticeQuestion[]=[];
for(const [ci,c] of courseContent.entries()){
 const r=lessonReading[c.id],n=courseNotes[c.id];
 for(const [si,material] of [c.scene,...practiceScenes[c.id]].entries()){
  const base={lesson:c.id,topic:c.topic,material,sourceId:c.sourceId,reference:n.steps,sample:`现有材料还不能直接支持继续操作。${r.panels[0].note}${n.steps.join('')}我会回复：“我需要先核实。${c.action}，确认之前先暂停操作。”${n.reminder}`};
  function add(k:number,kind:PracticeKind,skill:string,question:string,options:string[],correct:number[],notes:string[],explanation:string){
   const shift=(ci+si+k)%Math.max(options.length,1),order=options.map((_,i)=>(i+shift)%options.length);
   practiceBank.push({...base,id:`bank-${c.id}-${si+1}-${k+1}`,kind,skill,question,options:order.map(i=>options[i]),correct:order.flatMap((i,j)=>correct.includes(i)?[j]:[]),optionNotes:order.map(i=>notes[i]),explanation});
  }
  add(0,'单选题','选择下一步','面对这段情境，下一步更合理的是？',[c.action,c.wrong1,c.wrong2],[0],[n.why,`这一做法没有补齐独立核实环节。${n.reminder}`,`这不能替代对具体事项的核查。${r.panels[0].note}`],n.why);
  add(1,'单选题','区分证据与推断','关于现有信息能证明什么，哪一项表述更严谨？',[r.panels[0].note,'对方能提供材料，就已经证明这次要求可靠。','现有疑点足以认定某个具体的人已经违法。'],[0],[n.why+' '+n.reminder,'材料的提供与材料所述事实的独立确认是不同的事。','风险线索帮助决定是否暂停和核查，不能替代具体事实调查与认定。'],n.why+' '+n.reminder);
  add(2,'单选题','寻找核对入口','针对本情境，应优先采用哪条核对路径？',[r.panels[1].path,'只在当前对话中要求对方再次保证。','先按要求操作，再用结果反推是否可靠。'],[0],[r.panels[1].note,'重复保证仍是同一来源，不会自动增加独立证据。','先操作可能带来资金或信息风险，不能用操作成功替代事前核实。'],`${n.steps[1]}${r.panels[1].note}`);
  add(3,'多选题','落实核实动作','下列哪些动作有助于处理这段情境？',[n.steps[0],n.steps[1],c.wrong1,c.wrong2],[0,1],[n.steps[0]+'这让后续核实有具体对象。',n.steps[1]+'这有助于补充核对依据。',`仅这样做仍有缺口。${n.reminder}`,`这没有完成必要核实。${n.why}`],`应结合当前情境落实核实动作，不能只听承诺。${n.why}`);
  add(4,'多选题','明确核对范围','为了补齐依据，需要逐项核对哪些内容？',[...r.panels[1].fields.map(([key])=>`核对${key}的具体信息`),'只要对方态度诚恳，其他事项都可以省略。'],[0,1,2],[...r.panels[1].fields.map(([key])=>`${key}属于这次核实的具体对象。${r.panels[1].note}`),'态度不能证明身份、流程或交易事实。'],`${r.panels[1].note}${n.reminder}`);
  add(5,'判断题','辨别处理误区',`仅采取“${c.wrong1}”这一做法，就认为已妥善处理上述情境，是否合理？`,['合理','不合理'],[1],[`这仍有缺口。${n.why}`,n.reminder],`${n.why}建议：${c.action}。`);
  add(6,'判断题','理解核实边界',`在上述情境中，采取“${c.action}”的处理方式，是否合理？`,['合理','不合理'],[0],[`${n.why}仍应注意：${n.reminder}`,'这一方向与本情境的核实需求相符，不能因为多了一步核实就认为没有必要。'],`${n.steps.join('')}${n.reminder}`);
  add(7,'材料分析','分析并表达','这段情境，还缺少哪些核实依据？',[],[],[],`${n.why} ${n.reminder}`);
 }
}
export function practiceCorrect(q:PracticeQuestion,response:PracticeResponse|undefined):boolean|undefined{
 if(!response||q.kind==='材料分析')return undefined;
 const selected=response.answer;return Array.isArray(selected)&&selected.length===q.correct.length&&q.correct.every(i=>selected.includes(i));
}
export function readPractice(value:unknown):Record<string,PracticeResponse>{
 const data=value&&typeof value==='object'?value as Record<string,unknown>:{};const result:Record<string,PracticeResponse>={};
 for(const q of practiceBank){const raw=data[q.id];if(!raw||typeof raw!=='object')continue;const r=raw as PracticeResponse;
  if(typeof r.review!=='boolean'||typeof r.at!=='string')continue;
  if(q.kind==='材料分析'){if(typeof r.answer!=='string'||!r.answer.trim()||r.answer.length>1000)continue;}
  else if(!Array.isArray(r.answer)||!r.answer.length||new Set(r.answer).size!==r.answer.length||r.answer.some(i=>!Number.isInteger(i)||i<0||i>=q.options.length)||(q.kind!=='多选题'&&r.answer.length!==1))continue;
  result[q.id]={answer:Array.isArray(r.answer)?[...r.answer]:r.answer,review:r.review,at:r.at};
 }return result;
}
