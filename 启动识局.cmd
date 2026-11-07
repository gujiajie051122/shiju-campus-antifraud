@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules (
  echo 请先在此目录运行 npm install 安装依赖。
  pause
  exit /b 1
)
echo 浏览器打开 http://127.0.0.1:5173
echo 请保持本窗口打开。按 Ctrl+C 停止服务。
call npm run dev -- --host 127.0.0.1 --port 5173
pause
