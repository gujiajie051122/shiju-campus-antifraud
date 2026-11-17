import sharp from 'sharp';
import fs from 'node:fs';
const dir='docs/editorial-layout/qa';
const source='C:/Users/联想/.codex/generated_images/01a1b562-e25a-7881-8e1d-8153c5cac636/exec-6e125343-969c-4c86-b911-351b430ea866.png';
const render=dir+'/courses-reference-viewport.png';
const a=await sharp(source).metadata(),b=await sharp(render).metadata();
const imgs=[];
for(const [i,p]of [source,render].entries())imgs.push({input:await sharp(p).resize(744,530,{fit:'contain',background:'white'}).png().toBuffer(),left:744*i,top:0});
await sharp({create:{width:1488,height:530,channels:3,background:'white'}}).composite(imgs).png().toFile(dir+'/source-comparison.png');
const focus=[];
for(const [i,p]of [source,render].entries()){
 const m=i?b:a;
 const crop={left:Math.round(m.width*.06),top:Math.round(m.height*.14),width:Math.floor(m.width*.88),height:Math.floor(m.height*.58)};
 focus.push({input:await sharp(p).extract(crop).resize(900,600,{fit:'contain',background:'white'}).png().toBuffer(),left:900*i,top:0});
}
await sharp({create:{width:1800,height:600,channels:3,background:'white'}}).composite(focus).png().toFile(dir+'/focused-comparison.png');
const mobile=[];
for(const [i,name]of ['courses','quiz','knowledge','reader'].entries()){
 const p=dir+'/'+name+'-mobile.png';const m=await sharp(p).metadata();
 mobile.push({input:await sharp(p).extract({left:0,top:0,width:m.width,height:Math.min(m.height,1500)}).resize(390,1500,{fit:'contain',background:'white'}).png().toBuffer(),left:410*i,top:0});
}
await sharp({create:{width:1620,height:1500,channels:3,background:'#e8e8e8'}}).composite(mobile).png().toFile(dir+'/mobile-contact-sheet.png');
fs.writeFileSync(dir+'/comparison-metadata.json',JSON.stringify({source,sourcePixels:[a.width,a.height],render,renderPixels:[b.width,b.height],cssViewport:[1487,1058],normalization:'Equal 744x530 contain, white padding, no stretch. Focus: x .06w, y .14h, width .88w, height .58h; 900x600 contain.'},null,2));
