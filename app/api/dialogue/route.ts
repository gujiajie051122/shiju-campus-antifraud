import {parseDialogue,generateDialogue} from "@/lib/dialogue";
import {modelConfig} from "@/lib/model-service";
import {readJSON} from "@/lib/request-body";
export async function POST(request:Request){
 const body=await readJSON(request,40000);if("response" in body)return body.response;
 const input=parseDialogue(body.value);if(!input)return Response.json({error:"请输入1—1000字，并提供有效的演练上下文"},{status:400});
 let config=null;try{config=modelConfig();}catch{}
 return Response.json(await generateDialogue(input,config,request.signal),{headers:{"Cache-Control":"no-store"}});
}
