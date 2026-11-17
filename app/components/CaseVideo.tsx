"use client";
import {useEffect,useRef,useState} from "react";

export type VideoState="loading"|"playing"|"paused"|"error";

export function CaseVideo({src,poster,preview=false,onState,onEnd}:{src:string;poster?:string;preview?:boolean;onState:(state:VideoState)=>void;onEnd:()=>void}){
 const ref=useRef<HTMLVideoElement>(null),callbacks=useRef({onState,onEnd});
 const [time,setTime]=useState(0),[duration,setDuration]=useState(0);
 const clock=(seconds:number)=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,"0")}`;
 callbacks.current={onState,onEnd};
 useEffect(()=>{
  const video=ref.current;if(!video)return;
  let disposed=false,suspended=false,destroy=()=>{};
  const fail=()=>{if(!disposed){video.pause();callbacks.current.onState("error");}};
  const playing=()=>{clearTimeout(timeout);if(!disposed)callbacks.current.onState("playing");};
  const paused=()=>{if(!disposed)callbacks.current.onState("paused");};
  const ended=()=>{if(!disposed)callbacks.current.onEnd();};
  // Do not let a late manifest/play promise restart audio after focus is lost.
  const suspend=()=>{suspended=true;video.pause();};
  const visibility=()=>{if(document.hidden)suspend();};
  const timeout=setTimeout(()=>{if(!disposed&&!suspended&&video.readyState<3)fail();},18000);
  const play=()=>{
   if(disposed||suspended||document.hidden)return;
   void video.play().then(()=>{if(disposed||suspended)video.pause();}).catch(error=>{
    if(disposed||suspended)return;
    // Sound autoplay may be refused; the native play button remains usable.
    if(error?.name==="NotAllowedError")callbacks.current.onState("paused");else fail();
   });
  };
  video.muted=preview;
  video.addEventListener("playing",playing);video.addEventListener("pause",paused);video.addEventListener("error",fail);video.addEventListener("ended",ended);
  window.addEventListener("blur",suspend);window.addEventListener("pagehide",suspend);document.addEventListener("visibilitychange",visibility);
  if(video.canPlayType("application/vnd.apple.mpegurl")){video.src=src;play();}
  else void import("hls.js").then(({default:Hls})=>{
   if(disposed)return;if(!Hls.isSupported()){fail();return;}
   const hls=new Hls({maxBufferLength:20,maxMaxBufferLength:40,startLevel:-1,abrEwmaDefaultEstimate:4_000_000,capLevelToPlayerSize:true});
   destroy=()=>hls.destroy();hls.on(Hls.Events.MANIFEST_PARSED,play);hls.on(Hls.Events.ERROR,(_event,data)=>{if(data.fatal)fail();});
   hls.loadSource(src);hls.attachMedia(video);
  }).catch(fail);
  return()=>{
   disposed=true;clearTimeout(timeout);
   window.removeEventListener("blur",suspend);window.removeEventListener("pagehide",suspend);document.removeEventListener("visibilitychange",visibility);
   video.removeEventListener("playing",playing);video.removeEventListener("pause",paused);video.removeEventListener("error",fail);video.removeEventListener("ended",ended);
   video.pause();destroy();video.removeAttribute("src");video.load();
  };
 },[src,preview]);
 const video=<video ref={ref} className={preview?"case-video":"case-player-video"} poster={poster} controls={!preview} muted={preview} playsInline preload="metadata" onTimeUpdate={e=>setTime(e.currentTarget.currentTime)} onDurationChange={e=>{const value=e.currentTarget.duration;setDuration(Number.isFinite(value)?value:0);}} aria-label={preview?"案例静音预览":"案例报道播放器"}/>;
 if(preview)return video;
 return <>{video}<div className="case-player-timeline"><time>{clock(time)}</time><input type="range" aria-label="视频播放进度" min={0} max={duration||0} step={0.1} value={Math.min(time,duration)} disabled={!duration} onChange={e=>{if(ref.current){ref.current.currentTime=Number(e.target.value);setTime(Number(e.target.value));}}}/><time>{clock(duration)}</time></div></>;
}
