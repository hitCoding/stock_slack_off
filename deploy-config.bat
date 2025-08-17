@echo off
echo 配置文件部署脚本
echo.

echo 📁 当前目录: %CD%
echo.

echo 🔍 检查配置文件...
if exist "stock-codes.json" (
    echo ✅ 找到 stock-codes.json
) else (
    echo ❌ 未找到 stock-codes.json
    echo 📝 请先创建配置文件
    pause
    exit /b 1
)

echo.
echo 📋 配置文件内容预览:
type "stock-codes.json"
echo.

echo 🚀 准备部署配置文件...
echo 📁 目标位置: 与 exe 文件同一目录
echo.

echo 💡 使用说明:
echo 1. 将 stock-codes.json 复制到 exe 文件所在目录
echo 2. 重启应用以加载新配置
echo 3. 修改配置后需要重启应用
echo.

echo 📝 配置文件不会被自动打包进 exe 中
echo 📝 用户需要手动创建和修改配置文件
echo.

pause
