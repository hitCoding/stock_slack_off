@echo off
chcp 65001 >nul
echo ========================================
echo 股票行情小工具 - 构建脚本
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
    echo 📦 正在安装依赖包...
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
echo 🔨 正在构建应用...
echo 提示：构建完成后，可执行文件将在 dist 目录中
echo.

npm run build

if %errorlevel% equ 0 (
    echo.
    echo ✅ 构建成功！
    echo 📁 可执行文件位置：dist 目录
    echo.
    echo 是否打开dist目录？(Y/N)
    set /p choice=
    if /i "%choice%"=="Y" (
        explorer dist
    )
) else (
    echo.
    echo ❌ 构建失败，请检查错误信息
)

echo.
pause
