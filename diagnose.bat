@echo off
echo ========================================
echo 股票行情小工具 - 问题诊断
echo ========================================
echo.

echo 1. 检查文件结构...
echo.
dir /b *.js
echo.
dir /b *.html
echo.
dir /b *.css
echo.
dir /b assets\*.*
echo.

echo 2. 检查配置文件...
echo.
type config.js
echo.

echo 3. 检查package.json...
echo.
type package.json | findstr "main\|scripts"
echo.

echo 4. 检查Node.js环境...
echo.
node --version
npm --version
echo.

echo 5. 尝试启动应用...
echo.
echo 按任意键开始启动测试...
pause >nul

echo.
echo 正在启动应用...
echo 如果出现错误，请记录错误信息
echo.

npm start

echo.
echo 应用已退出，请检查上面的输出信息
pause
