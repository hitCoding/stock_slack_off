# 启动股票行情小工具（无缓存模式）
Write-Host "启动股票行情小工具（无缓存模式）..." -ForegroundColor Green

# 设置环境变量来减少缓存错误
$env:ELECTRON_DISABLE_GPU_CACHE = "1"
$env:ELECTRON_DISABLE_SOFTWARE_RASTERIZER = "1"
$env:ELECTRON_DISABLE_GPU_SANDBOX = "1"
$env:ELECTRON_NO_SANDBOX = "1"
$env:ELECTRON_DISABLE_DEV_SHM_USAGE = "1"

# 启动应用
Start-Process -FilePath "股票行情小工具.exe" -ArgumentList @(
    "--disable-gpu-cache",
    "--disable-software-rasterizer", 
    "--disable-gpu-sandbox",
    "--no-sandbox",
    "--disable-dev-shm-usage"
)

Write-Host "应用已启动！" -ForegroundColor Green
Read-Host "按回车键退出"
