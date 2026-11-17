import sharp from 'sharp';
import fs from 'node:fs';
const root='C:/Users/联想/.codex/generated_images/01a1b562-e25a-7881-8e1d-8153c5cac636/';
await sharp(root+'exec-a84aea15-ec81-4137-a1c5-a9e38ac9333f.png').resize({width:1800,withoutEnlargement:true}).webp({quality:88}).toFile('public/design/chat-campus.webp');
await sharp(root+'exec-1e9cb034-4762-40de-93ba-9f63463c294f.png').resize(160,160,{fit:'cover'}).webp({quality:90}).toFile('public/design/chat-recruiter.webp');
await sharp(root+'exec-a85233d1-2a34-45b6-bf75-5a738f6fec11.png').resize(160,160,{fit:'cover'}).webp({quality:90}).toFile('public/design/chat-student.webp');
fs.mkdirSync('docs/chat-redesign',{recursive:true});
fs.copyFileSync(root+'exec-700af4fe-6679-4592-841d-a43e143126f0.png','docs/chat-redesign/reference.png');
