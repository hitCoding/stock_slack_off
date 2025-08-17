@echo off
chcp 65001 >nul
echo ========================================
echo 股票行情小工具 - 项目清理脚本
echo ========================================
echo.

echo 🧹 正在清理项目文件...
echo.

echo 📁 清理测试脚本...
if exist "test-*.bat" (
    del /q "test-*.bat"
    echo ✅ 已删除测试脚本
) else (
    echo ℹ️ 未发现测试脚本
)

if exist "debug-*.bat" (
    del /q "debug-*.bat"
    echo ✅ 已删除调试脚本
) else (
    echo ℹ️ 未发现调试脚本
)

if exist "debug-main.js" (
    del "debug-main.js"
    echo ✅ 已删除调试文件
) else (
    echo ℹ️ 未发现调试文件
)

echo.
echo 📁 清理备份文件...
if exist "*.backup" (
    del /q "*.backup"
    echo ✅ 已删除备份文件
) else (
    echo ℹ️ 未发现备份文件
)

echo.
echo 📁 清理临时文件...
if exist "*.tmp" (
    del /q "*.tmp"
    echo ✅ 已删除临时文件
) else (
    echo ℹ️ 未发现临时文件
)

if exist "*.log" (
    del /q "*.log"
    echo ✅ 已删除日志文件
) else (
    echo ℹ️ 未发现日志文件
)

echo.
echo 📁 清理构建输出...
if exist "dist" (
    echo ⚠️ 发现构建输出目录 dist
    echo 是否删除构建输出？(Y/N)
    set /p choice=
    if /i "%choice%"=="Y" (
        rmdir /s /q "dist"
        echo ✅ 已删除构建输出目录
    ) else (
        echo ℹ️ 保留构建输出目录
    )
) else (
    echo ℹ️ 未发现构建输出目录
)

echo.
echo 📁 清理依赖包（可选）...
echo 是否删除node_modules目录以节省空间？(Y/N)
echo 注意：删除后需要重新运行 npm install
set /p choice=
if /i "%choice%"=="Y" (
    if exist "node_modules" (
        rmdir /s /q "node_modules"
        echo ✅ 已删除依赖包目录
        echo 💡 下次运行前请先执行 npm install
    ) else (
        echo ℹ️ 依赖包目录不存在
    )
) else (
    echo ℹ️ 保留依赖包目录
)

echo.
echo ========================================
echo 清理完成！
echo ========================================
echo.
echo 📋 保留的核心文件：
echo ✅ main.js - 主进程
echo ✅ preload.js - 预加载脚本
echo ✅ index.html - 主窗口
echo ✅ floating.html - 悬浮窗口
echo ✅ renderer.js - 渲染进程
echo ✅ styles.css - 样式文件
echo ✅ config.js - 配置文件
echo ✅ package.json - 项目配置
echo ✅ start.bat - 启动脚本
echo ✅ dev.bat - 开发脚本
echo ✅ build.bat - 构建脚本
echo ✅ check-status.bat - 状态检查
echo ✅ 快速开始.md - 使用指南
echo.
pause
