@echo off
echo 正在启动股票行情小工具（任务栏模式）...
echo.
echo 此模式将在Windows任务栏显示股票信息
echo 类似Windows自带的"资讯与兴趣"功能
echo.
echo 请确保已安装Node.js
echo 如果没有安装，请访问: https://nodejs.org/
echo.
pause
echo.
echo 正在安装依赖...
npm install
echo.
echo 正在启动应用...
npm start
echo.
echo 应用已启动！请查看任务栏中的股票信息
echo 点击任务栏按钮可以显示/隐藏主窗口
echo 右键点击任务栏按钮可以打开菜单
pause
