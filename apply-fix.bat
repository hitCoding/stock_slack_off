@echo off
chcp 65001 >nul
echo ========================================
echo 应用设置按钮修复
echo ========================================
echo.

echo 🔧 正在应用修复版本...
echo.

echo 📝 备份原始文件...
if exist "renderer.js" (
    copy "renderer.js" "renderer.js.backup"
    echo ✅ 已备份 renderer.js 为 renderer.js.backup
) else (
    echo ❌ 原始 renderer.js 不存在
    goto :error
)

echo.
echo 📝 应用修复版本...
if exist "renderer-fixed.js" (
    copy "renderer-fixed.js" "renderer.js"
    echo ✅ 已应用修复版本
) else (
    echo ❌ 修复版本 renderer-fixed.js 不存在
    goto :error
)

echo.
echo 🎉 修复完成！
echo.
echo 💡 现在可以启动应用测试设置按钮了
echo 💡 如果仍有问题，可以运行以下命令恢复原始文件：
echo    copy renderer.js.backup renderer.js
echo.

echo 🚀 启动应用测试修复效果...
npm start

:error
echo.
echo ❌ 修复失败，请检查文件是否存在
pause
