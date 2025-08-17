@echo off
echo ========================================
echo 股票行情小工具 - 简单调试模式
echo ========================================
echo.
echo 使用简化的main.js进行测试
echo.

REM 备份原文件
if exist "main.js" (
    echo 备份原main.js为main.js.backup
    copy "main.js" "main.js.backup" >nul
)

REM 使用调试版本
echo 使用调试版本main.js
copy "debug-main.js" "main.js" >nul

echo.
echo 正在安装依赖...
npm install

echo.
echo 正在启动应用...
echo 如果还是没有显示，请检查控制台输出
echo.

npm start

echo.
echo 应用已退出
echo.

REM 恢复原文件
if exist "main.js.backup" (
    echo 恢复原main.js
    copy "main.js.backup" "main.js" >nul
    del "main.js.backup" >nul
)

pause
