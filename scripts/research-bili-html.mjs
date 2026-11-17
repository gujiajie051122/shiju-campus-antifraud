import fs from 'node:fs/promises';
for(const q of process.argv.slice(2)){
 let t=await(await fetch('https://search.bilibili.com/all?keyword='+encodeURIComponent(q))).text();
 await fs.writeFile('docs/course-sources/bilis-'+encodeURIComponent(q)+'.html',t);
 let out=[];
 for(let c of t.split('class="bili-video-card__wrap"').slice(1)){
  let bvid=c.match(/video\/(BV\w+)\//)?.[1],title=c.match(/<h3[^>]*title="([^"]*)"/)?.[1],author=c.match(/class="bili-video-card__info--author"[^>]*>([^<]*)/)?.[1],poster=c.match(/(?:src|data-src)="(\/\/i[^\"]+)"/)?.[1];
  if(bvid)out.push({bvid,title,author,poster});
 }
 await fs.writeFile('docs/course-sources/bilis-'+encodeURIComponent(q)+'.json',JSON.stringify(out,null,2));console.log('\n'+q,JSON.stringify(out));
}
