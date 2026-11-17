import {parseJobChat,generateJobChat} from "@/lib/job-dialogue";
import {parseDialogue,generateDialogue} from "@/lib/dialogue";
import {modelConfig} from "@/lib/model-service";
import {readJSON} from "@/lib/request-body";
import {metered} from "@/lib/ai-budget";
import {budgetContext,budgetResponse} from "@/lib/ai-budget-context";
export async function POST(request:Request){
 const ctx=budgetContext(request);
 const body=await readJSON(request,40000);if("response" in body)return body.response;
 if(body.value&&typeof body.value==="object"&&(body.value as Record<string,unknown>).jobWorkshop===true){const job=parseJobChat(body.value);if(!job)return Response.json({error:"无效的情境消息"},{status:400});let config=null;try{config=modelConfig();}catch{}return budgetResponse(ctx,await metered(ctx,"dialogue",config,(tracked,transport)=>generateJobChat(job,tracked,request.signal,transport)));}
 const input=parseDialogue(body.value);if(!input)return Response.json({error:"请输入1—1000字，并提供有效的演练上下文"},{status:400});
 let config=null;try{config=modelConfig();}catch{}
 return budgetResponse(ctx,await metered(ctx,"dialogue",config,(tracked,transport)=>generateDialogue(input,tracked,request.signal,transport)));
}
