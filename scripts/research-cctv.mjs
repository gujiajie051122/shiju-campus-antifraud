import fs from 'node:fs/promises';
const qs=process.argv.slice(2);
await Promise.all(qs.map(async(q)=>{let u=new URL('https://search.cctv.com/ifsearch.php');u.search=new URLSearchParams({page:'1',qtext:q,sort:'relevance',pageSize:'20',type:'video',vtime:'-1',datepid:'1',channel:'',pageflag:'0',qtext_str:q});let r=await(await fetch(u)).json();await fs.writeFile('docs/course-sources/search-'+encodeURIComponent(q)+'.json',JSON.stringify(r,null,2));console.log(q,r.total);for(let x of r.list||[])console.log(x.all_title+' | '+x.urllink)}));

