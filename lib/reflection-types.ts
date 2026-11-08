export type FocusId="identity"|"terms"|"source"|"conflict"|"checked"|"choice";
export type FactorId="authority"|"time"|"relationship"|"sunk"|"insufficient";
export type ReviewSelection={engine:"model"|"rules";focusIds:FocusId[];factorId:FactorId;warning?:string};
export type ReviewFeedback={status:"confirm"|"reject"|"unsure";note:string;at:string};
export type PracticeAnswer={caseId:string;choiceId:string;at:string};
export type ReflectionRecord={basis:string;createdAt:string;selection:ReviewSelection;feedback?:ReviewFeedback;practice:PracticeAnswer[]};
export const focusIds:FocusId[]=["identity","terms","source","conflict","checked","choice"];
export const factorIds:FactorId[]=["authority","time","relationship","sunk","insufficient"];
export function isReflectionRecord(value:unknown):value is ReflectionRecord{
 if(!value||typeof value!=="object")return false;const r=value as ReflectionRecord,s=r.selection;
 const date=(x:unknown)=>typeof x==="string"&&Number.isFinite(Date.parse(x));
 return typeof r.basis==="string"&&r.basis.length<=20000&&date(r.createdAt)&&!!s&&["model","rules"].includes(s.engine)&&Array.isArray(s.focusIds)&&s.focusIds.length>0&&s.focusIds.length<=2&&new Set(s.focusIds).size===s.focusIds.length&&s.focusIds.every(id=>focusIds.includes(id))&&factorIds.includes(s.factorId)&&(s.warning===undefined||(typeof s.warning==="string"&&s.warning.length<=400))&&(!r.feedback||(["confirm","reject","unsure"].includes(r.feedback.status)&&typeof r.feedback.note==="string"&&r.feedback.note.length<=500&&date(r.feedback.at)))&&Array.isArray(r.practice)&&r.practice.length<=6&&r.practice.every(a=>a&&typeof a.caseId==="string"&&a.caseId.length<=40&&typeof a.choiceId==="string"&&a.choiceId.length<=20&&date(a.at));
}
