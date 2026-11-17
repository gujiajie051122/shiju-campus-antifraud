import {budgetContext,budgetResponse} from "@/lib/ai-budget-context";
import {usageSnapshot} from "@/lib/ai-budget";
import {modelConfig} from "@/lib/model-service";
export async function GET(request:Request){const ctx=budgetContext(request);let configured=false;try{configured=!!modelConfig();}catch{}return budgetResponse(ctx,await usageSnapshot(ctx,configured));}
