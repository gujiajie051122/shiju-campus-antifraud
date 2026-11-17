import {knowledgeChunks,retrieveKnowledge} from "./knowledge.ts";

// Normalize only familiar phrasing for retrieval; retain the original question
// for the model. This does not assert that an ambiguous account/person is safe.
export function normalizeKnowledgeQuery(question:string){
 return question.normalize("NFKC").replace(/如何让防范/g,"如何防范")
  .replace(/诈\s+骗/g,"诈骗").replace(/咋(样)?/g,"怎么")
  .replace(/二手买卖/g,"二手交易").replace(/刷单返钱/g,"刷单返利")
  .replace(/视频造假/g,"AI伪造视频").replace(/语音造假/g,"声音克隆")
  .replace(/验正码/g,"验证码").replace(/陪训费/g,"培训费");
}
export function isBlockedKnowledgeQuery(question:string){return /人肉|开盒|住址|家庭地址|绕过验证/.test(question);}
export function isAntiFraudQuery(question:string){
 return /诈骗|骗局|被骗|受骗|防骗|反诈|防诈|骗术|骗钱|电诈|上当|骗子|被.{0,3}骗|骗人/.test(question)
  ||(/招聘|兼职|二手|购票|门票|客服|转账|贷款|借钱|投资|奖学金|助学金/.test(question)&&/真假|假的|靠谱|可靠|可疑|安全|可信|风险|核实|防范|怎么办/.test(question));
}
const overviewIds=["job-fees","small-rewards","off-platform","investment-guarantee","romance-trust","ai-forgery","independent-callback","secret-code","screen-sharing","preserve-records","money-sent"];
export function overviewKnowledge(){return overviewIds.map(id=>knowledgeChunks.find(c=>c.id===id)!);}
export function selectKnowledge(question:string){
 const normalized=normalizeKnowledgeQuery(question);
 if(isBlockedKnowledgeQuery(normalized))return {sources:[],mode:"none" as const};
 const ranked=retrieveKnowledge(normalized).map(r=>r.chunk);
 // A failed lexical match is not the same as missing knowledge. In-scope
 // paraphrases reach the model with the reviewed collection in the SAME call.
 // Broad questions get a diverse overview instead of a single accidental hit.
 const specific=/兼职|招聘|刷单|返利|培训|贷款|校园贷|助学|奖学|资助|游戏|二手|购票|门票|机票|航班|客服|验证码|密码|屏幕|转账|转了|交钱|收费|投资|理财|网友|网恋|借钱|换脸|克隆|公检法|警官|安全账户|报警|报案|证据|追损|追回|沉没|社会工程|被骗后|被骗了|我被|遭遇|怀疑/.test(normalized);
 const broad=isAntiFraudQuery(normalized)&&/如何|怎么|怎样|哪些|什么|注意|识别|防范|防止|避免|常见|套路|预防/.test(normalized)&&!specific;
 if(broad)return {sources:overviewKnowledge(),mode:"overview" as const};
 if(ranked.length)return {sources:ranked,mode:"ranked" as const};
 if(isAntiFraudQuery(normalized))return {sources:knowledgeChunks,mode:"semantic" as const};
 return {sources:[],mode:"none" as const};
}
