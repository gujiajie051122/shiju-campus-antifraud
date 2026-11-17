import fs from 'node:fs/promises';
for(let [id,url] of [
 ['love-police','https://www.bilibili.com/video/BV14e411b7SY/'],
 ['love-cat','https://www.bilibili.com/video/BV1kx4y1k7uL/'],
 ['rebate-mg','https://www.bilibili.com/video/BV1nS4y197V8/'],
 ['rebate-people','https://www.bilibili.com/video/BV1t8hG6FE53/'],
 ['service-safety','https://www.bilibili.com/video/BV1Lu4y1C7qk/'],
 ['ticket-police','https://www.bilibili.com/video/BV1dK4y1z7sS/'],
 ['series-journey','https://www.bilibili.com/video/BV1UP4y1s7ZK/'],
]){try{
 const r=await fetch(url,{signal:AbortSignal.timeout(20000)}),html=await r.text();
 await fs.writeFile('docs/course-sources/candidate-'+id+'.html',html);
 const next=html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
 const bili=html.match(/window\.__INITIAL_STATE__=([\s\S]*?);\(function/)?.[1];
 if(next){const d=JSON.parse(next).props.pageProps.detailData;await fs.writeFile('docs/course-sources/candidate-'+id+'.json',JSON.stringify(d,null,2));console.log(id,JSON.stringify(d).slice(0,9500));}
 else if(bili){let d=JSON.parse(bili);await fs.writeFile('docs/course-sources/candidate-'+id+'.json',JSON.stringify(d.videoData,null,2));console.log(id,JSON.stringify(d.videoData).slice(0,1800));}
 else console.log(id,r.status,html.match(/.{0,60}(mp4|iframe|og:image|video src).{0,200}/gi)?.slice(0,8));
 }catch(e){console.log(id,e.message);}}
