@echo off
echo 正在构建股票行情小工具...
echo.
echo 请确保已安装Node.js
echo 如果没有安装，请访问: https://nodejs.org/
echo.
pause
echo.
echo 正在安装依赖...
npm install
echo.
echo 正在构建应用...
npm run build
echo.
echo 构建完成！可执行文件在 dist 目录中
pause
