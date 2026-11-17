import sharp from 'sharp';import fs from 'node:fs';
const files=fs.readdirSync('docs/course-sources/frames').filter(x=>x.endsWith('.jpg'));
const tiles=[];
for(let i=0;i<files.length;i++){let x=i%4*400,y=Math.floor(i/4)*255;tiles.push({input:await sharp('docs/course-sources/frames/'+files[i]).resize(400,225,{fit:'contain'}).toBuffer(),left:x,top:y});tiles.push({input:Buffer.from(`<svg width="400" height="30"><rect width="400" height="30" fill="white"/><text x="10" y="21" font-size="18">${files[i]}</text></svg>`),left:x,top:y+225});}
await sharp({create:{width:1600,height:Math.ceil(files.length/4)*255,channels:3,background:'white'}}).composite(tiles).png().toFile('docs/course-sources/frame-contact.png');
await sharp('public/design/question-desk.png').resize({width:1536,withoutEnlargement:true}).webp({quality:85}).toFile('public/design/question-desk.webp');
