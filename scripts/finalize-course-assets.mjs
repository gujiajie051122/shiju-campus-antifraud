import fs from 'node:fs/promises';import sharp from 'sharp';
import {videoCourses} from '../lib/video-courses.ts';
for(const id of ['human-trade-online','animation-bear'])await sharp(`docs/course-sources/new-frames/${id}.jpg`).webp({quality:90}).toFile(`public/course-posters/${id}.webp`);
const topics=[...new Set(videoCourses.map(v=>v.topic))];
let doc='# 课程视频核验记录\n\n本轮以内容匹配、原站可观看和教学形式准确为收录条件。相同视频不跨专题重复计数。视频链接用于原站观看，未推定转载授权。数量为实际收录，不承诺每类动画五条。\n\n| 专题 | 真人讲解 / 案件解析 | 动画教学 |\n|---|---:|---:|\n';
for(const topic of topics)doc+=`| ${topic} | ${videoCourses.filter(v=>v.topic===topic&&v.format==='真人讲解').length} | ${videoCourses.filter(v=>v.topic===topic&&v.format==='动画教学').length} |\n`;
doc+='\n图文微课仍为每专题五节。购票暂未收录通过匹配与播放核验的动画，不以真人短剧、静态漫画或其他题材补齐。\n\n核验依据：`catalog-cctv-audit.json`（视频标识、时长、封面尺寸）、`catalog-animation-audit.json`（发布者、视频地址与形式说明）。原有视频出处见 `lib/video-courses.ts`。\n\n筛除记录：\n- “警惕出借银行卡”：与求职专题关联不足，移出专题目录；学生定格动画按其刷单内容归入刷单专题，不重复计数。\n- “反诈风云”：题材归属不足以支持原先的交友分类，移出专题目录。\n- “反诈森林——机票退改签诈骗”“警惕购票骗局”“反诈宣传视频5：假冒客服”：原画面为真人，未充作动画。\n- 建德妇联、上海检察部分澎湃转载页：只有图片和文字，未保留可播放视频，未作为视频课程。\n- 北京政法网“守好银行卡”动画：来源明确，但其嵌入播放器本轮返回连接超时，暂未收录。\n- 香港警方动画：教学形式匹配，但原站跳转YouTube，未纳入本轮面向内地的可用视频目录。\n\n注意：真人讲解分类包含新闻主播、民警解读和案件报道，不等同于完整系统课程。使馆动画涉及境外求职环境；数字人“天妤”以实拍剧情为主，本轮未作为动画收录。\n';
await fs.writeFile('docs/course-sources/README.md',doc);console.log(doc);
