import type {AgentManager} from "@d-id/client-sdk";
export type AvatarSignal={type:"connection"|"video"|"error";value:string};
export class LiveAvatar{
 private agent?:AgentManager;private generation=0;
 async connect(video:HTMLVideoElement,signal:(s:AvatarSignal)=>void){
  const ticket=++this.generation,r=await fetch("/api/avatar",{cache:"no-store"}),c=await r.json() as {error?:string;agentId:string;clientKey:string};
  if(!r.ok)throw Error(c.error||"服务未配置");
  const sdk=await import("@d-id/client-sdk");
  const agent=await sdk.createAgentManager(c.agentId,{auth:{type:"key",clientKey:c.clientKey},callbacks:{
   onSrcObjectReady:stream=>{if(ticket===this.generation){video.srcObject=stream;void video.play().catch(()=>signal({type:"error",value:"请点击视频允许播放。"}));}},
   onConnectionStateChange:state=>{if(ticket===this.generation)signal({type:"connection",value:state});},
   onVideoStateChange:state=>{if(ticket===this.generation)signal({type:"video",value:state});},
   onError:()=>{if(ticket===this.generation)signal({type:"error",value:"数字人连接异常，请重试或切换文字。"});}
  }});
  if(ticket!==this.generation){await agent.disconnect();return;}
  this.agent=agent;await agent.connect();if(ticket!==this.generation)await agent.disconnect();
 }
 get connected(){return this.agent?.getConnectionState()==="connected";}
 interrupt(){if(this.agent?.isInterruptAvailable())this.agent.interrupt();}
 async speak(text:string){if(!this.connected)throw Error("数字人尚未连接");await this.agent!.speak({type:"text",input:text});}
 async stop(){if(this.agent?.isInterruptAvailable())this.agent.interrupt();await this.disconnect();}
 async disconnect(){++this.generation;const a=this.agent;this.agent=undefined;if(a)await a.disconnect();}
}
