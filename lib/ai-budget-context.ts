import {env} from "cloudflare:workers";
import {budgetPolicy,type BudgetContext} from "./ai-budget";

export function budgetContext(request:Request):BudgetContext{
 // Sites dispatch authenticates the visitor and injects this trusted header.
 // Never use body fields, cookies supplied by this app, or IP as an identity.
 const userId=request.headers.get("oai-authenticated-user-id");
 return {db:env.DB,userId:userId&&userId.length<=500?userId:null,policy:budgetPolicy()};
}
