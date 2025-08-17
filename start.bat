@echo off
chcp 65001 >nul
echo ========================================
echo 股票行情小工具启动脚本
echo ========================================
echo.

echo 正在检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到Node.js，请先安装Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js环境正常
echo.

echo 正在检查依赖包...
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖包...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖包安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖包安装完成
) else (
    echo ✅ 依赖包已存在
)

echo.
echo 🚀 正在启动股票行情小工具...
echo 提示：应用启动后会在系统托盘显示图标
echo.

npm start

echo.
echo 应用已退出
pause
