import type { Metadata } from "next";
import "./globals.css";
import "./case-home.css";
import "./learning.css";
import "./brand.css";
import "./modules.css";
import "./learning-redesign.css";
import "./illustrated-lessons.css";
import "./editorial-theme.css";
import "./job-case.css";
import "./job-chat.css";
import "./job-campus.css";
import "./job-review.css";
import "./case-home-refined.css";
import "./case-article.css";
import "./lesson-reading.css";
import "./lesson-panels.css";
import "./practice-bank.css";
import "./job-task.css";
import "./job-professional.css";
import "./records-overview.css";


export const metadata: Metadata={title:"识局 · 校园反诈演练",description:"在情境里练习核实，在复盘中理解选择。",icons:{icon:[{url:"/brand/shiju-mark-32.png",sizes:"32x32",type:"image/png"},{url:"/brand/shiju-mark-64.png",sizes:"64x64",type:"image/png"}],apple:"/brand/shiju-mark-180.png"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>;}



