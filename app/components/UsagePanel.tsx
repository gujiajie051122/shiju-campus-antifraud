"use client";
import {useEffect,useState} from "react";
type Usage={remaining?:number;used?:number;limit:number;message:string;requiresSignIn?:boolean;succeeded?:number;failures?:number;tokens?:number|null;unknownTokens?:number};
export function UsagePanel(){
 const [usage,setUsage]=useState<Usage|null>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{const controller=new AbortController();void fetch("/api/usage",{signal:controller.signal,cache:"no-store"}).then(async r=>{if(!r.ok)throw Error();return await r.json() as Usage;}).then(setUsage).catch(()=>{if(!controller.signal.aborted)setFailed(true);});return()=>controller.abort();},[]);
 return <div className="usage-panel" aria-live="polite"><div className="usage-heading"><strong>今日智能回复</strong><span>{usage?.remaining===undefined?"":`${usage.remaining} / ${usage.limit} 次可用`}</span></div><p>{usage?.message??(failed?"暂时无法读取用量，仍可继续预设演练。":"正在读取用量…")}</p>{usage?.requiresSignIn&&<a href="/signin-with-chatgpt?return_to=%2F" target="_top">登录后使用智能回复</a>}{usage?.remaining!==undefined&&<><small>北京时间每日零点恢复；预设回复不占额度。</small><details><summary>查看用量说明</summary><p>今日请求 {usage.used} 次，模型回复 {usage.succeeded} 次，异常或回退 {usage.failures} 次。已报告用量：{usage.tokens===null?"暂无":`${usage.tokens?.toLocaleString()} Token`}{usage.unknownTokens?`；${usage.unknownTokens} 次未报告用量`:""}。</p><p>失败请求也可能产生费用，因此计入次数。只记录调用状态和用量，不保存交流内容。</p></details></>}</div>;
}
