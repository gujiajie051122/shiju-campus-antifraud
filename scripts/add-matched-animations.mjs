import fs from 'node:fs/promises';import sharp from 'sharp';
import {videoCourses} from '../lib/video-courses.ts';
const entries=[];const audit=[];
async function add(course,poster,proof){
 let b;if(poster.startsWith('docs/'))b=await fs.readFile(poster);else{const r=await fetch(poster,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(course.id+' cover '+r.status);b=Buffer.from(await r.arrayBuffer());}
 const m=await sharp(b).metadata();
 await sharp(b).resize({width:1200,withoutEnlargement:true}).webp({quality:90}).toFile(`public/course-posters/${course.id}.webp`);
 entries.push({...course,format:'动画教学',poster:`/course-posters/${course.id}.webp`});
 audit.push({id:course.id,url:course.url,poster,width:m.width,height:m.height,...proof});
}
for(const [key,id,topic,title] of [
 ['rebate-mg','animation-rebate-mg','刷单返利','MG动画：刷单？有诈！'],
 ['rebate-people','animation-rebate-dog','刷单返利','动画提醒：别乱点链接，别轻信刷单返利'],
 ['service-game','animation-service-game','冒充客服','和平反诈小剧场：冒充客服恐吓退款'],
]){const d=JSON.parse(await fs.readFile(`docs/course-sources/candidate-${key}.json`));
 if(d.state!==0||!d.duration)throw Error(key+' unavailable');
 await add({id,topic,title,url:`https://www.bilibili.com/video/${d.bvid}/`,source:d.owner.name},d.pic.replace('http:','https:'),{sourceTitle:d.title,publisher:d.owner.name,duration:d.duration,videoSize:d.dimension});
}
const embassy='https://gb.china-embassy.gov.cn/lsfw_137163/lsbhyxz/lstx/202602/t20260216_11860785.htm';
const html=await fs.readFile('docs/course-sources/embassy.html','utf8');
const mp4=html.match(/https:\/\/svideo[^"'<>\s]+\.mp4/)?.[0];
const poster=html.match(/https:\/\/svideo[^"'<>\s]+\.jpg/)?.[0];
if(!mp4||!poster)throw Error('Embassy missing actual animation');
await add({id:'animation-job-embassy',topic:'求职兼职',title:'反诈动画：警惕虚假招聘与交友',url:embassy,source:'中国驻英国使馆'},poster,{video:mp4,note:'使馆系列动画第三集；只收录一次，归入求职专题。涉及境外求职环境。'});
const trade='https://rizhao.dzwww.com/caijing/lcwq/202502/t20250205_15480420.html';
const tradeHtml=await fs.readFile('docs/course-sources/trade-mg.html','utf8');
const tradeVideo=tradeHtml.match(/<video[^>]+poster="([^"]+)"[^>]+src="([^"]+)"/);
if(!tradeVideo)throw Error('Trade missing actual video');
await add({id:'animation-trade-offline',topic:'二手交易',title:'MG动画：线下二手交易，小心惹祸上身',url:trade,source:'大众网'},tradeVideo[1].replace('http:','https:'),{video:tradeVideo[2].replace('http:','https:').replaceAll('&amp;','&')});
await fs.writeFile('docs/course-sources/catalog-animation-audit.json',JSON.stringify(audit,null,2));
const all=[...videoCourses.filter(v=>v.id!=='animation-ai-tianyu'&&!entries.some(e=>e.id===v.id)),...entries];
await fs.writeFile('lib/video-courses.ts','// Verified source videos; watch on the original website. No redistribution license inferred.\nexport const videoCourses = '+JSON.stringify(all,null,2)+';\n');
console.log('Added',entries.map(e=>e.id));
