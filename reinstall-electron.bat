@echo off
echo 重新安装 Electron...
echo.

echo 删除现有的 Electron 目录...
if exist "node_modules\electron" (
    rmdir /s /q "node_modules\electron"
    echo ✅ Electron 目录已删除
) else (
    echo ℹ️ Electron 目录不存在
)

echo.
echo 重新安装 Electron...
npm install electron@28.0.0 --save-dev

echo.
echo 检查安装结果...
if exist "node_modules\electron\dist\electron.exe" (
    echo ✅ Electron 安装成功！
    echo 📁 路径: node_modules\electron\dist\electron.exe
) else (
    echo ❌ Electron 安装失败
    echo 📁 请检查 node_modules\electron 目录
)

echo.
pause
