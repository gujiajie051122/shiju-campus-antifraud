import fs from 'node:fs';
for(const id of ['human-share','human-pay','human-job','animation-campus','animation-wind','animation-bird','animation-pig','animation-cards']){
 const html=fs.readFileSync('docs/course-sources/'+id+'.html','utf8');
 const guid=html.match(/var\s+guid\s*=\s*["']([^"']+)/)?.[1]||html.match(/videoCenterId[^"']*["']([a-f0-9]{32})/)?.[1];
 if(guid){const data=await(await fetch('https://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid='+guid)).json();fs.writeFileSync('docs/course-sources/'+id+'-video.json',JSON.stringify(data));console.log(id,JSON.stringify({guid,hls:data.hls_url,duration:data.video?.totalLength}));}else console.log(id,html.match(/<video[^>]+src="([^"]+)/)?.[1]);
}
