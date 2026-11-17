import fs from 'node:fs';import {spawn} from 'node:child_process';
fs.mkdirSync('docs/course-sources/frames',{recursive:true});
const jobs=[['human-share',[0,20,40,65]],['human-pay',[0,50,100,190]],['human-job',[0,180,600,1200]],['animation-campus',[15,40]],['animation-wind',[15,40]],['animation-bird',[15]],['animation-pig',[15]],['animation-cards',[15]]];
for (const [id,times] of jobs){
 let url;if(fs.existsSync('docs/course-sources/'+id+'-video.json'))url=JSON.parse(fs.readFileSync('docs/course-sources/'+id+'-video.json')).hls_url;else{const html=fs.readFileSync('docs/course-sources/'+id+'.html','utf8');url=new URL(html.match(/<video[^>]+src="([^"]+)/)[1],'https://www.spp.gov.cn').href;}
 for(const t of times){await new Promise((resolve,reject)=>{const p=spawn('ffmpeg',['-loglevel','error','-ss',String(t),'-i',url,'-frames:v','1','-vf','scale=800:-1','-y',`docs/course-sources/frames/${id}-${t}.jpg`],{windowsHide:true});let err='';p.stderr.on('data',b=>err+=b);p.on('close',code=>code?reject(Error(id+': '+err.slice(0,300))):resolve());});console.log(id,t);}
}
