export async function readJSON(request:Request,max=16000):Promise<{value:unknown}|{response:Response}>{
 if(request.headers.get("origin")&&request.headers.get("origin")!==new URL(request.url).origin)return {response:Response.json({error:"请求来源不匹配"},{status:403})};
 const reader=request.body?.getReader();if(!reader)return {response:Response.json({error:"请求内容为空"},{status:400})};const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();return {response:Response.json({error:"内容过长"},{status:413})};}chunks.push(value);}const all=new Uint8Array(size);let offset=0;for(const c of chunks){all.set(c,offset);offset+=c.byteLength;}return {value:JSON.parse(new TextDecoder().decode(all))};}
 catch{return {response:Response.json({error:"请求格式错误"},{status:400})};}finally{reader.releaseLock();}
}
