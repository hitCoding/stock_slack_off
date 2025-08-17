@echo off
echo 检查当前目录的资源文件...
echo.

echo 📁 当前目录: %CD%
echo.

echo 🔍 检查必需文件:
if exist "assets\icon.png" (
    echo ✅ assets\icon.png - 存在
) else (
    echo ❌ assets\icon.png - 不存在
)

if exist "index.html" (
    echo ✅ index.html - 存在
) else (
    echo ❌ index.html - 不存在
)

if exist "floating.html" (
    echo ✅ floating.html - 存在
) else (
    echo ❌ floating.html - 不存在
)

if exist "preload.js" (
    echo ✅ preload.js - 存在
) else (
    echo ❌ preload.js - 不存在
)

if exist "main.js" (
    echo ✅ main.js - 存在
) else (
    echo ❌ main.js - 不存在
)

if exist "stock-codes.json" (
    echo ✅ stock-codes.json - 存在
) else (
    echo ❌ stock-codes.json - 不存在
)

echo.
echo 📋 目录内容:
dir /b

echo.
pause



