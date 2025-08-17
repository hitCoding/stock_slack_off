@echo off
echo ========================================
echo 股票行情小工具 - 任务栏显示调试
echo ========================================
echo.
echo 正在检查任务栏显示相关配置...
echo.

echo 1. 检查main.js配置...
findstr /n "skipTaskbar\|show\|setTitle" main.js
echo.

echo 2. 检查图标文件...
if exist "assets\icon.png" (
    echo ✅ 图标文件存在: assets\icon.png
    dir "assets\icon.png"
) else (
    echo ❌ 图标文件不存在
)
echo.

echo 3. 检查package.json...
findstr /n "main\|scripts" package.json
echo.

echo 4. 检查依赖...
if exist "node_modules\electron" (
    echo ✅ Electron已安装
) else (
    echo ❌ Electron未安装
)
echo.

echo 5. 启动应用进行测试...
echo.
echo 请观察控制台输出，特别关注：
echo - "股票数据已更新" 消息
echo - "任务栏显示" 消息
echo - "股票轮播显示已启动" 消息
echo.
echo 按任意键开始启动...
pause >nul

echo.
echo 正在启动应用...
npm start

echo.
echo 应用已退出
echo.
echo 如果任务栏没有显示股票信息，请检查：
echo 1. 控制台是否有错误信息
echo 2. 是否有"股票数据已更新"消息
echo 3. 是否有"任务栏显示"消息
echo.
pause
