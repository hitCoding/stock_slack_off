@echo off
echo 股票行情小工具 - 显示模式切换
echo.
echo 当前配置:
echo 1. 任务栏模式 (类似资讯与兴趣)
echo 2. 系统托盘模式 (传统方式)
echo.
set /p choice="请选择显示模式 (1 或 2): "

if "%choice%"=="1" (
    echo 正在切换到任务栏模式...
    echo displayMode: 'taskbar' > temp_config.js
    echo // 股票行情小工具配置文件 >> temp_config.js
    echo module.exports = { >> temp_config.js
    echo     stockRotationInterval: 5000, >> temp_config.js
    echo     stockDataRefreshInterval: 30000, >> temp_config.js
    echo     defaultStockCodes: ['000001', '600000', '000858'], >> temp_config.js
    echo     displayMode: 'taskbar', >> temp_config.js
    echo     showInTaskbar: true, >> temp_config.js
    echo     enableStockRotation: true, >> temp_config.js
    echo     taskbarDisplayFormat: { >> temp_config.js
    echo         showEmoji: true, >> temp_config.js
    echo         showChangeSymbol: true, >> temp_config.js
    echo         showPercentage: true, >> temp_config.js
    echo         maxTooltipLength: 100, >> temp_config.js
    echo         showInTitle: true, >> temp_config.js
    echo         showInTooltip: true >> temp_config.js
    echo     }, >> temp_config.js
    echo     taskbarButton: { >> temp_config.js
    echo         showIcon: true, >> temp_config.js
    echo         showTitle: true, >> temp_config.js
    echo         showTooltip: true, >> temp_config.js
    echo         clickToShow: true, >> temp_config.js
    echo         rightClickMenu: true >> temp_config.js
    echo     } >> temp_config.js
    echo }; >> temp_config.js
    move /y temp_config.js config.js >nul
    echo 已切换到任务栏模式！
    echo 请重启应用以生效。
) else if "%choice%"=="2" (
    echo 正在切换到系统托盘模式...
    echo displayMode: 'tray' > temp_config.js
    echo // 股票行情小工具配置文件 >> temp_config.js
    echo module.exports = { >> temp_config.js
    echo     stockRotationInterval: 5000, >> temp_config.js
    echo     stockDataRefreshInterval: 30000, >> temp_config.js
    echo     defaultStockCodes: ['000001', '600000', '000858'], >> temp_config.js
    echo     displayMode: 'tray', >> temp_config.js
    echo     showInTaskbar: true, >> temp_config.js
    echo     enableStockRotation: true, >> temp_config.js
    echo     taskbarDisplayFormat: { >> temp_config.js
    echo         showEmoji: true, >> temp_config.js
    echo         showChangeSymbol: true, >> temp_config.js
    echo         showPercentage: true, >> temp_config.js
    echo         maxTooltipLength: 100, >> temp_config.js
    echo         showInTitle: true, >> temp_config.js
    echo         showInTooltip: true >> temp_config.js
    echo     }, >> temp_config.js
    echo     taskbarButton: { >> temp_config.js
    echo         showIcon: true, >> temp_config.js
    echo         showTitle: true, >> temp_config.js
    echo         showTooltip: true, >> temp_config.js
    echo         clickToShow: true, >> temp_config.js
    echo         rightClickMenu: true >> temp_config.js
    echo     } >> temp_config.js
    echo }; >> temp_config.js
    move /y temp_config.js config.js >nul
    echo 已切换到系统托盘模式！
    echo 请重启应用以生效。
) else (
    echo 无效选择，请重新运行脚本。
)

echo.
pause
