export async function GET(){
 const agentId=process.env.DID_AGENT_ID,clientKey=process.env.DID_CLIENT_KEY;
 if(!agentId||!clientKey)return Response.json({error:"尚未配置实时数字人服务，可继续文字演练。"},{status:503});
 // Public D-ID client key scoped to the origin and agent, NOT the account API key.
 return Response.json({agentId,clientKey},{headers:{"Cache-Control":"no-store"}});
}
