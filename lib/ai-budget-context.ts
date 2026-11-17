import {env} from "cloudflare:workers";
import {budgetPolicy,type BudgetContext} from "./ai-budget";
import {budgetVisitor} from "./budget-visitor";

export function budgetContext(request:Request):BudgetContext{
 // Trusted platform identity when available; otherwise a separate anonymous
 // quota bucket lets competition reviewers try every AI feature directly.
 return {db:env.DB,...budgetVisitor(request,process.env.AI_REQUIRE_SIGN_IN==="true"),policy:budgetPolicy()};
}
export function budgetResponse(ctx:BudgetContext,value:unknown){
 const headers=new Headers({"Cache-Control":"no-store"});
 if(ctx.setCookie)headers.set("Set-Cookie",ctx.setCookie);
 return Response.json(value,{headers});
}
