import {parseReviewInput} from "@/lib/reflection-context";
import {analyzeReflection} from "@/lib/reflection-answer";
import {readJSON} from "@/lib/request-body";
import {modelConfig} from "@/lib/model-service";
import {metered} from "@/lib/ai-budget";
import {budgetContext,budgetResponse} from "@/lib/ai-budget-context";
import {parseJobReviewInput,jobReflectionContext} from "@/lib/job-reflection";
import {analyzeReflectionContext} from "@/lib/reflection-answer";
export async function POST(request:Request){
 const ctx=budgetContext(request);
 const body=await readJSON(request,16000);if("response" in body)return body.response;
 const value=body.value as {input?:unknown;jobInput?:unknown;consent?:unknown}|null;
 if(value?.jobInput!==undefined){
  const input=parseJobReviewInput(value.jobInput);
  if(!input||value.consent!==true||value.input!==undefined)return Response.json({error:"请先结束本轮，并确认发送操作摘要与自述。"},{status:400});
  let config=null;try{config=modelConfig();}catch{}
  return budgetResponse(ctx,await metered(ctx,"reflection",config,(tracked,transport)=>analyzeReflectionContext(input,jobReflectionContext(input),tracked,request.signal,transport)));
 }
 const input=parseReviewInput(value?.input);
 if(!input||value?.consent!==true)return Response.json({error:"请先结束本轮，并确认发送操作摘要与自述。"},{status:400});
 let config=null;try{config=modelConfig();}catch{}
 return budgetResponse(ctx,await metered(ctx,"reflection",config,(tracked,transport)=>analyzeReflection(input,tracked,request.signal,transport)));
}
