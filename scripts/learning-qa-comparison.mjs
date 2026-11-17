import sharp from 'sharp';import fs from 'node:fs';
const dir='docs/learning-redesign/qa';const gen='C:/Users/联想/.codex/generated_images/01a1b562-e25a-7881-8e1d-8153c5cac636/';
const pairs=[['courses','exec-2ffc27bf-ba92-47e9-9c72-ed9e9c264bdc.png'],['quiz','exec-2eef5c78-fd11-460f-999c-89ba6c7f042f.png'],['knowledge','exec-d96ec330-df70-420a-8250-37c86046ed66.png']];
const full=[],focus=[],meta=[];
for(const [i,[name,src]] of pairs.entries()){
 const a=gen+src,b=dir+'/'+name+'-desktop.png';const am=await sharp(a).metadata(),bm=await sharp(b).metadata();meta.push({name,source:a,sourceSize:[am.width,am.height],render:b,renderSize:[bm.width,bm.height]});
 for(const [j,file] of [a,b].entries()){
 full.push({input:await sharp(file).resize(720,540,{fit:'contain',background:'#f1f1ed'}).png().toBuffer(),left:j*720,top:i*570+30});
 focus.push({input:await sharp(file).extract({left:Math.round((j?0.18:0.16)*(j?bm.width:am.width)),top:Math.round(.22*(j?bm.height:am.height)),width:Math.floor(.81*(j?bm.width:am.width)),height:Math.round(.60*(j?bm.height:am.height))}).resize(720,400,{fit:'contain',background:'#f1f1ed'}).png().toBuffer(),left:j*720,top:i*430+30});
 }
 const label=Buffer.from(`<svg width="1440" height="30"><rect width="1440" height="30" fill="#173f32"/><text x="16" y="21" fill="white" font-size="17">${name}: approved concept (left) / implemented browser (right)</text></svg>`);full.push({input:label,left:0,top:i*570});focus.push({input:label,left:0,top:i*430});
}
await sharp({create:{width:1440,height:1710,channels:3,background:'white'}}).composite(full).png().toFile(dir+'/source-comparison.png');
await sharp({create:{width:1440,height:1290,channels:3,background:'white'}}).composite(focus).png().toFile(dir+'/focused-comparison.png');
fs.writeFileSync(dir+'/comparison-metadata.json',JSON.stringify(meta,null,2));
const mobile=[];for(const [i,n]of ['courses','quiz','knowledge'].entries())mobile.push({input:await sharp(dir+'/'+n+'-mobile.png').resize(375,844,{fit:'contain',background:'#faf9f5'}).toBuffer(),left:i*399,top:0});
await sharp({create:{width:1173,height:844,channels:3,background:'#deded4'}}).composite(mobile).png().toFile(dir+'/mobile-preview.png');
