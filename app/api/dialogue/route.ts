import {parseDialogue,generateDialogue} from "@/lib/dialogue";
import {modelConfig} from "@/lib/model-service";
import {readJSON} from "@/lib/request-body";
import {metered} from "@/lib/ai-budget";
import {budgetContext} from "@/lib/ai-budget-context";
export async function POST(request:Request){
 const body=await readJSON(request,40000);if("response" in body)return body.response;
 const input=parseDialogue(body.value);if(!input)return Response.json({error:"请输入1—1000字，并提供有效的演练上下文"},{status:400});
 let config=null;try{config=modelConfig();}catch{}
 return Response.json(await metered(budgetContext(request),"dialogue",config,(tracked,transport)=>generateDialogue(input,tracked,request.signal,transport)),{headers:{"Cache-Control":"no-store"}});
}
