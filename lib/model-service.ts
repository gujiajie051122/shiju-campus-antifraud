// Server-only transport: never import in client components.
export type ModelTelemetry={status?:number;promptTokens?:number;completionTokens?:number;totalTokens?:number};
export type ModelConfig={base:string;key:string;model:string;format:"schema"|"json";enableThinking?:boolean;observe?:(event:ModelTelemetry)=>void};
export function tokenTelemetry(raw:unknown):ModelTelemetry{
 if(!raw||typeof raw!=="object")return {};
 const u=raw as Record<string,unknown>,n=(v:unknown)=>typeof v==="number"&&Number.isSafeInteger(v)&&v>=0&&v<=10000000?v:undefined;
 const promptTokens=n(u.prompt_tokens),completionTokens=n(u.completion_tokens),totalTokens=n(u.total_tokens);
 if(promptTokens!==undefined&&completionTokens!==undefined&&totalTokens!==undefined&&promptTokens+completionTokens!==totalTokens)return {};
 return {...(promptTokens===undefined?{}:{promptTokens}),...(completionTokens===undefined?{}:{completionTokens}),...(totalTokens===undefined?{}:{totalTokens})};
}
export function modelConfig(env:Record<string,string|undefined>=process.env):ModelConfig|null{
 const {LLM_BASE_URL:base,LLM_API_KEY:key,LLM_MODEL:model}=env;if(!base||!key||!model)return null;
 const url=new URL(base);if(url.protocol!=="https:"||url.username||url.password||url.search||url.hash)throw Error("Invalid model endpoint");
 return {base:base.replace(/\/$/,""),key,model,format:env.LLM_OUTPUT_FORMAT==="json"?"json":"schema"};
}
export async function completeJSON(config:ModelConfig,system:string,payload:unknown,schema:Record<string,unknown>,name:string,signal?:AbortSignal,transport:typeof fetch=fetch):Promise<unknown>{
 const response=await transport(config.base+"/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+config.key},signal:AbortSignal.any([AbortSignal.timeout(18000),...(signal?[signal]:[])]),body:JSON.stringify({model:config.model,stream:false,...(config.enableThinking===undefined?{}:{enable_thinking:config.enableThinking}),messages:[{role:"system",content:system},{role:"user",content:JSON.stringify(payload)}],response_format:config.format==="json"?{type:"json_object"}:{type:"json_schema",json_schema:{name,strict:true,schema}}})});
 config.observe?.({status:response.status});
 if(!response.ok)throw Error("Model request failed");const raw=await response.text();if(raw.length>40000)throw Error("Model response too large");
 const data=JSON.parse(raw) as {usage?:unknown;choices?:{finish_reason?:string;message?:{content?:string;refusal?:unknown}}[]};config.observe?.(tokenTelemetry(data.usage));const choice=data.choices?.[0];
 if(choice?.finish_reason!=="stop"||choice.message?.refusal||typeof choice?.message?.content!=="string")throw Error("Incomplete or refused model output");return JSON.parse(choice.message.content);
}
