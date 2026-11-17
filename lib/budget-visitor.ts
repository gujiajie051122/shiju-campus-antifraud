// Anonymous visitor IDs are ONLY quota buckets, never authenticated identities.
// Clearing cookies can reset a visitor bucket, so the atomic site cap remains
// the hard spending limit for public competition access.
const cookieName="shiju_ai_visitor";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function budgetVisitor(request:Request,requireSignIn=false){
 const authenticated=request.headers.get("oai-authenticated-user-id");
 if(authenticated&&authenticated.length<=500)return {userId:authenticated,guest:false};
 if(requireSignIn)return {userId:null,guest:false};
 const values=(request.headers.get("cookie")??"").split(";").map(v=>v.trim()).filter(v=>v.startsWith(cookieName+"=")).map(v=>v.slice(cookieName.length+1));
 const existing=values.length===1&&uuid.test(values[0])?values[0]:null;
 const id=existing??crypto.randomUUID();
 return {userId:"guest:"+id,guest:true,...(existing?{}:{setCookie:`${cookieName}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${new URL(request.url).protocol==="https:"?"; Secure":""}`})};
}
