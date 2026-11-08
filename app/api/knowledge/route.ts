import {answerKnowledge} from "@/lib/knowledge-answer";
import {modelConfig} from "@/lib/model-service";
import {readJSON} from "@/lib/request-body";
import {metered} from "@/lib/ai-budget";
import {budgetContext} from "@/lib/ai-budget-context";
export async function POST(request:Request){const body=await readJSON(request,4000);if("response" in body)return body.response;const question=(body.value as {question?:unknown})?.question;if(typeof question!=="string"||!question.trim()||question.length>300)return Response.json({error:"请输入1—300字的问题"},{status:400});let config=null;try{config=modelConfig();}catch{}return Response.json(await metered(budgetContext(request),"knowledge",config,(tracked,transport)=>answerKnowledge(question.trim(),tracked,request.signal,transport)),{headers:{"Cache-Control":"no-store"}});}
