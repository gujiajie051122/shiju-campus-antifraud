import type {JobRun} from './job-workshop.ts';
export type JobFinding='uncertain'|'identity'|'process'|'both';
export function jobOutcome(run:JobRun){
 const seen=(action:string)=>run.logs.some(l=>l.action===action);
 const identity=seen('contact')&&['identity','both'].includes(run.finding??'uncertain');
 const process=seen('attachment')&&seen('directory')&&['process','both'].includes(run.finding??'uncertain');
 const stopped=!!run.decision&&run.decision!=='continue';
 const install=run.logs.findIndex(l=>l.action==='install');
 const corrected=stopped&&install>=0&&run.logs.slice(install+1).some(l=>l.action==='contact'||(l.action==='directory'&&seen('attachment')));
 const state=!run.decision?'ongoing':!stopped?'risk':install>=0?'corrected':identity||process?'verified':'safe';
 const copy={ongoing:['演练进行中','收集信息后，再作出你的决定。'],risk:['继续办理，风险未排除','你选择了继续。情境中的联系人没有获得授权，办理要求也存在风险；本轮没有实际付款或安装。'],corrected:['已停止风险操作','你曾点击模拟安装请求，随后停止办理。风险操作保留在记录中，不等于真实安装。'],verified:['已核实并阻断风险','你取得了独立材料，在提交判断时指出对应矛盾，并停止办理。这说明本轮有依据地避开了风险。'],safe:['已安全停止，依据待补充','你没有继续办理。若想说明具体识破了什么，还需取得独立材料，并在提交判断时指出对应问题。']} as const;
 const badges=[
  {id:'verify',title:'独立求证',earned:seen('contact')||seen('directory'),reason:'使用工作室公开渠道，取得岗位或联系人核实材料。'},
  {id:'identity',title:'分清身份',earned:identity,reason:'取得联系人授权结果，并指出联系人未获授权。'},
  {id:'compare',title:'发现矛盾',earned:process,reason:'查看附件、查询目录，并指出办理要求冲突。'},
  {id:'boundary',title:'守住边界',earned:stopped&&install<0&&(seen('attachment')||seen('contact')||seen('directory')),reason:'查看风险要求或核实材料后停止办理，未点击模拟安装。'},
  {id:'correct',title:'及时纠偏',earned:corrected,reason:'点击模拟安装后，补充独立核实并停止办理；本轮风险记录仍保留。'}
 ];
 return {state,title:copy[state][0],description:copy[state][1],badges,identity,process,install:install>=0,stopped};
}
