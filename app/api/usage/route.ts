import {budgetContext} from "@/lib/ai-budget-context";
import {usageSnapshot} from "@/lib/ai-budget";
import {modelConfig} from "@/lib/model-service";
export async function GET(request:Request){let configured=false;try{configured=!!modelConfig();}catch{}return Response.json(await usageSnapshot(budgetContext(request),configured),{headers:{"Cache-Control":"no-store"}});}
