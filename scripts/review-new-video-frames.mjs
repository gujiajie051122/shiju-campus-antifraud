import fs from 'node:fs/promises';import {spawn} from 'node:child_process';import sharp from 'sharp';
const ai=await fs.readFile('docs/course-sources/candidate-ai.html','utf8');
const embassy=await fs.readFile('docs/course-sources/embassy.html','utf8');
const trade=await fs.readFile('docs/course-sources/trade-mg.html','utf8');
const cctv=JSON.parse(await fs.readFile('docs/course-sources/catalog-cctv-audit.json'));
const jobs=[
 ['animation-ai-tianyu',new URL(ai.match(/<video[^>]+src="([^"]+)/)[1],'https://www.spp.gov.cn').href,18],
 ['animation-job-embassy',embassy.match(/https:\/\/svideo[^"'<>\s]+\.mp4/)[0],25],
 ['animation-trade-offline',trade.match(/<video[^>]+src="([^"]+)/)[1].replace('http:','https:').replaceAll('&amp;','&'),20],
 ['animation-bear',cctv.find(x=>x.id==='animation-bear').hls,30],
 ['human-trade-online',cctv.find(x=>x.id==='human-trade-online').hls,20],
];
await fs.mkdir('docs/course-sources/new-frames',{recursive:true});
const tiles=[];
for(let i=0;i<jobs.length;i++){const [id,url,time]=jobs[i],file=`docs/course-sources/new-frames/${id}.jpg`;
 await new Promise((resolve,reject)=>{const p=spawn('ffmpeg',['-loglevel','error','-rw_timeout','18000000','-ss',String(time),'-i',url,'-frames:v','1','-vf','scale=1280:-1','-y',file],{windowsHide:true});let err='';p.stderr.on('data',b=>err+=b);p.on('close',code=>code?reject(Error(id+': '+err.slice(0,250))):resolve());});
 tiles.push({input:await sharp(file).resize(400,260,{fit:'contain'}).toBuffer(),left:i%3*400,top:Math.floor(i/3)*290});
 tiles.push({input:Buffer.from(`<svg width="400" height="30"><rect width="400" height="30" fill="white"/><text x="8" y="20" font-size="16">${id}</text></svg>`),left:i%3*400,top:Math.floor(i/3)*290+260});console.log(id);
}
await sharp({create:{width:1200,height:580,channels:3,background:'white'}}).composite(tiles).png().toFile('docs/course-sources/new-frame-contact.png');
