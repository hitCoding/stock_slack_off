@echo off
echo 正在以调试模式启动股票行情小工具...
echo.
echo 请确保已安装Node.js
echo 如果没有安装，请访问: https://nodejs.org/
echo.
pause
echo.
echo 正在安装依赖...
npm install
echo.
echo 正在以调试模式启动应用...
npm run dev
echo.
echo 如果应用没有显示，请检查控制台输出
pause
