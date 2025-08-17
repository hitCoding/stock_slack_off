@echo off
echo 测试macOS图标修复...
echo.

echo 当前平台检测:
if "%OS%"=="Windows_NT" (
    echo 检测到Windows系统
    echo 图标尺寸: 16x16
) else (
    echo 检测到其他系统
    echo 图标尺寸: 16x16
)

echo.
echo 检查图标文件:
if exist "assets\icon.png" (
    echo ✓ 找到主图标: assets\icon.png
) else (
    echo ✗ 未找到主图标: assets\icon.png
)

if exist "assets\icon@2x.png" (
    echo ✓ 找到@2x图标: assets\icon@2x.png (36x36)
) else (
    echo ✗ 未找到@2x图标: assets\icon@2x.png
)

if exist "assets\icon@3x.png" (
    echo ✓ 找到@3x图标: assets\icon@3x.png (54x54)
) else (
    echo ✗ 未找到@3x图标: assets\icon@3x.png
)

echo.
echo 修复说明:
echo 1. 在macOS下，状态栏图标需要18x18像素
echo 2. 系统会自动选择@2x或@3x版本以获得最佳显示效果
echo 3. 如果没有@2x/@3x版本，会使用原始图标并缩放到18x18
echo.
echo 如果图标仍然过大，请运行 generate-macos-icons.bat 生成合适的图标文件
echo.
pause
