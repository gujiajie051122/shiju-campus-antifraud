import fs from 'node:fs/promises';
import sharp from 'sharp';
import {videoCourses} from '../lib/video-courses.ts';

// Each row is an independently selected source, not a search-result placeholder.
const seeds=[
['human-trade-cut','二手交易','二手交易“到手刀”：伪装成纠纷的诈骗','2026/11/05/VIDEDXmhZmVvpt2GrEG2f6aO261105'],
['human-trade-recycle','二手交易','高价回收手机？二手交易要留好凭证','2026/06/08/VIDEWaqBwC8tqGexVkTNQu0V260608'],
['human-trade-trap','二手交易','今日说法：交易陷阱','2022/09/04/VIDEHIF4ICfJRWRujjD1BXGs220904'],
['human-trade-online','二手交易','网上买二手物品，为何落入诈骗圈套？','2020/08/17/VIDE4rDCruQNQKsHyWb44Way200817'],
['human-trade-hotel','二手交易','二手平台订酒店，警惕交易陷阱','2021/09/01/VIDEEOXlVn9sCw9dkufcymND210901'],
['human-ticket-channel','购票骗局','演唱会购票：别信“内部渠道”','2025/07/22/VIDEeEDXjNC7ylXcCrCGaoDN250722'],
['human-ticket-agent','购票骗局','公安部提醒：代买门票有哪些套路？','2025/08/04/VIDEIcC805CVu9ZwP12GoVKW250804'],
['human-ticket-transfer','购票骗局','警惕“含泪转让”门票的骗局','2024/07/05/VIDEuHLxAFrJCZErJAV2wgPv240705'],
['human-ticket-fan','购票骗局','“饭圈大粉”的低价门票可信吗？','2024/09/09/VIDEDKqjp6FxWaBB75bdxdKk240909'],
['human-ticket-shanghai','购票骗局','谎称有渠道代买门票，十三人被骗','2024/07/04/VIDEbwz1gorQBDvcrULAXhmb240704'],
['human-job-check','求职兼职','求职诈骗套路多，这些陷阱要警惕','2025/02/13/VIDEHKzoC8jysq8OXARTrabU250213'],
['human-job-driver','求职兼职','应聘司机，怎么变成了租车？','2025/11/25/VIDEsluOImpFiFrLEU00zGD8251125'],
['human-job-interview','求职兼职','网上求职面试，为何被刷走四万元？','2026/11/10/VIDE8h2QquiHcVGeuygtGGDt261110'],
['human-job-live','求职兼职','网络直播招聘背后的骗局','2021/04/14/VIDEagM1ZnBVM2zkx9bXRIdS210414'],
['human-rebate-donate','刷单返利','“爱心捐赠”怎么变成了刷单诈骗？','2026/09/17/VIDE7fu6kKhZz5mdq3W1g8de260917'],
['human-rebate-salary','刷单返利','轻信“高薪刷单”之后','2025/11/20/VIDEPgDiHi7lqDxpO6wOCU7X251120'],
['human-rebate-launder','刷单返利','误入刷单骗局，还成了洗钱工具','2026/05/22/VIDEw0iry3VnPpPjHSjsZsCU260522'],
['human-rebate-pattern','刷单返利','警方拆解：刷单返利的两种套路','2023/11/04/VIDE5wwgYBdPKNNpDSuQ1Mng231104'],
['human-service-pattern','冒充客服','假客服的五大典型骗术','2025/12/26/VIDEs53MRnEhQ7MoYxnylOZf251226'],
['human-service-member','冒充客服','冒充客服，诱导关闭“会员”','2026/03/29/VIDEImwTnGctF7SKUdz9mfEP260329'],
['human-service-refund','冒充客服','网购退款，怎么被骗了六十五万元？','2023/06/22/VIDEgCraOExrhJTbDtzDSFBD230622'],
['human-face-love','交友与AI伪造','AI换脸包装的网恋骗局','2026/09/22/VIDEzg5T2bbOn52rOrACLZvB260922'],
['human-face-test','交友与AI伪造','AI换脸诈骗：检测预警技术能做什么？','2024/08/18/VIDEMRSmg4vX0taMx5xUr8Lu240818'],
['human-love-bait','交友与AI伪造','婚恋骗局：被“小甜头”一步步套牢','2026/06/15/VIDEnGKFhDoTBBoNv0wIkAyh260615'],
['human-face-trust','交友与AI伪造','眼见未必为实：警惕AI换脸诈骗','2026/04/14/VIDEBDddSIrwOY9Do9AOiVDh260414'],
['animation-bear','刷单返利','“熊出没”反诈小课堂：光头强提醒防刷单','2024/02/06/VIDEoAyjknVUKau1kJdqyVe2240206'],
];
const results=videoCourses.filter(v=>v.id!=='animation-wind'&&!seeds.some(s=>s[0]===v.id));
const audit=[];
await fs.mkdir('public/course-posters',{recursive:true});
for(let start=0;start<seeds.length;start+=5){
 const batch=await Promise.all(seeds.slice(start,start+5).map(async([id,topic,title,path])=>{
  const url=`https://tv.cctv.com/${path}.shtml`;
  const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(`${id}: ${r.status}`);
  const html=await r.text();
  const guid=html.match(/var\s+guid\s*=\s*["']([^"']+)/)?.[1];
  const coverRaw=html.match(/commentimg1?\s*=\s*["']([^"']+)/)?.[1];
  const cover=coverRaw?new URL(coverRaw,url).href:undefined;
  const sourceTitle=html.match(/<title>([^<]+)/)?.[1];
  if(!guid||!cover)throw Error(id+': no actual video or cover');
  const info=await(await fetch('https://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid='+guid,{signal:AbortSignal.timeout(25000)})).json();
  if(!info.hls_url||!Number(info.video?.totalLength))throw Error(id+': no playable video');
  const image=await fetch(cover,{signal:AbortSignal.timeout(25000)});if(!image.ok)throw Error(id+': cover unavailable');
  const buffer=Buffer.from(await image.arrayBuffer()),meta=await sharp(buffer).metadata();
  await sharp(buffer).resize({width:1200,withoutEnlargement:true}).webp({quality:90}).toFile(`public/course-posters/${id}.webp`);
  return {course:{id,format:id.startsWith('animation')?'动画教学':'真人讲解',topic,title,url,poster:`/course-posters/${id}.webp`,source:'央视网'},audit:{id,url,sourceTitle,guid,duration:Number(info.video.totalLength),cover,width:meta.width,height:meta.height,hls:info.hls_url}};
 }));
 for(const b of batch){results.push(b.course);audit.push(b.audit);console.log(b.audit.id,b.audit.sourceTitle,b.audit.width+'x'+b.audit.height);}
}
await fs.writeFile('docs/course-sources/catalog-cctv-audit.json',JSON.stringify(audit,null,2));
await fs.writeFile('lib/video-courses.ts','// Verified source videos; watch on the original website. No redistribution license inferred.\nexport const videoCourses = '+JSON.stringify(results,null,2)+';\n');
