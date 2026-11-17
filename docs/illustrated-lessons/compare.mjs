import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const here=fileURLToPath(new URL('./',import.meta.url));
const reference='C:/Users/联想/.codex/generated_images/01a1b562-e25a-7881-8e1d-8153c5cac636/';
const metadata={};
async function compare(name,source,actual,regions){
  const input=[source,actual];
  const images=[];
  metadata[name]=[];
  for(let i=0;i<2;i++){
    const meta=await sharp(input[i]).metadata();
    metadata[name].push({file:input[i],width:meta.width,height:meta.height,crop:regions?.[i]??null});
    let pic=sharp(input[i]);
    if(regions)pic=pic.extract(regions[i]);
    images.push(await pic.resize(regions?550:800,regions?520:640,{fit:'contain',background:'#faf9f5'}).png().toBuffer());
  }
  await sharp({create:{width:regions?1100:1600,height:regions?520:640,channels:3,background:'#faf9f5'}}).composite(images.map((input,i)=>({input,left:i*(regions?550:800),top:0}))).png().toFile(here+'qa/'+name+'.png');
}
await compare('catalog-comparison-final',reference+'exec-d54b67e4-2107-4da8-83f2-3a2a414bea9e.png',here+'qa/catalog-desktop-final.png');
await compare('reader-comparison-final',reference+'exec-46735e5a-5245-40c3-bbec-f0771003960e.png',here+'qa/reader-desktop-final.png');
await compare('reader-detail-comparison',reference+'exec-46735e5a-5245-40c3-bbec-f0771003960e.png',here+'qa/reader-desktop-final.png',[{left:840,top:320,width:550,height:520},{left:830,top:328,width:550,height:520}]);
await writeFile(here+'qa/comparison-metadata.json',JSON.stringify(metadata,null,2));
