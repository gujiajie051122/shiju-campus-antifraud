import fs from 'node:fs';
const seeds=[
['human-rebate','真人讲解','刷单返利','民警讲解：到底什么是刷单？','https://tv.cctv.com/2022/08/12/VIDEOHx2QIiS2y31UNFklEeQ220812.shtml'],
['human-share','真人讲解','冒充客服','民警演示：屏幕共享的风险','https://tv.cctv.com/2025/04/23/VIDEvQISBZJT1zQu7ons16L2250423.shtml'],
['human-pay','真人讲解','冒充客服','民警演示：远程支付的小细节','https://tv.cctv.com/2026/01/20/VIDE4ktBclsmPZEqNSgUl7DJ260120.shtml'],
['human-face','真人讲解','交友与AI伪造','警方解读：AI换脸如何被用于行骗','https://tv.cctv.com/2025/06/30/VIDEnHyXlnhoPxe3VdOaW4ou250630.shtml'],
['human-job','真人讲解','求职兼职','今日说法：高薪招工的幌子','https://tv.cctv.com/2026/05/20/VIDE2IQwh5XQBfJRm5V1WPA6260520.shtml'],
['animation-campus','动画教学','求职兼职','定格动画：学生反诈必修课','https://news.cctv.com/2025/08/29/ARTIo4lLLjiWBfI8Zn9fysQ1250829.shtml'],
['animation-wind','动画教学','交友与AI伪造','反电信网络诈骗动画：反诈风云','https://tv.cctv.com/2021/11/20/VIDE4yjQNmP05DTn51wiGkCc211120.shtml'],
['animation-bird','动画教学','刷单返利','骗局粉碎机：刷单杀鸟盘','https://www.spp.gov.cn/spp/2023lhzq/202303/t20230301_605697.shtml'],
['animation-pig','动画教学','交友与AI伪造','骗局粉碎机：爱情杀猪盘','https://www.spp.gov.cn/spp/2023lhzq/202302/t20230228_605700.shtml'],
['animation-cards','动画教学','求职兼职','骗局粉碎机：警惕出借银行卡','https://www.spp.gov.cn/spp/2023qglh/202302/t20230227_606059.shtml']
];
fs.mkdirSync('docs/course-sources',{recursive:true});
const results=[];
for(const [id,format,topic,title,url] of seeds){
 const response=await fetch(url);if(!response.ok)throw Error(id+' HTTP '+response.status); const html=await response.text();
 fs.writeFileSync('docs/course-sources/'+id+'.html',html);
 const articleId=url.match(/_(\d+)\.shtml/)?.[1];
 const articleImage=[...html.matchAll(/<img[^>]+src=["']([^"']+)/gi)].map(m=>m[1]).find(s=>articleId&&s.includes(articleId+'/images/'));
 const cover=html.match(/commentimg1\s*=\s*["']([^"']+)/)?.[1] || articleImage || html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]*fmspic[^"]+)/)?.[1];
 if(!cover)throw Error('No verified article/video cover: '+id);
 const poster=new URL(cover,url).href;
 results.push({id,format,topic,title,url,poster,source:url.includes('spp.gov')?'最高人民检察院':'央视网'});
 const image=await fetch(poster);if(!image.ok)throw Error(id+' poster HTTP '+image.status);
 fs.writeFileSync('docs/course-sources/'+id+'.jpg',Buffer.from(await image.arrayBuffer()));
 console.log(id,poster);
}
fs.writeFileSync('lib/video-courses.ts','// Public source pages; watch on the original website. No redistribution license inferred.\nexport const videoCourses = '+JSON.stringify(results,null,2)+';\n');
