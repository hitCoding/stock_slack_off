@echo off
echo 正在生成macOS图标文件...

REM 检查ImageMagick是否安装
magick --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到ImageMagick，请先安装ImageMagick
    echo 下载地址: https://imagemagick.org/script/download.php#windows
    pause
    exit /b 1
)

REM 检查原始图标是否存在
if not exist "assets\icon.png" (
    echo 错误: 未找到原始图标文件 assets\icon.png
    pause
    exit /b 1
)

echo 生成@2x图标 (36x36)...
magick "assets\icon.png" -resize 36x36 "assets\icon@2x.png"

echo 生成@3x图标 (54x54)...
magick "assets\icon.png" -resize 54x54 "assets\icon@3x.png"

echo 生成标准图标 (18x18)...
magick "assets\icon.png" -resize 18x18 "assets\icon-18.png"

echo 生成标准图标 (16x16)...
magick "assets\icon.png" -resize 16x16 "assets\icon-16.png"

echo.
echo 图标生成完成！
echo 生成的文件:
echo   - assets\icon@2x.png (36x36, 用于Retina显示器)
echo   - assets\icon@3x.png (54x54, 用于超高清显示器)
echo   - assets\icon-18.png (18x18, macOS状态栏标准尺寸)
echo   - assets\icon-16.png (16x16, Windows/Linux标准尺寸)
echo.
echo 现在可以在macOS上运行应用，状态栏图标应该显示正常大小。
pause
