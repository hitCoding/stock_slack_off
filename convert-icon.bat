@echo off
echo 正在转换SVG图标为PNG...
echo.
echo 请确保已安装ImageMagick
echo 如果没有安装，请访问: https://imagemagick.org/script/download.php#windows
echo.
echo 或者你可以手动将 assets/icon.svg 转换为 assets/icon.png
echo 建议尺寸: 32x32 或 64x64 像素
echo.
pause
echo.
echo 如果已安装ImageMagick，正在转换...
magick convert assets/icon.svg -resize 64x64 assets/icon.png
echo.
echo 转换完成！现在可以运行应用了
pause
