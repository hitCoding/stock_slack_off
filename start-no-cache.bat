@echo off
echo 启动股票行情小工具（无缓存模式）...

REM 设置环境变量来减少缓存错误
set ELECTRON_DISABLE_GPU_CACHE=1
set ELECTRON_DISABLE_SOFTWARE_RASTERIZER=1
set ELECTRON_DISABLE_GPU_SANDBOX=1
set ELECTRON_NO_SANDBOX=1
set ELECTRON_DISABLE_DEV_SHM_USAGE=1

REM 启动应用
start "" "股票行情小工具.exe" --disable-gpu-cache --disable-software-rasterizer --disable-gpu-sandbox --no-sandbox --disable-dev-shm-usage

echo 应用已启动！
pause
