import fs from 'node:fs';
const url='https://p3.img.cntv.cn/photoworkspace/contentimg/2026/04/18/2026041810580469002.jpg';fs.writeFileSync('docs/course-sources/trade.jpg',Buffer.from(await(await fetch(url)).arrayBuffer()));
