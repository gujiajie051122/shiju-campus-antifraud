import {parseReviewInput} from "@/lib/reflection-context";
import {analyzeReflection} from "@/lib/reflection-answer";
import {readJSON} from "@/lib/request-body";
import {modelConfig} from "@/lib/model-service";
import {metered} from "@/lib/ai-budget";
import {budgetContext} from "@/lib/ai-budget-context";
export async function POST(request:Request){
 const body=await readJSON(request,16000);if("response" in body)return body.response;
 const value=body.value as {input?:unknown;consent?:unknown}|null,input=parseReviewInput(value?.input);
 if(!input||value?.consent!==true)return Response.json({error:"请先结束本轮，并确认发送操作摘要与自述。"},{status:400});
 let config=null;try{config=modelConfig();}catch{}
 return Response.json(await metered(budgetContext(request),"reflection",config,(tracked,transport)=>analyzeReflection(input,tracked,request.signal,transport)),{headers:{"Cache-Control":"no-store"}});
}
