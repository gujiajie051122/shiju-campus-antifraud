import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"识局 · 校园反诈演练",description:"在情境里练习核实，在复盘中理解选择。",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>;}

